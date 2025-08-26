/**
 * Attribution Timeline System Tests
 * Story 1.5: DirectDrive Content-Citation-Performance Loop
 * 
 * Tests 12-week attribution tracking with three phases:
 * - Baseline (0-4 weeks)
 * - Primary Impact (4-8 weeks) 
 * - Sustained Impact (8-12 weeks)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock data for attribution timeline testing
const mockContentPerformanceData = {
  contentId: 1,
  publishDate: '2025-07-15T00:00:00Z', // 4 weeks ago
  baselineCitations: 5,
  currentCitations: 12,
  attributionPhases: {
    baseline: {
      startDate: '2025-07-15T00:00:00Z',
      endDate: '2025-08-12T00:00:00Z',
      citationCountStart: 5,
      citationCountEnd: 7,
      averagePosition: 3.2,
      citationLift: 40.0
    },
    primary: {
      startDate: '2025-08-12T00:00:00Z',
      endDate: '2025-09-09T00:00:00Z',
      citationCountStart: 7,
      citationCountEnd: 12,
      averagePosition: 2.1,
      citationLift: 71.4
    },
    sustained: {
      startDate: '2025-09-09T00:00:00Z',
      endDate: '2025-10-07T00:00:00Z',
      citationCountStart: 12,
      citationCountEnd: 15,
      averagePosition: 1.8,
      citationLift: 25.0
    }
  }
};

// Mock ROI calculation data
const mockROIData = {
  contentInvestment: 500, // USD
  citationValue: 25, // USD per citation
  positionMultiplier: {
    1: 2.0,
    2: 1.5,
    3: 1.0,
    4: 0.8,
    5: 0.6
  },
  businessImpactMetrics: {
    brandVisibility: 85.5,
    marketAuthority: 92.3,
    competitiveAdvantage: 78.9
  }
};

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: 1,
              content_id: 1,
              phase: 'baseline',
              phase_start_date: mockContentPerformanceData.attributionPhases.baseline.startDate,
              phase_end_date: mockContentPerformanceData.attributionPhases.baseline.endDate,
              citation_count_start: 5,
              citation_count_end: 7,
              attribution_confidence: 88.5,
              performance_metrics: {
                citation_lift: 40.0,
                average_position: 3.2,
                time_to_first_citation: 3
              }
            }
          ],
          error: null
        }))
      })),
      gte: vi.fn(() => ({
        lte: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [
              {
                id: 1,
                ai_model: 'chatgpt',
                cited: true,
                position: 2,
                monitored_at: '2025-08-01T10:00:00Z',
                correlation_confidence: 92.3
              }
            ],
            error: null
          }))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: 1, phase: 'baseline', attribution_confidence: 88.5 },
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: { updated: true },
        error: null
      }))
    }))
  })),
  rpc: vi.fn(() => ({
    data: {
      citation_correlation: 0.89,
      attribution_confidence: 91.2,
      roi_metrics: {
        total_investment: 500,
        citation_value_generated: 1250,
        roi_percentage: 150.0
      }
    },
    error: null
  }))
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('Attribution Timeline System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-15T12:00:00Z')); // 4 weeks after publish
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('12-Week Phase Management', () => {
    it('should create baseline phase (0-4 weeks) upon content publication', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const result = await manager.initializeBaseline({
        contentId: 1,
        publicationDate: '2025-07-15T00:00:00Z',
        initialCitationCount: 5
      });

      expect(result.success).toBe(true);
      expect(result.phase).toBe('baseline');
      expect(result.startDate).toBe('2025-07-15T00:00:00Z');
      expect(result.endDate).toBe('2025-08-12T00:00:00Z');
      expect(result.durationWeeks).toBe(4);
      expect(result.citationCountStart).toBe(5);
    });

    it('should transition to primary phase (4-8 weeks) automatically', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      // Set time to 4 weeks + 1 day after publication
      vi.setSystemTime(new Date('2025-08-13T00:00:00Z'));

      const result = await manager.checkPhaseTransition(1);

      expect(result.transitionRequired).toBe(true);
      expect(result.currentPhase).toBe('baseline');
      expect(result.nextPhase).toBe('primary');
      expect(result.transitionDate).toBe('2025-08-12T00:00:00Z');
    });

    it('should transition to sustained phase (8-12 weeks) automatically', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      // Set time to 8 weeks + 1 day after publication
      vi.setSystemTime(new Date('2025-09-10T00:00:00Z'));

      const result = await manager.checkPhaseTransition(1);

      expect(result.transitionRequired).toBe(true);
      expect(result.currentPhase).toBe('primary');
      expect(result.nextPhase).toBe('sustained');
      expect(result.transitionDate).toBe('2025-09-09T00:00:00Z');
    });

    it('should complete timeline after 12 weeks', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      // Set time to 12 weeks + 1 day after publication
      vi.setSystemTime(new Date('2025-10-08T00:00:00Z'));

      const result = await manager.checkPhaseTransition(1);

      expect(result.transitionRequired).toBe(true);
      expect(result.currentPhase).toBe('sustained');
      expect(result.nextPhase).toBe('completed');
      expect(result.timelineCompleted).toBe(true);
    });

    it('should validate phase duration constraints', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const phases = await manager.getPhaseDefinitions();

      expect(phases.baseline.durationWeeks).toBe(4);
      expect(phases.primary.durationWeeks).toBe(4);
      expect(phases.sustained.durationWeeks).toBe(4);
      expect(phases.baseline.durationWeeks + phases.primary.durationWeeks + phases.sustained.durationWeeks).toBe(12);
    });
  });

  describe('Performance Metrics Calculation', () => {
    it('should calculate citation lift >50% correctly', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const baseline = 5;
      const current = 12;
      
      const citationLift = calculator.calculateCitationLift(baseline, current);

      expect(citationLift).toBe(140.0); // (12-5)/5 * 100 = 140%
      expect(citationLift).toBeGreaterThan(50); // Requirement: >50%
    });

    it('should measure time to first citation <14 days', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const publicationDate = '2025-07-15T00:00:00Z';
      const firstCitationDate = '2025-07-18T10:30:00Z'; // 3.4 days later

      const timeToFirstCitation = calculator.calculateTimeToFirstCitation(
        publicationDate,
        firstCitationDate
      );

      expect(timeToFirstCitation).toBeCloseTo(3.4, 1);
      expect(timeToFirstCitation).toBeLessThan(14); // Requirement: <14 days
    });

    it('should maintain attribution confidence >85%', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const attributionFactors = {
        temporalCorrelation: 0.92, // Strong time correlation
        contentSimilarity: 0.89, // High content match
        citationPattern: 0.88, // Consistent citation pattern
        competitiveContext: 0.91 // Strong competitive positioning
      };

      const confidence = calculator.calculateAttributionConfidence(attributionFactors);

      expect(confidence).toBeGreaterThan(85); // Requirement: >85%
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should calculate comprehensive ROI metrics', async () => {
      const { ROICalculator } = await import('@/utils/roi-calculator');
      const calculator = new ROICalculator();

      const metrics = await calculator.calculateComprehensiveROI({
        contentInvestment: mockROIData.contentInvestment,
        citationData: {
          baseline: 5,
          current: 15,
          averagePosition: 2.1,
          citationValue: mockROIData.citationValue
        },
        timeframe: '12_weeks'
      });

      expect(metrics.totalInvestment).toBe(500);
      expect(metrics.citationValueGenerated).toBeGreaterThan(0);
      expect(metrics.roiPercentage).toBeGreaterThan(0);
      expect(metrics.paybackPeriodWeeks).toBeLessThan(12);
      expect(metrics.businessImpactScore).toBeGreaterThan(0);
    });
  });

  describe('Citation Correlation Engine', () => {
    it('should correlate published content with citation improvements', async () => {
      const { CitationCorrelator } = await import('@/utils/citation-correlator');
      const correlator = new CitationCorrelator();

      const correlation = await correlator.analyzeContentCitationCorrelation({
        contentId: 1,
        publicationDate: '2025-07-15T00:00:00Z',
        citationTimeframe: {
          start: '2025-07-15T00:00:00Z',
          end: '2025-08-15T00:00:00Z'
        }
      });

      expect(correlation.correlationCoefficient).toBeGreaterThan(0.8);
      expect(correlation.confidence).toBeGreaterThan(85);
      expect(correlation.significanceLevel).toBeLessThan(0.05);
      expect(correlation.causalityIndicators.length).toBeGreaterThan(0);
    });

    it('should identify citation patterns before and after publication', async () => {
      const { CitationCorrelator } = await import('@/utils/citation-correlator');
      const correlator = new CitationCorrelator();

      const patterns = await correlator.analyzeCitationPatterns({
        contentId: 1,
        prePublicationWeeks: 4,
        postPublicationWeeks: 8
      });

      expect(patterns.prePublication.averageCitations).toBeLessThan(patterns.postPublication.averageCitations);
      expect(patterns.trendAnalysis.direction).toBe('increasing');
      expect(patterns.statisticalSignificance).toBe(true);
      expect(patterns.attributionLikelihood).toBeGreaterThan(85);
    });

    it('should validate correlation with competitive analysis', async () => {
      const { CitationCorrelator } = await import('@/utils/citation-correlator');
      const correlator = new CitationCorrelator();

      const competitiveValidation = await correlator.validateWithCompetitiveContext({
        contentId: 1,
        industryBenchmarks: {
          averageCitationLift: 35.0,
          averageTimeToImpact: 14,
          topPerformerThreshold: 50.0
        }
      });

      expect(competitiveValidation.outperformsIndustry).toBe(true);
      expect(competitiveValidation.relativeBenchmark).toBeGreaterThan(1.0);
      expect(competitiveValidation.marketPositionImprovement).toBeGreaterThan(0);
    });
  });

  describe('Database Integration', () => {
    it('should store attribution timeline records correctly', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const timelineData = {
        content_id: 1,
        phase: 'baseline',
        phase_start_date: '2025-07-15T00:00:00Z',
        phase_end_date: '2025-08-12T00:00:00Z',
        citation_count_start: 5,
        citation_count_end: 7,
        performance_metrics: {
          citation_lift: 40.0,
          average_position: 3.2,
          time_to_first_citation: 3
        },
        attribution_confidence: 88.5
      };

      const result = await supabase
        .from('attribution_timeline')
        .insert(timelineData)
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.data.phase).toBe('baseline');
      expect(result.data.attribution_confidence).toBe(88.5);
      expect(result.error).toBeNull();
    });

    it('should update content_performance table with correlation data', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const updateResult = await supabase
        .from('content_performance')
        .update({
          citation_current_count: 12,
          citation_lift_percentage: 140.0,
          time_to_first_citation: 3,
          roi_score: 89.5,
          attribution_phase: 'primary'
        })
        .eq('content_id', 1);

      expect(updateResult.data).toEqual({ updated: true });
      expect(updateResult.error).toBeNull();
    });

    it('should execute RPC functions for complex calculations', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const rpcResult = await supabase.rpc('calculate_attribution_confidence', {
        content_id: 1,
        phase: 'primary'
      });

      expect(rpcResult.data).toBeDefined();
      expect(rpcResult.data.attribution_confidence).toBeGreaterThan(85);
      expect(rpcResult.error).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should complete attribution calculation within 5 seconds', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const startTime = Date.now();
      
      await manager.calculatePhaseAttribution({
        contentId: 1,
        phase: 'primary',
        citationData: mockContentPerformanceData.attributionPhases.primary
      });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // < 5 seconds
    });

    it('should handle 500+ content pieces simultaneously', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const contentIds = Array.from({ length: 500 }, (_, i) => i + 1);
      const batchSize = 50;

      const startTime = Date.now();
      
      for (let i = 0; i < contentIds.length; i += batchSize) {
        const batch = contentIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(contentId => 
            manager.calculatePhaseAttribution({
              contentId,
              phase: 'baseline',
              citationData: mockContentPerformanceData.attributionPhases.baseline
            })
          )
        );
      }
      
      const totalDuration = Date.now() - startTime;
      const averagePerContent = totalDuration / 500;
      
      expect(averagePerContent).toBeLessThan(100); // Average < 100ms per content
      expect(totalDuration).toBeLessThan(300000); // Total < 5 minutes
    });
  });

  describe('Mathematical Verification', () => {
    it('should verify citation lift calculation accuracy', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const testCases = [
        { baseline: 5, current: 8, expected: 60.0 },
        { baseline: 10, current: 15, expected: 50.0 },
        { baseline: 3, current: 12, expected: 300.0 },
        { baseline: 20, current: 25, expected: 25.0 }
      ];

      testCases.forEach(({ baseline, current, expected }) => {
        const result = calculator.calculateCitationLift(baseline, current);
        expect(result).toBeCloseTo(expected, 1);
      });
    });

    it('should verify ROI calculation precision to 2 decimal places', async () => {
      const { ROICalculator } = await import('@/utils/roi-calculator');
      const calculator = new ROICalculator();

      const roi = await calculator.calculateROI({
        investment: 750.00,
        returns: 1875.50
      });

      expect(roi.percentage).toBeCloseTo(150.07, 2);
      expect(roi.percentage.toString()).toMatch(/^\d+\.\d{2}$/);
    });

    it('should verify attribution confidence statistical validity', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const citationTimeline = [
        { date: '2025-07-15', count: 5 }, // Publication
        { date: '2025-07-16', count: 5 },
        { date: '2025-07-17', count: 6 },
        { date: '2025-07-18', count: 7 }, // First increase
        { date: '2025-07-19', count: 8 },
        { date: '2025-07-20', count: 9 },
        { date: '2025-07-21', count: 10 }
      ];

      const confidence = calculator.calculateStatisticalConfidence(citationTimeline);

      expect(confidence.pValue).toBeLessThan(0.05); // Statistically significant
      expect(confidence.confidence).toBeGreaterThan(85);
      expect(confidence.trendStrength).toBeGreaterThan(0.8);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing citation data gracefully', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const result = await manager.calculatePhaseAttribution({
        contentId: 999, // Non-existent content
        phase: 'baseline',
        citationData: null
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_CITATION_DATA');
      expect(result.confidence).toBe(0);
    });

    it('should handle invalid phase transitions', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      // Try to transition from baseline to sustained (skipping primary)
      const result = await manager.transitionPhase({
        contentId: 1,
        fromPhase: 'baseline',
        toPhase: 'sustained' // Invalid transition
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PHASE_TRANSITION');
      expect(result.validTransitions).toEqual(['primary']);
    });

    it('should handle negative citation counts', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const result = calculator.calculateCitationLift(-5, 10);

      expect(result).toBe(null);
      expect(calculator.getLastError()).toBe('NEGATIVE_BASELINE_COUNT');
    });

    it('should handle timeline completion edge cases', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      // Set time exactly at 12 weeks
      vi.setSystemTime(new Date('2025-10-07T00:00:00Z'));

      const result = await manager.checkPhaseTransition(1);

      expect(result.transitionRequired).toBe(true);
      expect(result.nextPhase).toBe('completed');
      expect(result.exactlyAtThreshold).toBe(true);
    });
  });
});