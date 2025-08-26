# DirectDrive Authority Engine

> **AI-Powered Citation Monitoring & Content Authority System for DirectDrive Logistics**

A comprehensive system that monitors AI model citations, tracks competitive positioning, and automates content creation to establish DirectDrive Logistics as the leading authority in Kurdistan's logistics sector.

## 🚀 Live Demo

- **Dashboard**: [https://directdrive-authority-engine-dashbo-flax.vercel.app/dashboard](https://directdrive-authority-engine-dashbo-flax.vercel.app/dashboard) ✅ **LIVE**
- **API Documentation**: [View API Docs](./docs/api/)
- **n8n Workflows**: [View Workflows](./apps/n8n-workflows/)

## 📋 Project Status

### ✅ Epic 1: DirectDrive Authority Foundation (COMPLETED)
- **Story 1.1**: Database Infrastructure ✅
- **Story 1.2**: n8n Workflow Enhancement ✅  
- **Story 1.3**: Content Specialization ✅
- **Story 1.4**: AI Citation Monitoring System ✅ **(Latest Complete)**

### 🔄 Next: Epic 2: Content Publishing Automation
- **Story 1.5**: DirectDrive Content Publishing Automation (Ready)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **AI Integration**: OpenAI GPT-4, Google AI, Perplexity API
- **Workflow Automation**: n8n Cloud (14-node production workflow)
- **Real-time**: Supabase Realtime, WebSockets
- **Testing**: Vitest, Testing Library, Playwright
- **Deployment**: Vercel, GitHub Actions

## 🏗️ Architecture

```
DirectDrive Authority Engine/
├── apps/
│   ├── dashboard/           # Next.js dashboard app
│   └── n8n-workflows/      # Automation workflows
├── packages/
│   ├── shared/              # Shared utilities & types
│   └── ai-clients/          # AI model integrations
├── database/                # Schema & migrations
├── docs/                    # Documentation
└── scripts/                 # Build & deployment scripts
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn
- Supabase account
- n8n Cloud account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/[username]/directdrive-authority-engine.git
cd directdrive-authority-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Set up database**
```bash
# Apply database schema
PGPASSWORD="CK7aE@s@U*B7Zyn" psql -h db.lrwdoihyhnybwwntmmrs.supabase.co -U postgres -d postgres -f ./database/ai_citations_schema_update.sql
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the dashboard**
```
http://localhost:3000/dashboard
```

## 🔧 Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://lrwdoihyhnybwwntmmrs.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
PERPLEXITY_API_KEY=your_perplexity_key

# n8n Configuration
N8N_WEBHOOK_URL=your_n8n_webhook
N8N_API_KEY=your_n8n_api_key
```

## 📊 Features

### 🔍 AI Citation Monitoring
- **Multi-AI Tracking**: Monitors DirectDrive mentions across ChatGPT, Google AI, and Perplexity
- **Competitive Analysis**: Tracks positioning against Kurdistan logistics competitors
- **Real-time Alerts**: Instant notifications for new citations
- **Performance Metrics**: Citation trends, positioning improvements, market share

### 🤖 Automated Workflows
- **Daily Monitoring**: 14-node n8n workflow for systematic AI model querying
- **Content Creation**: Automated content generation based on market gaps
- **Performance Tracking**: Execution monitoring with retry logic
- **Error Handling**: Comprehensive failure recovery and notification

### 📱 Analytics Dashboard ✅ **FULLY FUNCTIONAL**
- **Citation Trends**: Interactive Chart.js visualizations with Line, Bar, Doughnut, and Radar charts
- **Competitive Landscape**: Position rankings with color-coded performance indicators
- **Professional UI**: Modern responsive design with Tailwind CSS, rounded cards, hover effects
- **Real-time Updates**: Live dashboard with client-side timestamp updates
- **Export Capabilities**: Data export for reporting and analysis
- **Multi-tab Interface**: Citation Analytics, Competitive Analysis, Citation Details, Real-Time Alerts

## 🔌 API Endpoints

### Citation Monitoring
```bash
# Record new citation
POST /api/v1/citations

# Get analytics data
GET /api/v1/citations/analytics

# Competitive analysis
GET /api/v1/citations/competitive
```

## 🧪 Testing

```bash
# Run all tests
./scripts/run-tests.sh

# Database validation
./database/validate-schema.sh

# n8n workflow validation
node ./apps/n8n-workflows/scripts/validate-workflows.js
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture/)
- [Story Documentation](./docs/stories/)
- [Implementation Summary](./docs/implementation-summary.md)

## 📈 Business Value

**DirectDrive Results**:
- Complete AI citation monitoring system
- 15 competitor tracking with positioning analysis
- Multi-language support (English, Arabic, Kurdish, Farsi)
- Real-time dashboard with performance metrics

## 🔒 Security

- **Row Level Security**: Supabase RLS on all tables
- **API Rate Limiting**: Comprehensive rate limiting
- **Input Validation**: Zod schemas for all endpoints
- **Environment Security**: Secure credential management

---

**Built with ❤️ using Claude AI** | **Last Updated**: August 2025# Trigger deployment
