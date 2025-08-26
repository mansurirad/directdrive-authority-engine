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

## Story 1.5: Content-Citation-Performance Loop Workflows

### Content Verification & Attribution Tracking

This workflow demonstrates the new multi-factor content verification system and 12-week attribution tracking for measuring content performance correlation.

```mermaid
sequenceDiagram
    participant WP as WordPress Site
    participant CRAWLER as Content Crawler
    participant API as Next.js API
    participant SB as Supabase DB
    participant VERIFY as Verification Engine
    participant ATTRIB as Attribution Tracker
    participant PERF as Performance Dashboard

    Note over WP,PERF: Content-Citation-Performance Loop Flow
    
    rect rgb(240, 255, 240)
        Note over CRAWLER,VERIFY: Daily Content Verification Process
        
        CRAWLER->>WP: Crawl directdrivelogistic.com/blog/
        WP-->>CRAWLER: Return published content list
        
        loop For each detected content
            CRAWLER->>API: POST /api/v1/content/verify
            API->>SB: Query content_pieces for matching
            SB-->>API: Return content metadata
            
            API->>VERIFY: Trigger multi-factor verification
            
            par Multi-Factor Verification
                VERIFY->>VERIFY: URL pattern matching
                VERIFY->>VERIFY: Title + date correlation
                VERIFY->>VERIFY: Keyword fingerprint analysis
                VERIFY->>VERIFY: Content similarity scoring
            end
            
            VERIFY-->>API: Return verification results
            
            alt Confidence > 85%
                API->>SB: Update content_pieces.verified_url
                API->>SB: Create ContentPerformance record
                API->>SB: Create ContentVerification record
                
                API->>ATTRIB: Initialize attribution tracking
                ATTRIB->>SB: Create AttributionTimeline baseline
                
                API->>PERF: WebSocket: content_verification_complete
                PERF->>PERF: Update verification dashboard
                
            else Confidence < 85%
                API->>SB: Log verification failure
                API->>PERF: WebSocket: verification_failed
                Note over PERF: Alert for manual review
            end
        end
    end
```

### 12-Week Attribution Timeline Management

This workflow shows how the attribution tracking system manages the three phases of content performance measurement.

```mermaid
sequenceDiagram
    participant SCHED as Scheduler
    participant ATTRIB as Attribution Tracker
    participant SB as Supabase DB
    participant CITE as Citation Monitor
    participant ROI as ROI Engine
    participant PERF as Performance Dashboard

    Note over SCHED,PERF: 12-Week Attribution Timeline Flow
    
    rect rgb(255, 248, 240)
        Note over SCHED,ROI: Weekly Attribution Phase Management
        
        loop Weekly attribution check
            SCHED->>ATTRIB: Trigger attribution update
            ATTRIB->>SB: Query active attribution timelines
            SB-->>ATTRIB: Return timeline records
            
            loop For each content attribution
                ATTRIB->>SB: Get current attribution phase
                SB-->>ATTRIB: Return phase data
                
                alt Phase: Baseline (0-4 weeks)
                    ATTRIB->>CITE: Get baseline citation count
                    CITE-->>ATTRIB: Return citation metrics
                    ATTRIB->>SB: Update baseline measurements
                    
                    alt Week 4 reached
                        ATTRIB->>SB: Transition to primary phase
                        ATTRIB->>PERF: WebSocket: attribution_phase_transition
                        Note over PERF: Baseline → Primary phase alert
                    end
                    
                else Phase: Primary (4-8 weeks)
                    ATTRIB->>CITE: Get current citation count
                    CITE-->>ATTRIB: Return citation metrics
                    ATTRIB->>ROI: Calculate citation lift
                    ROI-->>ATTRIB: Return lift percentage
                    
                    ATTRIB->>SB: Update performance metrics
                    
                    alt Week 8 reached
                        ATTRIB->>SB: Transition to sustained phase
                        ATTRIB->>PERF: WebSocket: attribution_phase_transition
                        Note over PERF: Primary → Sustained phase alert
                    end
                    
                else Phase: Sustained (8-12 weeks)
                    ATTRIB->>CITE: Get sustained citation count
                    CITE-->>ATTRIB: Return citation metrics
                    ATTRIB->>ROI: Calculate long-term ROI
                    ROI-->>ATTRIB: Return ROI score
                    
                    ATTRIB->>SB: Update final performance metrics
                    
                    alt Week 12 reached
                        ATTRIB->>SB: Mark attribution complete
                        ATTRIB->>ROI: Generate final ROI analysis
                        ROI->>SB: Store content effectiveness score
                        
                        ATTRIB->>PERF: WebSocket: attribution_complete
                        Note over PERF: Final ROI analysis available
                    end
                end
                
                ATTRIB->>SB: Update attribution confidence
                SB-->>ATTRIB: Confirm timeline update
            end
        end
    end
```

### ROI Analysis & Business Impact Correlation

This workflow demonstrates how the system correlates content performance with business impact through automated ROI calculation.

