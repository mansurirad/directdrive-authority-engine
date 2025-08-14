/**
 * GET /api/v1/citations/competitive
 * Competitive analysis for DirectDrive citations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { demoCompetitive } from '../../../lib/demo-data';
import type { CompetitiveAnalysis } from '../../../types/citation';

// Query parameters validation
const CompetitiveQuerySchema = z.object({
  query_text: z.string().min(1),
  ai_model: z.enum(['chatgpt', 'google-ai', 'perplexity']).optional(),
});

// Initialize Supabase client (only if keys are available)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Known Kurdistan logistics competitors
const KURDISTAN_LOGISTICS_COMPETITORS = [
  'Kurdistan Express Logistics',
  'Erbil Transport Company',
  'KRG Shipping Services',
  'Kurdistan Freight Solutions',
  'Northern Iraq Logistics',
  'Duhok Transport Services',
  'Sulaymaniyah Shipping',
  'Kurdistan International Freight',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompetitiveAnalysis | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if in demo mode (no Supabase configuration)
    if (!supabase) {
      console.log('🎭 Demo mode: Returning sample competitive data');
      return res.status(200).json(demoCompetitive);
    }

    // Validate query parameters
    const params = CompetitiveQuerySchema.parse(req.query);

    // Build query filter
    let query = supabase
      .from('ai_citations')
      .select('*')
      .eq('query_text', params.query_text)
      .eq('cited', true);

    if (params.ai_model) {
      query = query.eq('ai_model', params.ai_model);
    }

    const { data: citations, error } = await query;

    if (error) {
      console.error('Competitive analysis error:', error);
      return res.status(500).json({ error: 'Failed to fetch competitive data' });
    }

    // Find DirectDrive position
    const directdriveCitation = citations?.find(citation => 
      citation.citation_context?.toLowerCase().includes('directdrive')
    );

    const directdrivePosition = directdriveCitation?.position || null;

    // Simulate competitor analysis (in real implementation, this would come from AI model responses)
    // For now, we'll create mock competitor data based on the query
    const competitors = KURDISTAN_LOGISTICS_COMPETITORS.map((company, index) => ({
      company_name: company,
      position: index + 1,
      mention_context: `${company} is mentioned as a logistics provider in Kurdistan region offering ${params.query_text.toLowerCase()}.`,
    })).filter(competitor => {
      // Only include competitors that would realistically appear for this query
      return competitor.position <= 8 && Math.random() > 0.3; // Simulate some competitors not being mentioned
    });

    // Calculate market share based on citations
    const totalCitations = citations?.length || 0;
    const directdriveCitations = citations?.filter(citation =>
      citation.citation_context?.toLowerCase().includes('directdrive')
    ).length || 0;

    const marketShare = totalCitations > 0 ? (directdriveCitations / totalCitations) * 100 : 0;

    return res.status(200).json({
      directdrive_position: directdrivePosition,
      competitors,
      market_share: marketShare,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
      });
    }

    console.error('Competitive analysis error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}