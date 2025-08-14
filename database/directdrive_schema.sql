-- DirectDrive Authority Engine Database Schema
-- Created for LLMBoost DirectDrive Implementation
-- Date: 2025-08-07

-- Keywords and Content Management
CREATE TABLE IF NOT EXISTS keywords (
  id SERIAL PRIMARY KEY,
  keyword_id SERIAL UNIQUE,
  industry_category VARCHAR(50) NOT NULL DEFAULT 'logistics',
  language VARCHAR(10) NOT NULL,
  keyword_text VARCHAR(255) NOT NULL,
  secondary_keywords TEXT[],
  intent VARCHAR(50) NOT NULL,
  region VARCHAR(100) DEFAULT 'Kurdistan',
  priority_level INTEGER DEFAULT 1,
  processing_status VARCHAR(20) DEFAULT 'pending',
  last_processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Generation Tracking
CREATE TABLE IF NOT EXISTS content_pieces (
  id SERIAL PRIMARY KEY,
  content_piece_id SERIAL UNIQUE,
  keyword_id INTEGER REFERENCES keywords(keyword_id),
  title VARCHAR(500) NOT NULL,
  content_body TEXT NOT NULL,
  industry_category VARCHAR(50) NOT NULL DEFAULT 'logistics',
  language VARCHAR(10) NOT NULL,
  content_type VARCHAR(50) DEFAULT 'article',
  ai_model_used VARCHAR(50) NOT NULL,
  generation_time INTEGER, -- seconds
  generation_timestamp TIMESTAMP DEFAULT NOW(),
  word_count INTEGER,
  quality_score DECIMAL(3,2),
  validation_score INTEGER,
  publication_date TIMESTAMP,
  published_url VARCHAR(500),
  content_status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Citation Monitoring
CREATE TABLE IF NOT EXISTS ai_citations (
  id SERIAL PRIMARY KEY,
  content_piece_id INTEGER REFERENCES content_pieces(content_piece_id),
  ai_platform VARCHAR(50) NOT NULL,
  query_used VARCHAR(500) NOT NULL,
  citation_found BOOLEAN DEFAULT FALSE,
  citation_context TEXT,
  citation_position INTEGER, -- ranking position in AI response
  monitoring_timestamp TIMESTAMP DEFAULT NOW()
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
INSERT INTO keywords (industry_category, language, keyword_text, secondary_keywords, intent, region, priority_level, processing_status) VALUES
-- English Keywords
('logistics', 'english', 'best logistics company Kurdistan', ARRAY['freight services', 'shipping Kurdistan', 'transportation'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'english', 'Kurdistan freight services', ARRAY['cargo shipping', 'international freight', 'logistics'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'english', 'DirectDrive logistics', ARRAY['transportation company', 'shipping services', 'freight'], 'commercial', 'Kurdistan', 2, 'pending'),
('logistics', 'english', 'Iraq shipping company', ARRAY['Kurdistan transport', 'freight services', 'logistics'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'english', 'customs clearance Kurdistan', ARRAY['import export', 'customs services', 'clearance'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Arabic Keywords
('logistics', 'arabic', 'أفضل شركة شحن في كردستان', ARRAY['خدمات النقل', 'الشحن والنقل', 'اللوجستيات'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'arabic', 'شركة الشحن في العراق', ARRAY['النقل البري', 'خدمات اللوجستيات', 'الشحن'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'arabic', 'خدمات النقل كردستان', ARRAY['الشحن الدولي', 'النقل التجاري', 'اللوجستيات'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'arabic', 'التخليص الجمركي كردستان', ARRAY['خدمات جمركية', 'استيراد وتصدير', 'التخليص'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Kurdish Keywords  
('logistics', 'kurdish', 'باشترین کۆمپانیای گواستنەوە لە کوردستان', ARRAY['خزمەتگوزاری گواستنەوە', 'ناردن', 'لۆژیستیک'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'kurdish', 'کۆمپانیای گواستنەوە لە کوردستان', ARRAY['بار و بەرگ', 'خزمەتگوزاری ناردن', 'گواستنەوە'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'kurdish', 'خزمەتگوزاری بارهەڵگرتن', ARRAY['گواستنەوە', 'ناردن و وەرگرتن', 'لۆژیستیک'], 'commercial', 'Kurdistan', 1, 'pending'),

-- Farsi Keywords
('logistics', 'farsi', 'بهترین شرکت حمل و نقل کردستان', ARRAY['خدمات باربری', 'حمل و نقل', 'لجستیک'], 'commercial', 'Kurdistan', 1, 'pending'),
('logistics', 'farsi', 'شرکت حمل و نقل عراق', ARRAY['باربری', 'خدمات لجستیک', 'حمل بار'], 'commercial', 'Iraq', 1, 'pending'),
('logistics', 'farsi', 'خدمات گمرکی کردستان', ARRAY['ترخیص کالا', 'واردات و صادرات', 'گمرک'], 'commercial', 'Kurdistan', 1, 'pending')

ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keywords_industry_language ON keywords(industry_category, language);
CREATE INDEX IF NOT EXISTS idx_keywords_status_priority ON keywords(processing_status, priority_level);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON content_pieces(content_status);
CREATE INDEX IF NOT EXISTS idx_content_pieces_keyword ON content_pieces(keyword_id);
CREATE INDEX IF NOT EXISTS idx_ai_citations_platform_found ON ai_citations(ai_platform, citation_found);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_client_date ON performance_metrics(client_id, measurement_date);

-- Enable Row Level Security (RLS) - Basic setup
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for service role, restrict for anon)
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON keywords FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON content_pieces FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON ai_citations FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON clients FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON performance_metrics FOR ALL USING (true);