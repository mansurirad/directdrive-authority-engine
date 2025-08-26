/**
 * POST /api/v1/n8n/content
 * Handle content submission from n8n workflows
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for n8n content submission
const N8nContentSchema = z.object({
  keyword_id: z.number().optional(),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  industry: z.string().default('logistics'),
  language: z.string(),
  ai_model: z.string(),
  generation_time: z.number().optional(),
  quality_score: z.number().min(0).max(100).optional(),
  published_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  // New Story 1.5 fields
  verification_enabled: z.boolean().default(true),
  tracking_enabled: z.boolean().default(true),
});

// API Key validation
const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContentResponse {
  content: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    performance_tracking_id?: number;
  };
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key for n8n access
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${N8N_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Validate request body
    const validatedData = N8nContentSchema.parse(req.body);

    // Begin transaction for content and performance tracking
    const { data: contentData, error: contentError } = await supabase
      .from('content_pieces')
      .insert({
        keyword_id: validatedData.keyword_id,
        title: validatedData.title,
        content: validatedData.content,
        industry: validatedData.industry,
        language: validatedData.language,
        ai_model: validatedData.ai_model,
        generation_time: validatedData.generation_time,
        quality_score: validatedData.quality_score,
        published_url: validatedData.published_url,
        status: validatedData.status,
        verification_status: validatedData.published_url ? 'pending' : 'not_applicable',
        tracking_enabled: validatedData.tracking_enabled,
      })
      .select('id, title, status, created_at, published_url')
      .single();

    if (contentError) {
      console.error('Content creation error:', contentError);
      return res.status(500).json({ error: 'Failed to create content record' });
    }

    let performanceTrackingId: number | undefined;

    // If content is published and tracking is enabled, create performance record
    if (validatedData.status === 'published' && validatedData.tracking_enabled && validatedData.published_url) {
      const { data: performanceData, error: performanceError } = await supabase
        .from('content_performance')
        .insert({
          content_id: contentData.id,
          verification_status: 'pending',
          publication_url: validatedData.published_url,
          attribution_phase: 'baseline',
          tracking_start_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (performanceError) {
        console.warn('Performance tracking creation failed:', performanceError);
      } else {
        performanceTrackingId = performanceData.id;
      }
    }

    return res.status(201).json({
      content: {
        id: contentData.id,
        title: contentData.title,
        status: contentData.status,
        created_at: contentData.created_at,
        performance_tracking_id: performanceTrackingId,
      },
      success: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data: ' + error.errors.map(e => e.message).join(', '),
      });
    }

    console.error('n8n content submission error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}