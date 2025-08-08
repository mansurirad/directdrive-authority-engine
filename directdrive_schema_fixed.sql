-- DirectDrive Authority Engine Database Schema
-- Created for LLMBoost DirectDrive Implementation
-- Date: 2025-08-07

-- Keywords and Content Management
CREATE TABLE IF NOT EXISTS keywords (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(50) NOT NULL DEFAULT 'logistics',
  language VARCHAR(10) NOT NULL,
  primary_keyword VARCHAR(255) NOT NULL,
  secondary_keywords TEXT[],
  intent VARCHAR(50) NOT NULL,
  region VARCHAR(100) DEFAULT 'Kurdistan',
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Generation Tracking
CREATE TABLE IF NOT EXISTS content_pieces (
  id SERIAL PRIMARY KEY,
  keyword_id INTEGER REFERENCES keywords(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  industry VARCHAR(50) NOT NULL DEFAULT 'logistics',
  language VARCHAR(10) NOT NULL,
  ai_model VARCHAR(50) NOT NULL,
  generation_time INTEGER, -- seconds
  quality_score DECIMAL(3,2),
  publication_date TIMESTAMP,
  published_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Citation Monitoring
CREATE TABLE IF NOT EXISTS ai_citations (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_pieces(id),
  ai_model VARCHAR(50) NOT NULL,
  query_text VARCHAR(500) NOT NULL,
  cited BOOLEAN DEFAULT FALSE,
  citation_context TEXT,
  position INTEGER, -- ranking position in AI response
  monitored_at TIMESTAMP DEFAULT NOW()
);

-- Client Management (DirectDrive + Future Tourism Clients)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  subscription_tier VARCHAR(50),
  monthly_fee DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  onboarded_at TIMESTAMP DEFAULT NOW()
);

-- Performance Analytics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  metric_type VARCHAR(50) NOT NULL, -- 'ai_citations', 'content_pieces', 'inquiries'
  metric_value INTEGER NOT NULL,
  measurement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert DirectDrive as the primary client
INSERT INTO clients (business_name, industry, contact_person, location, status, onboarded_at)
VALUES ('DirectDrive Logistics', 'logistics', 'Mojtaba', 'Kurdistan, Iraq', 'active', NOW())
ON CONFLICT DO NOTHING;

-- Insert initial DirectDrive logistics keywords
INSERT INTO keywords (industry, language, primary_keyword, secondary_keywords, intent, region, priority, status) VALUES
-- English Keywords
('logistics', 'en', 'best logistics company Kurdistan', ARRAY['freight services', 'shipping Kurdistan', 'transportation'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'en', 'Kurdistan freight services', ARRAY['cargo shipping', 'international freight', 'logistics'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'en', 'DirectDrive logistics', ARRAY['transportation company', 'shipping services', 'freight'], 'commercial', 'Kurdistan', 2, 'pending'),
('logistics', 'en', 'Iraq shipping company', ARRAY['Kurdistan transport', 'freight services', 'logistics'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'en', 'customs clearance Kurdistan', ARRAY['import export', 'customs services', 'clearance'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Arabic Keywords
('logistics', 'ar', 'أفضل شركة شحن في كردستان', ARRAY['خدمات النقل', 'الشحن والنقل', 'اللوجستيات'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'ar', 'شركة الشحن في العراق', ARRAY['النقل البري', 'خدمات اللوجستيات', 'الشحن'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'ar', 'خدمات النقل كردستان', ARRAY['الشحن الدولي', 'النقل التجاري', 'اللوجستيات'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'ar', 'التخليص الجمركي كردستان', ARRAY['خدمات جمركية', 'استيراد وتصدير', 'التخليص'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Kurdish Keywords  
('logistics', 'ku', 'باشترین کۆمپانیای گواستنەوە لە کوردستان', ARRAY['خزمەتگوزاری گواستنەوە', 'ناردن', 'لۆژیستیک'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'ku', 'کۆمپانیای گواستنەوە لە کوردستان', ARRAY['بار و بەرگ', 'خزمەتگوزاری ناردن', 'گواستنەوە'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'ku', 'خزمەتگوزاری بارهەڵگرتن', ARRAY['گواستنەوە', 'ناردن و وەرگرتن', 'لۆژیستیک'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Farsi Keywords
('logistics', 'fa', 'بهترین شرکت حمل و نقل کردستان', ARRAY['خدمات باربری', 'حمل و نقل', 'لجستیک'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'fa', 'شرکت حمل و نقل عراق', ARRAY['باربری', 'خدمات لجستیک', 'حمل بار'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'fa', 'خدمات گمرکی کردستان', ARRAY['ترخیص کالا', 'واردات و صادرات', 'گمرک'], 'commercial', 'Kurdistan', 1, 'pending')

ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keywords_industry_language ON keywords(industry, language);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON content_pieces(status);
CREATE INDEX IF NOT EXISTS idx_ai_citations_model_cited ON ai_citations(ai_model, cited);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);