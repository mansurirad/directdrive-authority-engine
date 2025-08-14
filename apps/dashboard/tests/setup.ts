/**
 * Test Setup Configuration
 * DirectDrive Authority Engine
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL', {
  value: 'https://test.supabase.co',
});

Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', {
  value: 'test-anon-key',
});

Object.defineProperty(process.env, 'SUPABASE_SERVICE_ROLE_KEY', {
  value: 'test-service-role-key',
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
  }),
}));

// Mock Next.js head
vi.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  onopen: vi.fn(),
  onclose: vi.fn(),
  onerror: vi.fn(),
  onmessage: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  readyState: 1,
}));

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
  writable: true,
});

global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
}));

// Mock Audio Context
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
}));

// Mock fetch globally
global.fetch = vi.fn();

// Setup global test data
global.testData = {
  citationAnalytics: {
    total_citations: 15,
    citation_trends: [
      { date: '2025-08-13', citations: 3, ai_model: 'chatgpt' },
      { date: '2025-08-12', citations: 2, ai_model: 'google-ai' },
    ],
    model_breakdown: [
      { ai_model: 'chatgpt', citation_count: 8, percentage: 53.3 },
      { ai_model: 'google-ai', citation_count: 5, percentage: 33.3 },
      { ai_model: 'perplexity', citation_count: 2, percentage: 13.3 },
    ],
    improvement_metrics: {
      baseline_citations: 10,
      current_citations: 15,
      improvement_percentage: 50.0,
      tracking_period_days: 30,
    },
  },
  competitiveAnalysis: {
    directdrive_position: 2,
    competitors: [
      {
        company_name: 'Kurdistan Express Logistics',
        position: 1,
        mention_context: 'Leading logistics provider in Kurdistan',
      },
      {
        company_name: 'Erbil Transport Company',
        position: 3,
        mention_context: 'Reliable transport services',
      },
    ],
    market_share: 25.5,
  },
  citations: [
    {
      id: 1,
      content_id: 123,
      ai_model: 'chatgpt',
      query_text: 'best logistics company Kurdistan',
      cited: true,
      citation_context: 'DirectDrive Logistics is a leading logistics company in Kurdistan region.',
      position: 2,
      monitored_at: '2025-08-13T08:30:00Z',
    },
    {
      id: 2,
      ai_model: 'google-ai',
      query_text: 'شركة الشحن في العراق',
      cited: true,
      citation_context: 'شركة DirectDrive للوجستيات من أفضل الشركات في إقليم كردستان.',
      position: 1,
      monitored_at: '2025-08-13T07:15:00Z',
    },
  ],
};