```mermaid
sequenceDiagram
    participant TRIG as ROI Trigger
    participant ROI as ROI Engine
    participant SB as Supabase DB
    participant CITE as Citation Data
    participant COMP as Competitive Analysis
    participant PERF as Performance Dashboard
    participant BIZ as Business Dashboard

    Note over TRIG,BIZ: ROI Analysis & Business Impact Flow
    
    TRIG->>ROI: POST /api/v1/content/roi-analysis/calculate
    ROI->>SB: Query content performance data
    SB-->>ROI: Return attribution timelines
    
    rect rgb(240, 248, 255)
        Note over ROI,COMP: Comprehensive ROI Analysis
        
        ROI->>CITE: Get citation correlation data
        CITE-->>ROI: Return citation-content mapping
        
        ROI->>COMP: Get competitive position changes
        COMP-->>ROI: Return market position data
        
        par ROI Calculation Components
            ROI->>ROI: Calculate citation lift percentage
            Note over ROI: (Current - Baseline) / Baseline * 100
            
            ROI->>ROI: Calculate time to first citation
            Note over ROI: Days from publication to first AI mention
            
            ROI->>ROI: Calculate attribution confidence
            Note over ROI: Correlation strength between content and citations
            
            ROI->>ROI: Calculate content effectiveness score
            Note over ROI: Weighted score: lift (40%) + speed (30%) + confidence (30%)
        end
        
        ROI->>SB: Store calculated ROI metrics
        SB-->>ROI: Confirm ROI data saved
    end
    
    ROI->>PERF: WebSocket: roi_calculation_complete
    PERF->>PERF: Update content performance charts
    
    ROI->>BIZ: WebSocket: business_impact_update
    BIZ->>BIZ: Update business KPI dashboard
    
    alt High-performing content identified
        ROI->>PERF: WebSocket: performance_alert
        Note over PERF: Alert: Content achieving >50% citation lift
        
        ROI->>SB: Generate optimization recommendations
        SB-->>ROI: Store content strategy insights
        
    else Underperforming content identified
        ROI->>PERF: WebSocket: performance_alert
        Note over PERF: Alert: Content requiring optimization
        
        ROI->>COMP: Request competitive analysis
        COMP-->>ROI: Return improvement recommendations
    end
```

### Real-time Performance Correlation Updates

This workflow shows how the system provides real-time correlation between published content and AI citation improvements.

```mermaid
sequenceDiagram
    participant CITE as Citation Monitor
    participant CORR as Correlation Engine
    participant SB as Supabase DB
    participant ATTRIB as Attribution Tracker
    participant PERF as Performance Dashboard
    participant ALERT as Alert System

    Note over CITE,ALERT: Real-time Performance Correlation Flow
    
    rect rgb(255, 240, 240)
        Note over CITE,CORR: Citation Detection & Correlation
        
        CITE->>CITE: Detect new AI citation
        CITE->>CORR: POST citation with content context
        
        CORR->>SB: Query published content database
        SB-->>CORR: Return content pieces with metadata
        
        CORR->>CORR: Analyze citation-content correlation
        Note over CORR: Match query keywords, publication timing, content similarity
        
        alt Strong correlation found (confidence > 85%)
            CORR->>SB: Link citation to content piece
            CORR->>ATTRIB: Update attribution timeline
            ATTRIB->>SB: Increment citation count for current phase
            
            CORR->>PERF: WebSocket: citation_correlation_update
            PERF->>PERF: Update real-time citation tracking
            
            alt First citation for content
                CORR->>SB: Record time to first citation
                CORR->>PERF: WebSocket: first_citation_milestone
                Note over PERF: Celebration: First AI citation achieved!
            end
            
            alt Citation lift threshold reached
                CORR->>ALERT: Trigger performance alert
                ALERT->>PERF: WebSocket: performance_threshold_reached
                Note over PERF: Alert: 50% citation lift achieved
            end
            
        else Weak correlation (confidence < 85%)
            CORR->>SB: Log correlation attempt
            Note over SB: Maintain correlation history for analysis
        end
    end
    
    CORR->>SB: Update overall performance metrics
    SB-->>CORR: Confirm metrics updated
    
    CORR->>PERF: WebSocket: dashboard_refresh
    PERF->>PERF: Refresh performance visualizations
```

**Story 1.5 Workflows Rationale:**
These enhanced sequence diagrams demonstrate the new Content-Citation-Performance Loop monitoring capabilities that transform DirectDrive's content strategy from manual tracking to automated correlation analysis. The workflows provide real-time verification of published content, systematic attribution tracking through 12-week phases, and quantifiable ROI measurement that directly supports business decision-making. The integration maintains compatibility with existing Stories 1.1-1.4 infrastructure while adding sophisticated performance monitoring that enables data-driven content optimization.

**Core Workflows Rationale:**
These sequence diagrams illustrate how your existing n8n workflow expertise integrates seamlessly with modern web application patterns. The workflows demonstrate the BUILD → PROVE → SELL strategy in action: DirectDrive content generation proves the system works, citation monitoring validates business impact, and tourism demonstrations convert prospects using real evidence. The new Story 1.5 workflows extend this foundation with automated performance correlation, providing the quantifiable metrics needed for strategic content optimization and business growth validation.

---
