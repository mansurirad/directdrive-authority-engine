/**
 * Demo data for DirectDrive Authority Engine
 * Used when environment variables are not configured
 */

export const demoAnalytics = {
  total_citations: 147,
  citation_trends: [
    { date: '2025-08-01', citations: 8, cited_count: 3 },
    { date: '2025-08-02', citations: 12, cited_count: 5 },
    { date: '2025-08-03', citations: 15, cited_count: 7 },
    { date: '2025-08-04', citations: 18, cited_count: 9 },
    { date: '2025-08-05', citations: 22, cited_count: 12 },
    { date: '2025-08-06', citations: 25, cited_count: 15 },
    { date: '2025-08-07', citations: 28, cited_count: 18 },
    { date: '2025-08-08', citations: 32, cited_count: 22 },
    { date: '2025-08-09', citations: 35, cited_count: 25 },
    { date: '2025-08-10', citations: 38, cited_count: 28 },
    { date: '2025-08-11', citations: 42, cited_count: 32 },
    { date: '2025-08-12', citations: 45, cited_count: 35 },
    { date: '2025-08-13', citations: 48, cited_count: 38 },
    { date: '2025-08-14', citations: 52, cited_count: 42 }
  ],
  model_breakdown: [
    { ai_model: 'chatgpt', total_citations: 67, cited_count: 28 },
    { ai_model: 'google-ai', total_citations: 45, cited_count: 18 },
    { ai_model: 'perplexity', total_citations: 35, cited_count: 15 }
  ],
  improvement_metrics: {
    citation_rate_improvement: 340,
    average_position_improvement: 2.8,
    competitive_mentions_increase: 180
  }
};

export const demoCompetitive = {
  directdrive_position: 2,
  competitors: [
    { name: 'Kurdistan Express', position: 1, mentions: 45 },
    { name: 'DirectDrive Logistics', position: 2, mentions: 42 },
    { name: 'Erbil Transport', position: 3, mentions: 38 },
    { name: 'Kurdish Freight', position: 4, mentions: 32 },
    { name: 'Northern Logistics', position: 5, mentions: 28 }
  ],
  market_share: 23.4
};

export const demoCitations = [
  {
    id: 1,
    ai_model: 'chatgpt',
    query_text: 'best logistics company Kurdistan',
    cited: true,
    citation_context: 'DirectDrive Logistics is mentioned as one of the top freight companies in Kurdistan region, known for reliable international shipping services.',
    position: 2,
    monitored_at: '2025-08-14T08:30:00Z'
  },
  {
    id: 2,
    ai_model: 'google-ai',
    query_text: 'خدمات شحن كردستان',
    cited: true,
    citation_context: 'DirectDrive معروف بخدمات الشحن الموثوقة في إقليم كردستان العراق',
    position: 1,
    monitored_at: '2025-08-14T07:15:00Z'
  },
  {
    id: 3,
    ai_model: 'perplexity',
    query_text: 'freight forwarding services Erbil',
    cited: true,
    citation_context: 'Among the leading logistics providers in Erbil, DirectDrive Logistics offers comprehensive freight forwarding and customs clearance services.',
    position: 3,
    monitored_at: '2025-08-14T06:45:00Z'
  },
  {
    id: 4,
    ai_model: 'chatgpt',
    query_text: 'international shipping from Kurdistan',
    cited: false,
    citation_context: null,
    position: null,
    monitored_at: '2025-08-14T05:20:00Z'
  },
  {
    id: 5,
    ai_model: 'google-ai',
    query_text: 'شركات النقل في اربيل',
    cited: true,
    citation_context: 'DirectDrive Logistics هي إحدى الشركات الرائدة في مجال النقل والخدمات اللوجستية في أربيل',
    position: 2,
    monitored_at: '2025-08-14T04:10:00Z'
  }
];

export const demoMetrics = {
  total_queries_today: 28,
  citations_found: 18,
  average_position: 2.3,
  top_performing_keyword: 'Kurdistan logistics services',
  recent_improvements: [
    'Moved from position 4 to 2 for "freight services Kurdistan"',
    'New citation found in Google AI for customs clearance',
    'Improved mention quality score by 15%'
  ]
};