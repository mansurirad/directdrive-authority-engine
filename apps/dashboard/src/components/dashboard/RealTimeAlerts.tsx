/**
 * Real-Time Citation Alerts Component
 * DirectDrive Authority Engine
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { AICitation } from '../../types/citation';

interface AlertConfig {
  enabled: boolean;
  highPriorityOnly: boolean;
  minPosition: number;
  aiModels: ('chatgpt' | 'google-ai' | 'perplexity')[];
  notificationSound: boolean;
}

interface CitationAlert {
  id: string;
  citation: AICitation;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

export const RealTimeAlertsComponent: React.FC = () => {
  const [alerts, setAlerts] = useState<CitationAlert[]>([]);
  const [config, setConfig] = useState<AlertConfig>({
    enabled: true,
    highPriorityOnly: false,
    minPosition: 5,
    aiModels: ['chatgpt', 'google-ai', 'perplexity'],
    notificationSound: true,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize Supabase client for real-time subscriptions
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (config.enabled) {
      setupRealTimeSubscription();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [config.enabled]);

  useEffect(() => {
    const unread = alerts.filter(alert => !alert.read).length;
    setUnreadCount(unread);
  }, [alerts]);

  const setupRealTimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('ai_citations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_citations',
          filter: 'cited=eq.true', // Only listen for positive citations
        },
        (payload) => {
          handleNewCitation(payload.new as AICitation);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config]);

  const handleNewCitation = (citation: AICitation) => {
    // Check if citation meets alert criteria
    if (!shouldAlert(citation)) return;

    const priority = calculatePriority(citation);
    const alert: CitationAlert = {
      id: `alert_${citation.id}_${Date.now()}`,
      citation,
      timestamp: new Date().toISOString(),
      priority,
      read: false,
    };

    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts

    // Play notification sound if enabled
    if (config.notificationSound) {
      playNotificationSound();
    }

    // Show browser notification
    showBrowserNotification(alert);
  };

  const shouldAlert = (citation: AICitation): boolean => {
    // Check AI model filter
    if (!config.aiModels.includes(citation.ai_model)) return false;

    // Check position threshold
    if (citation.position && citation.position > config.minPosition) return false;

    // Check high priority filter
    if (config.highPriorityOnly && calculatePriority(citation) !== 'high') return false;

    return true;
  };

  const calculatePriority = (citation: AICitation): 'high' | 'medium' | 'low' => {
    // High priority: Top 2 positions or DirectDrive-specific queries
    if (citation.position && citation.position <= 2) return 'high';
    if (citation.query_text.toLowerCase().includes('directdrive')) return 'high';

    // Medium priority: Top 5 positions
    if (citation.position && citation.position <= 5) return 'medium';

    return 'low';
  };

  const playNotificationSound = () => {
    // Create audio context and play a simple notification tone
    const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const showBrowserNotification = (alert: CitationAlert) => {
    if (Notification.permission === 'granted') {
      new Notification('DirectDrive Citation Alert', {
        body: `New citation found: ${alert.citation.query_text}`,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prev =>
      prev.map(alert => ({ ...alert, read: true }))
    );
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Alerts</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Mark All Read
          </button>
          <button
            onClick={clearAlerts}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alerts-enabled"
              checked={config.enabled}
              onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="alerts-enabled" className="ml-2 text-sm text-gray-700">
              Enable Alerts
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="high-priority-only"
              checked={config.highPriorityOnly}
              onChange={(e) => setConfig(prev => ({ ...prev, highPriorityOnly: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="high-priority-only" className="ml-2 text-sm text-gray-700">
              High Priority Only
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notification-sound"
              checked={config.notificationSound}
              onChange={(e) => setConfig(prev => ({ ...prev, notificationSound: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="notification-sound" className="ml-2 text-sm text-gray-700">
              Sound Notifications
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="min-position" className="text-sm text-gray-700">
              Min Position:
            </label>
            <select
              id="min-position"
              value={config.minPosition}
              onChange={(e) => setConfig(prev => ({ ...prev, minPosition: parseInt(e.target.value) }))}
              className="border-gray-300 rounded text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pos => (
                <option key={pos} value={pos}>#{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5 5-5m-5 5V4" />
            </svg>
            <p className="mt-2">No alerts yet. Real-time monitoring is active.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${!alert.read ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.citation.ai_model.toUpperCase()}
                      </span>
                      {alert.citation.position && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          #{alert.citation.position}
                        </span>
                      )}
                      {!alert.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {alert.citation.query_text}
                    </p>
                    {alert.citation.citation_context && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {alert.citation.citation_context}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-gray-500">
                    {formatTimeAgo(alert.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority Alerts</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium Priority Alerts</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.priority === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Priority Alerts</div>
          </div>
        </div>
      )}
    </div>
  );
};