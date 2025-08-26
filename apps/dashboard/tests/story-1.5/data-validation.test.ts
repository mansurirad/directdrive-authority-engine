/**
 * Data Validation Tests for Story 1.5
 * DirectDrive Content-Citation-Performance Loop
 * 
 * Validates data integrity, consistency, and business rule compliance
 * across all Story 1.5 data structures and operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Data validation schemas and constraints
const VALIDATION_RULES = {
  confidenceThreshold: 85,
  citationLiftMinimum: 50,
  timeToFirstCitationMax: 14,
  roiPrecisionDecimals: 2,
  attributionPhases: ['baseline', 'primary', 'sustained', 'completed'],
  verificationMethods: ['url_tracking', 'title_date', 'keyword_fingerprint', 'content_similarity'],
  verificationStatuses: ['pending', 'verified', 'not_found', 'error'],
  aiModels: ['chatgpt', 'google-ai', 'perplexity']
};

// Mock test data for validation
const mockValidationData = {
  validContentPerformance: {
    content_id: 1,
    verification_status: 'verified',
    verification_confidence: 92.5,
    attribution_phase: 'primary',
    citation_baseline_count: 5,
    citation_current_count: 12,
    citation_lift_percentage: 140.0,
    time_to_first_citation: 3,
    roi_score: 89.7
  },
  invalidContentPerformance: {
    content_id: null, // Invalid: required field
    verification_confidence: 150.0, // Invalid: > 100
    attribution_phase: 'invalid_phase', // Invalid: not in allowed values
    citation_baseline_count: -2, // Invalid: negative
    citation_lift_percentage: 25.0, // Invalid: < 50% requirement
    time_to_first_citation: 20 // Invalid: > 14 days
  },
  validContentVerification: {
    content_id: 1,
    verification_method: 'url_tracking',
    match_confidence: 88.5,
    verification_details: {
      url_match: true,
      title_similarity: 0.92,
      content_similarity: 0.89,
      keyword_matches: 8
    }
  },
  invalidContentVerification: {
    content_id: 'invalid', // Invalid: not integer
    verification_method: 'invalid_method', // Invalid: not in allowed values
    match_confidence: -5.0, // Invalid: negative
    verification_details: null // Invalid: required field
  }
};

// Mock Supabase client for validation testing
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [mockValidationData.validContentPerformance],
        error: null
      }))
    })),
    insert: vi.fn((data) => ({
      select: vi.fn(() => ({
        single: vi.fn(() => {
          // Simulate validation errors for invalid data
          if (data.verification_confidence > 100) {
            return {
              data: null,
              error: { message: 'Confidence must be between 0 and 100' }
            };
          }
          return {
            data: { id: 1, ...data },
            error: null
          };
        })
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: { updated: true },
        error: null
      }))
    }))
  }))
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('Data Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Content Performance Data Validation', () => {
    it('should validate confidence threshold requirements', async () => {
      const { ContentPerformanceValidator } = await import('@/utils/content-performance-validator');
      const validator = new ContentPerformanceValidator();

      const validData = mockValidationData.validContentPerformance;
      const invalidData = { ...validData, verification_confidence: 75.0 }; // Below threshold

      const validResult = validator.validateConfidenceThreshold(validData);
      const invalidResult = validator.validateConfidenceThreshold(invalidData);

      expect(validResult.valid).toBe(true);
      expect(validResult.confidence).toBeGreaterThan(VALIDATION_RULES.confidenceThreshold);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('CONFIDENCE_BELOW_THRESHOLD');
      expect(invalidResult.confidence).toBeLessThan(VALIDATION_RULES.confidenceThreshold);
    });

    it('should validate citation lift requirements', async () => {
      const { PerformanceMetricsValidator } = await import('@/utils/performance-metrics-validator');
      const validator = new PerformanceMetricsValidator();

      const validCitationLift = 75.5; // Above 50% requirement
      const invalidCitationLift = 35.0; // Below 50% requirement

      const validResult = validator.validateCitationLift(validCitationLift);
      const invalidResult = validator.validateCitationLift(invalidCitationLift);

      expect(validResult.valid).toBe(true);
      expect(validResult.lift).toBeGreaterThan(VALIDATION_RULES.citationLiftMinimum);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('CITATION_LIFT_BELOW_MINIMUM');
      expect(invalidResult.lift).toBeLessThan(VALIDATION_RULES.citationLiftMinimum);
    });

    it('should validate time to first citation requirements', async () => {
      const { TimelineValidator } = await import('@/utils/timeline-validator');
      const validator = new TimelineValidator();

      const validTimeToFirstCitation = 8; // Within 14 days
      const invalidTimeToFirstCitation = 18; // Exceeds 14 days

      const validResult = validator.validateTimeToFirstCitation(validTimeToFirstCitation);
      const invalidResult = validator.validateTimeToFirstCitation(invalidTimeToFirstCitation);

      expect(validResult.valid).toBe(true);
      expect(validResult.days).toBeLessThan(VALIDATION_RULES.timeToFirstCitationMax);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('TIME_TO_CITATION_EXCEEDS_LIMIT');
      expect(invalidResult.days).toBeGreaterThan(VALIDATION_RULES.timeToFirstCitationMax);
    });

    it('should validate attribution phase transitions', async () => {
      const { AttributionPhaseValidator } = await import('@/utils/attribution-phase-validator');
      const validator = new AttributionPhaseValidator();

      const validTransitions = [
        { from: 'baseline', to: 'primary' },
        { from: 'primary', to: 'sustained' },
        { from: 'sustained', to: 'completed' }
      ];

      const invalidTransitions = [
        { from: 'baseline', to: 'sustained' }, // Skipping primary
        { from: 'completed', to: 'baseline' }, // Backwards transition
        { from: 'primary', to: 'invalid_phase' } // Invalid phase
      ];

      validTransitions.forEach(transition => {
        const result = validator.validatePhaseTransition(transition.from, transition.to);
        expect(result.valid).toBe(true);
        expect(result.transition).toBe('VALID');
      });

      invalidTransitions.forEach(transition => {
        const result = validator.validatePhaseTransition(transition.from, transition.to);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate ROI calculation precision', async () => {
      const { ROIValidator } = await import('@/utils/roi-validator');
      const validator = new ROIValidator();

      const testROIValues = [
        { value: 75.00, valid: true },
        { value: 89.55, valid: true },
        { value: 123.456, valid: false }, // Too many decimal places
        { value: -15.00, valid: false } // Negative ROI
      ];

      testROIValues.forEach(test => {
        const result = validator.validateROIPrecision(test.value);
        expect(result.valid).toBe(test.valid);
        
        if (test.valid) {
          expect(result.decimalPlaces).toBeLessThanOrEqual(VALIDATION_RULES.roiPrecisionDecimals);
        } else {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Content Verification Data Validation', () => {
    it('should validate verification method constraints', async () => {
      const { VerificationMethodValidator } = await import('@/utils/verification-method-validator');
      const validator = new VerificationMethodValidator();

      VALIDATION_RULES.verificationMethods.forEach(method => {
        const result = validator.validateMethod(method);
        expect(result.valid).toBe(true);
        expect(result.method).toBe(method);
      });

      const invalidMethods = ['invalid_method', 'unknown_verification', ''];
      invalidMethods.forEach(method => {
        const result = validator.validateMethod(method);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('INVALID_VERIFICATION_METHOD');
      });
    });

    it('should validate match confidence boundaries', async () => {
      const { ConfidenceBoundaryValidator } = await import('@/utils/confidence-boundary-validator');
      const validator = new ConfidenceBoundaryValidator();

      const testConfidenceValues = [
        { value: 0.0, valid: true },
        { value: 50.5, valid: true },
        { value: 100.0, valid: true },
        { value: -5.0, valid: false },
        { value: 105.0, valid: false },
        { value: null, valid: false },
        { value: 'invalid', valid: false }
      ];

      testConfidenceValues.forEach(test => {
        const result = validator.validateConfidenceBoundaries(test.value);
        expect(result.valid).toBe(test.valid);
        
        if (!test.valid) {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });

    it('should validate verification details structure', async () => {
      const { VerificationDetailsValidator } = await import('@/utils/verification-details-validator');
      const validator = new VerificationDetailsValidator();

      const validDetails = {
        url_tracking: {
          url_accessible: true,
          title_match: true,
          content_similarity: 0.89,
          keyword_matches: 8
        },
        title_date: {
          title_similarity: 0.92,
          date_match: true,
          publication_confirmed: true
        },
        keyword_fingerprint: {
          keyword_match_rate: 0.85,
          fingerprint_score: 0.91,
          semantic_similarity: 0.88
        },
        content_similarity: {
          similarity_score: 0.87,
          semantic_match: true,
          structural_similarity: 0.79
        }
      };

      Object.entries(validDetails).forEach(([method, details]) => {
        const result = validator.validateDetailsStructure(method, details);
        expect(result.valid).toBe(true);
        expect(result.requiredFieldsPresent).toBe(true);
      });

      // Test invalid details structure
      const invalidDetails = {
        url_tracking: {
          // Missing required fields
          url_accessible: true
        },
        content_similarity: {
          similarity_score: 'invalid_value' // Invalid data type
        }
      };

      Object.entries(invalidDetails).forEach(([method, details]) => {
        const result = validator.validateDetailsStructure(method, details);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Attribution Timeline Data Validation', () => {
    it('should validate phase duration constraints', async () => {
      const { PhaseDurationValidator } = await import('@/utils/phase-duration-validator');
      const validator = new PhaseDurationValidator();

      const validPhaseDurations = [
        { phase: 'baseline', startDate: '2025-07-01', endDate: '2025-07-29', expectedWeeks: 4 },
        { phase: 'primary', startDate: '2025-07-29', endDate: '2025-08-26', expectedWeeks: 4 },
        { phase: 'sustained', startDate: '2025-08-26', endDate: '2025-09-23', expectedWeeks: 4 }
      ];

      validPhaseDurations.forEach(phaseData => {
        const result = validator.validatePhaseDuration(
          phaseData.phase,
          phaseData.startDate,
          phaseData.endDate
        );
        
        expect(result.valid).toBe(true);
        expect(result.durationWeeks).toBeCloseTo(phaseData.expectedWeeks, 0);
      });

      // Test invalid durations
      const invalidPhaseDurations = [
        { phase: 'baseline', startDate: '2025-07-01', endDate: '2025-07-15', error: 'TOO_SHORT' },
        { phase: 'primary', startDate: '2025-07-01', endDate: '2025-08-15', error: 'TOO_LONG' },
        { phase: 'sustained', startDate: '2025-08-01', endDate: '2025-07-15', error: 'INVALID_DATES' }
      ];

      invalidPhaseDurations.forEach(phaseData => {
        const result = validator.validatePhaseDuration(
          phaseData.phase,
          phaseData.startDate,
          phaseData.endDate
        );
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(phaseData.error);
      });
    });

    it('should validate citation count consistency', async () => {
      const { CitationCountValidator } = await import('@/utils/citation-count-validator');
      const validator = new CitationCountValidator();

      const validCitationCounts = [
        { start: 5, end: 8, phase: 'baseline' },
        { start: 8, end: 12, phase: 'primary' },
        { start: 12, end: 15, phase: 'sustained' }
      ];

      validCitationCounts.forEach(countData => {
        const result = validator.validateCitationCounts(
          countData.start,
          countData.end,
          countData.phase
        );
        
        expect(result.valid).toBe(true);
        expect(result.end).toBeGreaterThanOrEqual(result.start);
      });

      // Test invalid citation counts
      const invalidCitationCounts = [
        { start: -2, end: 5, error: 'NEGATIVE_START_COUNT' },
        { start: 10, end: 8, error: 'END_LESS_THAN_START' },
        { start: 5, end: null, error: 'MISSING_END_COUNT' }
      ];

      invalidCitationCounts.forEach(countData => {
        const result = validator.validateCitationCounts(
          countData.start,
          countData.end,
          'baseline'
        );
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(countData.error);
      });
    });

    it('should validate performance metrics structure', async () => {
      const { PerformanceMetricsStructureValidator } = await import('@/utils/performance-metrics-structure-validator');
      const validator = new PerformanceMetricsStructureValidator();

      const validMetrics = {
        citation_lift: 75.5,
        average_position: 2.1,
        time_to_first_citation: 3,
        correlation_confidence: 89.7,
        business_impact_score: 85.3
      };

      const result = validator.validateMetricsStructure(validMetrics);
      expect(result.valid).toBe(true);
      expect(result.requiredMetricsPresent).toBe(true);

      // Test invalid metrics structure
      const invalidMetrics = {
        citation_lift: 'invalid_value',
        average_position: -1.5, // Invalid: negative position
        // Missing required metrics
      };

      const invalidResult = validator.validateMetricsStructure(invalidMetrics);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Database Constraint Validation', () => {
    it('should enforce foreign key constraints', async () => {
      const { ForeignKeyValidator } = await import('@/utils/foreign-key-validator');
      const validator = new ForeignKeyValidator();

      // Test valid foreign key relationships
      const validReferences = [
        { table: 'content_performance', column: 'content_id', referencedTable: 'content_pieces', referencedColumn: 'content_piece_id' },
        { table: 'content_verification', column: 'content_id', referencedTable: 'content_pieces', referencedColumn: 'content_piece_id' },
        { table: 'attribution_timeline', column: 'content_id', referencedTable: 'content_pieces', referencedColumn: 'content_piece_id' }
      ];

      for (const reference of validReferences) {
        const result = await validator.validateForeignKeyReference(
          reference.table,
          reference.column,
          1, // Valid content_piece_id
          reference.referencedTable,
          reference.referencedColumn
        );
        
        expect(result.valid).toBe(true);
        expect(result.referenceExists).toBe(true);
      }

      // Test invalid foreign key (non-existent content_piece_id)
      const invalidResult = await validator.validateForeignKeyReference(
        'content_performance',
        'content_id',
        999, // Non-existent content_piece_id
        'content_pieces',
        'content_piece_id'
      );
      
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('FOREIGN_KEY_VIOLATION');
    });

    it('should enforce check constraints', async () => {
      const { CheckConstraintValidator } = await import('@/utils/check-constraint-validator');
      const validator = new CheckConstraintValidator();

      const checkConstraints = [
        {
          table: 'content_performance',
          constraint: 'verification_confidence_range',
          validValues: [0, 50.5, 100],
          invalidValues: [-5, 105, null]
        },
        {
          table: 'attribution_timeline',
          constraint: 'citation_counts_non_negative',
          validValues: [0, 5, 100],
          invalidValues: [-1, -10]
        },
        {
          table: 'content_verification',
          constraint: 'match_confidence_range',
          validValues: [0.0, 85.5, 100.0],
          invalidValues: [-0.1, 100.1]
        }
      ];

      checkConstraints.forEach(constraint => {
        constraint.validValues.forEach(value => {
          const result = validator.validateCheckConstraint(
            constraint.table,
            constraint.constraint,
            value
          );
          expect(result.valid).toBe(true);
        });

        constraint.invalidValues.forEach(value => {
          const result = validator.validateCheckConstraint(
            constraint.table,
            constraint.constraint,
            value
          );
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        });
      });
    });

    it('should enforce unique constraints', async () => {
      const { UniqueConstraintValidator } = await import('@/utils/unique-constraint-validator');
      const validator = new UniqueConstraintValidator();

      // Test unique constraint on attribution_timeline (content_id, phase)
      const uniqueConstraintTest = await validator.validateUniqueConstraint(
        'attribution_timeline',
        ['content_id', 'phase'],
        { content_id: 1, phase: 'baseline' }
      );

      expect(uniqueConstraintTest.valid).toBe(true);
      expect(uniqueConstraintTest.constraint).toBe('unique_content_phase');

      // Test violation of unique constraint
      const duplicateTest = await validator.validateUniqueConstraint(
        'attribution_timeline',
        ['content_id', 'phase'],
        { content_id: 1, phase: 'baseline' }, // Duplicate entry
        { checkExisting: true }
      );

      expect(duplicateTest.valid).toBe(false);
      expect(duplicateTest.errors).toContain('UNIQUE_CONSTRAINT_VIOLATION');
    });
  });

  describe('Business Rule Validation', () => {
    it('should validate DirectDrive-specific business rules', async () => {
      const { BusinessRuleValidator } = await import('@/utils/business-rule-validator');
      const validator = new BusinessRuleValidator();

      const businessRules = [
        {
          name: 'minimum_tracking_period',
          description: 'Content must be tracked for at least 12 weeks',
          validator: (data) => validator.validateMinimumTrackingPeriod(data.tracking_start_date),
          validData: { tracking_start_date: '2025-05-15T00:00:00Z' }, // 12+ weeks ago
          invalidData: { tracking_start_date: '2025-08-10T00:00:00Z' } // < 12 weeks ago
        },
        {
          name: 'logistics_content_relevance',
          description: 'Content must be relevant to logistics industry',
          validator: (data) => validator.validateLogisticsRelevance(data.keywords, data.content),
          validData: { 
            keywords: ['logistics', 'freight', 'shipping', 'transportation'],
            content: 'DirectDrive provides comprehensive logistics solutions...'
          },
          invalidData: {
            keywords: ['cooking', 'recipes', 'food'],
            content: 'This article is about cooking techniques...'
          }
        },
        {
          name: 'kurdistan_market_focus',
          description: 'Content should focus on Kurdistan market',
          validator: (data) => validator.validateKurdistanMarketFocus(data.content, data.metadata),
          validData: {
            content: 'logistics services in Kurdistan region',
            metadata: { market_focus: 'kurdistan', region: 'middle_east' }
          },
          invalidData: {
            content: 'logistics services in European markets',
            metadata: { market_focus: 'europe', region: 'europe' }
          }
        }
      ];

      businessRules.forEach(rule => {
        const validResult = rule.validator(rule.validData);
        expect(validResult.valid).toBe(true);
        expect(validResult.ruleName).toBe(rule.name);

        const invalidResult = rule.validator(rule.invalidData);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate performance improvement requirements', async () => {
      const { PerformanceImprovementValidator } = await import('@/utils/performance-improvement-validator');
      const validator = new PerformanceImprovementValidator();

      const performanceRequirements = {
        minimum_citation_lift: 50, // %
        maximum_time_to_citation: 14, // days
        minimum_attribution_confidence: 85, // %
        minimum_roi_positive: true
      };

      const validPerformanceData = {
        citation_lift_percentage: 75.5,
        time_to_first_citation: 8,
        attribution_confidence: 89.7,
        roi_score: 125.3
      };

      const invalidPerformanceData = {
        citation_lift_percentage: 35.0, // Below minimum
        time_to_first_citation: 18, // Above maximum
        attribution_confidence: 78.5, // Below minimum
        roi_score: -15.2 // Negative ROI
      };

      const validResult = validator.validatePerformanceImprovement(
        validPerformanceData,
        performanceRequirements
      );
      expect(validResult.valid).toBe(true);
      expect(validResult.meetsAllRequirements).toBe(true);

      const invalidResult = validator.validatePerformanceImprovement(
        invalidPerformanceData,
        performanceRequirements
      );
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.failedRequirements.length).toBeGreaterThan(0);
    });

    it('should validate correlation strength requirements', async () => {
      const { CorrelationStrengthValidator } = await import('@/utils/correlation-strength-validator');
      const validator = new CorrelationStrengthValidator();

      const correlationData = [
        { contentId: 1, correlationCoefficient: 0.89, pValue: 0.02, strength: 'strong' },
        { contentId: 2, correlationCoefficient: 0.65, pValue: 0.08, strength: 'moderate' },
        { contentId: 3, correlationCoefficient: 0.25, pValue: 0.15, strength: 'weak' }
      ];

      correlationData.forEach(data => {
        const result = validator.validateCorrelationStrength(
          data.correlationCoefficient,
          data.pValue
        );

        if (data.strength === 'strong') {
          expect(result.valid).toBe(true);
          expect(result.significance).toBe('statistically_significant');
        } else if (data.strength === 'weak') {
          expect(result.valid).toBe(false);
          expect(result.errors).toContain('WEAK_CORRELATION');
        }
      });
    });
  });

  describe('Data Consistency Validation', () => {
    it('should validate cross-table data consistency', async () => {
      const { CrossTableConsistencyValidator } = await import('@/utils/cross-table-consistency-validator');
      const validator = new CrossTableConsistencyValidator();

      const consistencyChecks = [
        {
          name: 'content_performance_attribution_timeline_sync',
          description: 'Content performance and attribution timeline should be synchronized',
          tables: ['content_performance', 'attribution_timeline'],
          constraint: 'attribution_phase_match'
        },
        {
          name: 'content_verification_performance_sync',
          description: 'Content verification status should match performance tracking',
          tables: ['content_verification', 'content_performance'],
          constraint: 'verification_status_match'
        }
      ];

      for (const check of consistencyChecks) {
        const result = await validator.validateCrossTableConsistency(
          check.tables,
          check.constraint,
          { contentId: 1 }
        );

        expect(result.consistent).toBe(true);
        expect(result.checkName).toBe(check.name);
        expect(result.inconsistencies).toHaveLength(0);
      }
    });

    it('should detect and report data inconsistencies', async () => {
      const { DataInconsistencyDetector } = await import('@/utils/data-inconsistency-detector');
      const detector = new DataInconsistencyDetector();

      const inconsistencyScenarios = [
        {
          name: 'attribution_phase_mismatch',
          description: 'Attribution phase differs between content_performance and attribution_timeline',
          severity: 'high'
        },
        {
          name: 'citation_count_discrepancy',
          description: 'Citation counts inconsistent across related tables',
          severity: 'medium'
        },
        {
          name: 'timestamp_inconsistency',
          description: 'Timestamp sequence violations',
          severity: 'low'
        }
      ];

      for (const scenario of inconsistencyScenarios) {
        const result = await detector.detectInconsistency(scenario.name, { contentId: 1 });
        
        expect(result.detected).toBeDefined();
        expect(result.severity).toBe(scenario.severity);
        
        if (result.detected) {
          expect(result.affectedRecords.length).toBeGreaterThan(0);
          expect(result.resolutionSuggestions.length).toBeGreaterThan(0);
        }
      }
    });
  });
});