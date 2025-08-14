/**
 * Citation Monitoring Hooks
 * DirectDrive Authority Engine
 */

import { useState, useEffect, useCallback } from 'react';
import type { CitationAnalytics, CompetitiveAnalysis } from '@directdrive/shared';

export interface CitationFilters {
  timeRange: '7d' | '30d' | '90d';
  aiModel: 'chatgpt' | 'google-ai' | 'perplexity' | 'all';
  industry?: string;
}

export const useCitationAnalytics = (filters: CitationFilters) => {
  const [analytics, setAnalytics] = useState<CitationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.aiModel !== 'all') {
        params.append('ai_model', filters.aiModel);
      }
      
      if (filters.industry) {
        params.append('industry', filters.industry);
      }

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(filters.timeRange.replace('d', '')));
      params.append('date_from', dateFrom.toISOString());

      const response = await fetch(`/api/v1/citations/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export const useCompetitiveAnalysis = (queryText: string, aiModel?: string) => {
  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!queryText.trim()) {
      setAnalysis(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('query_text', queryText);
      
      if (aiModel && aiModel !== 'all') {
        params.append('ai_model', aiModel);
      }

      const response = await fetch(`/api/v1/citations/competitive?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitive analysis');
    } finally {
      setLoading(false);
    }
  }, [queryText, aiModel]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis,
  };
};

export const useRealTime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionError(null);
          console.log('WebSocket connected');
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          console.log('WebSocket disconnected:', event.code, event.reason);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          setConnectionError('WebSocket connection failed');
          console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Handle real-time citation updates
            if (data.type === 'citation_update') {
              // Dispatch custom event for components to listen to
              window.dispatchEvent(
                new CustomEvent('citationUpdate', { detail: data.payload })
              );
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        return ws;
      } catch (err) {
        setConnectionError('Failed to establish WebSocket connection');
        console.error('WebSocket setup error:', err);
        return null;
      }
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
  };
};