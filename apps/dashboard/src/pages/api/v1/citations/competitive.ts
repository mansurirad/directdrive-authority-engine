/**
 * Competitive Analysis API endpoint for DirectDrive Authority Engine
 * GET /api/v1/citations/competitive
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { demoCompetitive } from '@/lib/demo-data';
import type { CompetitiveAnalysis } from '@/types/citation';

// Query parameters validation
const CompetitiveQuerySchema = z.object({
  query_text: z.string().min(1),
  ai_model: z.enum(['chatgpt', 'google-ai', 'perplexity']).optional(),
}).optional();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompetitiveAnalysis | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const validation = CompetitiveQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    // For now, return demo data to ensure deployment works
    // TODO: Implement real competitive analysis when API keys are configured
    return res.status(200).json(demoCompetitive);
    
  } catch (error) {
    console.error('Competitive API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}