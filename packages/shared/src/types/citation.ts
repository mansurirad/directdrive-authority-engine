/**
 * AI Citation Monitoring Types
 * DirectDrive Authority Engine
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
  ai_model: string;
}

export interface ModelBreakdown {
  ai_model: string;
  citation_count: number;
  percentage: number;
}

export interface ImprovementMetrics {
  baseline_citations: number;
  current_citations: number;
  improvement_percentage: number;
  tracking_period_days: number;
}

export interface CompetitorMention {
  company_name: string;
  position: number;
  mention_context: string;
}

export interface CitationAnalytics {
  total_citations: number;
  citation_trends: CitationTrend[];
  model_breakdown: ModelBreakdown[];
  improvement_metrics: ImprovementMetrics;
}

export interface CompetitiveAnalysis {
  directdrive_position?: number;
  competitors: CompetitorMention[];
  market_share: number;
}

export type CreateCitationRequest = Omit<AICitation, 'id' | 'monitored_at'>;

export interface CitationResponse {
  citation: AICitation;
  success: boolean;
}