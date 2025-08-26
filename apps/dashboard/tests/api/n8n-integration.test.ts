/**
 * n8n Integration Test Suite
 * Tests the n8n API endpoints for keyword and content management
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET;

describe('n8n Integration Tests', () => {
  const headers = {
    'Authorization': `Bearer ${N8N_API_KEY}`,
    'Content-Type': 'application/json',
  };

  describe('Keywords API', () => {
    test('GET /api/v1/n8n/keywords - fetch pending keywords', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords?status=pending&limit=5`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.keywords)).toBe(true);
      expect(data.keywords.length).toBeGreaterThan(0);
      
      // Verify keyword structure
      const keyword = data.keywords[0];
      expect(keyword).toHaveProperty('id');
      expect(keyword).toHaveProperty('primary_keyword');
      expect(keyword.status).toBe('pending');
    });

    test('POST /api/v1/n8n/keywords - create new keyword', async () => {
      const newKeyword = {
        industry: 'logistics',
        language: 'en',
        primary_keyword: 'test keyword automation',
        secondary_keywords: ['keyword1', 'keyword2'],
        intent: 'informational',
        priority: 8,
        status: 'pending'
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newKeyword),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.keyword).toHaveProperty('id');
      expect(data.keyword.primary_keyword).toBe(newKeyword.primary_keyword);
      expect(data.keyword.status).toBe('pending');
    });

    test('PUT /api/v1/n8n/keywords/[id] - update keyword status', async () => {
      // First get a pending keyword
      const keywords = await supabase
        .from('keywords')
        .select('id')
        .eq('status', 'pending')
        .limit(1);

      if (keywords.data && keywords.data.length > 0) {
        const keywordId = keywords.data[0].id;

        const response = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords/${keywordId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: 'active' }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.keyword.status).toBe('active');
      }
    });
  });

  describe('Content API', () => {
    test('POST /api/v1/n8n/content - submit generated content', async () => {
      // Get a keyword ID for reference
      const keywords = await supabase
        .from('keywords')
        .select('id')
        .limit(1);

      const newContent = {
        keyword_id: keywords.data?.[0]?.id,
        title: 'Test Article: Best Logistics Practices',
        content: 'This is a test article content for n8n integration testing...',
        industry: 'logistics',
        language: 'en',
        ai_model: 'gemini-2.0-flash',
        generation_time: 45,
        quality_score: 87.5,
        status: 'draft',
        tracking_enabled: true
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/content`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newContent),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.content).toHaveProperty('id');
      expect(data.content.title).toBe(newContent.title);
      expect(data.content.status).toBe('draft');
    });

    test('POST /api/v1/n8n/content - published content with performance tracking', async () => {
      const publishedContent = {
        title: 'Published Test Article',
        content: 'This is a published test article with performance tracking...',
        industry: 'logistics',
        language: 'en',
        ai_model: 'gemini-2.0-flash',
        quality_score: 92.0,
        published_url: 'https://directdrivelogistic.com/test-article',
        status: 'published',
        tracking_enabled: true
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/content`, {
        method: 'POST',
        headers,
        body: JSON.stringify(publishedContent),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.content.status).toBe('published');
      expect(data.content).toHaveProperty('performance_tracking_id');
      expect(typeof data.content.performance_tracking_id).toBe('number');
    });
  });

  describe('Performance Monitoring API', () => {
    test('GET /api/v1/n8n/performance - fetch performance data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/performance?limit=5`, {
        method: 'GET',
        headers,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.performance_records)).toBe(true);
      
      // Check structure if records exist
      if (data.performance_records.length > 0) {
        const record = data.performance_records[0];
        expect(record).toHaveProperty('content_id');
        expect(record).toHaveProperty('verification_status');
        expect(record).toHaveProperty('attribution_phase');
      }
    });

    test('POST /api/v1/n8n/performance - update performance metrics', async () => {
      // Get a performance record to update
      const performance = await supabase
        .from('content_performance')
        .select('id, content_id')
        .limit(1);

      if (performance.data && performance.data.length > 0) {
        const performanceId = performance.data[0].id;

        const updateData = {
          verification_status: 'verified',
          verification_confidence: 95.5,
          citation_current_count: 3,
          citation_lift_percentage: 25.0,
          roi_score: 78.3
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/n8n/performance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            performance_id: performanceId,
            ...updateData
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.updated_record.verification_status).toBe('verified');
      }
    });
  });

  describe('End-to-End Workflow Simulation', () => {
    test('Complete n8n workflow simulation', async () => {
      // Step 1: Create a new keyword
      const newKeyword = {
        industry: 'logistics',
        language: 'en',
        primary_keyword: 'automated workflow test',
        intent: 'informational',
        priority: 9,
        status: 'pending'
      };

      const keywordResponse = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newKeyword),
      });

      expect(keywordResponse.status).toBe(201);
      const keywordData = await keywordResponse.json();
      const keywordId = keywordData.keyword.id;

      // Step 2: Update keyword status to active
      const updateResponse = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords/${keywordId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'active' }),
      });

      expect(updateResponse.status).toBe(200);

      // Step 3: Submit generated content
      const contentData = {
        keyword_id: keywordId,
        title: 'Automated Test Content',
        content: 'This is automatically generated content for testing...',
        industry: 'logistics',
        language: 'en',
        ai_model: 'gemini-2.0-flash',
        generation_time: 35,
        quality_score: 88.0,
        published_url: 'https://directdrivelogistic.com/automated-test',
        status: 'published',
        tracking_enabled: true
      };

      const contentResponse = await fetch(`${API_BASE_URL}/api/v1/n8n/content`, {
        method: 'POST',
        headers,
        body: JSON.stringify(contentData),
      });

      expect(contentResponse.status).toBe(201);
      const contentResult = await contentResponse.json();

      // Step 4: Verify performance tracking was created
      expect(contentResult.content).toHaveProperty('performance_tracking_id');
      expect(typeof contentResult.content.performance_tracking_id).toBe('number');

      // Step 5: Mark keyword as completed
      const completeResponse = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords/${keywordId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'completed' }),
      });

      expect(completeResponse.status).toBe(200);

      console.log('✅ End-to-end workflow test completed successfully');
    }, 30000); // 30 second timeout for full workflow
  });

  describe('Error Handling', () => {
    test('Unauthorized access without API key', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    test('Invalid request data validation', async () => {
      const invalidKeyword = {
        // Missing required fields
        primary_keyword: '', // Empty string should fail validation
        intent: 'invalid_intent', // Invalid enum value
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/n8n/keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invalidKeyword),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid request data');
    });
  });
});