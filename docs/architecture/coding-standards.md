# Coding Standards

These are the **CRITICAL fullstack rules** for AI agents working on DirectDrive Authority Engine. Focus on project-specific standards that prevent common mistakes and ensure consistency across the stack.

## Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared` and import from `@directdrive/shared` - never duplicate interfaces
- **API Calls:** Never make direct HTTP calls - always use the service layer in `packages/database` or `apps/dashboard/src/services`
- **Environment Variables:** Access only through config objects in `packages/shared/src/constants`, never `process.env` directly
- **Error Handling:** All API routes must use the standard `ApiError` format - never return raw errors to clients
- **State Updates:** Never mutate Zustand state directly - always use store actions for updates
- **Database Queries:** Use `packages/database/src/queries` functions - never write raw SQL in components
- **Real-time Subscriptions:** Use `useRealtime` hooks for Supabase subscriptions - never subscribe in components directly
- **n8n Integration:** All n8n webhook endpoints must validate `x-n8n-webhook-signature` header
- **Language Routing:** AI model selection must use `packages/ai-clients` routing - never hardcode model selection
- **Industry Switching:** Use configuration-driven templates from database - never hardcode industry-specific logic

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `CitationDashboard.tsx` |
| Hooks | camelCase with 'use' | - | `useCitationMonitoring.ts` |
| API Routes | - | kebab-case | `/api/v1/citation-analytics` |
| Database Tables | - | snake_case | `content_pieces`, `ai_citations` |
| Types/Interfaces | PascalCase | PascalCase | `ContentPiece`, `AICitation` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `AI_MODELS`, `SUPPORTED_LANGUAGES` |
| Functions | camelCase | camelCase | `generateContent()`, `monitorCitations()` |
| Files | kebab-case | kebab-case | `citation-monitor.ts`, `content-generator.ts` |

## TypeScript Strict Rules

```typescript
// packages/shared/src/types/index.ts - Single source of truth
export interface Keyword {
  id: number;
  industry: Industry;
  language: Language;
  // ... rest of interface
}

// ✅ Correct usage in components
import { Keyword } from '@directdrive/shared';

// ❌ Wrong - never duplicate types
interface LocalKeyword { ... }
```

## API Error Handling Pattern

```typescript
// ✅ Correct API error handling
export async function handler(req: NextRequest) {
  try {
    // API logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: 'CITATION_FETCH_ERROR',
        message: 'Failed to fetch citation data',
        timestamp: new Date().toISOString(),
        request_id: req.headers.get('x-request-id') || 'unknown'
      }
    }, { status: 500 });
  }
}
```

## n8n Webhook Security Pattern

```typescript
// ✅ Correct n8n webhook validation
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-n8n-webhook-signature');
  
  if (!validateN8nSignature(signature, body)) {
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
      { status: 401 }
    );
  }
  
  // Process webhook
}
```

## Real-time Updates Pattern

```typescript
// ✅ Correct real-time usage
import { useRealtime } from '@/hooks/useRealtime';

export function CitationDashboard() {
  const { citations, isConnected } = useRealtime('ai_citations', {
    filter: 'cited.eq.true'
  });
  
  // Component logic
}

// ❌ Wrong - never subscribe directly
useEffect(() => {
  supabase.channel('citations').subscribe(...);
}, []);
```

**Coding Standards Rationale:**
These standards ensure consistency across the DirectDrive Authority Engine stack while preventing common integration mistakes. The focus on type sharing and configuration-driven logic supports the modular industry framework. Strict error handling and security patterns ensure production readiness for both DirectDrive validation and tourism client scaling.

---
