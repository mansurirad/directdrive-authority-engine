-- Story 1.5: Content-Citation-Performance Loop Migration ROLLBACK
-- DirectDrive Authority Engine Database Rollback
-- Date: 2025-08-15
-- Purpose: Safely rollback Story 1.5 database changes if needed

-- =============================================
-- ROLLBACK SCRIPT: Story 1.5 Implementation
-- =============================================

-- WARNING: This script will remove all Story 1.5 enhancements
-- Backup your data before running this rollback!

-- Begin transaction for atomic rollback
BEGIN;

-- =============================================
-- 1. BACKUP DATA (Optional - uncomment if needed)
-- =============================================

-- Uncomment the following section to backup Story 1.5 data before rollback
/*
CREATE TABLE IF NOT EXISTS content_performance_backup AS 
SELECT * FROM content_performance;

CREATE TABLE IF NOT EXISTS content_verification_backup AS 
SELECT * FROM content_verification;

CREATE TABLE IF NOT EXISTS attribution_timeline_backup AS 
SELECT * FROM attribution_timeline;

-- Backup enhanced ai_citations data
CREATE TABLE IF NOT EXISTS ai_citations_story_1_5_backup AS 
SELECT id, correlation_confidence, attribution_phase, correlation_metadata 
FROM ai_citations 
WHERE correlation_confidence IS NOT NULL 
   OR attribution_phase IS NOT NULL 
   OR correlation_metadata IS NOT NULL;

-- Backup enhanced content_pieces data
CREATE TABLE IF NOT EXISTS content_pieces_story_1_5_backup AS 
SELECT content_piece_id, verified_url, verification_status, verification_confidence, tracking_enabled, performance_score 
FROM content_pieces 
WHERE verified_url IS NOT NULL 
   OR verification_status IS NOT NULL 
   OR verification_confidence IS NOT NULL
   OR tracking_enabled IS NOT NULL
   OR performance_score IS NOT NULL;
*/

-- =============================================
-- 2. DROP TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS update_content_performance_updated_at ON content_performance;
DROP TRIGGER IF EXISTS update_attribution_timeline_updated_at ON attribution_timeline;

-- =============================================
-- 3. DROP RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Allow service role full access content_performance" ON content_performance;
DROP POLICY IF EXISTS "Allow service role full access content_verification" ON content_verification;
DROP POLICY IF EXISTS "Allow service role full access attribution_timeline" ON attribution_timeline;

-- =============================================
-- 4. DROP STORY 1.5 TABLES
-- =============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS attribution_timeline CASCADE;
DROP TABLE IF EXISTS content_verification CASCADE;
DROP TABLE IF EXISTS content_performance CASCADE;

-- =============================================
-- 5. REMOVE ENHANCED COLUMNS FROM EXISTING TABLES
-- =============================================

-- Remove Story 1.5 columns from content_pieces table
ALTER TABLE content_pieces 
DROP COLUMN IF EXISTS verified_url,
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS verification_confidence,
DROP COLUMN IF EXISTS tracking_enabled,
DROP COLUMN IF EXISTS performance_score;

-- Remove Story 1.5 columns from ai_citations table
ALTER TABLE ai_citations 
DROP COLUMN IF EXISTS correlation_confidence,
DROP COLUMN IF EXISTS attribution_phase,
DROP COLUMN IF EXISTS correlation_metadata;

-- =============================================
-- 6. DROP INDEXES CREATED FOR STORY 1.5
-- =============================================

-- Drop content_pieces indexes
DROP INDEX IF EXISTS idx_content_pieces_verification_status;
DROP INDEX IF EXISTS idx_content_pieces_tracking_enabled;

-- Drop ai_citations indexes
DROP INDEX IF EXISTS idx_ai_citations_correlation_confidence;
DROP INDEX IF EXISTS idx_ai_citations_attribution_phase;
DROP INDEX IF EXISTS idx_ai_citations_correlation_metadata_gin;

-- =============================================
-- 7. CLEAN UP FUNCTIONS (if no longer needed)
-- =============================================

-- Note: Keeping update_updated_at_column() function as it might be used elsewhere
-- Uncomment the following line only if you're sure no other tables use this function
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- =============================================
-- 8. VALIDATION
-- =============================================

-- Validate rollback success
DO $$
DECLARE
    content_performance_exists BOOLEAN := FALSE;
    content_verification_exists BOOLEAN := FALSE;
    attribution_timeline_exists BOOLEAN := FALSE;
    enhanced_columns_exist BOOLEAN := FALSE;
BEGIN
    -- Check if Story 1.5 tables still exist
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'content_performance'
    ) INTO content_performance_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'content_verification'
    ) INTO content_verification_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'attribution_timeline'
    ) INTO attribution_timeline_exists;
    
    -- Check if enhanced columns still exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'content_pieces' 
        AND column_name IN ('verified_url', 'verification_status', 'verification_confidence', 'tracking_enabled', 'performance_score')
    ) INTO enhanced_columns_exist;
    
    -- Log validation results
    RAISE NOTICE 'Rollback Validation Results:';
    RAISE NOTICE 'content_performance table exists: %', content_performance_exists;
    RAISE NOTICE 'content_verification table exists: %', content_verification_exists;
    RAISE NOTICE 'attribution_timeline table exists: %', attribution_timeline_exists;
    RAISE NOTICE 'Enhanced columns exist: %', enhanced_columns_exist;
    
    -- Validation checks
    IF NOT content_performance_exists AND NOT content_verification_exists AND NOT attribution_timeline_exists AND NOT enhanced_columns_exist THEN
        RAISE NOTICE 'SUCCESS: Story 1.5 rollback completed successfully!';
        RAISE NOTICE 'Database has been restored to pre-Story 1.5 state.';
    ELSE
        RAISE EXCEPTION 'FAILURE: Story 1.5 rollback validation failed! Some components may still exist.';
    END IF;
END $$;

-- =============================================
-- COMMIT ROLLBACK TRANSACTION
-- =============================================

-- Commit all rollback changes
COMMIT;

-- =============================================
-- POST-ROLLBACK NOTES
-- =============================================

/*
ROLLBACK SUMMARY:
- Removed all Story 1.5 tables: content_performance, content_verification, attribution_timeline
- Removed enhanced columns from content_pieces and ai_citations tables
- Dropped all Story 1.5 specific indexes, triggers, and RLS policies
- Validated complete removal of Story 1.5 components

DATA BACKUP:
If you uncommented the backup section at the beginning of this script,
your Story 1.5 data has been preserved in these tables:
- content_performance_backup
- content_verification_backup
- attribution_timeline_backup
- ai_citations_story_1_5_backup
- content_pieces_story_1_5_backup

RESTORATION AFTER ROLLBACK:
To restore Story 1.5 functionality after this rollback:
1. Re-run the original migration script: story_1_5_content_performance_migration.sql
2. If you created backups, you can restore data from the backup tables
3. Ensure all API endpoints and services are updated to match the restored schema

IMPORTANT NOTES:
- This rollback removes ALL Story 1.5 performance monitoring capabilities
- Any applications using Story 1.5 features will need to be updated
- Consider the impact on any ongoing content performance tracking
- Backup tables (if created) can be dropped after confirming rollback success

TESTING AFTER ROLLBACK:
1. Verify existing Stories 1.1-1.4 functionality still works
2. Ensure dashboard loads without Story 1.5 performance components
3. Confirm n8n workflows continue to function
4. Test content generation and citation monitoring workflows
*/