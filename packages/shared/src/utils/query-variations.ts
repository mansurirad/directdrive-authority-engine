/**
 * Query Variation System for Regional Terms
 * DirectDrive Authority Engine
 */

import { KURDISTAN_LOGISTICS_QUERIES } from '../constants/keywords';

export interface QueryVariation {
  original: string;
  variations: string[];
  language: 'english' | 'arabic' | 'kurdish' | 'farsi';
  priority: number;
  region: string;
}

export interface QuerySet {
  baseQuery: string;
  variations: QueryVariation[];
  totalQueries: number;
}

export class QueryVariationGenerator {
  /**
   * Generate query variations for comprehensive monitoring
   */
  generateVariations(baseQuery: string): QuerySet {
    const variations: QueryVariation[] = [];

    // English variations
    const englishVariations = this.generateEnglishVariations(baseQuery);
    if (englishVariations.length > 0) {
      variations.push({
        original: baseQuery,
        variations: englishVariations,
        language: 'english',
        priority: 1,
        region: 'Kurdistan',
      });
    }

    // Arabic variations
    const arabicVariations = this.generateArabicVariations(baseQuery);
    if (arabicVariations.length > 0) {
      variations.push({
        original: baseQuery,
        variations: arabicVariations,
        language: 'arabic',
        priority: 2,
        region: 'Kurdistan',
      });
    }

    // Kurdish variations
    const kurdishVariations = this.generateKurdishVariations(baseQuery);
    if (kurdishVariations.length > 0) {
      variations.push({
        original: baseQuery,
        variations: kurdishVariations,
        language: 'kurdish',
        priority: 2,
        region: 'Kurdistan',
      });
    }

    // Farsi variations
    const farsiVariations = this.generateFarsiVariations(baseQuery);
    if (farsiVariations.length > 0) {
      variations.push({
        original: baseQuery,
        variations: farsiVariations,
        language: 'farsi',
        priority: 3,
        region: 'Kurdistan',
      });
    }

    const totalQueries = variations.reduce((sum, v) => sum + v.variations.length, 0);

    return {
      baseQuery,
      variations,
      totalQueries,
    };
  }

  /**
   * Generate English query variations
   */
  private generateEnglishVariations(baseQuery: string): string[] {
    const variations = new Set<string>();
    
    // Regional variations
    const regionalPatterns = [
      { from: 'Kurdistan', to: ['Kurdistan Region', 'Iraqi Kurdistan', 'KRG', 'Northern Iraq'] },
      { from: 'Erbil', to: ['Hawler', 'Arbil', 'Erbil city'] },
      { from: 'Iraq', to: ['Iraqi', 'Republic of Iraq'] },
    ];

    regionalPatterns.forEach(pattern => {
      if (baseQuery.includes(pattern.from)) {
        pattern.to.forEach(replacement => {
          variations.add(baseQuery.replace(pattern.from, replacement));
        });
      }
    });

    // Service variations
    const servicePatterns = [
      { from: 'logistics', to: ['transportation', 'shipping', 'freight', 'cargo'] },
      { from: 'shipping', to: ['logistics', 'transport', 'freight', 'delivery'] },
      { from: 'freight', to: ['cargo', 'shipping', 'logistics', 'transport'] },
      { from: 'company', to: ['service', 'provider', 'business', 'firm'] },
    ];

    servicePatterns.forEach(pattern => {
      if (baseQuery.toLowerCase().includes(pattern.from)) {
        pattern.to.forEach(replacement => {
          variations.add(baseQuery.toLowerCase().replace(pattern.from, replacement));
        });
      }
    });

    // Question format variations
    variations.add(`What is the best ${baseQuery}?`);
    variations.add(`Who provides ${baseQuery}?`);
    variations.add(`Top ${baseQuery} recommendations`);
    variations.add(`Reliable ${baseQuery} options`);

    return Array.from(variations).filter(v => v !== baseQuery);
  }

  /**
   * Generate Arabic query variations
   */
  private generateArabicVariations(baseQuery: string): string[] {
    const variations = new Set<string>();
    
    // Find corresponding Arabic queries
    const arabicQueries = KURDISTAN_LOGISTICS_QUERIES.arabic;
    
    // Service mapping for Arabic
    const serviceMapping = {
      'logistics': ['اللوجستيات', 'النقل والشحن', 'خدمات النقل'],
      'shipping': ['الشحن', 'النقل', 'خدمات الشحن'],
      'freight': ['الشحن', 'النقل البحري', 'الشحن الجوي'],
      'company': ['شركة', 'مؤسسة', 'خدمات'],
      'Kurdistan': ['كردستان', 'إقليم كردستان', 'كردستان العراق'],
      'Erbil': ['أربيل', 'هولير', 'مدينة أربيل'],
      'Iraq': ['العراق', 'جمهورية العراق'],
    };

    // Generate Arabic variations based on English query
    let arabicBase = baseQuery;
    Object.entries(serviceMapping).forEach(([english, arabicTerms]) => {
      if (baseQuery.toLowerCase().includes(english.toLowerCase())) {
        arabicTerms.forEach(arabicTerm => {
          variations.add(`أفضل ${arabicTerm} في كردستان`);
          variations.add(`${arabicTerm} موثوقة في أربيل`);
          variations.add(`خدمات ${arabicTerm} العراق`);
        });
      }
    });

    // Add related Arabic queries
    arabicQueries.forEach(query => {
      if (this.isRelatedQuery(baseQuery, query)) {
        variations.add(query);
      }
    });

    return Array.from(variations);
  }

