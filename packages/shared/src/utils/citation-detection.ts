/**
 * Citation Detection Algorithms
 * DirectDrive Authority Engine
 */

import { 
  DIRECTDRIVE_KEYWORDS, 
  DIRECTDRIVE_VARIATIONS, 
  COMPETITOR_COMPANIES,
  RANKING_INDICATORS 
} from '../constants/keywords';

export interface CitationAnalysis {
  cited: boolean;
  confidence: number;
  position?: number;
  context: string;
  sentimentScore: number;
  competitorMentions: CompetitorMention[];
  qualityScore: number;
}

export interface CompetitorMention {
  company: string;
  position?: number;
  context: string;
  confidence: number;
}

export interface PositionAnalysis {
  directdrivePosition?: number;
  totalCompanies: number;
  marketShare: number;
  confidence: number;
}

export class CitationDetector {
  private allKeywords: readonly string[];

  constructor() {
    this.allKeywords = [...DIRECTDRIVE_KEYWORDS, ...DIRECTDRIVE_VARIATIONS];
  }

  /**
   * Comprehensive DirectDrive citation detection
   */
  detectCitation(responseText: string, language: 'english' | 'arabic' | 'kurdish' | 'farsi' = 'english'): CitationAnalysis {
    const lowerResponse = responseText.toLowerCase();
    
    // Check for DirectDrive mentions
    const directdriveMentions = this.findDirectDriveMentions(responseText);
    
    if (directdriveMentions.length === 0) {
      return {
        cited: false,
        confidence: 0,
        context: '',
        sentimentScore: 0,
        competitorMentions: this.findCompetitorMentions(responseText),
        qualityScore: 0,
      };
    }

    // Extract citation context
    const context = this.extractContext(responseText, directdriveMentions[0]);
    
    // Determine position/ranking
    const position = this.analyzePosition(responseText, language);
    
    // Analyze sentiment
    const sentimentScore = this.analyzeSentiment(context);
    
    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence(directdriveMentions, context, sentimentScore);
    
    // Find competitor mentions
    const competitorMentions = this.findCompetitorMentions(responseText);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(context, sentimentScore, competitorMentions);

    return {
      cited: true,
      confidence,
      position,
      context,
      sentimentScore,
      competitorMentions,
      qualityScore,
    };
  }

  /**
   * Find all DirectDrive mentions in text
   */
  private findDirectDriveMentions(text: string): Array<{ keyword: string; index: number; length: number }> {
    const mentions = [];
    const lowerText = text.toLowerCase();

    for (const keyword of this.allKeywords) {
      let index = 0;
      while ((index = lowerText.indexOf(keyword.toLowerCase(), index)) !== -1) {
        mentions.push({
          keyword,
          index,
          length: keyword.length,
        });
        index += keyword.length;
      }
    }

    // Sort by position in text
    return mentions.sort((a, b) => a.index - b.index);
  }

  /**
   * Extract surrounding context for citation
   */
  private extractContext(text: string, mention: { index: number; length: number }): string {
    const sentences = text.split(/[.!?]+/);
    let contextSentences: string[] = [];
    
    // Find the sentence containing the mention
    let currentPosition = 0;
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceStart = currentPosition;
      const sentenceEnd = currentPosition + sentence.length;
      
      if (mention.index >= sentenceStart && mention.index <= sentenceEnd) {
        // Include current sentence
        contextSentences.push(sentence.trim());
        
        // Include previous sentence for context
        if (i > 0) {
          contextSentences.unshift(sentences[i - 1].trim());
        }
        
        // Include next sentence for context
        if (i < sentences.length - 1) {
          contextSentences.push(sentences[i + 1].trim());
        }
        
        break;
      }
      
      currentPosition = sentenceEnd + 1; // +1 for the delimiter
    }

