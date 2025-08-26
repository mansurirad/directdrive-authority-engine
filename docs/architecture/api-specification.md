# API Specification

Based on your REST + WebSocket approach and the data models we've defined, this comprehensive API specification supports DirectDrive Authority Engine's real-time citation monitoring and n8n workflow integration.

## REST API Specification

All API endpoints follow RESTful conventions with JSON request/response format. Authentication uses Supabase JWT tokens for secure access to DirectDrive data and future client data isolation.

**Base URL:** `https://directdrive-authority.vercel.app/api/v1`  
**Authentication:** Bearer token (Supabase JWT)  
**Content-Type:** `application/json`

## Core API Endpoints

### Keywords Management
```yaml
GET /api/v1/keywords:
  summary: "Retrieve all keywords with filtering"
  parameters:
    industry?: string
    language?: string
    status?: string
    priority?: number
  responses:
    200:
      schema:
        type: array
        items: Keyword

POST /api/v1/keywords:
  summary: "Create new keyword for content generation"
  body:
    type: object
    properties:
      industry: string
      language: string
      primary_keyword: string
      secondary_keywords: array
      intent: string
      region: string
      priority: number
  responses:
    201:
      schema: Keyword

GET /api/v1/keywords/next:
  summary: "Get next batch of keywords for processing"
  parameters:
    industry?: string
    limit?: number
  responses:
    200:
      schema:
        type: array
        items: Keyword
```

### Content Management
```yaml
GET /api/v1/content:
  summary: "Retrieve content pieces with filtering"
  parameters:
    keyword_id?: number
    industry?: string
    language?: string
    status?: string
    workflow_state?: string
    assigned_reviewer?: string
    ai_model?: string
    limit?: number
    offset?: number
  responses:
    200:
      schema:
        type: object
        properties:
          content: array
          total_count: number
          has_more: boolean

POST /api/v1/content:
  summary: "Create new content piece"
  body:
    type: object
    properties:
      keyword_id: number
      title: string
      content: string
      industry: string
      language: string
      ai_model: string
      quality_score: number
  responses:
    201:
      schema: ContentPiece

GET /api/v1/content/{id}:
  summary: "Get single content piece with full details"
  parameters:
    id: number
  responses:
    200:
      schema: ContentPiece
    404:
      schema:
        type: object
        properties:
          error: string

PUT /api/v1/content/{id}:
  summary: "Update content piece (admin panel operations)"
  parameters:
    id: number
  body:
    type: object
    properties:
      title?: string
      content?: string
      workflow_state?: string
      assigned_reviewer?: string
      review_notes?: string
      priority_score?: number
      scheduled_publish_date?: string
  responses:
    200:
      schema: ContentPiece

PUT /api/v1/content/{id}/approve:
  summary: "Approve content for publishing"
  parameters:
    id: number
  body:
    type: object
    properties:
      approval_notes?: string
      scheduled_date?: string
      priority?: number
  responses:
    200:
      schema:
        type: object
        properties:
          approved: boolean
          queue_position: number
          estimated_publish_time: string

PUT /api/v1/content/{id}/reject:
  summary: "Reject content and return to review"
  parameters:
    id: number
  body:
    type: object
    properties:
      rejection_reason: string
      suggested_changes: string
  responses:
    200:
      schema:
        type: object
        properties:
          rejected: boolean
          workflow_state: string

DELETE /api/v1/content/{id}:
  summary: "Archive content piece"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: object
        properties:
          archived: boolean
```

### Admin Panel Workflow Management
```yaml
GET /api/v1/admin/review-queue:
  summary: "Get content review queue for admin panel"
  parameters:
    assigned_reviewer?: string
    workflow_state?: string
    priority_min?: number
    limit?: number
  responses:
    200:
      schema:
        type: object
        properties:
          queue_items: array
          total_pending: number
          reviewer_assignments: object

POST /api/v1/admin/assign-reviewer:
  summary: "Assign content to reviewer"
  body:
    type: object
    properties:
      content_ids: array
      reviewer_id: string
      priority_override?: number
  responses:
    200:
      schema:
        type: object
        properties:
          assigned_count: number
          assignments: array

GET /api/v1/admin/workload:
  summary: "Get reviewer workload statistics"
  parameters:
    timeframe?: string
  responses:
    200:
      schema:
        type: object
        properties:
          reviewers: array
          average_review_time: number
          queue_backlog: number

POST /api/v1/admin/bulk-action:
  summary: "Perform bulk actions on content"
  body:
    type: object
    properties:
      content_ids: array
      action: string
      parameters: object
  responses:
    200:
      schema:
        type: object
        properties:
          processed_count: number
          failed_count: number
          results: array
```

