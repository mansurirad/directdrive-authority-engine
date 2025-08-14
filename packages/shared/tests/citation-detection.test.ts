/**
 * Citation Detection Tests
 * DirectDrive Authority Engine
 */

import { describe, it, expect } from 'vitest';
import { CitationDetector } from '../src/utils/citation-detection';
import { QueryVariationGenerator } from '../src/utils/query-variations';
import { CompetitiveAnalyzer } from '../src/utils/competitive-analysis';

describe('CitationDetector', () => {
  const detector = new CitationDetector();

  it('should detect DirectDrive citations', () => {
    const response = 'DirectDrive Logistics is a leading logistics company in Kurdistan region, offering comprehensive freight and shipping services.';
    
    const analysis = detector.detectCitation(response);
    
    expect(analysis.cited).toBe(true);
    expect(analysis.confidence).toBeGreaterThan(0.5);
    expect(analysis.context).toContain('DirectDrive');
    expect(analysis.position).toBeDefined();
  });

  it('should not detect citations when DirectDrive is not mentioned', () => {
    const response = 'Kurdistan Express is the top logistics provider in the region.';
    
    const analysis = detector.detectCitation(response);
    
    expect(analysis.cited).toBe(false);
    expect(analysis.confidence).toBe(0);
  });

  it('should detect competitor mentions', () => {
    const response = 'The best logistics companies in Kurdistan include Kurdistan Express Logistics and Erbil Transport Company.';
    
    const analysis = detector.detectCitation(response);
    
    expect(analysis.competitorMentions.length).toBeGreaterThan(0);
    expect(analysis.competitorMentions[0].company).toBe('Kurdistan Express Logistics');
  });

  it('should analyze position correctly', () => {
    const response = '1. DirectDrive Logistics - premier service\n2. Kurdistan Express - reliable option';
    
    const analysis = detector.detectCitation(response);
    
    expect(analysis.cited).toBe(true);
    expect(analysis.position).toBe(1);
  });

  it('should calculate sentiment correctly', () => {
    const positiveResponse = 'DirectDrive Logistics is excellent and reliable with outstanding service.';
    const negativeResponse = 'DirectDrive Logistics has poor service and is unreliable.';
    
    const positiveAnalysis = detector.detectCitation(positiveResponse);
    const negativeAnalysis = detector.detectCitation(negativeResponse);
    
    expect(positiveAnalysis.sentimentScore).toBeGreaterThan(0);
    expect(negativeAnalysis.sentimentScore).toBeLessThan(0);
  });

  it('should handle multilingual content', () => {
    const arabicResponse = 'شركة DirectDrive للوجستيات هي من أفضل الشركات في كردستان.';
    
    const analysis = detector.detectCitation(arabicResponse, 'arabic');
    
    expect(analysis.cited).toBe(true);
    expect(analysis.context).toContain('DirectDrive');
  });

  it('should calculate quality scores', () => {
    const highQualityResponse = 'DirectDrive Logistics is a professional logistics company offering freight, customs clearance, and warehousing services in Kurdistan region with excellent customer service.';
    const lowQualityResponse = 'DirectDrive is mentioned.';
    
    const highQualityAnalysis = detector.detectCitation(highQualityResponse);
    const lowQualityAnalysis = detector.detectCitation(lowQualityResponse);
    
    expect(highQualityAnalysis.qualityScore).toBeGreaterThan(lowQualityAnalysis.qualityScore);
  });
});

describe('QueryVariationGenerator', () => {
  const generator = new QueryVariationGenerator();

  it('should generate query variations', () => {
    const querySet = generator.generateVariations('best logistics company Kurdistan');
    
    expect(querySet.variations.length).toBeGreaterThan(0);
    expect(querySet.totalQueries).toBeGreaterThan(0);
    expect(querySet.variations.some(v => v.language === 'english')).toBe(true);
  });

  it('should generate multilingual variations', () => {
    const querySet = generator.generateVariations('shipping services Erbil');
    
    const languages = querySet.variations.map(v => v.language);
    expect(languages).toContain('english');
    expect(languages).toContain('arabic');
  });

  it('should prioritize queries correctly', () => {
    const querySet = generator.generateVariations('DirectDrive logistics');
    
    const englishVariation = querySet.variations.find(v => v.language === 'english');
    expect(englishVariation?.priority).toBe(1);
  });

  it('should generate high-priority queries', () => {
    const highPriorityQueries = generator.getHighPriorityQueries();
    
    expect(highPriorityQueries.length).toBeGreaterThan(0);
    expect(highPriorityQueries).toContain('DirectDrive logistics');
    expect(highPriorityQueries).toContain('best logistics company Kurdistan');
  });

  it('should generate monitoring schedule', () => {
    const schedule = generator.generateMonitoringSchedule();
    
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule.some(s => s.frequency === 'daily')).toBe(true);
    expect(schedule.some(s => s.frequency === 'weekly')).toBe(true);
  });
});

describe('CompetitiveAnalyzer', () => {
  const analyzer = new CompetitiveAnalyzer();

  it('should calculate competitive metrics', () => {
    const responses = [
      {
        query: 'best logistics company Kurdistan',
        response: '1. Kurdistan Express 2. DirectDrive Logistics 3. Erbil Transport'
      },
      {
        query: 'shipping services',
        response: 'DirectDrive Logistics offers excellent shipping services in Kurdistan.'
      }
    ];
    
    const metrics = analyzer.calculateCompetitiveMetrics(responses);
    
    expect(metrics.directdriveRank).toBeDefined();
    expect(metrics.marketVisibility).toBeGreaterThan(0);
    expect(metrics.dominanceScore).toBeGreaterThanOrEqual(0);
  });

  it('should analyze competitive landscape', () => {
    const responses = [
      {
        query: 'Kurdistan logistics companies',
        response: 'Top companies include Kurdistan Express Logistics, DirectDrive Logistics, and Erbil Transport Company.',
        aiModel: 'chatgpt'
      }
    ];
    
    const analysis = analyzer.analyzeCompetitiveLandscape(responses);
    
    expect(analysis.marketLeaders.length).toBeGreaterThan(0);
    expect(analysis.directdriveProfile).toBeDefined();
    expect(analysis.opportunities.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it('should identify market gaps', () => {
    const responses = [
      {
        query: 'reliable logistics Kurdistan',
        response: 'There are limited reliable options for logistics in Kurdistan region.',
        aiModel: 'chatgpt'
      }
    ];
    
    const analysis = analyzer.analyzeCompetitiveLandscape(responses);
    
    expect(analysis.marketGaps.some(gap => gap.includes('reliability'))).toBe(true);
  });

  it('should generate strategic recommendations', () => {
    const responses = [
      {
        query: 'best logistics company',
        response: 'Kurdistan Express leads the market, but DirectDrive Logistics has strong local expertise.',
        aiModel: 'chatgpt'
      }
    ];
    
    const analysis = analyzer.analyzeCompetitiveLandscape(responses);
    
    expect(analysis.recommendations.length).toBeGreaterThan(0);
    expect(analysis.recommendations.some(rec => rec.includes('expertise'))).toBe(true);
  });
});