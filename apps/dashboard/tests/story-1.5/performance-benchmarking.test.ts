/**
 * Performance Benchmarking and Validation Tests
 * Story 1.5: DirectDrive Content-Citation-Performance Loop
 * 
 * Validates all performance requirements and accuracy thresholds
 * for the content-citation-performance monitoring system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { performance } from 'perf_hooks';

// Performance requirement constants
const PERFORMANCE_REQUIREMENTS = {
  CONTENT_VERIFICATION_RESPONSE_TIME: 300, // ms
  DAILY_CRAWLING_EXECUTION_TIME: 120000, // ms (2 minutes)
  ATTRIBUTION_CORRELATION_TIME: 5000, // ms (5 seconds)
  CONCURRENT_CONTENT_SUPPORT: 500,
  CONFIDENCE_THRESHOLD: 85, // %
  CITATION_LIFT_REQUIREMENT: 50, // %
  TIME_TO_CITATION_REQUIREMENT: 14, // days
  ROI_PRECISION_DECIMAL_PLACES: 2
};

// Mock performance monitoring utilities
const mockPerformanceMonitor = {
  measureExecutionTime: vi.fn(),
  measureMemoryUsage: vi.fn(),
  measureThroughput: vi.fn(),
  generateReport: vi.fn()
};

// Mock load testing utilities
const mockLoadTester = {
  simulateConcurrentRequests: vi.fn(),
  stressTestDatabase: vi.fn(),
  validateSystemStability: vi.fn()
};

vi.mock('@/utils/performance-monitor', () => ({
  PerformanceMonitor: vi.fn(() => mockPerformanceMonitor)
}));

vi.mock('@/utils/load-tester', () => ({
  LoadTester: vi.fn(() => mockLoadTester)
}));

describe('Performance Benchmarking and Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Content Verification Performance', () => {
    it('should complete verification within 300ms requirement', async () => {
      // Mock fast response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => '<html><title>Test Content</title><body>Test body</body></html>'
      });

      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const startTime = performance.now();
      
      await verifier.verifyByUrl(
        'https://directdrivelogistic.com/blog/test-article',
        { contentId: 1 }
      );
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_REQUIREMENTS.CONTENT_VERIFICATION_RESPONSE_TIME);
    });

    it('should handle verification load at scale', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      // Mock successful responses
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => '<html><title>Test</title></html>'
      });

      const startTime = performance.now();
      
      // Test 100 concurrent verifications
      const verificationPromises = Array.from({ length: 100 }, (_, i) =>
        verifier.verifyByUrl(
          `https://directdrivelogistic.com/blog/article-${i}`,
          { contentId: i + 1 }
        )
      );

      const results = await Promise.all(verificationPromises);
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / 100;

      expect(results).toHaveLength(100);
      expect(averageTime).toBeLessThan(PERFORMANCE_REQUIREMENTS.CONTENT_VERIFICATION_RESPONSE_TIME);
      expect(results.every(r => r !== null)).toBe(true);
    });

    it('should maintain accuracy under performance pressure', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      // Mock high-quality content
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => `
          <html>
            <head><title>DirectDrive Logistics Solutions</title></head>
            <body>
              <article>
                <h1>DirectDrive Logistics Solutions</h1>
                <p>DirectDrive provides comprehensive logistics services in Kurdistan region.</p>
                <time datetime="2025-08-15">August 15, 2025</time>
              </article>
            </body>
          </html>
        `
      });

      const results = await Promise.all(
        Array.from({ length: 50 }, () =>
          verifier.verifyByUrl(
            'https://directdrivelogistic.com/blog/directdrive-solutions',
            {
              contentId: 1,
              expectedTitle: 'DirectDrive Logistics Solutions',
              expectedKeywords: ['directdrive', 'logistics', 'kurdistan']
            }
          )
        )
      );

      // All results should maintain high confidence despite performance pressure
      results.forEach(result => {
        expect(result.confidence).toBeGreaterThan(PERFORMANCE_REQUIREMENTS.CONFIDENCE_THRESHOLD);
        expect(result.verified).toBe(true);
      });
    });
  });

  describe('Website Crawling Performance', () => {
    it('should complete daily crawling within 2 minutes', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      // Mock blog listing with multiple pages
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => `
          <html>
            <body>
              <div class="blog-posts">
                ${Array.from({ length: 50 }, (_, i) => `
                  <article>
                    <h2><a href="/blog/article-${i}">Article ${i}</a></h2>
                    <time>2025-08-${15 - (i % 15)}</time>
                  </article>
                `).join('')}
              </div>
            </body>
          </html>
        `
      });

      const startTime = performance.now();
      
      const result = await crawler.crawlBlogListing('https://directdrivelogistic.com/blog/');
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_REQUIREMENTS.DAILY_CRAWLING_EXECUTION_TIME);
      expect(result.success).toBe(true);
      expect(result.postsFound.length).toBeGreaterThan(0);
    });

    it('should handle large blog archives efficiently', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      // Mock large blog archive
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => `
          <html>
            <body>
              <div class="blog-posts">
                ${Array.from({ length: 200 }, (_, i) => `
                  <article>
                    <h2><a href="/blog/article-${i}">Article ${i}</a></h2>
                    <time>2025-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}</time>
                  </article>
                `).join('')}
              </div>
              <nav class="pagination">
                <a href="?page=2">Next</a>
              </nav>
            </body>
          </html>
        `
      });

      const startTime = performance.now();
      
      const result = await crawler.crawlBlogListing(
        'https://directdrivelogistic.com/blog/',
        { maxPages: 5, maxArticles: 200 }
      );
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_REQUIREMENTS.DAILY_CRAWLING_EXECUTION_TIME);
      expect(result.postsFound.length).toBeLessThanOrEqual(200);
      expect(result.pagesProcessed).toBeLessThanOrEqual(5);
    });

    it('should optimize memory usage during crawling', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      const initialMemory = process.memoryUsage();
      
      // Mock multiple crawl operations
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: async () => '<html><body><div class="blog-posts"></div></body></html>'
      });

      for (let i = 0; i < 10; i++) {
        await crawler.crawlBlogListing(`https://directdrivelogistic.com/blog/page-${i}`);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Attribution Correlation Performance', () => {
    it('should complete correlation calculation within 5 seconds', async () => {
      const { CitationCorrelator } = await import('@/utils/citation-correlator');
      const correlator = new CitationCorrelator();

      const startTime = performance.now();
      
      await correlator.analyzeContentCitationCorrelation({
        contentId: 1,
        publicationDate: '2025-07-15T00:00:00Z',
        citationTimeframe: {
          start: '2025-07-15T00:00:00Z',
          end: '2025-08-15T00:00:00Z'
        },
        citationDataSize: 1000 // Large dataset
      });
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_REQUIREMENTS.ATTRIBUTION_CORRELATION_TIME);
    });

    it('should handle complex statistical calculations efficiently', async () => {
      const { PerformanceCalculator } = await import('@/utils/performance-calculator');
      const calculator = new PerformanceCalculator();

      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        date: new Date(2025, 6, 15 + (i % 60)), // 60 days of data
        citations: Math.floor(Math.random() * 20) + 5,
        position: Math.floor(Math.random() * 5) + 1
      }));

      const startTime = performance.now();
      
      const confidence = calculator.calculateStatisticalConfidence(largeDataset);
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(confidence.confidence).toBeGreaterThan(0);
    });

    it('should maintain precision under computational load', async () => {
      const { ROICalculator } = await import('@/utils/roi-calculator');
      const calculator = new ROICalculator();

      const calculations = await Promise.all(
        Array.from({ length: 100 }, async (_, i) => {
          const investment = 500 + (i * 10);
          const returns = investment * 1.75; // 75% ROI
          
          return calculator.calculateROI({ investment, returns });
        })
      );

      calculations.forEach((result, i) => {
        const expectedROI = 75.00;
        expect(result.percentage).toBeCloseTo(expectedROI, PERFORMANCE_REQUIREMENTS.ROI_PRECISION_DECIMAL_PLACES);
        
        // Verify decimal precision
        const decimalPlaces = result.percentage.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(PERFORMANCE_REQUIREMENTS.ROI_PRECISION_DECIMAL_PLACES);
      });
    });
  });

  describe('Concurrent Content Support', () => {
    it('should support 500+ content pieces simultaneously', async () => {
      const { AttributionTimelineManager } = await import('@/utils/attribution-timeline');
      const manager = new AttributionTimelineManager();

      const contentIds = Array.from(
        { length: PERFORMANCE_REQUIREMENTS.CONCURRENT_CONTENT_SUPPORT }, 
        (_, i) => i + 1
      );

      const startTime = performance.now();
      
      // Process content in batches of 50 for realistic load simulation
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < contentIds.length; i += batchSize) {
        const batch = contentIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(contentId => 
            manager.calculatePhaseAttribution({
              contentId,
              phase: 'baseline',
              citationData: {
                baseline: 5,
                current: 8,
                timeframe: 4 // weeks
              }
            })
          )
        );
        results.push(...batchResults);
      }
      
      const totalTime = performance.now() - startTime;
      const averageTimePerContent = totalTime / PERFORMANCE_REQUIREMENTS.CONCURRENT_CONTENT_SUPPORT;
      
      expect(results).toHaveLength(PERFORMANCE_REQUIREMENTS.CONCURRENT_CONTENT_SUPPORT);
      expect(averageTimePerContent).toBeLessThan(100); // < 100ms per content piece
      expect(totalTime).toBeLessThan(300000); // Total < 5 minutes
    });

    it('should maintain system stability under maximum load', async () => {
      const { SystemMonitor } = await import('@/utils/system-monitor');
      const monitor = new SystemMonitor();

      const startMetrics = monitor.getCurrentMetrics();
      
      // Simulate maximum load scenario
      const loadPromises = Array.from({ length: 1000 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        return { id: i, processed: true };
      });

      const results = await Promise.all(loadPromises);
      const endMetrics = monitor.getCurrentMetrics();

      expect(results).toHaveLength(1000);
      expect(endMetrics.memoryUsage.heapUsed).toBeLessThan(startMetrics.memoryUsage.heapUsed * 2);
      expect(endMetrics.cpuUsage).toBeLessThan(90); // CPU usage should stay reasonable
    });

    it('should handle database connection pooling efficiently', async () => {
      const { DatabasePool } = await import('@/utils/database-pool');
      const pool = new DatabasePool();

      const startTime = performance.now();
      
      // Simulate 100 concurrent database operations
      const dbOperations = Array.from({ length: 100 }, async (_, i) => {
        const connection = await pool.getConnection();
        
        try {
          // Simulate database operation
          await new Promise(resolve => setTimeout(resolve, 50));
          return { id: i, success: true };
        } finally {
          pool.releaseConnection(connection);
        }
      });

      const results = await Promise.all(dbOperations);
      const duration = performance.now() - startTime;
      
      expect(results).toHaveLength(100);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(pool.getActiveConnections()).toBeLessThan(20); // Efficient pooling
    });
  });

  describe('Accuracy Requirements Validation', () => {
    it('should maintain >85% confidence threshold consistently', async () => {
      const { ConfidenceValidator } = await import('@/utils/confidence-validator');
      const validator = new ConfidenceValidator();

      const testScenarios = [
        {
          name: 'high_quality_match',
          factors: { urlMatch: 1.0, titleMatch: 0.95, contentMatch: 0.92, keywordMatch: 0.88 }
        },
        {
          name: 'good_quality_match',
          factors: { urlMatch: 0.9, titleMatch: 0.88, contentMatch: 0.87, keywordMatch: 0.85 }
        },
        {
          name: 'borderline_match',
          factors: { urlMatch: 0.85, titleMatch: 0.85, contentMatch: 0.85, keywordMatch: 0.85 }
        }
      ];

      testScenarios.forEach(scenario => {
        const confidence = validator.calculateOverallConfidence(scenario.factors);
        
        if (scenario.name === 'borderline_match') {
          expect(confidence).toBeGreaterThanOrEqual(PERFORMANCE_REQUIREMENTS.CONFIDENCE_THRESHOLD);
        } else {
          expect(confidence).toBeGreaterThan(PERFORMANCE_REQUIREMENTS.CONFIDENCE_THRESHOLD);
        }
      });
    });

    it('should validate citation lift >50% requirement', async () => {
      const { PerformanceValidator } = await import('@/utils/performance-validator');
      const validator = new PerformanceValidator();

      const testCases = [
        { baseline: 10, current: 16, expectedLift: 60.0 },
        { baseline: 5, current: 8, expectedLift: 60.0 },
        { baseline: 20, current: 31, expectedLift: 55.0 },
        { baseline: 8, current: 13, expectedLift: 62.5 }
      ];

      testCases.forEach(testCase => {
        const lift = validator.calculateCitationLift(testCase.baseline, testCase.current);
        
        expect(lift).toBeCloseTo(testCase.expectedLift, 1);
        expect(lift).toBeGreaterThan(PERFORMANCE_REQUIREMENTS.CITATION_LIFT_REQUIREMENT);
      });
    });

    it('should validate time to citation <14 days requirement', async () => {
      const { TimelineValidator } = await import('@/utils/timeline-validator');
      const validator = new TimelineValidator();

      const publicationDates = [
        '2025-08-01T00:00:00Z',
        '2025-08-05T12:00:00Z',
        '2025-08-10T08:30:00Z'
      ];

      const firstCitationDates = [
        '2025-08-03T10:15:00Z', // 2.4 days
        '2025-08-12T14:20:00Z', // 7.1 days
        '2025-08-22T16:45:00Z'  // 12.3 days
      ];

      publicationDates.forEach((pubDate, index) => {
        const timeToFirstCitation = validator.calculateTimeToFirstCitation(
          pubDate,
          firstCitationDates[index]
        );
        
        expect(timeToFirstCitation).toBeLessThan(PERFORMANCE_REQUIREMENTS.TIME_TO_CITATION_REQUIREMENT);
        expect(timeToFirstCitation).toBeGreaterThan(0);
      });
    });

    it('should validate ROI calculation precision', async () => {
      const { ROIValidator } = await import('@/utils/roi-validator');
      const validator = new ROIValidator();

      const testCases = [
        { investment: 750.00, returns: 1125.00, expectedROI: 50.00 },
        { investment: 1000.50, returns: 1875.75, expectedROI: 87.46 },
        { investment: 2250.33, returns: 3600.55, expectedROI: 60.00 }
      ];

      testCases.forEach(testCase => {
        const roi = validator.calculateROI(testCase.investment, testCase.returns);
        
        expect(roi).toBeCloseTo(testCase.expectedROI, PERFORMANCE_REQUIREMENTS.ROI_PRECISION_DECIMAL_PLACES);
        
        // Verify decimal precision
        const roiString = roi.toFixed(PERFORMANCE_REQUIREMENTS.ROI_PRECISION_DECIMAL_PLACES);
        expect(roiString).toMatch(/^\d+\.\d{2}$/);
      });
    });
  });

  describe('Integration Performance', () => {
    it('should maintain performance across all Story 1.1-1.4 integrations', async () => {
      const { IntegrationPerformanceTester } = await import('@/utils/integration-performance-tester');
      const tester = new IntegrationPerformanceTester();

      const integrationTests = [
        { story: '1.1', component: 'supabase_database', operation: 'query_citations' },
        { story: '1.2', component: 'n8n_workflow', operation: 'trigger_monitoring' },
        { story: '1.3', component: 'content_generation', operation: 'fetch_content_pieces' },
        { story: '1.4', component: 'citation_monitoring', operation: 'analyze_competitive' }
      ];

      const results = await Promise.all(
        integrationTests.map(test => tester.testIntegrationPerformance(test))
      );

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.responseTime).toBeLessThan(1000); // < 1 second per integration
        expect(result.dataIntegrity).toBe(true);
        
        console.log(`Story ${integrationTests[index].story} integration: ${result.responseTime}ms`);
      });
    });

    it('should validate end-to-end workflow performance', async () => {
      const { EndToEndTester } = await import('@/utils/end-to-end-tester');
      const tester = new EndToEndTester();

      const startTime = performance.now();
      
      const workflowResult = await tester.executeCompleteWorkflow({
        contentId: 1,
        includeVerification: true,
        includeAttribution: true,
        includeROIAnalysis: true
      });
      
      const totalTime = performance.now() - startTime;
      
      expect(workflowResult.success).toBe(true);
      expect(totalTime).toBeLessThan(30000); // Complete workflow < 30 seconds
      expect(workflowResult.verificationConfidence).toBeGreaterThan(85);
      expect(workflowResult.attributionConfidence).toBeGreaterThan(85);
      expect(workflowResult.roiAccuracy).toBeGreaterThan(95);
    });
  });

  describe('Stress Testing', () => {
    it('should handle peak load scenarios', async () => {
      const { StressTester } = await import('@/utils/stress-tester');
      const tester = new StressTester();

      const stressTestConfig = {
        concurrentUsers: 100,
        requestsPerUser: 50,
        duration: 60000, // 1 minute
        rampUpTime: 10000 // 10 seconds
      };

      const results = await tester.executeStressTest(stressTestConfig);
      
      expect(results.successRate).toBeGreaterThan(95); // > 95% success rate
      expect(results.averageResponseTime).toBeLessThan(500); // < 500ms average
      expect(results.errorRate).toBeLessThan(5); // < 5% error rate
      expect(results.systemStability).toBe(true);
    });

    it('should recover gracefully from overload', async () => {
      const { RecoveryTester } = await import('@/utils/recovery-tester');
      const tester = new RecoveryTester();

      // Simulate system overload
      const overloadResult = await tester.simulateOverload({
        requestRate: 1000, // req/sec
        duration: 30000 // 30 seconds
      });

      expect(overloadResult.systemOverloaded).toBe(true);
      
      // Test recovery
      const recoveryResult = await tester.testRecovery({
        cooldownTime: 60000, // 1 minute
        normalRequestRate: 10 // req/sec
      });

      expect(recoveryResult.systemRecovered).toBe(true);
      expect(recoveryResult.recoveryTime).toBeLessThan(120000); // < 2 minutes
      expect(recoveryResult.dataIntegrity).toBe(true);
    });
  });
});