### Publishing Queue Management
```yaml
GET /api/v1/publishing/queue:
  summary: "Get publishing queue status"
  parameters:
    status?: string
    scheduled_date_from?: string
    scheduled_date_to?: string
    priority_min?: number
  responses:
    200:
      schema:
        type: array
        items: PublishingQueue

POST /api/v1/publishing/queue:
  summary: "Add content to publishing queue"
  body:
    type: object
    properties:
      content_id: number
      scheduled_date: string
      priority: number
      business_event?: string
      publication_platform: string
  responses:
    201:
      schema: PublishingQueue

PUT /api/v1/publishing/queue/{id}:
  summary: "Update queue item"
  parameters:
    id: number
  body:
    type: object
    properties:
      scheduled_date?: string
      priority?: number
      queue_status?: string
  responses:
    200:
      schema: PublishingQueue

POST /api/v1/publishing/queue/{id}/retry:
  summary: "Retry failed publication"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: object
        properties:
          retry_initiated: boolean
          estimated_completion: string

DELETE /api/v1/publishing/queue/{id}:
  summary: "Cancel queued publication"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: object
        properties:
          cancelled: boolean
```

### Real-time SEO Scoring
```yaml
GET /api/v1/content/{id}/score:
  summary: "Get real-time SEO score for content"
  parameters:
    id: number
  responses:
    200:
      schema: ContentScoring

POST /api/v1/content/{id}/score/recalculate:
  summary: "Trigger SEO score recalculation"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: object
        properties:
          calculation_triggered: boolean
          estimated_completion: string

PUT /api/v1/content/{id}/score/manual-adjustment:
  summary: "Apply manual score adjustment"
  parameters:
    id: number
  body:
    type: object
    properties:
      adjusted_score: number
      adjustment_reason: string
  responses:
    200:
      schema: ContentScoring
```

### Citation Monitoring
```yaml
GET /api/v1/citations:
  summary: "Retrieve AI citations with filtering"
  parameters:
    content_id?: number
    ai_model?: string
    cited?: boolean
    date_from?: string
    date_to?: string
  responses:
    200:
      schema:
        type: array
        items: AICitation

POST /api/v1/citations:
  summary: "Record new AI citation"
  body:
    type: object
    properties:
      content_id: number
      ai_model: string
      query_text: string
      cited: boolean
      citation_context: string
      position: number
  responses:
    201:
      schema: AICitation

GET /api/v1/citations/analytics:
  summary: "Get citation analytics and trends"
  parameters:
    timeframe?: string
    industry?: string
  responses:
    200:
      schema:
        type: object
        properties:
          total_citations: number
          citation_rate: number
          top_performing_content: array
          competitive_analysis: object
```

## Story 1.5: Content Performance Monitoring Endpoints

### Content Verification
```yaml
POST /api/v1/content/verify:
  summary: "Verify content publication using multi-factor matching"
  body:
    type: object
    properties:
      content_id: number
      publication_url?: string
      force_recheck?: boolean
  responses:
    200:
      schema:
        type: object
        properties:
          verification: ContentVerification
          confidence: number
          success: boolean
          error?: string

GET /api/v1/content/{id}/verification:
  summary: "Get verification history for content piece"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: array
        items: ContentVerification

POST /api/v1/content/verification/batch:
  summary: "Batch verify multiple content pieces"
  body:
    type: object
    properties:
      content_ids: array
      verification_method?: string
  responses:
    200:
      schema:
        type: object
        properties:
          verified_count: number
          failed_count: number
          results: array
```

### Performance Tracking
```yaml
GET /api/v1/content/performance:
  summary: "Get content performance metrics with attribution tracking"
  parameters:
    content_id?: number
    phase?: string
    date_from?: string
    date_to?: string
    client_id?: number
  responses:
    200:
      schema:
        type: object
        properties:
          performances: array
          attribution_summary: object
          total_roi_score: number

POST /api/v1/content/performance:
  summary: "Create performance tracking record"
  body:
    type: object
    properties:
      content_id: number
      tracking_start_date: string
      citation_baseline_count: number
  responses:
    201:
      schema: ContentPerformance

PUT /api/v1/content/performance/{id}:
  summary: "Update performance metrics"
  parameters:
    id: number
  body:
    type: object
    properties:
      citation_current_count: number
      attribution_phase: string
      roi_score: number
  responses:
    200:
      schema: ContentPerformance
```

