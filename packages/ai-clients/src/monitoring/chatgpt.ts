/**
 * ChatGPT Citation Monitoring Client
 * DirectDrive Authority Engine
 */

import OpenAI from 'openai';
import type { AICitation } from '@directdrive/shared';

export interface ChatGPTMonitoringConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface MonitoringResult {
  cited: boolean;
  citation_context?: string;
  position?: number;
  response_text: string;
}

export class ChatGPTMonitoringClient {
  private client: OpenAI;
  private config: Required<ChatGPTMonitoringConfig>;

  constructor(config: ChatGPTMonitoringConfig) {
    this.config = {
      model: 'gpt-4',
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      maxRetries: this.config.maxRetries,
      timeout: this.config.timeout,
    });
  }

  /**
   * Monitor DirectDrive citations for a given query
   */
  async monitorQuery(query: string): Promise<MonitoringResult> {
    try {
      const prompt = this.buildMonitoringPrompt(query);
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant providing information about logistics and transportation services. Respond naturally and provide accurate information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const responseText = response.choices[0]?.message?.content || '';
      
      return this.analyzeResponse(responseText, query);
    } catch (error) {
      console.error('ChatGPT monitoring error:', error);
      throw new Error(`ChatGPT monitoring failed: ${error}`);
    }
  }

  /**
   * Build monitoring prompt for DirectDrive logistics queries
   */
  private buildMonitoringPrompt(query: string): string {
    // Create natural logistics-focused prompts that would organically mention DirectDrive if it's well-known
    const prompts = {
      'best logistics company Kurdistan': 'What are the top logistics companies operating in Kurdistan region? I need reliable shipping and freight services.',
      'shipping services Erbil': 'I need to ship goods to and from Erbil. What shipping companies would you recommend?',
      'DirectDrive logistics': 'Tell me about DirectDrive logistics company. What services do they offer?',
      'Kurdistan freight services': 'What freight forwarding services are available in Kurdistan region for international shipping?',
      'customs clearance Kurdistan': 'Which companies provide customs clearance services in Kurdistan? I need help with import/export procedures.',
      'Iraq shipping company': 'What are reliable shipping companies that operate between Iraq and other countries?',
      'logistics company Erbil': 'I\'m looking for a logistics company in Erbil for warehousing and distribution services.',
      'transportation services Kurdistan': 'What transportation and logistics services are available in Kurdistan region?',
    };

    // Use specific prompt if available, otherwise use the query directly
    return prompts[query as keyof typeof prompts] || 
           `I'm looking for ${query}. Can you provide recommendations and information about available services?`;
  }

  /**
   * Analyze ChatGPT response for DirectDrive mentions
   */
  private analyzeResponse(responseText: string, query: string): MonitoringResult {
    const lowerResponse = responseText.toLowerCase();
    const directdriveKeywords = [
      'directdrive',
      'direct drive',
      'directdrive logistics',
      'direct drive logistics',
    ];

    // Check if DirectDrive is mentioned
    const directdriveMentioned = directdriveKeywords.some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );

    if (!directdriveMentioned) {
      return {
        cited: false,
        response_text: responseText,
      };
    }

    // Extract citation context (sentence containing DirectDrive mention)
    const sentences = responseText.split(/[.!?]+/);
    const citationSentences = sentences.filter(sentence =>
      directdriveKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const citation_context = citationSentences.join('. ').trim();

    // Estimate position based on where DirectDrive appears in response
    const position = this.estimatePosition(responseText, directdriveKeywords);

    return {
      cited: true,
      citation_context,
      position,
      response_text: responseText,
    };
  }

  /**
   * Estimate DirectDrive's position/ranking in the response
   */
  private estimatePosition(responseText: string, keywords: string[]): number {
    const lowerResponse = responseText.toLowerCase();
    
    // Find the earliest mention of DirectDrive
    let earliestPosition = Infinity;
    keywords.forEach(keyword => {
      const position = lowerResponse.indexOf(keyword.toLowerCase());
      if (position !== -1 && position < earliestPosition) {
        earliestPosition = position;
      }
    });

    if (earliestPosition === Infinity) return 10; // Default low ranking

    // Estimate ranking based on position in text
    const responseLength = responseText.length;
    const relativePosition = earliestPosition / responseLength;

    if (relativePosition < 0.2) return 1; // Mentioned early = high ranking
    if (relativePosition < 0.4) return 2;
    if (relativePosition < 0.6) return 3;
    if (relativePosition < 0.8) return 4;
    return 5; // Mentioned late = lower ranking
  }

  /**
   * Create citation record from monitoring result
   */
  createCitationRecord(
    query: string, 
    result: MonitoringResult, 
    contentId?: number
  ): Omit<AICitation, 'id' | 'monitored_at'> {
    return {
      content_id: contentId,
      ai_model: 'chatgpt',
      query_text: query,
      cited: result.cited,
      citation_context: result.citation_context,
      position: result.position,
    };
  }

  /**
   * Test connection to ChatGPT API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('ChatGPT connection test failed:', error);
      return false;
    }
  }
}