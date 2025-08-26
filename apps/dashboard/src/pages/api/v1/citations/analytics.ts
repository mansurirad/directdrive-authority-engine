/**
 * Analytics API endpoint for DirectDrive Authority Engine
 * GET /api/v1/citations/analytics
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { demoAnalytics } from '@/lib/demo-data';
import type { CitationAnalytics } from '@/types/citation';

// Query parameters validation
const AnalyticsQuerySchema = z.object({
  ai_model: z.enum(['chatgpt', 'google-ai', 'perplexity']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).optional();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CitationAnalytics | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const validation = AnalyticsQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const { ai_model, start_date, end_date } = validation.data || {};

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured, returning demo data');
      return res.status(200).json(demoAnalytics);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query filters
    let query = supabase.from('ai_citations').select('*');
    
    if (ai_model) {
      query = query.eq('ai_model', ai_model);
    }
    
    if (start_date) {
      query = query.gte('monitored_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('monitored_at', end_date);
    }

    const { data: citations, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Failed to fetch citation data' });
    }

    // Calculate analytics from real data
    const totalCitations = citations.length;
    const citedCount = citations.filter(c => c.cited).length;

    // Group by date for trends
    const trendsMap = new Map();
    citations.forEach(citation => {
      const date = citation.monitored_at?.split('T')[0];
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { date, citations: 0, cited_count: 0 });
      }
      trendsMap.get(date).citations++;
      if (citation.cited) {
        trendsMap.get(date).cited_count++;
      }
    });

    const citationTrends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Group by AI model
    const modelMap = new Map();
    citations.forEach(citation => {
      if (!modelMap.has(citation.ai_model)) {
        modelMap.set(citation.ai_model, { ai_model: citation.ai_model, total_citations: 0, cited_count: 0 });
      }
      modelMap.get(citation.ai_model).total_citations++;
      if (citation.cited) {
        modelMap.get(citation.ai_model).cited_count++;
      }
    });

    const modelBreakdown = Array.from(modelMap.values());

    // Calculate improvement metrics (simplified)
    const citationRate = totalCitations > 0 ? Math.round((citedCount / totalCitations) * 100) : 0;
    const avgPosition = citations.filter(c => c.position).reduce((sum, c) => sum + c.position, 0) / citations.filter(c => c.position).length || 0;

    const realAnalytics: CitationAnalytics = {
      total_citations: totalCitations,
      citation_trends: citationTrends,
      model_breakdown: modelBreakdown,
      improvement_metrics: {
        citation_rate_improvement: citationRate,
        average_position_improvement: Number(avgPosition.toFixed(1)),
        competitive_mentions_increase: citedCount
      }
    };

    return res.status(200).json(realAnalytics);
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}