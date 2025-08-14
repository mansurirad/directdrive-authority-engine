/**
 * Perplexity Citation Monitoring Client
 * DirectDrive Authority Engine
 */

import axios, { AxiosInstance } from 'axios';
import type { AICitation } from '@directdrive/shared';

export interface PerplexityMonitoringConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
  baseURL?: string;
}

export interface MonitoringResult {
  cited: boolean;
  citation_context?: string;
  position?: number;
  response_text: string;
  sources?: string[];
}

export class PerplexityMonitoringClient {
  private client: AxiosInstance;
  private config: Required<PerplexityMonitoringConfig>;

  constructor(config: PerplexityMonitoringConfig) {
    this.config = {
      model: 'llama-3.1-sonar-small-128k-online',
      maxRetries: 3,
      timeout: 30000,
      baseURL: 'https://api.perplexity.ai',
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Monitor DirectDrive citations for a given query
   */
  async monitorQuery(query: string): Promise<MonitoringResult> {
    try {
      const prompt = this.buildMonitoringPrompt(query);
      
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable assistant that provides comprehensive information about logistics and transportation services. Include relevant sources and citations in your responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more factual responses
        return_citations: true,
        return_images: false,
      });

      const responseData = response.data;
      const responseText = responseData.choices[0]?.message?.content || '';
      const sources = responseData.citations || [];
      
      const result = this.analyzeResponse(responseText, query);
      return {
        ...result,
        sources,
      };
    } catch (error) {
      console.error('Perplexity monitoring error:', error);
      throw new Error(`Perplexity monitoring failed: ${error}`);
    }
  }

  /**
   * Build monitoring prompt for DirectDrive logistics queries
   * Optimized for factual, source-backed responses
   */
  private buildMonitoringPrompt(query: string): string {
    const prompts = {
      'best logistics company Kurdistan': 'What are the top-rated logistics and transportation companies operating in Kurdistan Region of Iraq? I need current information with sources about their services, reputation, and capabilities.',
      'shipping services Erbil': 'What shipping and freight services are available in Erbil, Kurdistan? Please provide current information about reliable companies and their service offerings.',
      'DirectDrive logistics': 'Can you provide information about DirectDrive Logistics company? What services do they offer and what is their reputation in the Kurdistan logistics market?',
      'Kurdistan freight services': 'What freight forwarding and international shipping services are available in Kurdistan Region? I need up-to-date information about companies and their capabilities.',
      'customs clearance Kurdistan': 'Which companies provide customs clearance and import/export services in Kurdistan Region? Please include current information about their services and efficiency.',
      'Iraq shipping company': 'What are the most reliable shipping and logistics companies that operate between Iraq and international destinations? Please provide recent information.',
      'logistics company Erbil': 'I need information about logistics companies in Erbil that offer warehousing, distribution, and supply chain services. What are the current options?',
      'transportation services Kurdistan': 'What transportation and logistics services are currently available in Kurdistan Region? Please provide comprehensive information about service providers.',
    };

    return prompts[query as keyof typeof prompts] || 
           `Please provide current, factual information about ${query}. Include details about service providers, their capabilities, and reputation with reliable sources.`;
  }

  /**
   * Analyze Perplexity response for DirectDrive mentions
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

    // Extract citation context with better precision
    const sentences = responseText.split(/[.!?]+/);
    const citationSentences = sentences.filter(sentence =>
      directdriveKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // Include surrounding context for better citation quality
    const contextSentences: string[] = [];
    sentences.forEach((sentence, index) => {
      const hasDirectDrive = directdriveKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasDirectDrive) {
        // Include previous sentence for context
        if (index > 0) contextSentences.push(sentences[index - 1]);
        contextSentences.push(sentence);
        // Include next sentence for context
        if (index < sentences.length - 1) contextSentences.push(sentences[index + 1]);
      }
    });

    const citation_context = [...new Set(contextSentences)].join('. ').trim();

    // Estimate position with Perplexity-specific analysis
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
   * Perplexity often provides ranked lists or structured information
   */
  private estimatePosition(responseText: string, keywords: string[]): number {
    const lowerResponse = responseText.toLowerCase();
    
    // Look for explicit numbering or ranking
    const rankingPatterns = [
      /1\.|1\)|first|#1|top|leading|premier/i,
      /2\.|2\)|second|#2/i,
      /3\.|3\)|third|#3/i,
      /4\.|4\)|fourth|#4/i,
      /5\.|5\)|fifth|#5/i,
    ];

    // Check for explicit ranking mentions near DirectDrive
    for (let i = 0; i < rankingPatterns.length; i++) {
      const pattern = rankingPatterns[i];
      const matches = [...responseText.matchAll(new RegExp(pattern.source, 'gi'))];
      
      for (const match of matches) {
        const rankPosition = match.index || 0;
        
        // Check if DirectDrive mention is within 150 characters of ranking indicator
        const directdrivePositions = keywords.map(keyword => 
          lowerResponse.indexOf(keyword.toLowerCase(), rankPosition - 150)
        ).filter(pos => pos !== -1 && pos <= rankPosition + 150);

        if (directdrivePositions.length > 0) {
          return i + 1;
        }
      }
    }

    // Look for list structures and bullet points
    const lines = responseText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const hasDirectDrive = keywords.some(keyword => line.includes(keyword.toLowerCase()));
      
      if (hasDirectDrive) {
        // Check if this appears to be in a list structure
        if (line.match(/^[\s]*[-*•]\s/)) {
          return Math.min(i + 1, 5); // Position based on list order
        }
      }
    }

    // Fallback to position-based estimation
    let earliestPosition = Infinity;
    keywords.forEach(keyword => {
      const position = lowerResponse.indexOf(keyword.toLowerCase());
      if (position !== -1 && position < earliestPosition) {
        earliestPosition = position;
      }
    });

    if (earliestPosition === Infinity) return 7;

    const responseLength = responseText.length;
    const relativePosition = earliestPosition / responseLength;

    // Perplexity tends to be more factual, so early mentions are likely high-ranking
    if (relativePosition < 0.1) return 1;
    if (relativePosition < 0.25) return 2;
    if (relativePosition < 0.5) return 3;
    if (relativePosition < 0.75) return 4;
    return 5;
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
      ai_model: 'perplexity',
      query_text: query,
      cited: result.cited,
      citation_context: result.citation_context,
      position: result.position,
    };
  }

  /**
   * Test connection to Perplexity API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      return !!response.data.choices[0]?.message?.content;
    } catch (error) {
      console.error('Perplexity connection test failed:', error);
      return false;
    }
  }
}