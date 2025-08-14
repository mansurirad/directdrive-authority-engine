# Technical Assumptions

## Repository Structure: Modular Monorepo
Single repository containing DirectDrive-specific implementation with clear industry module separation allowing easy tourism adaptation.

## Service Architecture
**Enhanced n8n Workflow Integration:** Core 60+ node workflow enhanced with Supabase database operations, multi-language AI model routing, and industry-agnostic content generation framework.

## Testing Requirements
**Real Business Validation:** Use DirectDrive's actual website traffic and business inquiries to validate AI citation correlation with customer acquisition.

## Additional Technical Assumptions and Requests

**Database Architecture:**
- **Primary:** Supabase PostgreSQL with industry-agnostic schema supporting logistics keywords now, tourism keywords later
- **Content Storage:** Multi-language content with industry tagging for modular management
- **Analytics:** Performance tracking suitable for both internal DirectDrive use and client demonstrations

**Multi-Language AI Integration:**
- **English:** OpenAI GPT-4 for international logistics content
- **Arabic:** GPT-4 with regional business context for Iraq/Gulf markets  
- **Kurdish:** Google Gemini optimized for local Kurdistan logistics terminology
- **Farsi:** Gemini with Iran trade route and customs context

**Industry Modular Framework:**
- **Content Templates:** Logistics-specific prompts easily replaceable with tourism prompts
- **Keyword Management:** Industry-agnostic database schema supporting any vertical
- **Monitoring Queries:** Configurable AI queries adaptable from logistics to tourism focus

**Performance Validation:**
- **Business Metrics:** Track DirectDrive inquiry correlation with AI citation improvements
- **Technical Metrics:** Document system performance for scaling to multiple tourism clients
- **Cost Modeling:** Validate API usage costs for pricing model validation

**Operational Infrastructure:**
- **CI/CD Pipeline:** GitHub Actions automated testing and deployment with staging/production environments
- **Feature Flags:** Environment-variable-based feature toggle system for safe brownfield integration
- **Monitoring Stack:** Comprehensive monitoring covering business operations, n8n workflows, and technical infrastructure
- **Rollback Procedures:** Epic-level rollback strategies with emergency procedures and business continuity protection

**Deployment Strategy:**
- **Zero-Downtime Deployment:** Vercel-based deployment with health checks and automated rollback triggers
- **Environment Management:** Development, staging, and production environments with proper secrets management
- **Business Continuity:** DirectDrive operations protected during all deployments with fallback mechanisms

---
