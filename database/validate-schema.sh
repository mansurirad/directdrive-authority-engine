#!/bin/bash

# DirectDrive Authority Engine - Database Schema Validation
# Validates database schema and test data integrity

set -e

echo "🗄️ Validating DirectDrive Database Schema"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Database connection parameters
DB_HOST="db.lrwdoihyhnybwwntmmrs.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
export PGPASSWORD="CK7aE@s@U*B7Zyn"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql not found. Installing PostgreSQL client...${NC}"
    
    # Try to install psql (this might need sudo permissions)
    if command -v apt-get &> /dev/null; then
        echo "Attempting to install postgresql-client..."
        apt-get update && apt-get install -y postgresql-client 2>/dev/null || {
            echo -e "${YELLOW}⚠️ Could not install psql. Skipping database validation.${NC}"
            exit 0
        }
    else
        echo -e "${YELLOW}⚠️ psql not available and cannot install. Skipping database validation.${NC}"
        exit 0
    fi
fi

# Function to run SQL query and check result
run_sql_check() {
    local description="$1"
    local sql_query="$2"
    local expected_result="$3"
    
    echo -n "Checking $description... "
    
    result=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "$sql_query" 2>/dev/null | tr -d '[:space:]') || {
        echo -e "${RED}❌ FAILED (connection error)${NC}"
        return 1
    }
    
    if [[ "$result" == "$expected_result" ]]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (expected: $expected_result, got: $result)${NC}"
        return 1
    fi
}

# Function to check table exists
check_table_exists() {
    local table_name="$1"
    run_sql_check "table '$table_name' exists" \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table_name';" \
        "1"
}

# Function to check column exists
check_column_exists() {
    local table_name="$1"
    local column_name="$2"
    run_sql_check "column '$table_name.$column_name' exists" \
        "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '$table_name' AND column_name = '$column_name';" \
        "1"
}

# Test database connection
echo "Testing database connection..."
if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Check required tables exist
echo -e "\n📋 Checking required tables..."
check_table_exists "keywords"
check_table_exists "content_pieces"
check_table_exists "ai_citations"
check_table_exists "clients"
check_table_exists "performance_metrics"

# Check ai_citations table schema (updated schema)
echo -e "\n🔍 Validating ai_citations table schema..."
check_column_exists "ai_citations" "id"
check_column_exists "ai_citations" "content_id"
check_column_exists "ai_citations" "ai_model"
check_column_exists "ai_citations" "query_text"
check_column_exists "ai_citations" "cited"
check_column_exists "ai_citations" "citation_context"
check_column_exists "ai_citations" "position"
check_column_exists "ai_citations" "monitored_at"

# Check keywords table schema
echo -e "\n📝 Validating keywords table schema..."
check_column_exists "keywords" "keyword_id"
check_column_exists "keywords" "industry_category"
check_column_exists "keywords" "language"
check_column_exists "keywords" "keyword_text"
check_column_exists "keywords" "processing_status"

# Check content_pieces table schema
echo -e "\n📄 Validating content_pieces table schema..."
check_column_exists "content_pieces" "content_piece_id"
check_column_exists "content_pieces" "keyword_id"
check_column_exists "content_pieces" "title"
check_column_exists "content_pieces" "content_body"
check_column_exists "content_pieces" "ai_model_used"

# Check foreign key relationships
echo -e "\n🔗 Validating foreign key relationships..."
run_sql_check "ai_citations -> content_pieces foreign key" \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'ai_citations' AND constraint_type = 'FOREIGN KEY';" \
    "1"

run_sql_check "content_pieces -> keywords foreign key" \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'content_pieces' AND constraint_type = 'FOREIGN KEY';" \
    "1"

# Check indexes exist
echo -e "\n📇 Validating database indexes..."
run_sql_check "ai_citations indexes" \
    "SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'ai_citations';" \
    "4"

run_sql_check "keywords indexes" \
    "SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'keywords';" \
    "2"

# Check RLS is enabled
echo -e "\n🔒 Validating Row Level Security..."
run_sql_check "RLS enabled on ai_citations" \
    "SELECT COUNT(*) FROM pg_tables WHERE tablename = 'ai_citations' AND rowsecurity = true;" \
    "1"

run_sql_check "RLS enabled on keywords" \
    "SELECT COUNT(*) FROM pg_tables WHERE tablename = 'keywords' AND rowsecurity = true;" \
    "1"

# Check sample data exists
echo -e "\n📊 Validating sample data..."
run_sql_check "keywords contain DirectDrive logistics data" \
    "SELECT COUNT(*) FROM keywords WHERE industry_category = 'logistics';" \
    "15"

run_sql_check "DirectDrive client exists" \
    "SELECT COUNT(*) FROM clients WHERE business_name = 'DirectDrive Logistics';" \
    "1"

# Validate data constraints
echo -e "\n🎯 Validating data constraints..."
run_sql_check "ai_model constraint in ai_citations" \
    "SELECT COUNT(*) FROM ai_citations WHERE ai_model NOT IN ('chatgpt', 'google-ai', 'perplexity');" \
    "0"

run_sql_check "position constraint in ai_citations" \
    "SELECT COUNT(*) FROM ai_citations WHERE position IS NOT NULL AND (position < 1 OR position > 10);" \
    "0"

# Test query performance
echo -e "\n⚡ Testing query performance..."
start_time=$(date +%s%N)
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM ai_citations WHERE cited = true;" &>/dev/null
end_time=$(date +%s%N)
query_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

if [ $query_time -lt 2000 ]; then
    echo -e "${GREEN}✅ Query performance acceptable (${query_time}ms)${NC}"
else
    echo -e "${YELLOW}⚠️ Query performance slow (${query_time}ms)${NC}"
fi

echo -e "\n${GREEN}🎉 Database schema validation completed!${NC}"