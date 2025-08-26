# Technical Architecture Documentation - LLMBOOST2 Admin Panel

## System Architecture Overview

### Current Infrastructure Reality Check
```
✅ Working Components:
- Supabase PostgreSQL database (keywords, content_pieces, ai_citations)
- 29-node n8n workflow (Google Sheets dependent)
- DirectDrive website auto-publishing
- Telegram notification system

❌ Missing Integrations:
- n8n ↔ Supabase connection
- Admin panel interface
- Content review workflow
- SEO scoring integration
```

### Target Architecture Flow
```
Keywords Input → Supabase DB → n8n Workflow → Admin Panel Review → Publishing Queue → DirectDrive Website
     ↓              ↓              ↓               ↓                ↓                ↓
   Next.js       PostgreSQL    29-Node Pipeline  Tabbed Interface  Scheduling     Auto-Publish
   Forms         Storage       (Modified)        + SEO Scoring    System         Integration
```

## Database Schema Enhancements

### Enhanced content_pieces Table
```sql
-- Add workflow and scoring fields
ALTER TABLE content_pieces ADD COLUMN workflow_status TEXT DEFAULT 'generated';
-- States: 'generated' → 'under_review' → 'approved' → 'scheduled' → 'published'

ALTER TABLE content_pieces ADD COLUMN seo_score INTEGER;
ALTER TABLE content_pieces ADD COLUMN score_breakdown JSONB;
ALTER TABLE content_pieces ADD COLUMN scheduled_publish_date TIMESTAMP;
ALTER TABLE content_pieces ADD COLUMN last_reviewed_at TIMESTAMP;
ALTER TABLE content_pieces ADD COLUMN review_notes TEXT;

-- Example score_breakdown structure:
-- {
--   "overall_score": 87,
--   "technical_seo": 92,
--   "content_quality": 85,
--   "brand_integration": 84,
--   "improvement_suggestions": ["Add internal links", "Optimize meta description"]
-- }
```

### New Tables for Admin Panel

