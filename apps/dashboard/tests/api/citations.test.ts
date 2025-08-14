/**
 * Citation API Endpoints Tests
 * Tests for /api/v1/citations endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import citationsHandler from '../../src/pages/api/v1/citations/index';
import analyticsHandler from '../../src/pages/api/v1/citations/analytics';
import competitiveHandler from '../../src/pages/api/v1/citations/competitive';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 1,
              content_id: null,
              ai_model: 'chatgpt',
              query_text: 'test query',
              cited: true,
              citation_context: 'test context',
              position: 3,
              monitored_at: '2025-08-13T10:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            eq: vi.fn(() => ({
              count: 5,
              data: [
                {
                  id: 1,
                  ai_model: 'chatgpt',
                  monitored_at: '2025-08-13T10:00:00Z',
                  citation_context: 'DirectDrive is mentioned',
                  position: 3,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => ({
      data: [
        { date: '2025-08-13', citations: 2, ai_model: 'chatgpt' },
        { date: '2025-08-13', citations: 1, ai_model: 'google-ai' },
      ],
      error: null,
    })),
  })),
}));

describe('/api/v1/citations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/citations', () => {
    it('should create a new citation record', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          ai_model: 'chatgpt',
          query_text: 'best logistics company Kurdistan',
          cited: true,
          citation_context: 'DirectDrive is mentioned as top logistics provider',
          position: 3,
        },
      });

      await citationsHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.citation.ai_model).toBe('chatgpt');
      expect(responseData.citation.query_text).toBe('test query');
    });

    it('should reject invalid ai_model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          ai_model: 'invalid-model',
          query_text: 'test query',
          cited: true,
        },
      });

      await citationsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Invalid request data');
    });

    it('should reject non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await citationsHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getData()).toContain('Method not allowed');
    });
  });

  describe('GET /api/v1/citations/analytics', () => {
    it('should return citation analytics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          ai_model: 'chatgpt',
          date_from: '2025-08-01',
          date_to: '2025-08-13',
        },
      });

      await analyticsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.total_citations).toBeDefined();
      expect(responseData.citation_trends).toBeDefined();
      expect(responseData.model_breakdown).toBeDefined();
      expect(responseData.improvement_metrics).toBeDefined();
    });

    it('should reject non-GET methods', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await analyticsHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('GET /api/v1/citations/competitive', () => {
    it('should return competitive analysis', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          query_text: 'best logistics company Kurdistan',
          ai_model: 'chatgpt',
        },
      });

      await competitiveHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.directdrive_position).toBeDefined();
      expect(responseData.competitors).toBeDefined();
      expect(responseData.market_share).toBeDefined();
    });

    it('should require query_text parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await competitiveHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Invalid query parameters');
    });
  });
});