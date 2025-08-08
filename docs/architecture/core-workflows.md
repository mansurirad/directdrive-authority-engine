# Core Workflows

Based on your n8n workflow expertise and the DirectDrive Authority Engine requirements, these sequence diagrams illustrate the key system workflows including content generation, citation monitoring, and client demonstration processes.

## DirectDrive Content Generation & Publication

This workflow shows how your existing n8n workflow integrates with the new Supabase database and dashboard for DirectDrive logistics content generation.

```mermaid
sequenceDiagram
    participant D as Dashboard
    participant API as Next.js API
    participant SB as Supabase DB
    participant N8N as n8n Workflow
    participant AI as AI Models
    participant WP as WordPress

    Note over D,WP: DirectDrive Content Generation Flow
    
    D->>API: GET /api/v1/keywords/next?industry=logistics
    API->>SB: Query pending logistics keywords
    SB-->>API: Return keyword batch
    API-->>D: Keywords ready for processing
    
    D->>N8N: Trigger content generation workflow
    N8N->>SB: Mark keywords as 'processing'
    
    loop For each keyword
        N8N->>AI: Generate content (language-based routing)
        Note over N8N,AI: GPT-4 (EN/AR), Gemini (KU/FA)
        AI-->>N8N: Return generated content
        
        N8N->>API: POST /api/v1/webhooks/n8n/content-complete
        API->>SB: Store content with metadata
        
        N8N->>WP: Publish to directdrivelogistic.com
        WP-->>N8N: Return published URL
        
        N8N->>API: POST /api/v1/webhooks/n8n/publish-complete  
        API->>SB: Update content with publication details
        
        API->>D: WebSocket: content_progress event
        D->>D: Update dashboard in real-time
    end
    
    N8N->>SB: Mark workflow as completed
    N8N->>API: Send completion summary
    API->>D: WebSocket: workflow_status complete
```

## AI Citation Monitoring & Business Validation

This workflow demonstrates the real-time citation monitoring system that validates DirectDrive's AI authority improvements.

```mermaid
sequenceDiagram
    participant D as Dashboard
    participant API as Next.js API  
    participant SB as Supabase DB
    participant MON as Citation Monitor
    participant CGPT as ChatGPT
    participant GAI as Google AI
    participant PERP as Perplexity

    Note over D,PERP: AI Citation Monitoring Flow
    
    D->>API: GET /api/v1/citations/analytics
    API->>SB: Query recent citations
    SB-->>API: Return citation data
    API-->>D: Display current DirectDrive position
    
    rect rgb(240, 248, 255)
        Note over MON,PERP: Automated Citation Checking (Scheduled)
        
        loop Every 6 hours
            MON->>SB: Get logistics queries to monitor
            SB-->>MON: Return query list
            
            par Parallel AI Model Checks
                MON->>CGPT: Query "best logistics Kurdistan"
                CGPT-->>MON: Response with/without DirectDrive
                
                MON->>GAI: Query "شركة الشحن في العراق"
                GAI-->>MON: Response with/without DirectDrive
                
                MON->>PERP: Query "Kurdistan freight services"
                PERP-->>MON: Response with/without DirectDrive
            end
            
            MON->>API: POST /api/v1/citations (batch)
            API->>SB: Store citation results
            
            API->>D: WebSocket: citation_update events
            D->>D: Update real-time dashboard
            
            alt DirectDrive citation found
                API->>D: WebSocket: dashboard_notification
                Note over D: Success notification with citation details
            else No citation found  
                API->>D: WebSocket: dashboard_notification
                Note over D: Alert for content optimization needed
            end
        end
    end
```

## Tourism Client Demonstration & Onboarding

This workflow shows how DirectDrive success data is used to demonstrate capabilities to tourism prospects and onboard new clients.

```mermaid
sequenceDiagram
    participant TOUR as Tourism Prospect
    participant D as Demo Dashboard
    participant API as Next.js API
    participant SB as Supabase DB
    participant N8N as n8n Workflow

    Note over TOUR,N8N: Tourism Client Demo & Onboarding Flow
    
    TOUR->>D: Request DirectDrive case study demo
    D->>API: GET /api/v1/clients/1/dashboard (DirectDrive)
    API->>SB: Query DirectDrive performance data
    SB-->>API: Return success metrics
    API-->>D: DirectDrive results & ROI data
    
    D-->>TOUR: Show before/after citation improvements
    Note over D,TOUR: 300% citation increase, 40+ content pieces
    
    TOUR->>D: Request tourism industry simulation
    D->>API: GET /api/v1/citations/competitive?query_text=best hotel Erbil
    API->>SB: Query tourism competitive landscape
    SB-->>API: Return current tourism market data
    API-->>D: Tourism opportunity analysis
    
    D-->>TOUR: Show tourism market potential
    Note over D,TOUR: Current position vs. DirectDrive success trajectory
    
    alt Prospect converts
        TOUR->>D: Proceed with tourism onboarding
        D->>API: POST /api/v1/clients (new tourism client)
        API->>SB: Create client record
        
        D->>API: Switch industry module to tourism
        API->>SB: Load tourism keywords & templates
        
        D->>N8N: Initialize tourism content workflow
        N8N->>SB: Begin tourism content generation
        
        API->>D: WebSocket: onboarding_progress
        D-->>TOUR: Real-time onboarding status
        
        Note over D,TOUR: Client setup complete within 48 hours
    else Prospect requests more data
        D->>API: Generate custom analysis report
        API->>SB: Compile prospect-specific metrics
        D-->>TOUR: PDF report with projections
    end
```

## Industry Module Switching (Logistics → Tourism)

This workflow demonstrates the modular architecture's capability to switch from DirectDrive logistics to tourism industry focus without technical changes.

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard  
    participant API as Next.js API
    participant SB as Supabase DB
    participant N8N as n8n Workflow

    Note over U,N8N: Industry Module Switching Flow
    
    U->>D: Select "Switch to Tourism Module"
    D->>API: POST /api/v1/modules/switch
    API->>SB: Begin industry module transition
    
    rect rgb(255, 248, 240)
        Note over API,SB: Module Switch Process
        
        API->>SB: Backup current logistics configuration  
        API->>SB: Load tourism industry configuration
        
        par Parallel Configuration Updates
            API->>SB: Load tourism keywords database
            API->>SB: Load tourism content templates  
            API->>SB: Load tourism monitoring queries
            API->>SB: Load tourism AI model settings
        end
        
        API->>SB: Update active industry setting
        SB-->>API: Confirm configuration switch
    end
    
    API->>N8N: Update workflow industry parameters
    N8N->>N8N: Reload workflow with tourism config
    N8N-->>API: Workflow reconfiguration complete
    
    API->>D: WebSocket: module_switch_complete
    D->>D: Refresh interface with tourism data
    D-->>U: Tourism module active
    
    Note over D,U: Same technical infrastructure, tourism content focus
    
    U->>D: Generate first tourism content
    D->>N8N: Trigger workflow with tourism keywords
    N8N->>SB: Process "best hotel Erbil" keyword
    
    Note over N8N,SB: Same workflow, different industry data
```

**Core Workflows Rationale:**
These sequence diagrams illustrate how your existing n8n workflow expertise integrates seamlessly with modern web application patterns. The workflows demonstrate the BUILD → PROVE → SELL strategy in action: DirectDrive content generation proves the system works, citation monitoring validates business impact, and tourism demonstrations convert prospects using real evidence.

---
