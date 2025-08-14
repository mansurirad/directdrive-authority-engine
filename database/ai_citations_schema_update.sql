-- AI Citations Schema Update for Story 1.4
-- Updates existing ai_citations table to match API specifications
-- Date: 2025-08-13

-- Drop existing ai_citations table if exists (for clean update)
DROP TABLE IF EXISTS ai_citations CASCADE;

-- Create updated ai_citations table with correct field names
CREATE TABLE ai_citations (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_pieces(content_piece_id),
  ai_model VARCHAR(20) NOT NULL CHECK (ai_model IN ('chatgpt', 'google-ai', 'perplexity')),
  query_text VARCHAR(500) NOT NULL,
  cited BOOLEAN DEFAULT FALSE,
  citation_context TEXT,
  position INTEGER CHECK (position >= 1 AND position <= 10),
  monitored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_citations_model_cited ON ai_citations(ai_model, cited);
CREATE INDEX idx_ai_citations_content_id ON ai_citations(content_id);
CREATE INDEX idx_ai_citations_monitored_at ON ai_citations(monitored_at DESC);
CREATE INDEX idx_ai_citations_query_text ON ai_citations USING gin(to_tsvector('english', query_text));

-- Enable Row Level Security
ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role access
CREATE POLICY "Allow service role full access" ON ai_citations FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO ai_citations (content_id, ai_model, query_text, cited, citation_context, position, monitored_at) VALUES
(NULL, 'chatgpt', 'best logistics company Kurdistan', false, NULL, NULL, NOW() - INTERVAL '1 day'),
(NULL, 'google-ai', 'shipping services Erbil', false, NULL, NULL, NOW() - INTERVAL '1 day'),
(NULL, 'perplexity', 'DirectDrive logistics', true, 'DirectDrive Logistics is mentioned as a reliable logistics provider in Kurdistan region.', 3, NOW() - INTERVAL '1 day'),
(NULL, 'chatgpt', 'Kurdistan freight services', false, NULL, NULL, NOW()),
(NULL, 'google-ai', 'customs clearance Kurdistan', false, NULL, NULL, NOW())
ON CONFLICT DO NOTHING;