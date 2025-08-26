# Claude Code Configuration & Credentials
*Last Updated: August 19, 2025*

## 🔐 Saved Credentials & APIs

All credentials are saved in `.env.local` and will **NEVER** need to be asked for again.

### ✅ Working Services & APIs

#### Supabase Database
- **URL**: `https://lrwdoihyhnybwwntmmrs.supabase.co`
- **Status**: ✅ Connected and Working
- **Database**: PostgreSQL with `ai_citations` table
- **Password**: `CK7aE@s@U*B7Zyn`

#### n8n Cloud Automation
- **URL**: `https://raddirectdrive.app.n8n.cloud`  
- **API Endpoint**: `https://raddirectdrive.app.n8n.cloud/api/v1`
- **Status**: ✅ Connected and Working
- **Key Workflow**: SEO Content Generator English VERSION 03 (`VVAuXhF9yGXIGqjy`) - **ACTIVE**

#### MCP Servers
- **supabase**: ✅ Connected
- **context7**: ✅ Connected  
- **playwright**: ✅ Connected
- **n8n-workflow-builder**: ✅ Connected

## 🚀 Quick Start Commands

### Load All Environment Variables
```bash
source ./load-env.sh
```

### Test Database Connection
```bash
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM ai_citations;"
```

### Test n8n API
```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/workflows"
```

## 📋 n8n Workflows Summary

### SEO Content Generator English VERSION 03 
- **ID**: `VVAuXhF9yGXIGqjy`
- **Status**: ✅ ACTIVE
- **Schedule**: Sundays & Wednesdays at 8 AM
- **Purpose**: Automated SEO blog post generation pipeline
- **Features**: Research → Planning → Writing → Publishing

### Other Workflows
1. **GetFile** (`0qoUZMSKIBZquJgL`) - File processing via Telegram
2. **Final Accountant assistant** (`15pvqCxCsdRMVKoJ`) - Persian financial transaction assistant  
3. **GetImage copy** (`1g9f1lKoKJs2nDRS`) - Image processing and OCR
4. **CheckSaveData** (`1grFn6E9qzGPCCpX`) - Data validation workflow

## 🔧 Project Structure

```
/home/mojtaba/LLMBoost2/
├── .env.local          # 🔐 Main credentials file (ALL APIs saved here)
├── .env.n8n           # n8n specific config
├── load-env.sh        # Environment loader script
├── CLAUDE.md          # This file - credential reference
└── apps/dashboard/    # DirectDrive Authority Engine Dashboard
```

## 💡 Important Notes

- **All API keys and credentials are permanently saved** - no need to ask user again
- **MCP servers are configured and working** - can be used directly
- **n8n API is working** - can list workflows, execute, etc.
- **Supabase database is accessible** - can query and update ai_citations table

### 🔧 n8n API Helper Script

For reliable n8n API access without MCP issues, use the helper script:

```bash
# List all workflows
/home/mojtaba/LLMBoost2/scripts/n8n-api.sh list_workflows

# Get specific workflow
/home/mojtaba/LLMBoost2/scripts/n8n-api.sh get_workflow VVAuXhF9yGXIGqjy

# Execute workflow
/home/mojtaba/LLMBoost2/scripts/n8n-api.sh execute_workflow VVAuXhF9yGXIGqjy

# Activate/Deactivate workflow
/home/mojtaba/LLMBoost2/scripts/n8n-api.sh activate_workflow VVAuXhF9yGXIGqjy
/home/mojtaba/LLMBoost2/scripts/n8n-api.sh deactivate_workflow VVAuXhF9yGXIGqjy
```

**Why this script works:** 
- Automatically loads environment variables from `load-env.sh`
- Uses correct `X-N8N-API-KEY` header format
- Properly handles n8n Cloud API endpoints
- Bypasses MCP authentication issues

## 🎯 Next Actions Available

With all credentials saved, you can now:
- ✅ Execute n8n workflows
- ✅ Query Supabase database  
- ✅ Use all MCP servers
- ✅ Access browser automation via Playwright
- ✅ Search documentation via Context7