### Attribution Timeline
```yaml
GET /api/v1/content/{id}/attribution:
  summary: "Get 12-week attribution timeline for content"
  parameters:
    id: number
  responses:
    200:
      schema:
        type: array
        items: AttributionTimeline

POST /api/v1/content/attribution/update:
  summary: "Update attribution timeline with citation data"
  body:
    type: object
    properties:
      content_id: number
      citation_data: object
      performance_metrics: object
  responses:
    200:
      schema:
        type: object
        properties:
          attribution: AttributionTimeline
          correlation_updated: boolean
          phase_transition: boolean

GET /api/v1/attribution/phase-summary:
  summary: "Get summary of all content attribution phases"
  parameters:
    phase?: string
    client_id?: number
  responses:
    200:
      schema:
        type: object
        properties:
          baseline_count: number
          primary_count: number
          sustained_count: number
          completed_count: number
          average_roi_by_phase: object
```

### ROI Analysis
```yaml
GET /api/v1/content/roi-analysis:
  summary: "Get comprehensive ROI analysis for content performance"
  parameters:
    timeframe: string
    content_ids?: array
    industry?: string
    client_id?: number
  responses:
    200:
      schema:
        type: object
        properties:
          roi_metrics: object
          content_effectiveness: array
          business_impact: object
          competitive_insights: object

GET /api/v1/content/roi-analysis/trends:
  summary: "Get ROI trends and performance correlation"
  parameters:
    period: string
    comparison_period?: string
  responses:
    200:
      schema:
        type: object
        properties:
          trend_analysis: object
          citation_lift_trends: array
          content_roi_distribution: object
          optimization_recommendations: array

POST /api/v1/content/roi-analysis/calculate:
  summary: "Trigger ROI calculation for specific content"
  body:
    type: object
    properties:
      content_ids: array
      force_recalculation?: boolean
  responses:
    200:
      schema:
        type: object
        properties:
          calculation_triggered: boolean
          estimated_completion: string
          job_id: string
```

## n8n Webhook Endpoints

### Content Generation Webhooks
```yaml
POST /api/v1/webhooks/n8n/content-complete:
  summary: "n8n webhook for content generation completion"
  body:
    type: object
    properties:
      workflow_id: string
      content_data: object
      generation_metadata: object
  responses:
    200:
      schema:
        type: object
        properties:
          received: boolean
          content_id: number

POST /api/v1/webhooks/n8n/publish-complete:
  summary: "n8n webhook for content publication completion"
  body:
    type: object
    properties:
      content_id: number
      publication_url: string
      publication_status: string
  responses:
    200:
      schema:
        type: object
        properties:
          received: boolean
          verification_triggered: boolean
```

### Citation Monitoring Webhooks
```yaml
POST /api/v1/webhooks/n8n/citation-found:
  summary: "n8n webhook for new citation detection"
  body:
    type: object
    properties:
      citation_data: object
      monitoring_metadata: object
  responses:
    200:
      schema:
        type: object
        properties:
          received: boolean
          attribution_updated: boolean

POST /api/v1/webhooks/n8n/monitoring-complete:
  summary: "n8n webhook for citation monitoring completion"
  body:
    type: object
    properties:
      monitoring_session_id: string
      citations_found: number
      monitoring_summary: object
  responses:
    200:
      schema:
        type: object
        properties:
          received: boolean
          performance_updated: boolean
```

## WebSocket Events

