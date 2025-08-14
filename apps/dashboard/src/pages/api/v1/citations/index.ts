/**
 * POST /api/v1/citations
 * Record new AI citation check results
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { CreateCitationRequest, CitationResponse } from '@directdrive/shared';

// Validation schema for citation creation
const CreateCitationSchema = z.object({
  content_id: z.number().optional(),
  ai_model: z.enum(['chatgpt', 'google-ai', 'perplexity']),
  query_text: z.string().min(1).max(500),
  cited: z.boolean(),
  citation_context: z.string().optional(),
  position: z.number().min(1).max(10).optional(),
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CitationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = CreateCitationSchema.parse(req.body);

    // Insert citation record into database
    const { data, error } = await supabase
      .from('ai_citations')
      .insert({
        content_id: validatedData.content_id,
        ai_model: validatedData.ai_model,
        query_text: validatedData.query_text,
        cited: validatedData.cited,
        citation_context: validatedData.citation_context,
        position: validatedData.position,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to record citation' });
    }

    // Transform database response to match API interface
    const citation = {
      id: data.id,
      content_id: data.content_id,
      ai_model: data.ai_model,
      query_text: data.query_text,
      cited: data.cited,
      citation_context: data.citation_context,
      position: data.position,
      monitored_at: data.monitored_at,
    };

    return res.status(201).json({
      citation,
      success: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
      });
    }

    console.error('Citation creation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}