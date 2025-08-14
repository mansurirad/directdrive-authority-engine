/**
 * GET /api/v1/citations/analytics
 * Retrieve citation analytics and trends
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { demoAnalytics } from '../../../lib/demo-data';
import type { CitationAnalytics } from '../../../types/citation';

// Query parameters validation
const AnalyticsQuerySchema = z.object({
  ai_model: z.enum(['chatgpt', 'google-ai', 'perplexity']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  industry: z.string().optional(),
});

// Initialize Supabase client (only if keys are available)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CitationAnalytics | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if in demo mode (no Supabase configuration)
    if (!supabase) {
      console.log('🎭 Demo mode: Returning sample analytics data');
      return res.status(200).json(demoAnalytics);
    }

    // Validate query parameters
    const params = AnalyticsQuerySchema.parse(req.query);

    // Build date filter
    const dateFrom = params.date_from ? new Date(params.date_from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const dateTo = params.date_to ? new Date(params.date_to) : new Date();

    // Get total citations count
    let totalQuery = supabase
      .from('ai_citations')
      .select('*', { count: 'exact' })
      .gte('monitored_at', dateFrom.toISOString())
      .lte('monitored_at', dateTo.toISOString())
      .eq('cited', true);

    if (params.ai_model) {
      totalQuery = totalQuery.eq('ai_model', params.ai_model);
    }

    const { count: totalCitations, error: totalError } = await totalQuery;

    if (totalError) {
      console.error('Total citations error:', totalError);
      return res.status(500).json({ error: 'Failed to fetch total citations' });
    }

    // Get citation trends (daily aggregation)
    const { data: trendsData, error: trendsError } = await supabase
      .rpc('get_citation_trends', {
        start_date: dateFrom.toISOString(),
        end_date: dateTo.toISOString(),
        filter_ai_model: params.ai_model || null,
      });

    if (trendsError) {
      console.error('Citation trends error:', trendsError);
      // Fallback to simple query if RPC function doesn't exist
      const { data: fallbackTrends, error: fallbackError } = await supabase
        .from('ai_citations')
        .select('monitored_at, ai_model')
        .gte('monitored_at', dateFrom.toISOString())
        .lte('monitored_at', dateTo.toISOString())
        .eq('cited', true);

      if (fallbackError) {
        return res.status(500).json({ error: 'Failed to fetch citation trends' });
      }

      // Process fallback data into trends format
      const trendsMap = new Map();
      fallbackTrends?.forEach(citation => {
        const date = new Date(citation.monitored_at).toISOString().split('T')[0];
        const key = `${date}-${citation.ai_model}`;
        trendsMap.set(key, (trendsMap.get(key) || 0) + 1);
      });

      const processedTrends = Array.from(trendsMap.entries()).map(([key, count]) => {
        const [date, ai_model] = key.split('-');
        return { date, citations: count, ai_model };
      });

      return res.status(200).json({
        total_citations: totalCitations || 0,
        citation_trends: processedTrends,
        model_breakdown: [],
        improvement_metrics: {
          baseline_citations: 0,
          current_citations: totalCitations || 0,
          improvement_percentage: 0,
          tracking_period_days: 30,
        },
      });
    }

    // Get model breakdown
    const { data: modelData, error: modelError } = await supabase
      .from('ai_citations')
      .select('ai_model')
      .gte('monitored_at', dateFrom.toISOString())
      .lte('monitored_at', dateTo.toISOString())
      .eq('cited', true);

    if (modelError) {
      console.error('Model breakdown error:', modelError);
      return res.status(500).json({ error: 'Failed to fetch model breakdown' });
    }

    // Process model breakdown
    const modelCounts = modelData?.reduce((acc, item) => {
      acc[item.ai_model] = (acc[item.ai_model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalModelCitations = Object.values(modelCounts).reduce((sum, count) => sum + count, 0);

    const modelBreakdown = Object.entries(modelCounts).map(([ai_model, citation_count]) => ({
      ai_model,
      citation_count,
      percentage: totalModelCitations > 0 ? (citation_count / totalModelCitations) * 100 : 0,
    }));

    // Calculate improvement metrics (baseline from 7 days ago)
    const baselineDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { count: baselineCitations } = await supabase
      .from('ai_citations')
      .select('*', { count: 'exact' })
      .gte('monitored_at', baselineDate.toISOString())
      .lte('monitored_at', dateFrom.toISOString())
      .eq('cited', true);

    const currentCitations = totalCitations || 0;
    const baseline = baselineCitations || 0;
    const improvementPercentage = baseline > 0 ? ((currentCitations - baseline) / baseline) * 100 : 0;

    return res.status(200).json({
      total_citations: currentCitations,
      citation_trends: trendsData || [],
      model_breakdown: modelBreakdown,
      improvement_metrics: {
        baseline_citations: baseline,
        current_citations: currentCitations,
        improvement_percentage: improvementPercentage,
        tracking_period_days: 30,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
      });
    }

    console.error('Analytics error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}