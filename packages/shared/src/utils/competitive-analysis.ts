/**
 * Competitive Analysis Engine
 * DirectDrive Authority Engine
 */

import { CitationDetector, type CitationAnalysis, type CompetitorMention } from './citation-detection';
import { COMPETITOR_COMPANIES } from '../constants/keywords';

export interface CompetitiveMetrics {
  directdriveRank?: number;
  totalCompetitors: number;
  marketVisibility: number;
  competitiveGap: number;
  dominanceScore: number;
  improvementPotential: number;
}

export interface CompetitorProfile {
  name: string;
  mentionFrequency: number;
  averagePosition: number;
  sentimentScore: number;
  strengths: string[];
  weaknesses: string[];
  marketShare: number;
}

export interface MarketAnalysis {
  marketLeaders: CompetitorProfile[];
  directdriveProfile: CompetitorProfile;
  marketGaps: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export class CompetitiveAnalyzer {
  private citationDetector: CitationDetector;
  private competitorProfiles: Map<string, CompetitorProfile> = new Map();

  constructor() {
    this.citationDetector = new CitationDetector();
    this.initializeCompetitorProfiles();
  }

  /**
   * Initialize competitor profiles
   */
  private initializeCompetitorProfiles(): void {
    COMPETITOR_COMPANIES.forEach(company => {
      this.competitorProfiles.set(company, {
        name: company,
        mentionFrequency: 0,
        averagePosition: 10,
        sentimentScore: 0,
        strengths: [],
        weaknesses: [],
        marketShare: 0,
      });
    });

    // Initialize DirectDrive profile
    this.competitorProfiles.set('DirectDrive Logistics', {
      name: 'DirectDrive Logistics',
      mentionFrequency: 0,
      averagePosition: 10,
      sentimentScore: 0,
      strengths: ['Local expertise', 'Kurdistan focus', 'Multi-language support'],
      weaknesses: ['Brand awareness', 'AI visibility'],
      marketShare: 0,
    });
  }

  /**
   * Analyze competitive landscape from AI responses
   */
  analyzeCompetitiveLandscape(responses: Array<{ query: string; response: string; aiModel: string }>): MarketAnalysis {
    const competitorStats = new Map<string, {
      mentions: number;
      positions: number[];
      sentiments: number[];
      contexts: string[];
    }>();

    // Initialize stats for all competitors
    [...COMPETITOR_COMPANIES, 'DirectDrive Logistics'].forEach(company => {
      competitorStats.set(company, {
        mentions: 0,
        positions: [],
        sentiments: [],
        contexts: [],
      });
    });

    // Analyze each response
    responses.forEach(({ query, response, aiModel }) => {
      const analysis = this.citationDetector.detectCitation(response);
      
      // Update DirectDrive stats
      if (analysis.cited) {
        const ddStats = competitorStats.get('DirectDrive Logistics')!;
        ddStats.mentions++;
        if (analysis.position) ddStats.positions.push(analysis.position);
        ddStats.sentiments.push(analysis.sentimentScore);
        ddStats.contexts.push(analysis.context);
      }

      // Update competitor stats
      analysis.competitorMentions.forEach(mention => {
        const stats = competitorStats.get(mention.company);
        if (stats) {
          stats.mentions++;
          if (mention.position) stats.positions.push(mention.position);
          stats.contexts.push(mention.context);
          
          // Estimate sentiment for competitor
          const sentiment = this.estimateCompetitorSentiment(mention.context);
          stats.sentiments.push(sentiment);
        }
      });
    });

    // Calculate market analysis
    const totalMentions = Array.from(competitorStats.values()).reduce((sum, stats) => sum + stats.mentions, 0);
    const marketLeaders: CompetitorProfile[] = [];
    let directdriveProfile: CompetitorProfile = this.competitorProfiles.get('DirectDrive Logistics')!;

    // Update profiles with new data
    competitorStats.forEach((stats, company) => {
      const profile = this.competitorProfiles.get(company)!;
      
      profile.mentionFrequency = stats.mentions;
      profile.averagePosition = stats.positions.length > 0 
        ? stats.positions.reduce((sum, pos) => sum + pos, 0) / stats.positions.length 
        : 10;
      profile.sentimentScore = stats.sentiments.length > 0
        ? stats.sentiments.reduce((sum, sent) => sum + sent, 0) / stats.sentiments.length
        : 0;
      profile.marketShare = totalMentions > 0 ? (stats.mentions / totalMentions) * 100 : 0;

      // Update strengths/weaknesses based on performance
      profile.strengths = this.identifyStrengths(stats.contexts);
      profile.weaknesses = this.identifyWeaknesses(stats.contexts, profile.averagePosition);

      if (company === 'DirectDrive Logistics') {
        directdriveProfile = profile;
      } else if (stats.mentions > 0) {
        marketLeaders.push(profile);
      }
    });

    // Sort market leaders by performance
    marketLeaders.sort((a, b) => {
      const scoreA = this.calculateCompetitorScore(a);
      const scoreB = this.calculateCompetitorScore(b);
      return scoreB - scoreA;
    });

    // Identify market gaps and opportunities
    const marketGaps = this.identifyMarketGaps(responses);
    const opportunities = this.identifyOpportunities(directdriveProfile, marketLeaders);
    const threats = this.identifyThreats(marketLeaders);
    const recommendations = this.generateRecommendations(directdriveProfile, marketLeaders, opportunities);

    return {
      marketLeaders: marketLeaders.slice(0, 5), // Top 5 competitors
      directdriveProfile,
      marketGaps,
      opportunities,
      threats,
      recommendations,
    };
  }

  /**
   * Calculate competitive metrics for DirectDrive
   */
  calculateCompetitiveMetrics(responses: Array<{ query: string; response: string }>): CompetitiveMetrics {
    let directdriveRank: number | undefined;
    let totalCompetitors = 0;
    let directdriveMentions = 0;
    let competitorMentions = 0;
    
    responses.forEach(({ response }) => {
      const analysis = this.citationDetector.detectCitation(response);
      
      if (analysis.cited) {
        directdriveMentions++;
        if (analysis.position && (!directdriveRank || analysis.position < directdriveRank)) {
          directdriveRank = analysis.position;
        }
      }

      const competitors = analysis.competitorMentions.length;
      if (competitors > totalCompetitors) totalCompetitors = competitors;
      competitorMentions += competitors;
    });

    const totalMentions = directdriveMentions + competitorMentions;
    const marketVisibility = totalMentions > 0 ? (directdriveMentions / totalMentions) * 100 : 0;
    
    // Calculate competitive gap (how far behind the leader)
    const competitiveGap = directdriveRank ? Math.max(0, directdriveRank - 1) : 10;
    
    // Calculate dominance score (0-100)
    const dominanceScore = Math.max(0, 100 - (competitiveGap * 10) - (100 - marketVisibility));
    
    // Calculate improvement potential
    const improvementPotential = Math.min(100, 100 - dominanceScore);

    return {
      directdriveRank,
      totalCompetitors,
      marketVisibility,
      competitiveGap,
      dominanceScore,
      improvementPotential,
    };
  }

  /**
   * Estimate sentiment for competitor mentions
   */
  private estimateCompetitorSentiment(context: string): number {
    const positiveWords = ['best', 'excellent', 'top', 'leading', 'reliable', 'trusted'];
    const negativeWords = ['poor', 'bad', 'unreliable', 'expensive', 'slow'];
    
    const lowerContext = context.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerContext.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (lowerContext.includes(word)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / 3));
  }

