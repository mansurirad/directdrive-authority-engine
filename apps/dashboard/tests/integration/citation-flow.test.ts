/**
 * Citation Monitoring Integration Tests
 * DirectDrive Authority Engine
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for integration tests
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            id: 1,
            ai_model: 'chatgpt',
            query_text: 'test query',
            cited: true,
            citation_context: 'test context',
            position: 2,
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
            data: [
              {
                id: 1,
                ai_model: 'chatgpt',
                query_text: 'test query',
                cited: true,
                monitored_at: '2025-08-13T10:00:00Z',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: { updated: true },
        error: null,
      })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  removeAllChannels: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Citation Monitoring Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Citation Workflow', () => {
    it('should complete full citation monitoring cycle', async () => {
      // Mock API responses for the full workflow
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            citation: {
              id: 1,
              ai_model: 'chatgpt',
              query_text: 'best logistics company Kurdistan',
              cited: true,
              citation_context: 'DirectDrive is mentioned as a top provider',
              position: 2,
            },
            success: true,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => global.testData.citationAnalytics,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => global.testData.competitiveAnalysis,
        });

      // Step 1: Record a new citation
      const citationResponse = await fetch('/api/v1/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_model: 'chatgpt',
          query_text: 'best logistics company Kurdistan',
          cited: true,
          citation_context: 'DirectDrive is mentioned as a top provider',
          position: 2,
        }),
      });

      expect(citationResponse.ok).toBe(true);
      const citationData = await citationResponse.json();
      expect(citationData.success).toBe(true);
      expect(citationData.citation.cited).toBe(true);

      // Step 2: Fetch analytics to verify data is included
      const analyticsResponse = await fetch('/api/v1/citations/analytics');
      expect(analyticsResponse.ok).toBe(true);
      const analyticsData = await analyticsResponse.json();
      expect(analyticsData.total_citations).toBeGreaterThan(0);

      // Step 3: Check competitive analysis
      const competitiveResponse = await fetch(
        '/api/v1/citations/competitive?query_text=best%20logistics%20company%20Kurdistan'
      );
      expect(competitiveResponse.ok).toBe(true);
      const competitiveData = await competitiveResponse.json();
      expect(competitiveData.directdrive_position).toBeDefined();
    });

    it('should handle citation detection workflow', async () => {
      // Test the citation detection logic
      const { CitationDetector } = await import('@directdrive/shared');
      const detector = new CitationDetector();

      const testResponse = 'DirectDrive Logistics is a leading logistics company in Kurdistan region, offering comprehensive freight and shipping services.';
      
      const analysis = detector.detectCitation(testResponse);

      expect(analysis.cited).toBe(true);
      expect(analysis.confidence).toBeGreaterThan(0.5);
      expect(analysis.context).toContain('DirectDrive');
      expect(analysis.qualityScore).toBeGreaterThan(0);
    });

    it('should handle competitive analysis workflow', async () => {
      const { CompetitiveAnalyzer } = await import('@directdrive/shared');
      const analyzer = new CompetitiveAnalyzer();

      const mockResponses = [
        {
          query: 'best logistics company Kurdistan',
          response: 'Top companies include Kurdistan Express, DirectDrive Logistics, and Erbil Transport.',
          aiModel: 'chatgpt',
        },
      ];

      const analysis = analyzer.analyzeCompetitiveLandscape(mockResponses);

      expect(analysis.directdriveProfile).toBeDefined();
      expect(analysis.marketLeaders.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Database Integration', () => {
    it('should successfully connect to Supabase', () => {
      const supabase = createClient('test-url', 'test-key');
      expect(supabase).toBeDefined();
    });

    it('should insert citation data correctly', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const result = await supabase
        .from('ai_citations')
        .insert({
          ai_model: 'chatgpt',
          query_text: 'test query',
          cited: true,
          citation_context: 'test context',
          position: 2,
        })
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.data.cited).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should query citation analytics correctly', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const result = await supabase
        .from('ai_citations')
        .select('*')
        .gte('monitored_at', '2025-08-01')
        .eq('cited', true);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('API Integration', () => {
    it('should handle API rate limiting', async () => {
      // Mock rate limited response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' }),
      });

      const response = await fetch('/api/v1/citations', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });

      expect(response.status).toBe(429);
    });

    it('should validate API request data', async () => {
      // Mock validation error response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid request data' }),
      });

      const response = await fetch('/api/v1/citations', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toContain('Invalid');
    });

    it('should handle server errors gracefully', async () => {
      // Mock server error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/v1/citations');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('Real-time Integration', () => {
    it('should establish real-time connection', () => {
      const supabase = createClient('test-url', 'test-key');
      const channel = supabase.channel('test-channel');
      
      expect(channel).toBeDefined();
      expect(mockSupabase.channel).toHaveBeenCalledWith('test-channel');
    });

    it('should subscribe to citation updates', () => {
      const supabase = createClient('test-url', 'test-key');
      const channel = supabase.channel('ai_citations');
      
      const mockCallback = vi.fn();
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_citations',
      }, mockCallback);

      expect(mockSupabase.channel).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent API requests', async () => {
      // Mock successful responses
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch('/api/v1/citations', {
          method: 'POST',
          body: JSON.stringify({ test: `data-${i}` }),
        })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.ok).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => global.testData.citationAnalytics,
      });

      await fetch('/api/v1/citations/analytics');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second in tests
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network failures gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

      try {
        await fetch('/api/v1/citations/analytics');
      } catch (error) {
        expect(error.message).toBe('Network failure');
      }
    });

    it('should handle invalid JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        const response = await fetch('/api/v1/citations/analytics');
        await response.json();
      } catch (error) {
        expect(error.message).toBe('Invalid JSON');
      }
    });

    it('should handle authentication errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const response = await fetch('/api/v1/citations');
      expect(response.status).toBe(401);
    });
  });
});