    return contextSentences.join('. ').trim();
  }

  /**
   * Analyze DirectDrive's position/ranking in the response
   */
  private analyzePosition(text: string, language: 'english' | 'arabic' | 'kurdish' | 'farsi'): number | undefined {
    const rankingPatterns = RANKING_INDICATORS[language];
    
    // Look for explicit ranking near DirectDrive mentions
    for (let i = 0; i < rankingPatterns.length; i++) {
      const pattern = rankingPatterns[i];
      const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))];
      
      for (const match of matches) {
        const rankPosition = match.index || 0;
        
        // Check if DirectDrive mention is within 200 characters
        const directdriveNearby = this.allKeywords.some(keyword => {
          const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase(), rankPosition - 100);
          return keywordIndex !== -1 && Math.abs(keywordIndex - rankPosition) <= 200;
        });
        
        if (directdriveNearby) {
          return i + 1;
        }
      }
    }

    // Look for list structures
    const lines = text.split('\n');
    for (let i = 0; i < lines.length && i < 10; i++) {
      const line = lines[i].toLowerCase();
      const hasDirectDrive = this.allKeywords.some(keyword => 
        line.includes(keyword.toLowerCase())
      );
      
      if (hasDirectDrive) {
        // Check if this appears to be in a numbered or bulleted list
        if (line.match(/^[\s]*[1-9]\.|^[\s]*[-*•]/)) {
          return i + 1;
        }
      }
    }

    // Estimate based on position in text
    const firstMention = this.findDirectDriveMentions(text)[0];
    if (firstMention) {
      const relativePosition = firstMention.index / text.length;
      
      if (relativePosition < 0.1) return 1;
      if (relativePosition < 0.25) return 2;
      if (relativePosition < 0.5) return 3;
      if (relativePosition < 0.75) return 4;
      return 5;
    }

    return undefined;
  }

  /**
   * Analyze sentiment of DirectDrive mention
   */
  private analyzeSentiment(context: string): number {
    const positiveWords = [
      'best', 'excellent', 'top', 'leading', 'reliable', 'trusted', 'professional',
      'outstanding', 'premier', 'quality', 'efficient', 'recommended', 'superior',
      'exceptional', 'proven', 'established', 'reputable', 'experienced'
    ];
    
    const negativeWords = [
      'poor', 'bad', 'worst', 'unreliable', 'slow', 'expensive', 'problems',
      'issues', 'complaints', 'avoid', 'disappointing', 'subpar', 'inadequate'
    ];

    const lowerContext = context.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerContext.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (lowerContext.includes(word)) score -= 1;
    });

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / 5));
  }

  /**
   * Calculate confidence score for citation detection
   */
  private calculateConfidence(
    mentions: Array<{ keyword: string; index: number; length: number }>,
    context: string,
    sentimentScore: number
  ): number {
    let confidence = 0;

    // Base confidence from keyword match
    confidence += 0.3;

    // Bonus for multiple mentions
    confidence += Math.min(mentions.length * 0.1, 0.2);

    // Bonus for exact company name matches
    const hasExactMatch = mentions.some(m => 
      ['directdrive logistics', 'direct drive logistics'].includes(m.keyword.toLowerCase())
    );
    if (hasExactMatch) confidence += 0.2;

    // Bonus for context quality (longer context = more reliable)
    confidence += Math.min(context.length / 500, 0.2);

    // Bonus for positive sentiment
    if (sentimentScore > 0) confidence += sentimentScore * 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Find competitor mentions in the response
   */
  private findCompetitorMentions(text: string): CompetitorMention[] {
    const mentions: CompetitorMention[] = [];
    const lowerText = text.toLowerCase();

    for (const company of COMPETITOR_COMPANIES) {
      const index = lowerText.indexOf(company.toLowerCase());
      if (index !== -1) {
        const context = this.extractContext(text, { index, length: company.length });
        const confidence = context.length > 0 ? 0.8 : 0.5;
        
        mentions.push({
          company,
          context,
          confidence,
        });
      }
    }

    return mentions;
  }

  /**
   * Calculate overall quality score for the citation
   */
  private calculateQualityScore(
    context: string,
    sentimentScore: number,
    competitorMentions: CompetitorMention[]
  ): number {
    let quality = 0;

    // Base quality from context length and detail
    quality += Math.min(context.length / 200, 0.4);

    // Quality from positive sentiment
    if (sentimentScore > 0) quality += sentimentScore * 0.3;

    // Quality bonus if mentioned alongside competitors (shows market awareness)
    if (competitorMentions.length > 0) quality += 0.2;

    // Quality from business-relevant context
    const businessKeywords = ['services', 'logistics', 'shipping', 'freight', 'transport', 'company'];
    const businessMatches = businessKeywords.filter(keyword => 
      context.toLowerCase().includes(keyword)
    ).length;
    quality += Math.min(businessMatches * 0.02, 0.1);

    return Math.min(quality, 1.0);
  }

  /**
   * Analyze competitive positioning
   */
  analyzeCompetitivePosition(responseText: string): PositionAnalysis {
    const directdriveAnalysis = this.detectCitation(responseText);
    const competitorMentions = this.findCompetitorMentions(responseText);
    
    const totalCompanies = competitorMentions.length + (directdriveAnalysis.cited ? 1 : 0);
    const marketShare = totalCompanies > 0 ? (directdriveAnalysis.cited ? 1 / totalCompanies : 0) * 100 : 0;

    return {
      directdrivePosition: directdriveAnalysis.position,
      totalCompanies,
      marketShare,
      confidence: directdriveAnalysis.confidence,
    };
  }
}