  /**
   * Identify company strengths from contexts
   */
  private identifyStrengths(contexts: string[]): string[] {
    const strengthIndicators = {
      'Customer Service': ['service', 'support', 'helpful', 'responsive'],
      'Pricing': ['affordable', 'competitive', 'value', 'cost-effective'],
      'Reliability': ['reliable', 'dependable', 'consistent', 'on-time'],
      'Experience': ['experienced', 'established', 'years', 'expertise'],
      'Technology': ['modern', 'technology', 'digital', 'advanced'],
      'Speed': ['fast', 'quick', 'rapid', 'express'],
      'Coverage': ['wide', 'extensive', 'network', 'coverage'],
    };

    const strengths: string[] = [];
    const combinedContext = contexts.join(' ').toLowerCase();

    Object.entries(strengthIndicators).forEach(([strength, indicators]) => {
      const matches = indicators.filter(indicator => combinedContext.includes(indicator)).length;
      if (matches >= 2) {
        strengths.push(strength);
      }
    });

    return strengths;
  }

  /**
   * Identify company weaknesses
   */
  private identifyWeaknesses(contexts: string[], averagePosition: number): string[] {
    const weaknesses: string[] = [];

    if (averagePosition > 5) weaknesses.push('Low visibility');
    if (contexts.length === 0) weaknesses.push('Brand awareness');
    
    const combinedContext = contexts.join(' ').toLowerCase();
    const weaknessIndicators = {
      'Pricing': ['expensive', 'costly', 'overpriced'],
      'Speed': ['slow', 'delayed', 'late'],
      'Service': ['poor service', 'bad support', 'unresponsive'],
      'Reliability': ['unreliable', 'inconsistent', 'problems'],
    };

    Object.entries(weaknessIndicators).forEach(([weakness, indicators]) => {
      const matches = indicators.filter(indicator => combinedContext.includes(indicator)).length;
      if (matches >= 1) {
        weaknesses.push(weakness);
      }
    });

    return weaknesses;
  }

