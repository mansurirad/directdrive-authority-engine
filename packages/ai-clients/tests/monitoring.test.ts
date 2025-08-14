/**
 * AI Monitoring Clients Tests
 * DirectDrive Authority Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatGPTMonitoringClient } from '../src/monitoring/chatgpt';
import { GoogleAIMonitoringClient } from '../src/monitoring/google-ai';
import { PerplexityMonitoringClient } from '../src/monitoring/perplexity';
import { AIMonitoringManager } from '../src/index';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'DirectDrive Logistics is a leading logistics company in Kurdistan region, offering comprehensive freight and shipping services.'
            }
          }]
        })
      }
    }
  }))
}));

// Mock Google AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'DirectDrive Logistics شركة رائدة في الخدمات اللوجستية في إقليم كردستان.'
        }
      })
    })
  }))
}));

// Mock Axios for Perplexity
vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue({
      post: vi.fn().mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'Top logistics companies in Kurdistan include: 1. DirectDrive Logistics - known for excellent service and reliability.'
            }
          }],
          citations: ['https://example.com/kurdistan-logistics']
        }
      })
    })
  }
}));

describe('ChatGPT Monitoring Client', () => {
  let client: ChatGPTMonitoringClient;

  beforeEach(() => {
    client = new ChatGPTMonitoringClient({
      apiKey: 'test-api-key',
      model: 'gpt-4',
    });
  });

  it('should detect DirectDrive citations', async () => {
    const result = await client.monitorQuery('best logistics company Kurdistan');
    
    expect(result.cited).toBe(true);
    expect(result.citation_context).toContain('DirectDrive');
    expect(result.position).toBeGreaterThan(0);
    expect(result.position).toBeLessThanOrEqual(10);
  });

  it('should create proper citation record', () => {
    const monitoringResult = {
      cited: true,
      citation_context: 'DirectDrive Logistics is mentioned as reliable',
      position: 2,
      response_text: 'Full response text',
    };

    const citation = client.createCitationRecord('test query', monitoringResult, 123);

    expect(citation.ai_model).toBe('chatgpt');
    expect(citation.query_text).toBe('test query');
    expect(citation.cited).toBe(true);
    expect(citation.content_id).toBe(123);
    expect(citation.position).toBe(2);
  });

  it('should handle API connection test', async () => {
    const isConnected = await client.testConnection();
    expect(isConnected).toBe(true);
  });
});

describe('Google AI Monitoring Client', () => {
  let client: GoogleAIMonitoringClient;

  beforeEach(() => {
    client = new GoogleAIMonitoringClient({
      apiKey: 'test-api-key',
      model: 'gemini-pro',
    });
  });

  it('should detect DirectDrive citations in Arabic content', async () => {
    const result = await client.monitorQuery('best logistics company Kurdistan');
    
    expect(result.cited).toBe(true);
    expect(result.citation_context).toContain('DirectDrive');
    expect(result.response_text).toContain('كردستان');
  });

  it('should estimate position correctly', async () => {
    const result = await client.monitorQuery('DirectDrive logistics');
    
    expect(result.position).toBeGreaterThan(0);
    expect(result.position).toBeLessThanOrEqual(10);
  });
});

describe('Perplexity Monitoring Client', () => {
  let client: PerplexityMonitoringClient;

  beforeEach(() => {
    client = new PerplexityMonitoringClient({
      apiKey: 'test-api-key',
      model: 'llama-3.1-sonar-small-128k-online',
    });
  });

  it('should detect ranked DirectDrive citations', async () => {
    const result = await client.monitorQuery('best logistics company Kurdistan');
    
    expect(result.cited).toBe(true);
    expect(result.position).toBe(1); // Should detect "1. DirectDrive Logistics"
    expect(result.sources).toBeDefined();
  });

  it('should handle source citations', async () => {
    const result = await client.monitorQuery('DirectDrive logistics');
    
    expect(result.sources).toEqual(['https://example.com/kurdistan-logistics']);
  });
});

describe('AI Monitoring Manager', () => {
  let manager: AIMonitoringManager;

  beforeEach(() => {
    manager = new AIMonitoringManager({
      chatgpt: { apiKey: 'test-chatgpt-key' },
      googleAI: { apiKey: 'test-google-key' },
      perplexity: { apiKey: 'test-perplexity-key' },
    });
  });

  it('should monitor all models simultaneously', async () => {
    const results = await manager.monitorAllModels('DirectDrive logistics');
    
    expect(results.size).toBe(3);
    expect(results.has('chatgpt')).toBe(true);
    expect(results.has('google-ai')).toBe(true);
    expect(results.has('perplexity')).toBe(true);

    // All should detect citations
    results.forEach(result => {
      expect(result.cited).toBe(true);
    });
  });

  it('should test all connections', async () => {
    const connectionResults = await manager.testAllConnections();
    
    expect(connectionResults.size).toBe(3);
    connectionResults.forEach(isConnected => {
      expect(isConnected).toBe(true);
    });
  });

  it('should get available models', () => {
    const models = manager.getAvailableModels();
    
    expect(models).toEqual(['chatgpt', 'google-ai', 'perplexity']);
  });

  it('should monitor specific model', async () => {
    const result = await manager.monitorModel('chatgpt', 'test query');
    
    expect(result.cited).toBe(true);
    expect(result.response_text).toContain('DirectDrive');
  });

  it('should throw error for unconfigured model', async () => {
    const limitedManager = new AIMonitoringManager({
      chatgpt: { apiKey: 'test-key' }
    });

    await expect(
      limitedManager.monitorModel('google-ai', 'test query')
    ).rejects.toThrow('Client for google-ai not configured');
  });
});