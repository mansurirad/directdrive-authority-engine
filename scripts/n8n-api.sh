#!/bin/bash

# n8n API Helper Script
# This script ensures environment variables are properly loaded for n8n API calls

# Load environment variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
source "$PROJECT_ROOT/load-env.sh" > /dev/null 2>&1

# Function to make n8n API calls
n8n_api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -z "$N8N_BASE_URL" ] || [ -z "$N8N_API_KEY" ]; then
        echo "Error: N8N_BASE_URL or N8N_API_KEY not set"
        return 1
    fi
    
    local url="${N8N_BASE_URL}${endpoint}"
    
    if [ "$method" = "GET" ]; then
        curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$url"
    elif [ "$method" = "POST" ]; then
        curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" -d "$data" "$url"
    elif [ "$method" = "PUT" ]; then
        curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" -d "$data" "$url"
    elif [ "$method" = "DELETE" ]; then
        curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$url"
    fi
}

# Execute the requested action
case "$1" in
    "list_workflows")
        n8n_api_call "GET" "/workflows"
        ;;
    "get_workflow")
        if [ -z "$2" ]; then
            echo "Error: Workflow ID required"
            exit 1
        fi
        n8n_api_call "GET" "/workflows/$2"
        ;;
    "activate_workflow")
        if [ -z "$2" ]; then
            echo "Error: Workflow ID required"
            exit 1
        fi
        n8n_api_call "POST" "/workflows/$2/activate"
        ;;
    "deactivate_workflow")
        if [ -z "$2" ]; then
            echo "Error: Workflow ID required"
            exit 1
        fi
        n8n_api_call "POST" "/workflows/$2/deactivate"
        ;;
    "execute_workflow")
        if [ -z "$2" ]; then
            echo "Error: Workflow ID required"
            exit 1
        fi
        n8n_api_call "POST" "/workflows/$2/execute"
        ;;
    "seo_generator")
        # Convenience function for SEO Content Generator English VERSION 03
        SEO_WORKFLOW_ID="VVAuXhF9yGXIGqjy"
        case "$2" in
            "status"|"get")
                n8n_api_call "GET" "/workflows/$SEO_WORKFLOW_ID"
                ;;
            "activate")
                n8n_api_call "POST" "/workflows/$SEO_WORKFLOW_ID/activate"
                ;;
            "deactivate")
                n8n_api_call "POST" "/workflows/$SEO_WORKFLOW_ID/deactivate"
                ;;
            "execute")
                n8n_api_call "POST" "/workflows/$SEO_WORKFLOW_ID/execute"
                ;;
            *)
                echo "SEO Generator Commands:"
                echo "  $0 seo_generator status     - Get workflow details"
                echo "  $0 seo_generator activate   - Activate workflow"
                echo "  $0 seo_generator deactivate - Deactivate workflow"
                echo "  $0 seo_generator execute    - Execute workflow"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Usage: $0 {list_workflows|get_workflow|activate_workflow|deactivate_workflow|execute_workflow|seo_generator} [workflow_id|command]"
        echo ""
        echo "SEO Generator shortcuts:"
        echo "  $0 seo_generator status     - Get SEO workflow details"
        echo "  $0 seo_generator activate   - Activate SEO workflow"
        echo "  $0 seo_generator execute    - Execute SEO workflow"
        exit 1
        ;;
esac