/**
 * AI Clients Package
 * DirectDrive Authority Engine
 */

export * from './monitoring/chatgpt';
export * from './monitoring/google-ai';
export * from './monitoring/perplexity';

// Re-export monitoring result interface for convenience
export interface AIMonitoringResult {
  cited: boolean;
  citation_context?: string;
  position?: number;
  response_text: string;
  sources?: string[];
}

// AI Model type for unified interface
export type AIModel = 'chatgpt' | 'google-ai' | 'perplexity';

// Factory function for creating monitoring clients
export interface MonitoringClientConfig {
  chatgpt?: {
    apiKey: string;
    model?: string;
  };
  googleAI?: {
    apiKey: string;
    model?: string;
  };
  perplexity?: {
    apiKey: string;
    model?: string;
  };
}

import { ChatGPTMonitoringClient } from './monitoring/chatgpt';
import { GoogleAIMonitoringClient } from './monitoring/google-ai';
import { PerplexityMonitoringClient } from './monitoring/perplexity';

export class AIMonitoringManager {
  private clients: Map<AIModel, any> = new Map();

  constructor(config: MonitoringClientConfig) {
    if (config.chatgpt) {
      this.clients.set('chatgpt', new ChatGPTMonitoringClient(config.chatgpt));
    }
    if (config.googleAI) {
      this.clients.set('google-ai', new GoogleAIMonitoringClient(config.googleAI));
    }
    if (config.perplexity) {
      this.clients.set('perplexity', new PerplexityMonitoringClient(config.perplexity));
    }
  }

  /**
   * Monitor a query across all configured AI models
   */
  async monitorAllModels(query: string): Promise<Map<AIModel, AIMonitoringResult>> {
    const results = new Map<AIModel, AIMonitoringResult>();
    
    const promises = Array.from(this.clients.entries()).map(async ([model, client]) => {
      try {
        const result = await client.monitorQuery(query);
        results.set(model, result);
      } catch (error) {
        console.error(`Monitoring failed for ${model}:`, error);
        results.set(model, {
          cited: false,
          response_text: '',
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Monitor a specific AI model
   */
  async monitorModel(model: AIModel, query: string): Promise<AIMonitoringResult> {
    const client = this.clients.get(model);
    if (!client) {
      throw new Error(`Client for ${model} not configured`);
    }
    return client.monitorQuery(query);
  }

  /**
   * Test connections to all configured AI models
   */
  async testAllConnections(): Promise<Map<AIModel, boolean>> {
    const results = new Map<AIModel, boolean>();
    
    const promises = Array.from(this.clients.entries()).map(async ([model, client]) => {
      try {
        const isConnected = await client.testConnection();
        results.set(model, isConnected);
      } catch (error) {
        console.error(`Connection test failed for ${model}:`, error);
        results.set(model, false);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get available AI models
   */
  getAvailableModels(): AIModel[] {
    return Array.from(this.clients.keys());
  }
}