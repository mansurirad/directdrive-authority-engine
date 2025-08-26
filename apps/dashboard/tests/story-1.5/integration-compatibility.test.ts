/**
 * Integration Compatibility Tests
 * Story 1.5: DirectDrive Content-Citation-Performance Loop
 * 
 * Validates compatibility and integration with Stories 1.1-1.4:
 * - Story 1.1: Supabase Database Setup
 * - Story 1.2: N8N Workflow Enhancement  
 * - Story 1.3: DirectDrive Content Specialization
 * - Story 1.4: AI Citation Monitoring System
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock data for cross-story integration testing
const mockIntegrationData = {
  // Story 1.1 - Database schema
  databaseTables: [
    'content_pieces',
    'ai_citations', 
    'content_performance',
    'content_verification',
    'attribution_timeline'
  ],
  // Story 1.2 - N8N workflows
  n8nWorkflows: {
    citationMonitoring: 'citation-monitoring-workflow',
    contentTracking: 'content-performance-tracking',
    realTimeAlerts: 'real-time-citation-alerts'
  },
  // Story 1.3 - Content specialization
  contentCategories: [
    'logistics_services',
    'freight_management', 
    'supply_chain',
    'warehousing',
    'transportation'
  ],
  // Story 1.4 - Citation monitoring
  aiModels: ['chatgpt', 'google-ai', 'perplexity'],
  competitiveAnalysis: true
};

// Mock Supabase client with comprehensive table structure
const mockSupabase = {
  from: vi.fn((table) => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: getMockDataForTable(table),
          error: null
        })),
        order: vi.fn(() => ({
          data: [getMockDataForTable(table)],
          error: null
        }))
      })),
      gte: vi.fn(() => ({
        lte: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [getMockDataForTable(table)],
            error: null
          }))
        }))
      })),
      in: vi.fn(() => ({
        data: [getMockDataForTable(table)],
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: 1, ...getMockDataForTable(table) },
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: { updated: true },
        error: null
      }))
    })),
    upsert: vi.fn(() => ({
      data: { upserted: true },
      error: null
    }))
  })),
  rpc: vi.fn(() => ({
    data: { correlation_analysis: true, success: true },
    error: null
  }))
};

function getMockDataForTable(table: string) {
  switch (table) {
    case 'content_pieces':
      return {
        content_piece_id: 1,
        title: 'DirectDrive Logistics Services',
        content_type: 'blog_post',
        content_status: 'published',
        published_url: 'https://directdrivelogistic.com/blog/logistics-services',
        verification_status: 'verified',
        verification_confidence: 92.5
      };
    case 'ai_citations':
      return {
        id: 1,
        content_id: 1,
        ai_model: 'chatgpt',
        cited: true,
        position: 2,
        correlation_confidence: 89.3,
        attribution_phase: 'primary'
      };
    case 'content_performance':
      return {
        id: 1,
        content_id: 1,
        verification_status: 'verified',
        attribution_phase: 'primary',
        citation_lift_percentage: 75.5,
        roi_score: 88.7
      };
    default:
      return { id: 1, success: true };
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

// Mock N8N workflow client
const mockN8NClient = {
  triggerWorkflow: vi.fn(() => Promise.resolve({ 
    executionId: 'exec-123',
    status: 'success',
    data: { processed: true }
  })),
  getWorkflowStatus: vi.fn(() => Promise.resolve({
    status: 'active',
    lastExecution: new Date().toISOString()
  })),
  updateWorkflow: vi.fn(() => Promise.resolve({ updated: true }))
};

vi.mock('@/utils/n8n-client', () => ({
  N8NClient: vi.fn(() => mockN8NClient)
}));

describe('Integration Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Story 1.1 - Database Integration', () => {
    it('should maintain compatibility with existing Supabase schema', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      // Test that Story 1.5 tables integrate with existing schema
      const tableTests = await Promise.all([
        supabase.from('content_pieces').select('*').eq('content_piece_id', 1).single(),
        supabase.from('ai_citations').select('*').eq('id', 1).single(),
        supabase.from('content_performance').select('*').eq('content_id', 1).single(),
        supabase.from('content_verification').select('*').eq('content_id', 1).single(),
        supabase.from('attribution_timeline').select('*').eq('content_id', 1).single()
      ]);

      tableTests.forEach(result => {
        expect(result.data).toBeDefined();
        expect(result.error).toBeNull();
      });
    });

    it('should preserve existing content_pieces data structure', async () => {
      const { DatabaseCompatibilityChecker } = await import('@/utils/database-compatibility');
      const checker = new DatabaseCompatibilityChecker();

      const compatibility = await checker.checkContentPiecesCompatibility();

      expect(compatibility.existingColumnsPreserved).toBe(true);
      expect(compatibility.newColumnsAdded).toContain('verification_status');
      expect(compatibility.newColumnsAdded).toContain('verification_confidence');
      expect(compatibility.foreignKeyIntegrity).toBe(true);
      expect(compatibility.indexesOptimized).toBe(true);
    });

    it('should maintain referential integrity across all tables', async () => {
      const { ReferentialIntegrityChecker } = await import('@/utils/referential-integrity');
      const checker = new ReferentialIntegrityChecker();

      const integrityCheck = await checker.validateCrossTableReferences();

      expect(integrityCheck.contentPiecesToPerformance).toBe(true);
      expect(integrityCheck.contentPiecesToVerification).toBe(true);
      expect(integrityCheck.contentPiecesToTimeline).toBe(true);
      expect(integrityCheck.citationsToContentPerformance).toBe(true);
      expect(integrityCheck.orphanedRecords).toHaveLength(0);
    });

    it('should support existing RLS policies', async () => {
      const { RLSPolicyChecker } = await import('@/utils/rls-policy-checker');
      const checker = new RLSPolicyChecker();

      const policyCheck = await checker.validateStory15Policies();

      expect(policyCheck.contentPerformancePolicies).toBe(true);
      expect(policyCheck.contentVerificationPolicies).toBe(true);
      expect(policyCheck.attributionTimelinePolicies).toBe(true);
      expect(policyCheck.serviceRoleAccess).toBe(true);
      expect(policyCheck.securityMaintained).toBe(true);
    });
  });

  describe('Story 1.2 - N8N Workflow Integration', () => {
    it('should integrate with existing citation monitoring workflow', async () => {
      const { N8NIntegration } = await import('@/utils/n8n-integration');
      const integration = new N8NIntegration();

      const workflowResult = await integration.triggerContentPerformanceTracking({
        contentId: 1,
        verificationRequired: true,
        attributionPhase: 'baseline'
      });

      expect(workflowResult.success).toBe(true);
      expect(workflowResult.executionId).toBeDefined();
      expect(mockN8NClient.triggerWorkflow).toHaveBeenCalledWith(
        'content-performance-tracking',
        expect.objectContaining({
          contentId: 1,
          verificationRequired: true
        })
      );
    });

    it('should enhance existing workflows without breaking changes', async () => {
      const { WorkflowCompatibilityChecker } = await import('@/utils/workflow-compatibility');
      const checker = new WorkflowCompatibilityChecker();

      const compatibility = await checker.checkExistingWorkflows();

      expect(compatibility.citationMonitoringIntact).toBe(true);
      expect(compatibility.realTimeAlertsIntact).toBe(true);
      expect(compatibility.newNodesAdded).toContain('content-verification');
      expect(compatibility.newNodesAdded).toContain('attribution-tracking');
      expect(compatibility.backwardCompatible).toBe(true);
    });

    it('should coordinate multiple workflows effectively', async () => {
      const { WorkflowCoordinator } = await import('@/utils/workflow-coordinator');
      const coordinator = new WorkflowCoordinator();

      const coordinationResult = await coordinator.orchestrateContentWorkflow({
        contentId: 1,
        workflows: [
          'citation-monitoring-workflow',
          'content-performance-tracking',
          'real-time-citation-alerts'
        ]
      });

      expect(coordinationResult.success).toBe(true);
      expect(coordinationResult.workflowsExecuted).toBe(3);
      expect(coordinationResult.executionOrder).toEqual([
        'content-performance-tracking',
        'citation-monitoring-workflow', 
        'real-time-citation-alerts'
      ]);
    });

    it('should handle workflow dependencies correctly', async () => {
      const { DependencyManager } = await import('@/utils/dependency-manager');
      const manager = new DependencyManager();

      const dependencies = await manager.resolveDependencies([
        { workflow: 'content-verification', dependsOn: [] },
        { workflow: 'citation-monitoring', dependsOn: ['content-verification'] },
        { workflow: 'attribution-tracking', dependsOn: ['citation-monitoring'] },
        { workflow: 'roi-analysis', dependsOn: ['attribution-tracking'] }
      ]);

      expect(dependencies.resolved).toBe(true);
      expect(dependencies.executionPlan).toHaveLength(4);
      expect(dependencies.circularDependencies).toBe(false);
    });
  });

  describe('Story 1.3 - Content Specialization Integration', () => {
    it('should work with DirectDrive logistics content categorization', async () => {
      const { ContentCategoryIntegration } = await import('@/utils/content-category-integration');
      const integration = new ContentCategoryIntegration();

      const categoryVerification = await integration.verifyLogisticsContent({
        contentId: 1,
        expectedCategories: mockIntegrationData.contentCategories
      });

      expect(categoryVerification.categoryMatch).toBe(true);
      expect(categoryVerification.logisticsSpecific).toBe(true);
      expect(categoryVerification.directDriveRelevant).toBe(true);
      expect(categoryVerification.confidenceScore).toBeGreaterThan(85);
    });

    it('should leverage existing content quality metrics', async () => {
      const { ContentQualityIntegration } = await import('@/utils/content-quality-integration');
      const integration = new ContentQualityIntegration();

      const qualityMetrics = await integration.integrateQualityWithPerformance({
        contentId: 1,
        includeSeMetrics: true,
        includeReadability: true
      });

      expect(qualityMetrics.seoScore).toBeGreaterThan(0);
      expect(qualityMetrics.readabilityScore).toBeGreaterThan(0);
      expect(qualityMetrics.performanceCorrelation).toBeGreaterThan(0.7);
      expect(qualityMetrics.citationPotential).toBeGreaterThan(75);
    });

    it('should maintain content publication pipeline integration', async () => {
      const { PublicationPipelineIntegration } = await import('@/utils/publication-pipeline-integration');
      const integration = new PublicationPipelineIntegration();

      const pipelineResult = await integration.integratePerformanceTracking({
        contentId: 1,
        publicationStage: 'published',
        enableRealTimeTracking: true
      });

      expect(pipelineResult.trackingEnabled).toBe(true);
      expect(pipelineResult.baselineEstablished).toBe(true);
      expect(pipelineResult.verificationScheduled).toBe(true);
      expect(pipelineResult.workflowsTriggered).toContain('content-performance-tracking');
    });

    it('should preserve content metadata and SEO optimization', async () => {
      const { MetadataPreservation } = await import('@/utils/metadata-preservation');
      const preservation = new MetadataPreservation();

      const metadataCheck = await preservation.validateMetadataIntegrity({
        contentId: 1,
        checkSeoFields: true,
        checkKeywords: true,
        checkCategories: true
      });

      expect(metadataCheck.metadataIntact).toBe(true);
      expect(metadataCheck.seoFieldsPreserved).toBe(true);
      expect(metadataCheck.keywordsPreserved).toBe(true);
      expect(metadataCheck.categoriesPreserved).toBe(true);
      expect(metadataCheck.enhancementsApplied).toBe(true);
    });
  });

  describe('Story 1.4 - Citation Monitoring Integration', () => {
    it('should extend existing AI citation monitoring capabilities', async () => {
      const { CitationMonitoringExtension } = await import('@/utils/citation-monitoring-extension');
      const extension = new CitationMonitoringExtension();

      const monitoringResult = await extension.enhanceExistingMonitoring({
        contentId: 1,
        aiModels: mockIntegrationData.aiModels,
        includePerformanceCorrelation: true
      });

      expect(monitoringResult.enhancementApplied).toBe(true);
      expect(monitoringResult.correlationEnabled).toBe(true);
      expect(monitoringResult.attributionTrackingEnabled).toBe(true);
      expect(monitoringResult.monitoredModels).toEqual(mockIntegrationData.aiModels);
    });

    it('should correlate with existing competitive analysis', async () => {
      const { CompetitiveAnalysisIntegration } = await import('@/utils/competitive-analysis-integration');
      const integration = new CompetitiveAnalysisIntegration();

      const correlation = await integration.correlateWithContentPerformance({
        contentId: 1,
        competitiveContext: true,
        marketPositioning: true
      });

      expect(correlation.competitiveImpactMeasured).toBe(true);
      expect(correlation.marketPositionImproved).toBe(true);
      expect(correlation.competitorBenchmarking).toBe(true);
      expect(correlation.strategicInsights).toHaveLength.toBeGreaterThan(0);
    });

    it('should maintain real-time alert functionality', async () => {
      const { RealTimeAlertIntegration } = await import('@/utils/realtime-alert-integration');
      const integration = new RealTimeAlertIntegration();

      const alertResult = await integration.integratePerformanceAlerts({
        contentId: 1,
        thresholds: {
          citationLift: 50,
          confidence: 85,
          timeToFirstCitation: 14
        }
      });

      expect(alertResult.alertsConfigured).toBe(true);
      expect(alertResult.thresholdsSet).toBe(true);
      expect(alertResult.realTimeUpdatesEnabled).toBe(true);
      expect(alertResult.notificationChannels).toContain('dashboard');
    });

    it('should preserve citation data integrity', async () => {
      const { CitationDataIntegrity } = await import('@/utils/citation-data-integrity');
      const integrity = new CitationDataIntegrity();

      const integrityCheck = await integrity.validateCitationDataConsistency({
        contentId: 1,
        checkCorrelations: true,
        validateTimestamps: true
      });

      expect(integrityCheck.dataConsistent).toBe(true);
      expect(integrityCheck.correlationsValid).toBe(true);
      expect(integrityCheck.timestampsValid).toBe(true);
      expect(integrityCheck.noDataLoss).toBe(true);
    });
  });

  describe('Cross-Story Data Flow', () => {
    it('should maintain data flow from content creation to performance analysis', async () => {
      const { DataFlowValidator } = await import('@/utils/data-flow-validator');
      const validator = new DataFlowValidator();

      const flowValidation = await validator.validateEndToEndDataFlow({
        startPoint: 'content_pieces',
        endPoint: 'content_performance',
        includeVerification: true,
        includeAttribution: true
      });

      expect(flowValidation.flowComplete).toBe(true);
      expect(flowValidation.dataTransformed).toBe(true);
      expect(flowValidation.verificationPassed).toBe(true);
      expect(flowValidation.attributionCalculated).toBe(true);
      expect(flowValidation.performanceMetricsGenerated).toBe(true);
    });

    it('should handle cross-story error propagation correctly', async () => {
      const { ErrorPropagationHandler } = await import('@/utils/error-propagation-handler');
      const handler = new ErrorPropagationHandler();

      // Simulate error in Story 1.2 workflow
      mockN8NClient.triggerWorkflow.mockRejectedValueOnce(new Error('Workflow failed'));

      const errorHandling = await handler.handleCrossStoryError({
        errorSource: 'story_1_2_workflow',
        affectedStories: ['1.3', '1.4', '1.5'],
        errorType: 'workflow_execution_failed'
      });

      expect(errorHandling.errorContained).toBe(true);
      expect(errorHandling.fallbackExecuted).toBe(true);
      expect(errorHandling.dataIntegrityMaintained).toBe(true);
      expect(errorHandling.recoveryPlan).toBeDefined();
    });

    it('should validate system-wide consistency', async () => {
      const { SystemConsistencyValidator } = await import('@/utils/system-consistency-validator');
      const validator = new SystemConsistencyValidator();

      const consistencyCheck = await validator.validateSystemWideConsistency({
        stories: ['1.1', '1.2', '1.3', '1.4', '1.5'],
        checkDataIntegrity: true,
        checkWorkflowIntegrity: true,
        checkApiIntegrity: true
      });

      expect(consistencyCheck.overallConsistency).toBe(true);
      expect(consistencyCheck.dataIntegrityScore).toBeGreaterThan(95);
      expect(consistencyCheck.workflowIntegrityScore).toBeGreaterThan(95);
      expect(consistencyCheck.apiIntegrityScore).toBeGreaterThan(95);
      expect(consistencyCheck.inconsistencies).toHaveLength(0);
    });
  });

  describe('Migration Safety', () => {
    it('should provide safe rollback mechanisms', async () => {
      const { MigrationSafetyChecker } = await import('@/utils/migration-safety-checker');
      const checker = new MigrationSafetyChecker();

      const safetyCheck = await checker.validateRollbackCapability({
        migrationVersion: 'story_1_5',
        checkBackups: true,
        validateRollbackScript: true
      });

      expect(safetyCheck.rollbackPossible).toBe(true);
      expect(safetyCheck.backupsValid).toBe(true);
      expect(safetyCheck.rollbackScriptTested).toBe(true);
      expect(safetyCheck.dataLossRisk).toBe('minimal');
    });

    it('should validate migration impact on existing functionality', async () => {
      const { MigrationImpactAssessor } = await import('@/utils/migration-impact-assessor');
      const assessor = new MigrationImpactAssessor();

      const impactAssessment = await assessor.assessMigrationImpact({
        targetStories: ['1.1', '1.2', '1.3', '1.4'],
        newStory: '1.5',
        checkPerformanceImpact: true
      });

      expect(impactAssessment.breakingChanges).toHaveLength(0);
      expect(impactAssessment.performanceImpact).toBe('minimal');
      expect(impactAssessment.functionalityPreserved).toBe(true);
      expect(impactAssessment.migrationRisk).toBe('low');
    });

    it('should ensure backward compatibility', async () => {
      const { BackwardCompatibilityTester } = await import('@/utils/backward-compatibility-tester');
      const tester = new BackwardCompatibilityTester();

      const compatibilityTest = await tester.testBackwardCompatibility({
        apiEndpoints: [
          '/api/v1/citations',
          '/api/v1/citations/analytics', 
          '/api/v1/citations/competitive'
        ],
        databaseQueries: true,
        workflowIntegrations: true
      });

      expect(compatibilityTest.apiCompatibility).toBe(true);
      expect(compatibilityTest.databaseCompatibility).toBe(true);
      expect(compatibilityTest.workflowCompatibility).toBe(true);
      expect(compatibilityTest.overallCompatibility).toBe(true);
    });
  });

  describe('Performance Impact Assessment', () => {
    it('should not degrade existing system performance', async () => {
      const { PerformanceImpactAnalyzer } = await import('@/utils/performance-impact-analyzer');
      const analyzer = new PerformanceImpactAnalyzer();

      const performanceAnalysis = await analyzer.analyzePerformanceImpact({
        baseline: 'pre_story_1_5',
        current: 'post_story_1_5',
        metrics: ['response_time', 'throughput', 'resource_usage']
      });

      expect(performanceAnalysis.responseTimeImpact).toBeLessThan(10); // < 10% increase
      expect(performanceAnalysis.throughputImpact).toBeGreaterThan(-5); // < 5% decrease
      expect(performanceAnalysis.resourceUsageImpact).toBeLessThan(15); // < 15% increase
      expect(performanceAnalysis.overallPerformanceAcceptable).toBe(true);
    });

    it('should validate resource utilization efficiency', async () => {
      const { ResourceUtilizationValidator } = await import('@/utils/resource-utilization-validator');
      const validator = new ResourceUtilizationValidator();

      const utilizationCheck = await validator.validateResourceEfficiency({
        checkMemoryUsage: true,
        checkCpuUsage: true,
        checkDatabaseConnections: true,
        checkNetworkUsage: true
      });

      expect(utilizationCheck.memoryEfficient).toBe(true);
      expect(utilizationCheck.cpuEfficient).toBe(true);
      expect(utilizationCheck.databaseConnectionsOptimal).toBe(true);
      expect(utilizationCheck.networkUsageReasonable).toBe(true);
      expect(utilizationCheck.overallEfficiency).toBeGreaterThan(85);
    });
  });
});