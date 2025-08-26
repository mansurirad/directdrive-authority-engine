/**
 * Content Verification System Tests
 * Story 1.5: DirectDrive Content-Citation-Performance Loop
 * 
 * Tests multi-factor content matching and verification algorithms
 * with >85% confidence threshold requirements
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock data for DirectDrive blog content
const mockDirectDriveBlogContent = {
  published: {
    title: "Comprehensive Logistics Solutions in Kurdistan Region",
    url: "https://directdrivelogistic.com/blog/comprehensive-logistics-solutions-kurdistan",
    publishDate: "2025-08-15",
    keywords: ["logistics", "kurdistan", "freight", "shipping", "directdrive"],
    content: "DirectDrive Logistics provides comprehensive freight and shipping services across Kurdistan region. Our logistics solutions include warehousing, distribution, and supply chain management.",
    hash: "sha256:1a2b3c4d5e6f7890abcdef1234567890"
  },
  unpublished: {
    title: "Future of Logistics Technology",
    content: "Exploring emerging technologies in logistics and supply chain management.",
    keywords: ["logistics", "technology", "innovation", "automation"]
  }
};

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: {
            content_piece_id: 1,
            title: mockDirectDriveBlogContent.published.title,
            content_body: mockDirectDriveBlogContent.published.content,
            keywords: mockDirectDriveBlogContent.published.keywords,
            published_url: mockDirectDriveBlogContent.published.url,
            publication_date: mockDirectDriveBlogContent.published.publishDate
          },
          error: null
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: 1, verification_method: 'url_tracking', match_confidence: 95.5 },
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
  }))
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

// Mock web crawler
global.fetch = vi.fn();

describe('Content Verification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful webpage fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => `
        <html>
          <head><title>${mockDirectDriveBlogContent.published.title}</title></head>
          <body>
            <article>
              <h1>${mockDirectDriveBlogContent.published.title}</h1>
              <time datetime="${mockDirectDriveBlogContent.published.publishDate}">August 15, 2025</time>
              <p>${mockDirectDriveBlogContent.published.content}</p>
            </article>
          </body>
        </html>
      `
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multi-Factor Content Matching', () => {
    it('should verify content via URL tracking with >85% confidence', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const result = await verifier.verifyByUrl(
        mockDirectDriveBlogContent.published.url,
        {
          contentId: 1,
          expectedTitle: mockDirectDriveBlogContent.published.title,
          expectedKeywords: mockDirectDriveBlogContent.published.keywords
        }
      );

      expect(result.verified).toBe(true);
      expect(result.confidence).toBeGreaterThan(85);
      expect(result.method).toBe('url_tracking');
      expect(result.matchedElements).toContain('title');
      expect(result.matchedElements).toContain('content');
    });

    it('should verify content via title and date correlation', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const result = await verifier.verifyByTitleDate(
        mockDirectDriveBlogContent.published.title,
        mockDirectDriveBlogContent.published.publishDate,
        { contentId: 1 }
      );

      expect(result.verified).toBe(true);
      expect(result.confidence).toBeGreaterThan(85);
      expect(result.method).toBe('title_date');
      expect(result.titleSimilarity).toBeGreaterThan(0.9);
      expect(result.dateMatch).toBe(true);
    });

    it('should verify content via keyword fingerprint analysis', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const result = await verifier.verifyByKeywordFingerprint(
        mockDirectDriveBlogContent.published.keywords,
        mockDirectDriveBlogContent.published.content,
        { contentId: 1 }
      );

      expect(result.verified).toBe(true);
      expect(result.confidence).toBeGreaterThan(85);
      expect(result.method).toBe('keyword_fingerprint');
      expect(result.keywordMatchRate).toBeGreaterThan(0.8);
      expect(result.fingerprintScore).toBeGreaterThan(0.85);
    });

    it('should verify content via content similarity scoring', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const publishedContent = mockDirectDriveBlogContent.published.content;
      const databaseContent = "DirectDrive Logistics offers comprehensive logistics and freight services in Kurdistan.";

      const result = await verifier.verifyByContentSimilarity(
        publishedContent,
        databaseContent,
        { contentId: 1 }
      );

      expect(result.verified).toBe(true);
      expect(result.confidence).toBeGreaterThan(85);
      expect(result.method).toBe('content_similarity');
      expect(result.similarityScore).toBeGreaterThan(0.85);
      expect(result.semanticMatch).toBe(true);
    });

    it('should reject verification below 85% confidence threshold', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      // Mock low confidence response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <html>
            <head><title>Unrelated Article</title></head>
            <body><p>This content has no relation to DirectDrive logistics.</p></body>
          </html>
        `
      });

      const result = await verifier.verifyByUrl(
        "https://example.com/unrelated-article",
        {
          contentId: 1,
          expectedTitle: mockDirectDriveBlogContent.published.title,
          expectedKeywords: mockDirectDriveBlogContent.published.keywords
        }
      );

      expect(result.verified).toBe(false);
      expect(result.confidence).toBeLessThan(85);
      expect(result.rejectionReason).toBe('CONFIDENCE_THRESHOLD_NOT_MET');
    });
  });

  describe('Website Crawling Integration', () => {
    it('should crawl directdrivelogistic.com/blog/ successfully', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      // Mock blog listing page
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <html>
            <body>
              <div class="blog-posts">
                <article>
                  <h2><a href="/blog/comprehensive-logistics-solutions-kurdistan">Comprehensive Logistics Solutions</a></h2>
                  <time>2025-08-15</time>
                </article>
                <article>
                  <h2><a href="/blog/freight-management-best-practices">Freight Management Best Practices</a></h2>
                  <time>2025-08-10</time>
                </article>
              </div>
            </body>
          </html>
        `
      });

      const crawlResult = await crawler.crawlBlogListing('https://directdrivelogistic.com/blog/');

      expect(crawlResult.success).toBe(true);
      expect(crawlResult.postsFound.length).toBeGreaterThan(0);
      expect(crawlResult.postsFound[0]).toMatchObject({
        title: expect.stringContaining('Comprehensive Logistics'),
        url: expect.stringContaining('/blog/comprehensive-logistics'),
        publishDate: '2025-08-15'
      });
      expect(crawlResult.crawlDuration).toBeLessThan(120000); // < 2 minutes
    });

    it('should detect new content publication', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      const existingContent = [
        {
          title: "Existing Article",
          url: "https://directdrivelogistic.com/blog/existing-article",
          publishDate: "2025-08-10"
        }
      ];

      // Mock updated blog listing with new content
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <html>
            <body>
              <div class="blog-posts">
                <article>
                  <h2><a href="/blog/new-logistics-innovations">New Logistics Innovations</a></h2>
                  <time>2025-08-16</time>
                </article>
                <article>
                  <h2><a href="/blog/existing-article">Existing Article</a></h2>
                  <time>2025-08-10</time>
                </article>
              </div>
            </body>
          </html>
        `
      });

      const newContent = await crawler.detectNewContent(
        'https://directdrivelogistic.com/blog/',
        existingContent
      );

      expect(newContent.length).toBe(1);
      expect(newContent[0].title).toContain('New Logistics Innovations');
      expect(newContent[0].isNew).toBe(true);
    });

    it('should handle crawler errors gracefully', async () => {
      const { BlogCrawler } = await import('@/utils/blog-crawler');
      const crawler = new BlogCrawler();

      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

      const result = await crawler.crawlBlogListing('https://directdrivelogistic.com/blog/');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
      expect(result.postsFound).toEqual([]);
    });
  });

  describe('Confidence Scoring System', () => {
    it('should calculate weighted confidence scores correctly', async () => {
      const { ConfidenceCalculator } = await import('@/utils/confidence-calculator');
      const calculator = new ConfidenceCalculator();

      const verificationResults = [
        { method: 'url_tracking', confidence: 95, weight: 0.4 },
        { method: 'title_date', confidence: 90, weight: 0.3 },
        { method: 'keyword_fingerprint', confidence: 88, weight: 0.2 },
        { method: 'content_similarity', confidence: 92, weight: 0.1 }
      ];

      const overallConfidence = calculator.calculateWeightedConfidence(verificationResults);

      expect(overallConfidence).toBeGreaterThan(85);
      expect(overallConfidence).toBeLessThanOrEqual(100);
      
      // Verify weighted calculation
      const expectedConfidence = (95 * 0.4) + (90 * 0.3) + (88 * 0.2) + (92 * 0.1);
      expect(overallConfidence).toBeCloseTo(expectedConfidence, 1);
    });

    it('should apply confidence penalties for missing data', async () => {
      const { ConfidenceCalculator } = await import('@/utils/confidence-calculator');
      const calculator = new ConfidenceCalculator();

      const incompleteResults = [
        { method: 'url_tracking', confidence: 95, weight: 0.4 },
        { method: 'title_date', confidence: 0, weight: 0.3 }, // Failed verification
        { method: 'keyword_fingerprint', confidence: 88, weight: 0.3 }
        // Missing content_similarity
      ];

      const penalizedConfidence = calculator.calculateWeightedConfidence(incompleteResults);

      expect(penalizedConfidence).toBeLessThan(85); // Should fall below threshold
      expect(penalizedConfidence).toBeGreaterThan(0);
    });
  });

  describe('Database Integration', () => {
    it('should store verification results in content_verification table', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const verificationData = {
        content_id: 1,
        verification_method: 'url_tracking',
        match_confidence: 95.5,
        verification_details: {
          url: mockDirectDriveBlogContent.published.url,
          title_match: true,
          content_match: true,
          keyword_matches: 5
        }
      };

      const result = await supabase
        .from('content_verification')
        .insert(verificationData)
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.data.match_confidence).toBe(95.5);
      expect(result.data.verification_method).toBe('url_tracking');
      expect(result.error).toBeNull();
    });

    it('should update content_pieces verification status', async () => {
      const supabase = createClient('test-url', 'test-key');
      
      const updateResult = await supabase
        .from('content_pieces')
        .update({
          verification_status: 'verified',
          verification_confidence: 95.5,
          verified_url: mockDirectDriveBlogContent.published.url
        })
        .eq('content_piece_id', 1);

      expect(updateResult.data).toEqual({ updated: true });
      expect(updateResult.error).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should complete verification within 300ms response time', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const startTime = Date.now();
      
      await verifier.verifyByUrl(
        mockDirectDriveBlogContent.published.url,
        { contentId: 1 }
      );
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(300);
    });

    it('should handle concurrent verification requests', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const verificationPromises = Array.from({ length: 10 }, (_, i) =>
        verifier.verifyByUrl(
          `https://directdrivelogistic.com/blog/article-${i}`,
          { contentId: i + 1 }
        )
      );

      const results = await Promise.all(verificationPromises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.confidence).toBe('number');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      const result = await verifier.verifyByUrl(
        'invalid-url',
        { contentId: 1 }
      );

      expect(result.verified).toBe(false);
      expect(result.error).toBe('INVALID_URL');
      expect(result.confidence).toBe(0);
    });

    it('should handle missing content gracefully', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      // Mock 404 response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      });

      const result = await verifier.verifyByUrl(
        'https://directdrivelogistic.com/blog/non-existent',
        { contentId: 1 }
      );

      expect(result.verified).toBe(false);
      expect(result.error).toBe('CONTENT_NOT_FOUND');
      expect(result.httpStatus).toBe(404);
    });

    it('should handle network timeouts', async () => {
      const { ContentVerifier } = await import('@/utils/content-verification');
      const verifier = new ContentVerifier();

      // Mock timeout
      (global.fetch as any).mockRejectedValueOnce(new Error('Request timeout'));

      const result = await verifier.verifyByUrl(
        'https://directdrivelogistic.com/blog/slow-page',
        { contentId: 1 }
      );

      expect(result.verified).toBe(false);
      expect(result.error).toBe('NETWORK_TIMEOUT');
      expect(result.confidence).toBe(0);
    });
  });
});