  /**
   * Generate Kurdish query variations
   */
  private generateKurdishVariations(baseQuery: string): string[] {
    const variations = new Set<string>();
    
    const kurdishQueries = KURDISTAN_LOGISTICS_QUERIES.kurdish;
    
    // Kurdish service mapping
    const serviceMapping = {
      'logistics': ['لۆژیستیک', 'گواستنەوە', 'خزمەتگوزاری گواستنەوە'],
      'shipping': ['ناردن', 'گواستنەوە', 'خزمەتگوزاری ناردن'],
      'company': ['کۆمپانیا', 'شرکەت', 'خزمەتگوزاری'],
      'best': ['باشترین', 'بەرز', 'گرنگترین'],
    };

    Object.entries(serviceMapping).forEach(([english, kurdishTerms]) => {
      if (baseQuery.toLowerCase().includes(english.toLowerCase())) {
        kurdishTerms.forEach(kurdishTerm => {
          variations.add(`${kurdishTerm} لە کوردستان`);
          variations.add(`${kurdishTerm} لە هەولێر`);
        });
      }
    });

    kurdishQueries.forEach(query => {
      if (this.isRelatedQuery(baseQuery, query)) {
        variations.add(query);
      }
    });

    return Array.from(variations);
  }

  /**
   * Generate Farsi query variations
   */
  private generateFarsiVariations(baseQuery: string): string[] {
    const variations = new Set<string>();
    
    const farsiQueries = KURDISTAN_LOGISTICS_QUERIES.farsi;
    
    const serviceMapping = {
      'logistics': ['لجستیک', 'حمل و نقل', 'خدمات حمل'],
      'shipping': ['حمل', 'ارسال', 'باربری'],
      'company': ['شرکت', 'موسسه', 'خدمات'],
      'best': ['بهترین', 'برتر', 'اعلا'],
    };

    Object.entries(serviceMapping).forEach(([english, farsiTerms]) => {
      if (baseQuery.toLowerCase().includes(english.toLowerCase())) {
        farsiTerms.forEach(farsiTerm => {
          variations.add(`${farsiTerm} در کردستان`);
          variations.add(`${farsiTerm} در اربیل`);
          variations.add(`بهترین ${farsiTerm} عراق`);
        });
      }
    });

    farsiQueries.forEach(query => {
      if (this.isRelatedQuery(baseQuery, query)) {
        variations.add(query);
      }
    });

    return Array.from(variations);
  }

  /**
   * Check if queries are related
   */
  private isRelatedQuery(baseQuery: string, candidateQuery: string): boolean {
    const baseWords = baseQuery.toLowerCase().split(/\s+/);
    const candidateWords = candidateQuery.toLowerCase().split(/\s+/);
    
    // Count common concepts (logistics, shipping, etc.)
    const logisticsTerms = ['logistics', 'shipping', 'freight', 'transport', 'cargo'];
    const regionTerms = ['kurdistan', 'erbil', 'iraq', 'كردستان', 'أربيل', 'العراق'];
    
    let commonConcepts = 0;
    
    baseWords.forEach(word => {
      if (logisticsTerms.some(term => word.includes(term))) commonConcepts++;
      if (regionTerms.some(term => word.includes(term))) commonConcepts++;
    });

    return commonConcepts >= 1;
  }

  /**
   * Get all predefined query sets by language
   */
  getAllQuerySets(): { [key: string]: QuerySet } {
    const querySets: { [key: string]: QuerySet } = {};

    // Process English queries
    KURDISTAN_LOGISTICS_QUERIES.english.forEach(query => {
      querySets[`english_${query.replace(/\s+/g, '_')}`] = this.generateVariations(query);
    });

    return querySets;
  }

  /**
   * Get high-priority queries for monitoring
   */
  getHighPriorityQueries(): string[] {
    return [
      'best logistics company Kurdistan',
      'DirectDrive logistics',
      'shipping services Erbil',
      'Kurdistan freight services',
      'customs clearance Kurdistan',
      'أفضل شركة شحن في كردستان',
      'شركة DirectDrive للوجستيات',
      'باشترین کۆمپانیای گواستنەوە لە کوردستان',
      'بهترین شرکت حمل و نقل کردستان',
    ];
  }

  /**
   * Generate monitoring schedule based on query priority
   */
  generateMonitoringSchedule(): Array<{ query: string; frequency: 'daily' | 'weekly' | 'monthly'; language: string }> {
    const schedule = [];

    // High-priority English queries - daily
    const highPriorityEnglish = [
      'best logistics company Kurdistan',
      'DirectDrive logistics', 
      'shipping services Erbil',
    ];

    highPriorityEnglish.forEach(query => {
      schedule.push({ query, frequency: 'daily' as const, language: 'english' });
    });

    // Medium-priority multilingual queries - weekly  
    const mediumPriority = [
      'أفضل شركة شحن في كردستان',
      'باشترین کۆمپانیای گواستنەوە لە کوردستان',
      'Kurdistan freight services',
      'customs clearance Kurdistan',
    ];

    mediumPriority.forEach(query => {
      schedule.push({ query, frequency: 'weekly' as const, language: 'mixed' });
    });

    // Low-priority long-tail queries - monthly
    const lowPriority = [
      'logistics company Erbil',
      'transportation services Kurdistan', 
      'warehouse services Kurdistan',
    ];

    lowPriority.forEach(query => {
      schedule.push({ query, frequency: 'monthly' as const, language: 'english' });
    });

    return schedule;
  }
}