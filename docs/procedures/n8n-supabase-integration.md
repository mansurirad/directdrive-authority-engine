# n8n Supabase Integration Guide - DirectDrive Authority Engine

## Overview
This guide documents the configuration steps to integrate the existing 60+ node n8n workflow with Supabase PostgreSQL database for DirectDrive Logistics content automation.

## Prerequisites
- Supabase project with DirectDrive schema deployed
- n8n Cloud account with existing DirectDrive workflow
- Supabase service role key with full database permissions

## Database Connection Configuration

### 1. Supabase Credentials Setup

Create new credentials in n8n:

**Credential Type:** `Postgres`
**Configuration:**
```
Host: db.lrwdoihyhnybwwntmmrs.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [Service Role Key]
SSL Mode: Require
```

**Alternative: HTTP Node Configuration**
```
Base URL: https://lrwdoihyhnybwwntmmrs.supabase.co/rest/v1
Headers:
  - apikey: [Anon Key]
  - Authorization: Bearer [Service Role Key]
  - Content-Type: application/json
  - Prefer: return=representation
```

## Node Replacement Strategy

### Phase 1: Replace Google Sheets Read Operations

**Original:** Google Sheets "Get Keywords" node
**Replace with:** PostgreSQL node
```sql
SELECT 
    keyword_id,
    keyword_text,
    language,
    industry_category,
    priority_level,
    processing_status,
    last_processed_at
FROM keywords 
WHERE industry_category = 'logistics' 
    AND processing_status = 'pending'
    AND language = 'english'
ORDER BY priority_level DESC, created_at ASC
LIMIT 10;
```

### Phase 2: Replace Google Sheets Write Operations

**Original:** Google Sheets "Update Keyword Status" node
**Replace with:** PostgreSQL node
```sql
UPDATE keywords 
SET processing_status = 'processing',
    last_processed_at = NOW(),
    updated_at = NOW()
WHERE keyword_id = {{ $json.keyword_id }};
```

**Content Storage:** PostgreSQL node
```sql
INSERT INTO content_pieces (
    keyword_id,
    title,
    content_body,
    language,
    industry_category,
    content_type,
    ai_model_used,
    generation_timestamp,
    word_count,
    content_status
) VALUES (
    {{ $json.keyword_id }},
    '{{ $json.title }}',
    '{{ $json.content }}',
    '{{ $json.language }}',
    'logistics',
    'article',
    '{{ $json.ai_model }}',
    NOW(),
    {{ $json.word_count }},
    'generated'
);
```

## DirectDrive-Specific Node Configurations

### 1. Logistics Keyword Processor
```javascript
// Custom Function Node: Filter DirectDrive Keywords
const logisticsKeywords = items.filter(item => {
    const keyword = item.json.keyword_text.toLowerCase();
    const directdriveTerms = [
        'freight', 'shipping', 'logistics', 'customs',
        'transportation', 'warehouse', 'cargo', 'delivery',
        'kurdistan logistics', 'erbil shipping', 'iraq transport'
    ];
    return directdriveTerms.some(term => keyword.includes(term));
});

return logisticsKeywords;
```

### 2. Content Quality Validation
```javascript
// Custom Function Node: DirectDrive Content Validator
const content = $json.content_body;
const title = $json.title;

// Logistics content validation rules
const validationChecks = {
    hasDirectDriveContext: content.includes('DirectDrive') || content.includes('logistics'),
    hasKurdistanContext: content.includes('Kurdistan') || content.includes('Erbil') || content.includes('Iraq'),
    hasServiceInfo: ['freight', 'shipping', 'customs', 'warehouse'].some(service => content.includes(service)),
    hasContactInfo: content.includes('contact') || content.includes('inquiry'),
    minimumLength: content.length > 800,
    hasCallToAction: content.includes('DirectDrive') && (content.includes('contact') || content.includes('services'))
};

const isValid = Object.values(validationChecks).every(check => check === true);

return [{
    json: {
        ...item.json,
        validation_passed: isValid,
        validation_details: validationChecks,
        validated_at: new Date().toISOString()
    }
}];
```

