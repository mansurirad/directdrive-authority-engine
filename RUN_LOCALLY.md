# 🚀 How to Run DirectDrive Authority Engine Locally

## Quick Start (Simple Method)

Since this is a monorepo with workspace dependencies, here's the easiest way to run it:

### 1. **Install Dependencies for Dashboard Only**
```bash
# Navigate to the main dashboard app
cd apps/dashboard

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

### 2. **Set Up Environment Variables**
```bash
# Copy the environment template
cp ../../.env.example .env.local

# Edit with your actual API keys
nano .env.local
```

### 3. **Run the Dashboard**
```bash
# Start the Next.js development server
npm run dev
```

Then open: **http://localhost:3000**

## Alternative: Run from GitHub (Fresh Clone)

If someone else wants to run this from GitHub:

```bash
# Clone the repository
git clone https://github.com/mansurirad/directdrive-authority-engine.git
cd directdrive-authority-engine

# Install dashboard dependencies
cd apps/dashboard
npm install --legacy-peer-deps

# Set up environment
cp ../../.env.example .env.local
# Edit .env.local with your API keys

# Run the dashboard
npm run dev
```

## Method 2: Deploy Online (Vercel - Recommended)

The easiest way to run this online is to deploy to Vercel:

### 1. **Go to Vercel**
- Visit: https://vercel.com
- Sign up/login with your GitHub account

### 2. **Import Repository**
- Click "New Project"
- Import: `mansurirad/directdrive-authority-engine`
- Root Directory: `apps/dashboard`
- Framework: Next.js

### 3. **Set Environment Variables**
Add these in Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=https://lrwdoihyhnybwwntmmrs.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
PERPLEXITY_API_KEY=your_perplexity_key
```

### 4. **Deploy**
- Click "Deploy"
- Get live URL (e.g., `https://directdrive-authority-engine.vercel.app`)

## Method 3: GitHub Codespaces (Cloud Development)

1. Go to your repository: https://github.com/mansurirad/directdrive-authority-engine
2. Click "Code" > "Codespaces" > "Create codespace"
3. Wait for environment to load
4. Run the setup commands above

## What You'll See

Once running, you'll have access to:

- **📊 Citation Analytics Dashboard**: Real-time charts and metrics
- **🔍 AI Monitoring Interface**: Track mentions across AI models
- **📈 Competitive Analysis**: Compare against other logistics companies
- **⚡ Real-time Alerts**: Live notifications for new citations
- **🛠️ API Endpoints**: RESTful APIs for citation management

## API Endpoints Available

- `POST /api/v1/citations` - Record new citation
- `GET /api/v1/citations/analytics` - Get analytics data
- `GET /api/v1/citations/competitive` - Competitive analysis

## Database Setup

The system uses Supabase PostgreSQL. The schema files are in `database/`:
- `ai_citations_schema_update.sql` - Main citation tracking schema
- `directdrive_schema.sql` - Complete database schema
- `validate-schema.sh` - Schema validation script

## n8n Workflow

Import the workflow from `apps/n8n-workflows/workflows/citation-monitoring.json` into your n8n instance for automated monitoring.

---

**Your DirectDrive Authority Engine is ready to run! 🎉**

Choose the method that works best for you - local development or cloud deployment.