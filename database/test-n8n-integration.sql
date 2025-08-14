-- DirectDrive n8n Integration Test Script
-- This script inserts sample DirectDrive logistics data for testing the n8n workflow integration

-- Create additional tables needed for comprehensive testing
CREATE TABLE IF NOT EXISTS content_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  industry_category VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL,
  template_structure JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industry_specific_data (
  id SERIAL PRIMARY KEY,
  industry_category VARCHAR(50) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  data_content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_monitoring_queries (
  id SERIAL PRIMARY KEY,
  query_text VARCHAR(500) NOT NULL,
  language VARCHAR(10) NOT NULL,
  industry_category VARCHAR(50) NOT NULL,
  monitoring_frequency VARCHAR(20) DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Keywords for DirectDrive Logistics
INSERT INTO keywords (keyword_text, language, industry_category, priority_level, processing_status) VALUES
-- English DirectDrive Keywords
('best logistics company Kurdistan', 'english', 'logistics', 5, 'pending'),
('freight forwarding Erbil Iraq', 'english', 'logistics', 4, 'pending'),
('customs clearance services Kurdistan', 'english', 'logistics', 4, 'pending'),
('international shipping from Iraq', 'english', 'logistics', 3, 'pending'),
('warehouse services Erbil', 'english', 'logistics', 3, 'pending'),

-- Arabic DirectDrive Keywords
('أفضل شركة لوجستيات في كردستان', 'arabic', 'logistics', 4, 'pending'),
('خدمات الشحن في أربيل', 'arabic', 'logistics', 3, 'pending'),
('شحن دولي من العراق', 'arabic', 'logistics', 3, 'pending'),

-- Kurdish DirectDrive Keywords
('باشترین کۆمپانیای لۆجستیک لە کوردستان', 'kurdish', 'logistics', 4, 'pending'),
('خزمەتگوزاری گەیاندن لە هەولێر', 'kurdish', 'logistics', 3, 'pending'),

-- Test Content Template
INSERT INTO content_templates (template_name, industry_category, language, template_structure) VALUES
('DirectDrive Logistics Article', 'logistics', 'english', 
'{"sections": ["introduction", "services", "regional_expertise", "contact_info", "call_to_action"], "tone": "professional", "focus": "Kurdistan logistics solutions"}') 
ON CONFLICT DO NOTHING;

-- Sample DirectDrive Service Data
INSERT INTO industry_specific_data (industry_category, data_type, data_content) VALUES
('logistics', 'services', '{"freight_forwarding": "International cargo transport", "customs_clearance": "Import/export documentation", "warehousing": "Secure storage facilities", "regional_routes": "Kurdistan to Iraq corridors"}'),
('logistics', 'contact_info', '{"company": "DirectDrive Logistics", "location": "Erbil, Kurdistan Region", "services": "Full logistics solutions", "expertise": "Regional transportation"}'),
('logistics', 'unique_value', '{"regional_expertise": "Kurdistan to Iraq trade routes", "customs_knowledge": "Local regulatory compliance", "network": "Established regional partnerships"}')
ON CONFLICT DO NOTHING;

-- Test AI Citation Monitoring Queries
INSERT INTO ai_monitoring_queries (query_text, language, industry_category, monitoring_frequency) VALUES
('best logistics company Kurdistan', 'english', 'logistics', 'daily'),
('freight forwarding services Erbil', 'english', 'logistics', 'daily'),
('shipping company Iraq Kurdistan', 'english', 'logistics', 'weekly'),
('DirectDrive logistics reviews', 'english', 'logistics', 'daily'),
('أفضل شركة شحن في كردستان', 'arabic', 'logistics', 'weekly')
ON CONFLICT DO NOTHING;

-- Verification Queries for n8n Testing

-- 1. Get pending DirectDrive keywords for processing
SELECT 
    keyword_id,
    keyword_text,
    language,
    industry_category,
    priority_level,
    processing_status,
    created_at
FROM keywords 
WHERE industry_category = 'logistics' 
    AND processing_status = 'pending'
ORDER BY priority_level DESC, created_at ASC;

-- 2. Check DirectDrive service data availability
SELECT 
    data_type,
    data_content
FROM industry_specific_data 
WHERE industry_category = 'logistics';

-- 3. Verify content template for DirectDrive
SELECT 
    template_name,
    template_structure
FROM content_templates 
WHERE industry_category = 'logistics' 
    AND language = 'english';

-- 4. Check AI monitoring configuration
SELECT 
    query_text,
    language,
    monitoring_frequency
FROM ai_monitoring_queries 
WHERE industry_category = 'logistics';

-- Sample n8n Test Workflow Queries

-- Update keyword status to 'processing'
-- UPDATE keywords SET processing_status = 'processing', last_processed_at = NOW() WHERE keyword_id = ?;

-- Insert generated content
-- INSERT INTO content_pieces (keyword_id, title, content_body, language, industry_category, content_type, ai_model_used, word_count, content_status)
-- VALUES (?, ?, ?, ?, 'logistics', 'article', ?, ?, 'generated');

-- Log AI citation monitoring result
-- INSERT INTO ai_citations (content_piece_id, ai_platform, query_used, citation_found, citation_position, monitoring_timestamp)
-- VALUES (?, 'chatgpt', ?, ?, ?, NOW());

-- Performance Test Query
SELECT 
    COUNT(*) as total_keywords,
    COUNT(CASE WHEN processing_status = 'pending' THEN 1 END) as pending_keywords,
    COUNT(CASE WHEN processing_status = 'processing' THEN 1 END) as processing_keywords,
    COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as completed_keywords
FROM keywords 
WHERE industry_category = 'logistics';