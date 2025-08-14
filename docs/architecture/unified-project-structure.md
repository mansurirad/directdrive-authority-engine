# Unified Project Structure

This monorepo structure accommodates both frontend dashboard and n8n workflow management, using npm workspaces for dependency management and shared TypeScript interfaces.

```plaintext
directdrive-authority-engine/
├── .github/                           # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                    # Test and build pipeline
│       └── deploy.yaml                # Vercel deployment
├── apps/                              # Application packages
│   ├── dashboard/                     # Next.js frontend application
│   │   ├── src/
│   │   │   ├── components/            # UI components
│   │   │   │   ├── ui/                # shadcn/ui base components
│   │   │   │   ├── dashboard/         # Dashboard-specific components
│   │   │   │   ├── charts/            # Citation analytics charts
│   │   │   │   └── forms/             # Keyword and content forms
│   │   │   ├── pages/                 # Next.js pages/routes
│   │   │   │   ├── api/               # API routes
│   │   │   │   ├── dashboard/         # Dashboard pages
│   │   │   │   └── auth/              # Authentication pages
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   │   ├── useRealtime.ts     # Supabase real-time hooks
│   │   │   │   ├── useCitations.ts    # Citation monitoring hooks
│   │   │   │   └── useContent.ts      # Content management hooks
│   │   │   ├── services/              # API client services
│   │   │   │   ├── api.ts             # Base API client
│   │   │   │   ├── supabase.ts        # Supabase client
│   │   │   │   └── websocket.ts       # WebSocket client
│   │   │   ├── stores/                # State management (Zustand)
│   │   │   │   ├── auth.ts            # Authentication state
│   │   │   │   ├── dashboard.ts       # Dashboard data state
│   │   │   │   └── realtime.ts        # Real-time updates state
│   │   │   ├── styles/                # Global styles/themes
│   │   │   │   ├── globals.css        # Global CSS
│   │   │   │   └── components.css     # Component styles
│   │   │   └── utils/                 # Frontend utilities
│   │   │       ├── format.ts          # Data formatting
│   │   │       ├── validation.ts      # Form validation
│   │   │       └── constants.ts       # App constants
│   │   ├── public/                    # Static assets
│   │   ├── tests/                     # Frontend tests
│   │   │   ├── components/            # Component tests
│   │   │   ├── pages/                 # Page tests
│   │   │   └── utils/                 # Utility tests
│   │   ├── next.config.js             # Next.js configuration
│   │   ├── tailwind.config.js         # Tailwind CSS config
│   │   └── package.json
│   └── n8n-workflows/                 # n8n workflow definitions
│       ├── workflows/                 # Exported n8n workflows
│       │   ├── content-generation.json      # Main content workflow
│       │   ├── citation-monitoring.json     # Citation tracking workflow
│       │   └── publication-workflow.json    # WordPress publishing
│       ├── credentials/               # n8n credential templates
│       │   ├── supabase-credentials.json
│       │   ├── openai-credentials.json
│       │   └── wordpress-credentials.json
│       ├── scripts/                   # Workflow management scripts
│       │   ├── export-workflows.js    # Export from n8n
│       │   ├── import-workflows.js    # Import to n8n
│       │   └── validate-workflows.js  # Workflow validation
│       ├── docs/                      # Workflow documentation
│       │   ├── content-generation.md  # Content workflow guide
│       │   ├── citation-monitoring.md # Citation workflow guide
│       │   └── setup.md               # n8n setup instructions
│       └── package.json
├── packages/                          # Shared packages
│   ├── shared/                        # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/                 # TypeScript interfaces
│   │   │   │   ├── keyword.ts         # Keyword interface
│   │   │   │   ├── content.ts         # ContentPiece interface
│   │   │   │   ├── citation.ts        # AICitation interface
│   │   │   │   ├── client.ts          # Client interface
│   │   │   │   └── index.ts           # Type exports
│   │   │   ├── constants/             # Shared constants
│   │   │   │   ├── languages.ts       # Language configurations
│   │   │   │   ├── industries.ts      # Industry definitions
│   │   │   │   └── ai-models.ts       # AI model configurations
│   │   │   ├── utils/                 # Shared utilities
│   │   │   │   ├── validation.ts      # Data validation
│   │   │   │   ├── formatting.ts      # Data formatting
│   │   │   │   └── api-helpers.ts     # API utility functions
│   │   │   └── schemas/               # Validation schemas
│   │   │       ├── keyword.schema.ts  # Keyword validation
│   │   │       ├── content.schema.ts  # Content validation
│   │   │       └── api.schema.ts      # API validation schemas
│   │   └── package.json
│   ├── database/                      # Database utilities
│   │   ├── src/
│   │   │   ├── client.ts              # Supabase client setup
│   │   │   ├── migrations/            # Database migrations
│   │   │   ├── queries/               # Common database queries
│   │   │   │   ├── keywords.ts        # Keyword queries
│   │   │   │   ├── content.ts         # Content queries
│   │   │   │   └── citations.ts       # Citation queries
│   │   │   └── types.ts               # Database-specific types
│   │   └── package.json
│   └── ai-clients/                    # AI model integrations
│       ├── src/
│       │   ├── openai/                # OpenAI integration
│       │   │   ├── client.ts          # OpenAI client
│       │   │   ├── prompts.ts         # Prompt templates
│       │   │   └── utils.ts           # OpenAI utilities
│       │   ├── google/                # Google AI integration
│       │   │   ├── client.ts          # Google AI client
│       │   │   ├── prompts.ts         # Google-specific prompts
│       │   │   └── utils.ts           # Google AI utilities
│       │   ├── monitoring/            # Citation monitoring
│       │   │   ├── chatgpt.ts         # ChatGPT monitoring
│       │   │   ├── google-ai.ts       # Google AI monitoring
│       │   │   └── perplexity.ts      # Perplexity monitoring
│       │   └── index.ts               # AI client exports
│       └── package.json
├── infrastructure/                    # IaC definitions (optional)
│   └── vercel/                        # Vercel configuration
│       ├── vercel.json                # Project configuration
│       └── env/                       # Environment configurations
├── scripts/                           # Build/deploy scripts
│   ├── build.js                       # Build all packages
│   ├── dev.js                         # Development server
│   ├── test.js                        # Run all tests
│   └── deploy.js                      # Deployment script
├── docs/                              # Documentation
│   ├── prd-directdrive-authority-engine.md
│   ├── architecture.md                # This document
│   ├── api-reference.md               # API documentation
│   ├── deployment-strategy.md         # Comprehensive deployment procedures
│   ├── rollback-procedures.md         # Emergency rollback procedures
│   ├── feature-flags-strategy.md      # Feature flag implementation
│   ├── monitoring-enhancement-plan.md # Monitoring and alerting strategy
│   └── setup/                         # Setup guides
│       ├── development.md             # Local development setup
│       ├── deployment.md              # Deployment guide
│       └── n8n-integration.md         # n8n integration guide
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── package.json                       # Root package.json (workspace config)
├── tsconfig.json                      # Root TypeScript configuration
├── vitest.config.js                   # Vitest configuration
└── README.md                          # Project documentation
```

**Project Structure Rationale:**
This monorepo structure supports your existing n8n workflow expertise while adding modern web application development patterns. The shared packages ensure type safety between dashboard and n8n integrations, while the apps separation allows independent deployment of dashboard and workflow management.

---
