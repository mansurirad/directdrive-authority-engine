# DirectDrive Authority Engine - Rollback Procedures

## Overview

This document provides comprehensive rollback procedures for each epic and story in the DirectDrive Authority Engine project, ensuring safe brownfield enhancement with minimal business disruption.

## Emergency Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| **Technical Lead** | [Primary Developer] | Immediate |
| **Product Owner** | Mojtaba | 15 minutes |
| **Business Owner** | DirectDrive Management | 30 minutes |
| **n8n Workflow Admin** | [Workflow Manager] | 10 minutes |

## General Rollback Principles

### Rollback Decision Matrix

| Severity | Trigger | Response Time | Rollback Scope |
|----------|---------|---------------|----------------|
| **P0 - Critical** | Business operations stopped | < 5 minutes | Full system rollback |
| **P1 - High** | Feature broken, business impact | < 15 minutes | Feature-specific rollback |
| **P2 - Medium** | Partial functionality affected | < 30 minutes | Component rollback |
| **P3 - Low** | Minor issues, no business impact | Next maintenance window | Planned fix |

### Pre-Rollback Checklist

**✅ Immediate Assessment:**
- [ ] Identify scope of impact (which stories/features affected)
- [ ] Determine if DirectDrive operations are impacted
- [ ] Check if n8n workflows are functioning
- [ ] Verify data integrity status

**✅ Stakeholder Notification:**
- [ ] Notify technical team immediately
- [ ] Alert business stakeholders within 10 minutes
- [ ] Document incident in tracking system
- [ ] Prepare communication for users if needed

## Epic-Level Rollback Procedures

### Epic 1: DirectDrive Foundation & Database Migration

#### Epic 1 Rollback Overview
**Rollback Complexity:** HIGH (Database changes involved)  
**Business Impact:** CRITICAL (Affects core n8n workflow)  
**Rollback Time:** 15-30 minutes

#### Epic 1 Rollback Steps

**Phase 1: Immediate Safety (< 5 minutes)**
```bash
# 1. Stop all n8n workflows immediately
curl -X POST "$N8N_API_URL/workflows/stop-all" \
  -H "Authorization: Bearer $N8N_API_KEY"

# 2. Switch traffic back to Google Sheets (if integrated)
# Update n8n nodes to use Google Sheets instead of Supabase
```

**Phase 2: Database Rollback (5-15 minutes)**
```sql
-- Rollback database schema changes
-- Execute in Supabase SQL editor
BEGIN;

-- Drop new tables if they exist
DROP TABLE IF EXISTS ai_citations CASCADE;
DROP TABLE IF EXISTS content_pieces CASCADE; 
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Restore Google Sheets integration endpoints
-- (Manual step: reconfigure n8n nodes)

COMMIT;
```

**Phase 3: Workflow Restoration (10-20 minutes)**
```bash
# 1. Restore previous n8n workflow from backup
# (Manual via n8n Cloud interface)

# 2. Update webhook endpoints to previous URLs
# 3. Test workflow execution with Google Sheets
# 4. Verify content generation pipeline
```

**Phase 4: Verification (5-10 minutes)**
```bash
# Verify rollback success
curl -f "$GOOGLE_SHEETS_API_URL/test-endpoint"
# Check n8n workflow execution
# Confirm content generation working
```

#### Story-Level Rollback: Epic 1

**Story 1.1: Supabase Database Setup**
```sql
-- Emergency database rollback
DROP DATABASE directdrive_authority;
-- Restore Google Sheets API credentials in n8n
-- Update workflow nodes back to Sheets operations
```

**Story 1.2: n8n Workflow Enhancement**
```bash
# Restore original workflow from n8n backup
# Revert webhook endpoints to original URLs
# Test original Google Sheets integration
```

### Epic 2: Multi-Language Content Engine

#### Epic 2 Rollback Overview
**Rollback Complexity:** MEDIUM (AI model routing changes)  
**Business Impact:** MEDIUM (Content generation affected)  
**Rollback Time:** 10-20 minutes

#### Epic 2 Rollback Steps

**Phase 1: AI Model Routing Rollback**
```javascript
// Revert to single-language content generation
const rollbackAIRouting = {
  language: 'en', // English only
  model: 'gpt-4', // Single model
  culturalContext: false // Disable cultural adaptations
};
```

**Phase 2: Database Content Cleanup**
```sql
-- Remove multi-language content if causing issues
DELETE FROM content_pieces WHERE language != 'en';
DELETE FROM keywords WHERE language != 'en';
```

### Epic 3: Authority Dashboard & Analytics

#### Epic 3 Rollback Overview
**Rollback Complexity:** LOW (Frontend-only changes)  
**Business Impact:** LOW (Dashboard is additional feature)  
**Rollback Time:** 5-10 minutes

#### Epic 3 Rollback Steps

**Phase 1: Frontend Rollback**
```bash
# Deploy previous frontend version
vercel rollback [previous-deployment-id]

# Disable dashboard routes
# Remove analytics API endpoints
```

**Phase 2: Database Cleanup**
```sql
-- Clean up analytics tables if needed
TRUNCATE TABLE dashboard_metrics;
```

## Feature Flag Strategy

### Feature Flag Implementation