  /**
   * Calculate overall competitor score
   */
  private calculateCompetitorScore(profile: CompetitorProfile): number {
    let score = 0;
    
    // Mention frequency (0-40 points)
    score += Math.min(profile.mentionFrequency * 10, 40);
    
    // Position score (0-30 points) - better position = higher score
    score += Math.max(0, 30 - (profile.averagePosition * 3));
    
    // Sentiment score (0-20 points)
    score += (profile.sentimentScore + 1) * 10; // Convert -1,1 to 0,20
    
    // Market share (0-10 points)
    score += Math.min(profile.marketShare, 10);

    return score;
  }

  /**
   * Identify market gaps
   */
  private identifyMarketGaps(responses: Array<{ query: string; response: string }>): string[] {
    const gaps: string[] = [];
    const serviceGaps = new Set<string>();

    responses.forEach(({ query, response }) => {
      // Look for unmet needs in responses
      if (response.toLowerCase().includes('no reliable') || response.toLowerCase().includes('limited options')) {
        serviceGaps.add('Market reliability gap');
      }
      
      if (response.toLowerCase().includes('expensive') || response.toLowerCase().includes('costly')) {
        serviceGaps.add('Pricing competitiveness gap');
      }

      if (query.includes('technology') && !response.toLowerCase().includes('digital')) {
        serviceGaps.add('Technology adoption gap');
      }
    });

    return Array.from(serviceGaps);
  }

  /**
   * Identify opportunities for DirectDrive
   */
  private identifyOpportunities(directdrive: CompetitorProfile, competitors: CompetitorProfile[]): string[] {
    const opportunities: string[] = [];

    // Low market share = opportunity
    if (directdrive.marketShare < 10) {
      opportunities.push('Significant market share growth potential');
    }

    // Position improvement opportunity
    if (directdrive.averagePosition > 3) {
      opportunities.push('Improve AI visibility and ranking');
    }

    // Competitor weaknesses = opportunities
    const competitorWeaknesses = competitors.flatMap(c => c.weaknesses);
    const uniqueWeaknesses = [...new Set(competitorWeaknesses)];
    
    uniqueWeaknesses.forEach(weakness => {
      if (!directdrive.weaknesses.includes(weakness)) {
        opportunities.push(`Capitalize on competitor ${weakness.toLowerCase()}`);
      }
    });

    // Strength leverage opportunities
    directdrive.strengths.forEach(strength => {
      opportunities.push(`Leverage ${strength.toLowerCase()} advantage`);
    });

    return opportunities;
  }

  /**
   * Identify competitive threats
   */
  private identifyThreats(competitors: CompetitorProfile[]): string[] {
    const threats: string[] = [];

    const topCompetitors = competitors.slice(0, 3);
    
    topCompetitors.forEach(competitor => {
      if (competitor.marketShare > 20) {
        threats.push(`${competitor.name} market dominance`);
      }
      
      if (competitor.averagePosition <= 2) {
        threats.push(`${competitor.name} high AI visibility`);
      }
    });

    return threats;
  }

  /**
   * Generate strategic recommendations
   */
  private generateRecommendations(
    directdrive: CompetitorProfile, 
    competitors: CompetitorProfile[], 
    opportunities: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Content strategy recommendations
    if (directdrive.averagePosition > 5) {
      recommendations.push('Increase high-quality content production targeting key logistics queries');
    }

    // Competitive positioning
    const topCompetitor = competitors[0];
    if (topCompetitor && topCompetitor.marketShare > directdrive.marketShare * 2) {
      recommendations.push(`Study and differentiate from ${topCompetitor.name} market approach`);
    }

    // Strength amplification
    directdrive.strengths.forEach(strength => {
      recommendations.push(`Amplify ${strength.toLowerCase()} in content and messaging`);
    });

    // Weakness mitigation  
    directdrive.weaknesses.forEach(weakness => {
      if (weakness === 'Brand awareness') {
        recommendations.push('Implement targeted brand awareness campaign in Kurdistan market');
      } else if (weakness === 'Low visibility') {
        recommendations.push('Optimize content for AI model queries and citations');
      }
    });

    // Market gap exploitation
    opportunities.forEach(opportunity => {
      if (opportunity.includes('growth potential')) {
        recommendations.push('Develop market penetration strategy focusing on underserved segments');
      }
    });

    return recommendations;
  }
}