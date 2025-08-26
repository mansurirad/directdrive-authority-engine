/**
 * POST /api/v1/n8n/performance
 * Handle content performance updates from n8n monitoring workflows
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for performance updates
const PerformanceUpdateSchema = z.object({
  content_id: z.number(),
  verification_status: z.enum(['pending', 'verified', 'failed', 'not_applicable']).optional(),
  publication_url: z.string().url().optional(),
  verification_confidence: z.number().min(0).max(100).optional(),
  attribution_phase: z.enum(['baseline', 'primary', 'sustained', 'completed']).optional(),
  citation_baseline_count: z.number().min(0).optional(),
  citation_current_count: z.number().min(0).optional(),
  time_to_first_citation: z.number().min(1).optional(),
  roi_score: z.number().min(0).optional(),
  // Verification details
  verification_method: z.enum(['url_tracking', 'title_date', 'keyword_fingerprint', 'content_similarity']).optional(),
  match_confidence: z.number().min(0).max(100).optional(),
  verification_details: z.record(z.unknown()).optional(),
});

// API Key validation
const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PerformanceResponse {
  performance: {
    id: number;
    content_id: number;
    verification_status: string;
    attribution_phase: string;
    roi_score: number;
    updated_at: string;
  };
  verification?: {
    id: number;
    match_confidence: number;
    verified_at: string;
  };
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PerformanceResponse | { error: string }>
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
    const validatedData = PerformanceUpdateSchema.parse(req.body);

    // Check if content exists
    const { data: contentExists, error: contentError } = await supabase
      .from('content_pieces')
      .select('id')
      .eq('id', validatedData.content_id)
      .single();

    if (contentError || !contentExists) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Calculate citation lift if both counts provided
    let citationLiftPercentage: number | undefined;
    if (validatedData.citation_baseline_count !== undefined && 
        validatedData.citation_current_count !== undefined &&
        validatedData.citation_baseline_count > 0) {
      citationLiftPercentage = 
        ((validatedData.citation_current_count - validatedData.citation_baseline_count) / 
         validatedData.citation_baseline_count) * 100;
    }

    // Prepare performance update data
    const performanceUpdateData: any = {};
    if (validatedData.verification_status) performanceUpdateData.verification_status = validatedData.verification_status;
    if (validatedData.publication_url) performanceUpdateData.publication_url = validatedData.publication_url;
    if (validatedData.verification_confidence) performanceUpdateData.verification_confidence = validatedData.verification_confidence;
    if (validatedData.attribution_phase) performanceUpdateData.attribution_phase = validatedData.attribution_phase;
    if (validatedData.citation_baseline_count !== undefined) performanceUpdateData.citation_baseline_count = validatedData.citation_baseline_count;
    if (validatedData.citation_current_count !== undefined) performanceUpdateData.citation_current_count = validatedData.citation_current_count;
    if (citationLiftPercentage !== undefined) performanceUpdateData.citation_lift_percentage = citationLiftPercentage;
    if (validatedData.time_to_first_citation) performanceUpdateData.time_to_first_citation = validatedData.time_to_first_citation;
    if (validatedData.roi_score !== undefined) performanceUpdateData.roi_score = validatedData.roi_score;
    performanceUpdateData.last_verified_at = new Date().toISOString();

    // Upsert performance record
    const { data: performanceData, error: performanceError } = await supabase
      .from('content_performance')
      .upsert(
        {
          content_id: validatedData.content_id,
          ...performanceUpdateData,
        },
        { 
          onConflict: 'content_id',
          ignoreDuplicates: false 
        }
      )
      .select('id, content_id, verification_status, attribution_phase, roi_score, updated_at')
      .single();

    if (performanceError) {
      console.error('Performance update error:', performanceError);
      return res.status(500).json({ error: 'Failed to update performance record' });
    }

    let verificationData: any = undefined;

    // If verification details provided, create verification record
    if (validatedData.verification_method && validatedData.match_confidence !== undefined) {
      const { data: verifyData, error: verifyError } = await supabase
        .from('content_verification')
        .insert({
          content_id: validatedData.content_id,
          verification_method: validatedData.verification_method,
          match_confidence: validatedData.match_confidence,
          verification_details: validatedData.verification_details || {},
        })
        .select('id, match_confidence, verified_at')
        .single();

      if (verifyError) {
        console.warn('Verification record creation failed:', verifyError);
      } else {
        verificationData = verifyData;
      }
    }

    const response: PerformanceResponse = {
      performance: performanceData,
      success: true,
    };

    if (verificationData) {
      response.verification = verificationData;
    }

    return res.status(200).json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data: ' + error.errors.map(e => e.message).join(', '),
      });
    }

    console.error('Performance update error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}