#### Publishing Queue Table
```sql
CREATE TABLE publishing_queue (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_pieces(id),
  scheduled_date TIMESTAMP,
  priority INTEGER DEFAULT 1,
  publishing_status TEXT DEFAULT 'queued',
  -- 'queued', 'publishing', 'published', 'failed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workflow Executions Tracking
```sql
CREATE TABLE workflow_executions (
  id SERIAL PRIMARY KEY,
  trigger_type TEXT, -- 'scheduled', 'manual', 'api'
  trigger_source TEXT, -- 'admin_panel', 'cron', 'webhook'
  status TEXT DEFAULT 'running',
  -- 'running', 'completed', 'failed', 'cancelled'
  keywords_processed INTEGER DEFAULT 0,
  content_generated INTEGER DEFAULT 0,
  execution_time_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### Content Reviews Table
```sql
CREATE TABLE content_reviews (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_pieces(id),
  reviewer_id TEXT, -- User ID (future expansion)
  review_action TEXT, -- 'approved', 'rejected', 'needs_changes'
  review_notes TEXT,
  time_spent_minutes INTEGER,
  reviewed_at TIMESTAMP DEFAULT NOW()
);
```

## API Specification

### Admin Panel Endpoints

#### Content Management
```typescript
// Get content queue with filtering and sorting
GET /api/v1/content
Query params: status?, score_min?, score_max?, limit?, offset?
Response: {
  content: ContentPiece[],
  total: number,
  filters: FilterOptions
}

// Get specific content for review
GET /api/v1/content/:id
Response: {
  content: ContentPiece,
  scoring: ScoreBreakdown,
  review_history: Review[]
}

// Update content during review
PATCH /api/v1/content/:id
Body: {
  title?: string,
  content?: string,
  workflow_status?: string,
  review_notes?: string
}

// Approve content for publishing
POST /api/v1/content/:id/approve
Body: {
  scheduled_date?: ISO8601,
  priority?: number,
  review_notes?: string
}
```

#### Keywords Management
```typescript
// Create new keywords for content generation
POST /api/v1/keywords
Body: {
  primary_keyword: string,
  secondary_keywords: string[],
  intent: string,
  language: string,
  priority: number
}

// Get keywords queue
GET /api/v1/keywords
Query params: status?, language?, priority?
Response: { keywords: Keyword[], total: number }
```

#### Workflow Control
```typescript
// Trigger manual content generation
POST /api/v1/workflow/trigger
Body: {
  keyword_ids?: number[],
  priority?: number
}
Response: {
  execution_id: string,
  estimated_completion: ISO8601
}

// Get workflow status
GET /api/v1/workflow/status/:execution_id
Response: {
  status: string,
  progress: number,
  current_step: string,
  estimated_remaining: number
}
```

### Real-time Subscriptions (Supabase)
```typescript
// Content status updates
supabase
  .channel('content_updates')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'content_pieces' },
    (payload) => updateContentCard(payload.new)
  )

// Workflow execution updates
supabase
  .channel('workflow_updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'workflow_executions' },
    (payload) => updateWorkflowStatus(payload)
  )
```

## n8n Workflow Integration

### Required Modifications to Existing 29-Node Workflow

#### 1. Replace Google Sheets Nodes
```javascript
// Current: Google Sheets "Grab New Cluster"
// Replace with: Supabase Query
SELECT id, primary_keyword, secondary_keywords, intent, language, priority
FROM keywords 
WHERE status = 'pending' 
ORDER BY priority DESC, created_at ASC 
LIMIT 1;

// Current: Google Sheets "Check as completed on Sheets"  
// Replace with: Supabase Update
UPDATE keywords 
SET status = 'processing', updated_at = NOW() 
WHERE id = {{ $('Grab New Cluster').item.json.id }};
```

#### 2. Add Content Storage to Supabase
```javascript
// New Node: Store Generated Content
INSERT INTO content_pieces (
  keyword_id,
  title,
  content,
  industry,
  language,
  ai_model,
  seo_score,
  score_breakdown,
  workflow_status,
  created_at
) VALUES (
  {{ $('Grab New Cluster').item.json.id }},
  {{ $('SEO details').item.json.title }},
  {{ $('Add internal links').item.json.content }},
  'logistics',
  {{ $('Grab New Cluster').item.json.language }},
  'gemini-2.0-flash',
  {{ $('SEO details').item.json.overall_score }},
  {{ $('SEO details').item.json.score_breakdown }},
  'generated',
  NOW()
);
```

#### 3. Workflow Execution Tracking
```javascript
// Start Node: Log Execution Start
INSERT INTO workflow_executions (
  trigger_type,
  trigger_source,
  status,
  created_at
) VALUES (
  '{{ $trigger.type }}',
  'n8n_workflow',
  'running',
  NOW()
) RETURNING id;

// End Node: Log Execution Complete
UPDATE workflow_executions 
SET 
  status = 'completed',
  keywords_processed = {{ $('keyword_count').item.json.count }},
  content_generated = {{ $('content_count').item.json.count }},
  execution_time_seconds = {{ $('execution_timer').item.json.duration }},
  completed_at = NOW()
WHERE id = {{ $('start_execution').item.json.id }};
```

#### 4. Remove Auto-Publishing (Admin Panel Control)
```javascript
// Remove These Nodes:
// - "Create a post" (WordPress publishing)
// - Direct website integration

// Replace with: Content Ready Notification
POST /api/v1/webhooks/content-generated
Body: {
  content_id: {{ $('store_content').item.json.id }},
  keyword: {{ $('Grab New Cluster').item.json.primary_keyword }},
  score: {{ $('SEO details').item.json.overall_score }},
  status: 'generated'
}
```

### Webhook Integration Points

#### Admin Panel → n8n Triggers
```javascript
// Manual content generation trigger
Webhook URL: https://raddirectdrive.app.n8n.cloud/webhook/manual-trigger
Method: POST
Body: {
  keyword_ids: number[],
  priority: number,
  requested_by: string
}
```

#### n8n → Admin Panel Notifications  
```javascript
// Content generation complete
Webhook URL: https://your-admin-panel.vercel.app/api/webhooks/n8n-complete
Method: POST
Body: {
  execution_id: string,
  content_id: number,
  status: 'completed' | 'failed',
  score: number,
  error_message?: string
}
```

## Performance Optimization

### Database Indexes
```sql
-- Content queue performance
CREATE INDEX idx_content_workflow_status ON content_pieces(workflow_status, created_at);
CREATE INDEX idx_content_seo_score ON content_pieces(seo_score DESC);
CREATE INDEX idx_content_scheduled_date ON content_pieces(scheduled_publish_date);

-- Keywords processing
CREATE INDEX idx_keywords_status_priority ON keywords(status, priority DESC, created_at);

-- Publishing queue
CREATE INDEX idx_publishing_queue_scheduled ON publishing_queue(scheduled_date, publishing_status);
```

### API Response Time Targets
```typescript
// Performance Requirements
Content Queue Load: < 500ms
Content Detail View: < 300ms  
Content Update: < 200ms
Real-time Updates: < 100ms latency
Workflow Trigger: < 1s response
```

### Caching Strategy
```typescript
// Frontend caching
- Content list: 30 seconds
- Individual content: 5 minutes  
- Scoring data: 1 minute
- Workflow status: Real-time (no cache)

// API caching
- Keywords list: 5 minutes
- Content statistics: 2 minutes
- User preferences: 1 hour
```

## Security Architecture

### Authentication & Authorization
```typescript
// Supabase Row Level Security
-- Admin Panel Access
CREATE POLICY "Admin panel access" ON content_pieces
FOR ALL USING (true); -- Single admin initially

-- Future expansion ready
CREATE POLICY "Content creator access" ON content_pieces  
FOR SELECT USING (created_by = auth.uid());
```

### API Security
```typescript
// Rate limiting
- Admin panel: 1000 requests/hour
- Workflow triggers: 10 requests/hour
- Real-time subscriptions: Unlimited

// Input validation
- Zod schemas for all API endpoints
- SQL injection prevention
- XSS protection on content fields
```

## Error Handling & Recovery

### Workflow Failure Recovery
```javascript
// n8n Error Handling Node
if (workflow_fails) {
  // Log error
  UPDATE workflow_executions 
  SET status = 'failed', error_message = '{{ $error.message }}'
  WHERE id = {{ $execution_id }};
  
  // Notify admin panel
  POST /api/webhooks/workflow-error
  Body: { execution_id, error_message, timestamp }
  
  // Reset keyword status
  UPDATE keywords SET status = 'pending' WHERE id = {{ $keyword_id }};
}
```

### Admin Panel Error Handling
```typescript
// Network resilience
- Retry failed API calls (3 attempts)
- Offline mode with local storage
- Error boundary components
- User-friendly error messages

// Data consistency
- Optimistic updates with rollback
- Conflict resolution for concurrent edits
- Auto-save draft changes
```

## Deployment Architecture

### Environment Setup
```yaml
# Development
- Local Next.js dev server
- Supabase local development
- n8n Cloud (shared instance)
- Test Telegram bot

# Production  
- Vercel deployment
- Supabase production database
- n8n Cloud production workflow
- Production Telegram integration
```

### Migration Strategy
```sql
-- Phase 1: Database preparation
1. Create new tables and indexes
2. Migrate existing data
3. Test API endpoints

-- Phase 2: n8n integration
1. Backup current workflow
2. Modify nodes (non-destructive)  
3. Test with sample data
4. Full integration testing

-- Phase 3: Admin panel deployment
1. Deploy to Vercel staging
2. Integration testing
3. User acceptance testing
4. Production deployment
```

## Scalability Considerations

### Current Capacity Planning
```
- Content generation: 50 articles/week
- Admin panel users: 1-3 initially  
- Database storage: ~1GB/year
- API requests: ~10,000/day
```

### Growth Planning  
```
- Content generation: 500 articles/week (10x)
- Admin panel users: 10-20 team members
- Database storage: ~10GB/year
- API requests: ~100,000/day
```

### Performance Monitoring
```typescript
// Metrics to track
- API response times
- Database query performance  
- n8n workflow execution time
- Content review completion rates
- User session analytics

// Alerts
- API response > 2 seconds
- Database connection failures
- n8n workflow failures  
- High error rates (>5%)
```

This technical architecture provides a complete foundation for implementing the admin panel while maintaining the existing n8n workflow functionality. The design prioritizes performance, scalability, and maintainability while enabling seamless integration between all system components.