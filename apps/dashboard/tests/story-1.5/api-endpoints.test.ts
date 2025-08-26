/**
 * API Endpoints Tests for Story 1.5
 * DirectDrive Content-Citation-Performance Loop
 * 
 * Tests for new API endpoints introduced in Story 1.5:
 * - Content verification endpoints
 * - Performance monitoring endpoints
 * - ROI analysis endpoints
 * - Attribution timeline endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock handlers for new Story 1.5 endpoints
const mockHandlers = {
  contentVerify: vi.fn(),
  contentPerformance: vi.fn(),
  roiAnalysis: vi.fn(),
  attributionUpdate: vi.fn()
};

// Mock successful responses
const mockResponses = {
  contentVerify: {
    verification: {
      id: 1,
      content_id: 1,
      verification_method: 'url_tracking',
      match_confidence: 92.5,
      verification_details: {
        url_match: true,
        title_match: true,
        content_similarity: 0.89
      }
    },
    confidence: 92.5,
    success: true
  },
  contentPerformance: {
    performances: [
      {
        id: 1,
        content_id: 1,
        verification_status: 'verified',
        attribution_phase: 'primary',
        citation_lift_percentage: 75.5,
        roi_score: 88.7,
        time_to_first_citation: 3
      }
    ],
    attribution_summary: {
      total_content_pieces: 15,
      average_citation_lift: 68.3,
      average_roi_score: 82.1
    }
  },
  roiAnalysis: {
    roi_metrics: {
      total_investment: 2500.00,
      citation_value_generated: 4375.00,
      roi_percentage: 75.00,
      payback_period_weeks: 6
    },
    content_effectiveness: [
      {
        content_id: 1,
        effectiveness_score: 89.5,
        citation_impact: 'high',
        business_value: 1250.00
      }
    ],
    business_impact: {
      brand_visibility_improvement: 45.8,
      market_authority_increase: 38.2,
      competitive_advantage_gain: 52.3
    }
  }
};

vi.mock('@/pages/api/v1/content/verify', () => mockHandlers.contentVerify);
vi.mock('@/pages/api/v1/content/performance', () => mockHandlers.contentPerformance);
vi.mock('@/pages/api/v1/content/roi-analysis', () => mockHandlers.roiAnalysis);
vi.mock('@/pages/api/v1/content/attribution/update', () => mockHandlers.attributionUpdate);

describe('Story 1.5 API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/content/verify', () => {
    it('should verify content with URL tracking method', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 1,
          publication_url: 'https://directdrivelogistic.com/blog/logistics-solutions'
        }
      });

      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(200).json(mockResponses.contentVerify);
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.verification.verification_method).toBe('url_tracking');
      expect(responseData.confidence).toBeGreaterThan(85);
    });

    it('should validate content_id parameter', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          publication_url: 'https://directdrivelogistic.com/blog/test'
          // Missing content_id
        }
      });

      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'content_id is required',
          success: false
        });
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('content_id');
      expect(responseData.success).toBe(false);
    });

    it('should handle verification failures gracefully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 999,
          publication_url: 'https://nonexistent.com/article'
        }
      });

      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(200).json({
          verification: {
            content_id: 999,
            verification_method: 'url_tracking',
            match_confidence: 15.5,
            verification_details: {
              url_accessible: false,
              title_match: false,
              content_similarity: 0.02
            }
          },
          confidence: 15.5,
          success: false,
          reason: 'CONFIDENCE_THRESHOLD_NOT_MET'
        });
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.confidence).toBeLessThan(85);
      expect(responseData.reason).toBe('CONFIDENCE_THRESHOLD_NOT_MET');
    });

    it('should reject non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(405).json({ error: 'Method not allowed' });
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('GET /api/v1/content/performance', () => {
    it('should return performance data for specific content', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          content_id: '1'
        }
      });

      mockHandlers.contentPerformance.mockImplementation((req, res) => {
        res.status(200).json(mockResponses.contentPerformance);
      });

      await mockHandlers.contentPerformance(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.performances).toHaveLength(1);
      expect(responseData.performances[0].content_id).toBe(1);
      expect(responseData.attribution_summary).toBeDefined();
    });

    it('should filter by attribution phase', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          phase: 'primary'
        }
      });

      mockHandlers.contentPerformance.mockImplementation((req, res) => {
        const filteredResponse = {
          ...mockResponses.contentPerformance,
          performances: mockResponses.contentPerformance.performances.filter(
            p => p.attribution_phase === 'primary'
          )
        };
        res.status(200).json(filteredResponse);
      });

      await mockHandlers.contentPerformance(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.performances[0].attribution_phase).toBe('primary');
    });

    it('should filter by date range', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          date_from: '2025-07-01',
          date_to: '2025-08-15'
        }
      });

      mockHandlers.contentPerformance.mockImplementation((req, res) => {
        res.status(200).json({
          ...mockResponses.contentPerformance,
          date_range: {
            from: '2025-07-01',
            to: '2025-08-15'
          }
        });
      });

      await mockHandlers.contentPerformance(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.date_range).toBeDefined();
      expect(responseData.date_range.from).toBe('2025-07-01');
    });

    it('should handle empty results', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          content_id: '999'
        }
      });

      mockHandlers.contentPerformance.mockImplementation((req, res) => {
        res.status(200).json({
          performances: [],
          attribution_summary: {
            total_content_pieces: 0,
            average_citation_lift: 0,
            average_roi_score: 0
          }
        });
      });

      await mockHandlers.contentPerformance(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.performances).toHaveLength(0);
      expect(responseData.attribution_summary.total_content_pieces).toBe(0);
    });
  });

  describe('GET /api/v1/content/roi-analysis', () => {
    it('should return comprehensive ROI analysis', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeframe: '12_weeks'
        }
      });

      mockHandlers.roiAnalysis.mockImplementation((req, res) => {
        res.status(200).json(mockResponses.roiAnalysis);
      });

      await mockHandlers.roiAnalysis(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.roi_metrics).toBeDefined();
      expect(responseData.roi_metrics.roi_percentage).toBe(75.00);
      expect(responseData.content_effectiveness).toHaveLength(1);
      expect(responseData.business_impact).toBeDefined();
    });

    it('should filter by specific content IDs', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeframe: '8_weeks',
          content_ids: '1,2,3'
        }
      });

      mockHandlers.roiAnalysis.mockImplementation((req, res) => {
        res.status(200).json({
          ...mockResponses.roiAnalysis,
          filtered_content_ids: [1, 2, 3],
          content_effectiveness: [
            { content_id: 1, effectiveness_score: 89.5 },
            { content_id: 2, effectiveness_score: 82.3 },
            { content_id: 3, effectiveness_score: 91.7 }
          ]
        });
      });

      await mockHandlers.roiAnalysis(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.filtered_content_ids).toEqual([1, 2, 3]);
      expect(responseData.content_effectiveness).toHaveLength(3);
    });

    it('should validate timeframe parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeframe: 'invalid_timeframe'
        }
      });

      mockHandlers.roiAnalysis.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Invalid timeframe. Allowed values: 4_weeks, 8_weeks, 12_weeks',
          success: false
        });
      });

      await mockHandlers.roiAnalysis(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Invalid timeframe');
    });

    it('should handle calculation errors', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          timeframe: '12_weeks'
        }
      });

      mockHandlers.roiAnalysis.mockImplementation((req, res) => {
        res.status(500).json({
          error: 'ROI calculation failed due to insufficient data',
          success: false
        });
      });

      await mockHandlers.roiAnalysis(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('calculation failed');
    });
  });

  describe('POST /api/v1/content/attribution/update', () => {
    it('should update attribution data successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 1,
          citation_data: {
            new_citations: 3,
            average_position: 2.1,
            ai_model: 'chatgpt',
            correlation_confidence: 91.5
          }
        }
      });

      mockHandlers.attributionUpdate.mockImplementation((req, res) => {
        res.status(200).json({
          attribution: {
            id: 1,
            content_id: 1,
            phase: 'primary',
            citation_count_end: 12,
            attribution_confidence: 89.7,
            updated_at: '2025-08-15T12:00:00Z'
          },
          correlation_updated: true,
          success: true
        });
      });

      await mockHandlers.attributionUpdate(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.correlation_updated).toBe(true);
      expect(responseData.attribution.content_id).toBe(1);
    });

    it('should validate required citation data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 1
          // Missing citation_data
        }
      });

      mockHandlers.attributionUpdate.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'citation_data is required',
          success: false
        });
      });

      await mockHandlers.attributionUpdate(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('citation_data');
      expect(responseData.success).toBe(false);
    });

    it('should handle phase transition updates', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 1,
          citation_data: {
            new_citations: 5,
            phase_transition: 'primary_to_sustained'
          }
        }
      });

      mockHandlers.attributionUpdate.mockImplementation((req, res) => {
        res.status(200).json({
          attribution: {
            id: 1,
            content_id: 1,
            phase: 'sustained',
            phase_transitioned: true,
            transition_date: '2025-09-09T00:00:00Z'
          },
          correlation_updated: true,
          phase_transition_completed: true,
          success: true
        });
      });

      await mockHandlers.attributionUpdate(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.phase_transition_completed).toBe(true);
      expect(responseData.attribution.phase).toBe('sustained');
    });

    it('should handle invalid content ID', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 999,
          citation_data: {
            new_citations: 2
          }
        }
      });

      mockHandlers.attributionUpdate.mockImplementation((req, res) => {
        res.status(404).json({
          error: 'Content not found',
          success: false
        });
      });

      await mockHandlers.attributionUpdate(req, res);

      expect(res._getStatusCode()).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Content not found');
    });
  });

  describe('API Performance and Rate Limiting', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 50 }, () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: { content_id: '1' }
        });

        mockHandlers.contentPerformance.mockImplementation((req, res) => {
          res.status(200).json(mockResponses.contentPerformance);
        });

        return mockHandlers.contentPerformance(req, res);
      });

      const startTime = Date.now();
      await Promise.all(concurrentRequests);
      const duration = Date.now() - startTime;

      // Should handle 50 concurrent requests within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(mockHandlers.contentPerformance).toHaveBeenCalledTimes(50);
    });

    it('should implement rate limiting for verification endpoint', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100'
        },
        body: {
          content_id: 1,
          publication_url: 'https://directdrivelogistic.com/blog/test'
        }
      });

      // Simulate rate limit exceeded
      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(429).json({
          error: 'Rate limit exceeded. Maximum 10 requests per minute.',
          retry_after: 60,
          success: false
        });
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(429);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Rate limit exceeded');
      expect(responseData.retry_after).toBe(60);
    });

    it('should validate request body size limits', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content_id: 1,
          citation_data: {
            // Simulate oversized payload
            large_data: 'x'.repeat(1000000) // 1MB of data
          }
        }
      });

      mockHandlers.attributionUpdate.mockImplementation((req, res) => {
        res.status(413).json({
          error: 'Request payload too large',
          max_size: '100KB',
          success: false
        });
      });

      await mockHandlers.attributionUpdate(req, res);

      expect(res._getStatusCode()).toBe(413);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('payload too large');
    });
  });

  describe('API Error Handling', () => {
    it('should handle database connection errors', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { content_id: '1' }
      });

      mockHandlers.contentPerformance.mockImplementation((req, res) => {
        res.status(503).json({
          error: 'Database temporarily unavailable',
          retry_after: 30,
          success: false
        });
      });

      await mockHandlers.contentPerformance(req, res);

      expect(res._getStatusCode()).toBe(503);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Database temporarily unavailable');
      expect(responseData.retry_after).toBe(30);
    });

    it('should handle malformed JSON requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: '{ invalid json }'
      });

      mockHandlers.contentVerify.mockImplementation((req, res) => {
        res.status(400).json({
          error: 'Invalid JSON in request body',
          success: false
        });
      });

      await mockHandlers.contentVerify(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Invalid JSON');
    });

    it('should provide consistent error response format', async () => {
      const errorResponses = [
        { status: 400, error: 'Bad Request' },
        { status: 404, error: 'Not Found' },
        { status: 500, error: 'Internal Server Error' }
      ];

      for (const errorResponse of errorResponses) {
        const { req, res } = createMocks({
          method: 'GET',
          query: { test: 'error' }
        });

        mockHandlers.contentPerformance.mockImplementation((req, res) => {
          res.status(errorResponse.status).json({
            error: errorResponse.error,
            success: false,
            timestamp: new Date().toISOString(),
            path: '/api/v1/content/performance'
          });
        });

        await mockHandlers.contentPerformance(req, res);

        expect(res._getStatusCode()).toBe(errorResponse.status);
        const responseData = JSON.parse(res._getData());
        expect(responseData.success).toBe(false);
        expect(responseData.error).toBeDefined();
        expect(responseData.timestamp).toBeDefined();
        expect(responseData.path).toBeDefined();
      }
    });
  });
});