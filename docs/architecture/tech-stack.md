# Tech Stack

This is the **DEFINITIVE technology selection** for the entire DirectDrive Authority Engine project. Based on your existing n8n workflow, Supabase database setup, and requirements for multi-language AI content generation with real-time monitoring.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | ^5.0 | Type-safe frontend development | Essential for shared data models between n8n, dashboard, and AI services |
| **Frontend Framework** | Next.js | ^14.0 | React-based dashboard application | Server-side rendering for SEO, API routes for citation monitoring, Vercel optimization |
| **UI Component Library** | shadcn/ui + Radix | Latest | Modern component system | Tailwind-compatible, accessible, perfect for business dashboards |
| **State Management** | Zustand | ^4.4 | Lightweight client state | Simpler than Redux, perfect for dashboard data and real-time updates |
| **Backend Language** | TypeScript | ^5.0 | Unified language across stack | Single language for n8n workflows, API routes, and shared utilities |
| **Backend Framework** | Next.js API Routes | ^14.0 | Serverless API endpoints | Integrated with frontend, serverless scaling, Vercel deployment |
| **API Style** | REST + WebSocket | HTTP/1.1 + WS | RESTful APIs + real-time updates | REST for CRUD operations, WebSocket for live citation monitoring |
| **Database** | Supabase PostgreSQL | ^15.0 | Primary data store | Already implemented, real-time capabilities, generous free tier |
| **Cache** | Supabase Edge Cache | Built-in | Query result caching | Reduces API costs for AI model calls, improves dashboard performance |
| **File Storage** | Supabase Storage | Built-in | Generated content assets | Integrated with database, CDN capabilities for published content |
| **Authentication** | Supabase Auth | Built-in | User authentication system | JWT tokens, social auth, integrated with database RLS |
| **Frontend Testing** | Vitest + Testing Library | ^1.0 + ^14.0 | Component and unit testing | Faster than Jest, better TypeScript support, React testing utilities |
| **Backend Testing** | Vitest | ^1.0 | API endpoint testing | Consistent testing framework across stack |
| **E2E Testing** | Playwright | ^1.40 | End-to-end testing | Better reliability than Cypress, multi-browser support |
| **Build Tool** | Vite | ^5.0 | Development and build tooling | Faster than Webpack, excellent TypeScript support |
| **Bundler** | Next.js Built-in | ^14.0 | Production bundling | Optimized for Vercel deployment, automatic code splitting |
| **IaC Tool** | Vercel CLI | Latest | Infrastructure as code | Simple deployment, environment management |
| **CI/CD** | GitHub Actions | Latest | Automated deployment pipeline | Free for public repos, excellent Vercel integration |
| **Monitoring** | Vercel Analytics + Sentry | Latest | Performance and error tracking | Built-in performance monitoring, comprehensive error tracking |
| **Logging** | Vercel Logs + Supabase Logs | Built-in | Application logging | Integrated logging across platform services |
| **CSS Framework** | Tailwind CSS | ^3.4 | Utility-first styling | Rapid development, consistent design system, shadcn/ui compatibility |
| **Workflow Orchestration** | n8n Cloud | Latest | Content generation automation | Your existing 60+ node workflow, visual workflow management |
| **AI Integration** | OpenAI API + Google AI | Latest | Multi-language content generation | GPT-4 for English/Arabic, Gemini for Kurdish/Farsi |
| **Content Publishing** | WordPress REST API | Latest | Automated content publishing | Direct integration with directdrivelogistic.com |
| **Real-time Updates** | Supabase Realtime | Built-in | Live citation monitoring | WebSocket-based real-time database subscriptions |

**Technology Selection Rationale:**
This stack maintains your existing n8n workflow expertise while adding modern web application capabilities. The TypeScript-first approach ensures type safety across n8n workflows, dashboard components, and shared data models. Supabase provides enterprise-grade database capabilities with real-time features essential for citation monitoring.

---
