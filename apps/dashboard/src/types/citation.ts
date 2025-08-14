/**
 * Citation types for DirectDrive Authority Engine
 */

export interface AICitation {
  id: number;
  content_id?: number;
  ai_model: 'chatgpt' | 'google-ai' | 'perplexity';
  query_text: string;
  cited: boolean;
  citation_context?: string;
  position?: number;
  monitored_at: string;
}

export interface CitationTrend {
  date: string;
  citations: number;
  cited_count: number;
}

export interface ModelBreakdown {
  ai_model: string;
  total_citations: number;
  cited_count: number;
}

export interface ImprovementMetrics {
  citation_rate_improvement: number;
  average_position_improvement: number;
  competitive_mentions_increase: number;
}

export interface CitationAnalytics {
  total_citations: number;
  citation_trends: CitationTrend[];
  model_breakdown: ModelBreakdown[];
  improvement_metrics: ImprovementMetrics;
}

export interface CompetitorMention {
  name: string;
  position: number;
  mentions: number;
}

export interface CompetitiveAnalysis {
  directdrive_position?: number;
  competitors: CompetitorMention[];
  market_share: number;
}