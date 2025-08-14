/**
 * Supabase Realtime Hook
 * DirectDrive Authority Engine
 */

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { AICitation } from '../types/citation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
  table: string;
}

export const useRealtimeSubscription = (
  table: string,
  callback: (event: RealtimeEvent) => void,
  filter?: string
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            table: payload.table,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to realtime updates');
        } else {
          setError(null);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, callback]);

  return { isConnected, error };
};

export const useCitationUpdates = (onNewCitation?: (citation: AICitation) => void) => {
  const [latestCitation, setLatestCitation] = useState<AICitation | null>(null);

  const handleCitationUpdate = (event: RealtimeEvent) => {
    if (event.eventType === 'INSERT' && event.new) {
      const citation = event.new as AICitation;
      setLatestCitation(citation);
      
      if (onNewCitation) {
        onNewCitation(citation);
      }
    }
  };

  const { isConnected, error } = useRealtimeSubscription(
    'ai_citations',
    handleCitationUpdate,
    'cited=eq.true' // Only get positive citations
  );

  return {
    latestCitation,
    isConnected,
    error,
  };
};