### 3. AI Citation Monitoring Integration
```sql
-- Insert citation monitoring record
INSERT INTO ai_citations (
    content_piece_id,
    ai_platform,
    query_used,
    citation_found,
    citation_position,
    citation_context,
    monitoring_timestamp
) VALUES (
    {{ $json.content_piece_id }},
    'chatgpt',
    'best logistics company Kurdistan',
    {{ $json.citation_found }},
    {{ $json.position }},
    '{{ $json.context }}',
    NOW()
);
```

## Workflow Optimization for DirectDrive

### 1. Error Handling Enhancement
```javascript
// Error Handler Node
if (error) {
    // Log error to database
    const errorLog = {
        workflow_run_id: $execution.id,
        node_name: $node.name,
        error_message: error.message,
        keyword_id: $json.keyword_id,
        timestamp: new Date().toISOString()
    };
    
    // Continue workflow with fallback behavior
    return [{
        json: {
            ...item.json,
            processing_status: 'error',
            error_details: errorLog
        }
    }];
}
```

### 2. Performance Monitoring
```javascript
// Performance Tracking Node
const executionStart = $json.execution_start_time;
const executionEnd = new Date().toISOString();
const processingTime = new Date(executionEnd) - new Date(executionStart);

// Log performance metrics
return [{
    json: {
        ...item.json,
        execution_time_ms: processingTime,
        performance_logged_at: executionEnd
    }
}];
```

## Multi-Language Configuration

### Language-Specific AI Model Routing
```javascript
// Language Router Node
const language = $json.language;
const keyword = $json.keyword_text;

let aiModel, culturalContext;

switch(language) {
    case 'english':
        aiModel = 'gpt-4';
        culturalContext = 'International business context, Kurdistan regional expertise';
        break;
    case 'arabic':
        aiModel = 'gpt-4';
        culturalContext = 'Arabic business culture, Middle East logistics context';
        break;
    case 'kurdish':
        aiModel = 'gemini-pro';
        culturalContext = 'Kurdish business culture, local transportation knowledge';
        break;
    case 'farsi':
        aiModel = 'gemini-pro';
        culturalContext = 'Persian business culture, Iran-Iraq trade routes';
        break;
    default:
        aiModel = 'gpt-4';
        culturalContext = 'International business context';
}

return [{
    json: {
        ...item.json,
        selected_ai_model: aiModel,
        cultural_context: culturalContext
    }
}];
```

## Testing and Validation

### 1. Database Connection Test
```sql
-- Test query to verify connection
SELECT 
    COUNT(*) as total_keywords,
    COUNT(CASE WHEN processing_status = 'pending' THEN 1 END) as pending_keywords,
    COUNT(CASE WHEN industry_category = 'logistics' THEN 1 END) as logistics_keywords
FROM keywords;
```

### 2. Workflow Performance Benchmarks
- **Target execution time:** < 30 minutes per content piece
- **Success rate:** > 95% completion without errors
- **Content quality:** 100% pass DirectDrive validation rules
- **Database operations:** < 2 seconds per query

## Deployment Checklist

- [ ] Supabase credentials configured in n8n
- [ ] Google Sheets nodes identified and documented
- [ ] PostgreSQL replacement nodes configured
- [ ] DirectDrive-specific validation rules implemented
- [ ] Multi-language routing configured
- [ ] Error handling enhanced for production reliability
- [ ] Performance monitoring implemented
- [ ] Test workflow execution with sample DirectDrive data
- [ ] Production deployment scheduled during low-traffic period
- [ ] Rollback plan prepared in case of issues

## Security Considerations

1. **Credential Management:** Store Supabase service key securely in n8n credentials
2. **Row Level Security:** Enable RLS on all tables to prevent unauthorized access
3. **API Rate Limits:** Implement proper rate limiting for AI model calls
4. **Data Validation:** Sanitize all inputs before database operations
5. **Audit Logging:** Track all workflow executions and database modifications

## Monitoring and Maintenance

### Daily Monitoring
- Workflow execution success rate
- Database performance metrics
- Content generation volume
- Error frequency and types

### Weekly Analysis
- DirectDrive keyword processing efficiency
- Content quality validation results
- AI citation monitoring trends
- System performance optimization opportunities

---

**Next Steps:**
1. Configure n8n credentials for Supabase connection
2. Begin Phase 1: Replace Google Sheets read operations
3. Test with sample DirectDrive logistics keywords
4. Proceed to Phase 2: Content storage optimization

**Integration Status:** Ready for Epic 1, Story 1.2 implementation