```typescript
// Feature flag configuration
interface FeatureFlags {
  SUPABASE_INTEGRATION: boolean;
  MULTI_LANGUAGE_CONTENT: boolean;
  AUTHORITY_DASHBOARD: boolean;
  AI_CITATION_MONITORING: boolean;
  TOURISM_MODULE: boolean;
}

// Environment-based feature flags
const featureFlags: FeatureFlags = {
  SUPABASE_INTEGRATION: process.env.FEATURE_SUPABASE === 'true',
  MULTI_LANGUAGE_CONTENT: process.env.FEATURE_MULTILANG === 'true',
  AUTHORITY_DASHBOARD: process.env.FEATURE_DASHBOARD === 'true',
  AI_CITATION_MONITORING: process.env.FEATURE_MONITORING === 'true',
  TOURISM_MODULE: process.env.FEATURE_TOURISM === 'true',
};
```

### Safe Deployment with Feature Flags

**Phase 1: Deploy with Flags OFF**
```bash
# Deploy new code with all features disabled
FEATURE_SUPABASE=false \
FEATURE_MULTILANG=false \
FEATURE_DASHBOARD=false \
vercel deploy --prod
```

**Phase 2: Gradual Feature Enablement**
```bash
# Enable features one by one after verification
vercel env add FEATURE_SUPABASE true production
vercel env add FEATURE_MULTILANG true production
# Test each feature before enabling next
```

**Phase 3: Emergency Feature Disable**
```bash
# Instantly disable problematic features
vercel env add FEATURE_PROBLEMATIC_FEATURE false production
# No deployment needed - takes effect immediately
```

## n8n Integration Monitoring & Rollback

### n8n Workflow Health Monitoring

```javascript
// n8n workflow health check endpoint
const monitorN8nHealth = async () => {
  const healthChecks = [
    {
      name: 'Workflow Execution',
      endpoint: '/api/n8n/health/workflow',
      timeout: 30000
    },
    {
      name: 'Database Connection', 
      endpoint: '/api/n8n/health/database',
      timeout: 5000
    },
    {
      name: 'Webhook Response',
      endpoint: '/api/n8n/health/webhook',
      timeout: 10000
    }
  ];
  
  // Execute health checks and trigger rollback if failures
};
```

### n8n Rollback Automation

```bash
#!/bin/bash
# n8n-rollback.sh - Automated n8n workflow rollback

# 1. Stop current workflow
curl -X POST "$N8N_URL/api/v1/workflows/$WORKFLOW_ID/deactivate"

# 2. Restore backup workflow
curl -X POST "$N8N_URL/api/v1/workflows/import" \
  -d @n8n-backup-workflow.json

# 3. Verify restoration
curl -X GET "$N8N_URL/api/v1/workflows/$BACKUP_WORKFLOW_ID/activate"

# 4. Test execution
curl -X POST "$N8N_URL/api/v1/workflows/$BACKUP_WORKFLOW_ID/execute"
```

## Data Protection During Rollbacks

### Database Backup Strategy

**Pre-Rollback Data Backup:**
```sql
-- Create backup before any rollback
CREATE TABLE backup_keywords_$(date +%Y%m%d) AS SELECT * FROM keywords;
CREATE TABLE backup_content_$(date +%Y%m%d) AS SELECT * FROM content_pieces;
CREATE TABLE backup_citations_$(date +%Y%m%d) AS SELECT * FROM ai_citations;
```

**Data Recovery Procedures:**
```sql
-- Restore data if rollback caused data loss
INSERT INTO keywords SELECT * FROM backup_keywords_20250113
WHERE NOT EXISTS (SELECT 1 FROM keywords WHERE keywords.id = backup_keywords_20250113.id);
```

### Content Generation Continuity

**Maintain Content Pipeline:**
```bash
# Ensure content generation continues during rollbacks
# Use backup AI endpoints if primary fails
# Queue content for processing during system recovery
```

## Communication Templates

### Internal Team Alert
```
🚨 ROLLBACK IN PROGRESS - DirectDrive Authority Engine

Severity: [P0/P1/P2/P3]
Affected Systems: [List affected components]
Business Impact: [Description of impact]
ETA for Resolution: [Time estimate]
Rollback Lead: [Name]

Current Status: [Brief status update]
Next Update: [Time for next communication]
```

### Business Stakeholder Communication
```
DirectDrive System Update

We're currently addressing a technical issue with our content management enhancement. 

Impact: [Clear business impact description]
Resolution: [What we're doing to fix it]
Timeline: [When normal operations will resume]

Your DirectDrive operations [will continue normally / may experience brief delays].
We'll update you within [timeframe].
```

## Rollback Testing & Validation

### Pre-Deployment Rollback Testing

**Staging Environment Rollback Tests:**
```bash
# Test rollback procedures in staging before production deployment
npm run test:rollback-epic-1
npm run test:rollback-epic-2
npm run test:rollback-features
```

**Rollback Validation Checklist:**
- [ ] All DirectDrive n8n workflows functional
- [ ] Content generation pipeline operational
- [ ] No data loss during rollback
- [ ] AI citation monitoring restored
- [ ] Website publishing functional

### Post-Rollback Verification

**Business Continuity Verification:**
```bash
# Verify DirectDrive operations after rollback
curl -f https://directdrivelogistic.com/api/health
# Test content generation workflow
# Verify AI citation tracking
# Check website publishing pipeline
```

## Rollback Success Metrics

### Technical Success Criteria
- ✅ Rollback completed within SLA timeframes
- ✅ Zero data loss during rollback process
- ✅ All DirectDrive operations restored
- ✅ n8n workflows functioning normally

### Business Success Criteria
- ✅ No interruption to content generation
- ✅ DirectDrive website publishing operational
- ✅ AI citation monitoring data preserved
- ✅ Customer-facing services unaffected

---

**Document Status:** ✅ COMPLETE - Addresses Critical Blocker 2  
**Implementation Ready:** Comprehensive rollback procedures for all epics and stories  
**Risk Mitigation:** Feature flags and monitoring systems for safe brownfield integration