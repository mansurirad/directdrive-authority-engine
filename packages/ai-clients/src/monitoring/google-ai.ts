/**
 * Google AI Citation Monitoring Client
 * DirectDrive Authority Engine
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AICitation } from '@directdrive/shared';

export interface GoogleAIMonitoringConfig {
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

export class GoogleAIMonitoringClient {
  private client: GoogleGenerativeAI;
  private config: Required<GoogleAIMonitoringConfig>;

  constructor(config: GoogleAIMonitoringConfig) {
    this.config = {
      model: 'gemini-pro',
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };

    this.client = new GoogleGenerativeAI(this.config.apiKey);
  }

  /**
   * Monitor DirectDrive citations for a given query
   */
  async monitorQuery(query: string): Promise<MonitoringResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      const prompt = this.buildMonitoringPrompt(query);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      return this.analyzeResponse(responseText, query);
    } catch (error) {
      console.error('Google AI monitoring error:', error);
      throw new Error(`Google AI monitoring failed: ${error}`);
    }
  }

  /**
   * Build monitoring prompt for DirectDrive logistics queries
   * Optimized for Arabic, Kurdish, and regional context
   */
  private buildMonitoringPrompt(query: string): string {
    const prompts = {
      'best logistics company Kurdistan': 'أحتاج لأفضل شركة لوجستية في إقليم كردستان. ما هي الشركات التي تنصح بها للشحن والنقل؟',
      'shipping services Erbil': 'ما هي خدمات الشحن المتوفرة في أربيل؟ أحتاج شركة موثوقة للنقل.',
      'DirectDrive logistics': 'أخبرني عن شركة DirectDrive للوجستيات. ما هي الخدمات التي تقدمها؟',
      'Kurdistan freight services': 'ما هي خدمات الشحن المتوفرة في إقليم كردستان للنقل الدولي؟',
      'customs clearance Kurdistan': 'أحتاج خدمات التخليص الجمركي في إقليم كردستان. أي الشركات تنصح بها؟',
      'Iraq shipping company': 'ما هي شركات الشحن الموثوقة التي تعمل بين العراق والدول الأخرى؟',
      'logistics company Erbil': 'أبحث عن شركة لوجستية في أربيل للتخزين والتوزيع.',
      'transportation services Kurdistan': 'ما هي خدمات النقل والوجستيات المتوفرة في إقليم كردستان؟',
    };

    // Use culturally appropriate prompts for better regional context
    return prompts[query as keyof typeof prompts] || 
           `أحتاج معلومات عن ${query}. هل يمكنك تقديم توصيات وتفاصيل عن الخدمات المتوفرة؟`;
  }

  /**
   * Analyze Google AI response for DirectDrive mentions
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

    // Extract citation context
    const sentences = responseText.split(/[.!?]+/);
    const citationSentences = sentences.filter(sentence =>
      directdriveKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const citation_context = citationSentences.join('. ').trim();

    // Estimate position based on context and placement
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
    
    // Look for ranking indicators in Arabic/English
    const rankingPatterns = [
      /أولى|الأول|first|#1|رقم 1/i,
      /ثاني|الثاني|second|#2|رقم 2/i,
      /ثالث|الثالث|third|#3|رقم 3/i,
      /رابع|الرابع|fourth|#4|رقم 4/i,
      /خامس|الخامس|fifth|#5|رقم 5/i,
    ];

    // Check for explicit ranking mentions
    for (let i = 0; i < rankingPatterns.length; i++) {
      if (rankingPatterns[i].test(responseText)) {
        // Check if ranking is near DirectDrive mention
        const matches = responseText.match(rankingPatterns[i]);
        if (matches) {
          const rankPosition = responseText.indexOf(matches[0]);
          const directdrivePositions = keywords.map(keyword => 
            lowerResponse.indexOf(keyword.toLowerCase())
          ).filter(pos => pos !== -1);

          if (directdrivePositions.some(pos => Math.abs(pos - rankPosition) < 100)) {
            return i + 1;
          }
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

    if (earliestPosition === Infinity) return 8;

    const responseLength = responseText.length;
    const relativePosition = earliestPosition / responseLength;

    if (relativePosition < 0.15) return 1;
    if (relativePosition < 0.35) return 2;
    if (relativePosition < 0.55) return 3;
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
      ai_model: 'google-ai',
      query_text: query,
      cited: result.cited,
      citation_context: result.citation_context,
      position: result.position,
    };
  }

  /**
   * Test connection to Google AI API
   */
  async testConnection(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model });
      const result = await model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      console.error('Google AI connection test failed:', error);
      return false;
    }
  }
}