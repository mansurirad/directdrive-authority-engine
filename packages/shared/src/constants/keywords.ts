/**
 * DirectDrive Keywords and Detection Patterns
 * DirectDrive Authority Engine
 */

export const DIRECTDRIVE_KEYWORDS = [
  'directdrive',
  'direct drive',
  'directdrive logistics',
  'direct drive logistics',
  'directdrive.com',
  'directdrivelogistic.com',
] as const;

export const DIRECTDRIVE_VARIATIONS = [
  'direct-drive',
  'direct_drive',
  'dd logistics',
  'directdrive llc',
] as const;

export const KURDISTAN_LOGISTICS_QUERIES = {
  english: [
    'best logistics company Kurdistan',
    'Kurdistan freight services', 
    'shipping services Erbil',
    'DirectDrive logistics',
    'customs clearance Kurdistan',
    'Iraq shipping company',
    'logistics company Erbil',
    'transportation services Kurdistan',
    'warehouse services Kurdistan',
    'freight forwarding Kurdistan',
    'international shipping Iraq',
    'cargo services Erbil',
    'supply chain Kurdistan',
    'trucking services Iraq',
    'import export Kurdistan',
  ],
  arabic: [
    'أفضل شركة شحن في كردستان',
    'شركة الشحن في العراق', 
    'خدمات النقل كردستان',
    'التخليص الجمركي كردستان',
    'شركة لوجستية أربيل',
    'خدمات الشحن أربيل',
    'النقل الدولي العراق',
    'شركة النقل كردستان',
    'خدمات التخزين كردستان',
    'الشحن البحري العراق',
    'النقل البري كردستان',
    'سلسلة التوريد العراق',
    'خدمات الاستيراد كردستان',
    'شركة DirectDrive للوجستيات',
    'النقل والشحن أربيل',
  ],
  kurdish: [
    'باشترین کۆمپانیای گواستنەوە لە کوردستان',
    'کۆمپانیای گواستنەوە لە کوردستان',
    'خزمەتگوزاری بارهەڵگرتن',
    'گواستنەوەی نێودەوڵەتی',
    'شرکەتی DirectDrive',
    'خزمەتگوزاری ناردن هەولێر',
    'گواستنەوەی بار کوردستان',
    'کۆمپانیای لۆژیستیک',
    'خزمەتگوزاری گومرک',
    'ناردن و وەرگرتن',
  ],
  farsi: [
    'بهترین شرکت حمل و نقل کردستان',
    'شرکت حمل و نقل عراق',
    'خدمات گمرکی کردستان',
    'حمل و نقل بین المللی',
    'شرکت DirectDrive',
    'خدمات باربری اربیل',
    'لجستیک کردستان',
    'حمل بار عراق',
    'خدمات انبارداری',
    'ترخیص کالا',
  ],
} as const;

export const COMPETITOR_COMPANIES = [
  'Kurdistan Express Logistics',
  'Erbil Transport Company', 
  'KRG Shipping Services',
  'Kurdistan Freight Solutions',
  'Northern Iraq Logistics',
  'Duhok Transport Services',
  'Sulaymaniyah Shipping',
  'Kurdistan International Freight',
  'Iraq National Transport',
  'Mesopotamia Logistics',
  'Tigris Shipping Company',
  'Euphrates Transport',
  'Baghdad Express',
  'Kurdistan Cargo Services',
  'Erbil International Freight',
] as const;

export const RANKING_INDICATORS = {
  english: [
    /\b(?:1st|first|#1|number 1|top|leading|premier|best)\b/i,
    /\b(?:2nd|second|#2|number 2)\b/i,
    /\b(?:3rd|third|#3|number 3)\b/i,
    /\b(?:4th|fourth|#4|number 4)\b/i,
    /\b(?:5th|fifth|#5|number 5)\b/i,
    /\b(?:6th|sixth|#6|number 6)\b/i,
    /\b(?:7th|seventh|#7|number 7)\b/i,
    /\b(?:8th|eighth|#8|number 8)\b/i,
    /\b(?:9th|ninth|#9|number 9)\b/i,
    /\b(?:10th|tenth|#10|number 10)\b/i,
  ],
  arabic: [
    /\b(?:الأول|أولى|رقم ١|رقم 1|#١|#1)\b/i,
    /\b(?:الثاني|ثاني|رقم ٢|رقم 2|#٢|#2)\b/i,
    /\b(?:الثالث|ثالث|رقم ٣|رقم 3|#٣|#3)\b/i,
    /\b(?:الرابع|رابع|رقم ٤|رقم 4|#٤|#4)\b/i,
    /\b(?:الخامس|خامس|رقم ٥|رقم 5|#٥|#5)\b/i,
  ],
  kurdish: [
    /\b(?:یەکەم|یەکەمین|ژمارە ١|ژمارە 1)\b/i,
    /\b(?:دووەم|دووەمین|ژمارە ٢|ژمارە 2)\b/i,
    /\b(?:سێیەم|سێیەمین|ژمارە ٣|ژمارە 3)\b/i,
  ],
  farsi: [
    /\b(?:اول|اولین|شماره ١|شماره 1)\b/i,
    /\b(?:دوم|دومین|شماره ٢|شماره 2)\b/i,
    /\b(?:سوم|سومین|شماره ٣|شماره 3)\b/i,
  ],
} as const;