### Admin Panel Real-time Updates
```yaml
Events:
  content_status_changed:
    description: "Content workflow state updated"
    payload:
      content_id: number
      old_state: string
      new_state: string
      assigned_reviewer?: string
      timestamp: string
      
  content_assigned:
    description: "Content assigned to reviewer"
    payload:
      content_id: number
      reviewer_id: string
      priority_score: number
      estimated_review_time: number
      
  content_approved:
    description: "Content approved for publishing"
    payload:
      content_id: number
      approved_by: string
      scheduled_date?: string
      queue_position: number
      
  content_rejected:
    description: "Content rejected and returned to review"
    payload:
      content_id: number
      rejected_by: string
      rejection_reason: string
      suggested_changes: string
      
  seo_score_updated:
    description: "Real-time SEO score recalculation complete"
    payload:
      content_id: number
      new_score: number
      score_breakdown: object
      optimization_suggestions: array
      
  queue_status_changed:
    description: "Publishing queue item status updated"
    payload:
      queue_id: number
      content_id: number
      old_status: string
      new_status: string
      estimated_publish_time?: string
      
  workflow_execution_complete:
    description: "n8n workflow execution finished"
    payload:
      execution_id: string
      workflow_id: string
      new_content_count: number
      execution_time: number
      success_rate: number
      
  reviewer_workload_updated:
    description: "Reviewer assignment or completion updated"
    payload:
      reviewer_id: string
      current_assignments: number
      completed_today: number
      average_review_time: number
```

### Real-time Performance Updates
```yaml
Events:
  content_verification_complete:
    description: "Content verification status updated"
    payload:
      content_id: number
      verification_status: string
      confidence: number
      
  attribution_phase_transition:
    description: "Content moved to next attribution phase"
    payload:
      content_id: number
      old_phase: string
      new_phase: string
      performance_delta: object
      
  roi_calculation_complete:
    description: "ROI analysis completed for content"
    payload:
      content_id: number
      roi_score: number
      business_impact: object
      
  citation_correlation_update:
    description: "Citation-content correlation updated"
    payload:
      content_id: number
      correlation_strength: number
      attribution_confidence: number
      
  performance_alert:
    description: "Performance threshold reached"
    payload:
      alert_type: string
      content_id: number
      threshold_value: number
      current_value: number
      
  system_notification:
    description: "System-wide notifications for admin panel"
    payload:
      notification_type: string
      message: string
      severity: string
      action_required: boolean
      related_content_id?: number
```

## Error Handling

### Standard Error Responses
```yaml
Error Response Format:
  type: object
  properties:
    error: boolean
    message: string
    code: string
    details?: object
    timestamp: string

Common Error Codes:
  CONTENT_NOT_FOUND: "Content piece not found"
  VERIFICATION_FAILED: "Content verification failed"
  INSUFFICIENT_CONFIDENCE: "Verification confidence below threshold"
  ATTRIBUTION_ERROR: "Attribution timeline calculation error"
  ROI_CALCULATION_FAILED: "ROI analysis calculation failed"
  INVALID_PHASE_TRANSITION: "Invalid attribution phase transition"
  CORRELATION_ERROR: "Citation-content correlation error"
```

## Authentication & Rate Limiting

### API Authentication
- Bearer token authentication using Supabase JWT
- Row-level security for multi-client data isolation
- API key authentication for n8n webhooks

### Rate Limiting
- Standard endpoints: 1000 requests/hour per client
- Verification endpoints: 500 requests/hour per client
- ROI analysis endpoints: 100 requests/hour per client
- Webhook endpoints: No rate limiting (internal use)

## Validation Schemas

### Content Performance Validation
```yaml
ContentPerformanceCreate:
  type: object
  required: [content_id, tracking_start_date]
  properties:
    content_id: 
      type: number
      minimum: 1
    tracking_start_date:
      type: string
      format: date-time
    citation_baseline_count:
      type: number
      minimum: 0
      default: 0

ContentVerificationRequest:
  type: object
  required: [content_id]
  properties:
    content_id:
      type: number
      minimum: 1
    publication_url:
      type: string
      format: uri
      pattern: "^https://directdrivelogistic\\.com/"
    force_recheck:
      type: boolean
      default: false

AttributionUpdateRequest:
  type: object
  required: [content_id, citation_data]
  properties:
    content_id:
      type: number
      minimum: 1
    citation_data:
      type: object
      properties:
        citation_count: number
        ai_model: string
        query_context: string
    performance_metrics:
      type: object
      properties:
        citation_lift: number
        time_to_citation: number
        competitive_position: number
```

---

**API Architecture Rationale:**
The enhanced API specification supports the new Story 1.5 Content-Citation-Performance Loop monitoring while maintaining backward compatibility with existing Stories 1.1-1.4 infrastructure. The new endpoints provide comprehensive content verification, attribution tracking, and ROI analysis capabilities with proper validation, error handling, and real-time updates through WebSocket events. The API design follows RESTful conventions and includes robust authentication, rate limiting, and multi-client data isolation for future scalability.