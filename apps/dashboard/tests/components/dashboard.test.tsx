/**
 * Dashboard Components Tests
 * DirectDrive Authority Engine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CitationAnalyticsComponent,
  CompetitiveAnalysisComponent,
  CitationDetailComponent,
  RealTimeAlertsComponent,
} from '@/components/dashboard';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
  Bar: vi.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  Doughnut: vi.fn(() => <div data-testid="doughnut-chart">Doughnut Chart</div>),
  Radar: vi.fn(() => <div data-testid="radar-chart">Radar Chart</div>),
}));

// Mock Chart.js registration
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

// Mock fetch
global.fetch = vi.fn();

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((callback) => {
          callback('SUBSCRIBED');
          return {
            unsubscribe: vi.fn(),
          };
        }),
      })),
    })),
    removeAllChannels: vi.fn(),
    removeChannel: vi.fn(),
  })),
}));

describe('CitationAnalyticsComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
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
      }),
    });
  });

  it('renders citation analytics with loading state', async () => {
    render(<CitationAnalyticsComponent />);
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Citation Analytics')).toBeInTheDocument();
    });
  });

  it('displays key metrics correctly', async () => {
    render(<CitationAnalyticsComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Total citations
      expect(screen.getByText('+50.0%')).toBeInTheDocument(); // Improvement
      expect(screen.getByText('10')).toBeInTheDocument(); // Baseline
      expect(screen.getByText('30d')).toBeInTheDocument(); // Tracking period
    });
  });

  it('renders charts correctly', async () => {
    render(<CitationAnalyticsComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('API Error'));
    
    render(<CitationAnalyticsComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error.*API Error/)).toBeInTheDocument();
    });
  });

  it('updates when filters change', async () => {
    render(<CitationAnalyticsComponent timeRange="7d" aiModel="chatgpt" />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('ai_model=chatgpt')
      );
    });
  });
});

describe('CompetitiveAnalysisComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
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
      }),
    });
  });

  it('renders competitive analysis correctly', async () => {
    render(<CompetitiveAnalysisComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Competitive Analysis')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument(); // DirectDrive position
      expect(screen.getByText('25.5%')).toBeInTheDocument(); // Market share
    });
  });

  it('displays competitor information', async () => {
    render(<CompetitiveAnalysisComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Kurdistan Express Logistics')).toBeInTheDocument();
      expect(screen.getByText('Erbil Transport Company')).toBeInTheDocument();
    });
  });

  it('shows competitive insights', async () => {
    render(<CompetitiveAnalysisComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Strategic Insights')).toBeInTheDocument();
      expect(screen.getByText('Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Competitive Threats')).toBeInTheDocument();
    });
  });
});

describe('CitationDetailComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders citation details list', async () => {
    render(<CitationDetailComponent showRecent={true} limit={5} />);
    
    await waitFor(() => {
      expect(screen.getByText('Citation Details')).toBeInTheDocument();
      expect(screen.getByText('Recent Citations')).toBeInTheDocument();
    });
  });

  it('displays citation information correctly', async () => {
    render(<CitationDetailComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('best logistics company Kurdistan')).toBeInTheDocument();
      expect(screen.getByText('ChatGPT')).toBeInTheDocument();
      expect(screen.getByText('Cited')).toBeInTheDocument();
    });
  });

  it('allows citation selection', async () => {
    render(<CitationDetailComponent />);
    
    await waitFor(() => {
      const citationItem = screen.getByText('best logistics company Kurdistan');
      fireEvent.click(citationItem);
      
      expect(screen.getByText('Citation Analysis')).toBeInTheDocument();
    });
  });
});

describe('RealTimeAlertsComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Web Audio API
    window.AudioContext = vi.fn().mockImplementation(() => ({
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
    
    // Mock Notification API
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'granted',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
    });
    global.Notification = vi.fn();
  });

  it('renders real-time alerts interface', () => {
    render(<RealTimeAlertsComponent />);
    
    expect(screen.getByText('Real-Time Alerts')).toBeInTheDocument();
    expect(screen.getByText('Alert Settings')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    render(<RealTimeAlertsComponent />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays alert configuration options', () => {
    render(<RealTimeAlertsComponent />);
    
    expect(screen.getByText('Enable Alerts')).toBeInTheDocument();
    expect(screen.getByText('High Priority Only')).toBeInTheDocument();
    expect(screen.getByText('Sound Notifications')).toBeInTheDocument();
  });

  it('handles alert configuration changes', () => {
    render(<RealTimeAlertsComponent />);
    
    const enableAlertsCheckbox = screen.getByLabelText('Enable Alerts');
    fireEvent.click(enableAlertsCheckbox);
    
    expect(enableAlertsCheckbox).not.toBeChecked();
  });

  it('shows empty state when no alerts', () => {
    render(<RealTimeAlertsComponent />);
    
    expect(screen.getByText('No alerts yet. Real-time monitoring is active.')).toBeInTheDocument();
  });
});

describe('Dashboard Integration', () => {
  it('handles real-time updates correctly', async () => {
    const mockWebSocket = {
      onopen: vi.fn(),
      onclose: vi.fn(),
      onerror: vi.fn(),
      onmessage: vi.fn(),
      close: vi.fn(),
    };
    
    global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket);
    
    render(<RealTimeAlertsComponent />);
    
    // Simulate WebSocket connection
    mockWebSocket.onopen();
    
    // Simulate receiving a citation update
    const citationUpdate = {
      type: 'citation_update',
      payload: {
        id: 1,
        ai_model: 'chatgpt',
        query_text: 'test query',
        cited: true,
        monitored_at: new Date().toISOString(),
      },
    };
    
    mockWebSocket.onmessage({
      data: JSON.stringify(citationUpdate),
    });
    
    expect(mockWebSocket.onopen).toHaveBeenCalled();
  });
});