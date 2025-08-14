#!/bin/bash

# DirectDrive Authority Engine - Test Runner
# Comprehensive testing script for all components

set -e

echo "🚀 DirectDrive Authority Engine - Running Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $2 FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to run tests with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    echo -e "\n${BLUE}Running $test_name...${NC}"
    
    if [ -n "$test_dir" ]; then
        cd "$test_dir"
    fi
    
    if eval "$test_command"; then
        print_status 0 "$test_name"
    else
        print_status 1 "$test_name"
    fi
    
    if [ -n "$test_dir" ]; then
        cd - > /dev/null
    fi
}

# 1. Shared Package Tests
echo -e "\n${YELLOW}📦 Testing Shared Package${NC}"
run_test "Shared Package Unit Tests" "npm test" "./packages/shared"

# 2. AI Clients Tests  
echo -e "\n${YELLOW}🤖 Testing AI Clients Package${NC}"
run_test "AI Clients Unit Tests" "npm test" "./packages/ai-clients"

# 3. API Endpoints Tests
echo -e "\n${YELLOW}🔌 Testing API Endpoints${NC}"
run_test "Citation API Tests" "npm test tests/api/citations.test.ts" "./apps/dashboard"

# 4. Dashboard Components Tests
echo -e "\n${YELLOW}📊 Testing Dashboard Components${NC}"
run_test "Dashboard Components Tests" "npm test tests/components/dashboard.test.tsx" "./apps/dashboard"

# 5. Integration Tests
echo -e "\n${YELLOW}🔗 Running Integration Tests${NC}"
run_test "Citation Flow Integration Tests" "npm test tests/integration/citation-flow.test.ts" "./apps/dashboard"

# 6. n8n Workflow Validation
echo -e "\n${YELLOW}⚙️ Validating n8n Workflows${NC}"
run_test "n8n Workflow Validation" "node scripts/validate-workflows.js" "./apps/n8n-workflows"

# 7. Database Schema Validation
echo -e "\n${YELLOW}🗄️ Validating Database Schema${NC}"
run_test "Database Schema Validation" "./validate-schema.sh" "./database"

# 8. TypeScript Compilation
echo -e "\n${YELLOW}📝 TypeScript Compilation Check${NC}"
run_test "TypeScript Compilation" "npx tsc --noEmit" "./apps/dashboard"
run_test "Shared Package TypeScript" "npx tsc --noEmit" "./packages/shared"
run_test "AI Clients TypeScript" "npx tsc --noEmit" "./packages/ai-clients"

# 9. Linting
echo -e "\n${YELLOW}🔍 Code Quality Checks${NC}"
run_test "ESLint Check" "npm run lint" "./apps/dashboard"

# 10. Security Checks
echo -e "\n${YELLOW}🔒 Security Audit${NC}"
run_test "NPM Security Audit" "npm audit --audit-level=moderate" "."

# 11. Performance Tests (if any)
echo -e "\n${YELLOW}⚡ Performance Tests${NC}"
run_test "API Performance Tests" "npm test tests/performance/*.test.ts" "./apps/dashboard" || true

# 12. E2E Tests (if Playwright is available)
echo -e "\n${YELLOW}🎭 End-to-End Tests${NC}"
if command -v playwright &> /dev/null; then
    run_test "Playwright E2E Tests" "npx playwright test" "./apps/dashboard"
else
    echo -e "${YELLOW}⚠️ Playwright not found, skipping E2E tests${NC}"
fi

# Final Report
echo -e "\n${BLUE}=================================================="
echo -e "📋 TEST SUMMARY"
echo -e "==================================================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! DirectDrive Authority Engine is ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}💥 $FAILED_TESTS test(s) failed. Please fix the issues before deployment.${NC}"
    exit 1
fi