/**
 * Main Dashboard Page
 * DirectDrive Authority Engine
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  CitationAnalyticsComponent,
  CompetitiveAnalysisComponent,
  CitationDetailComponent,
  RealTimeAlertsComponent,
} from '@/components/dashboard';

type DashboardTab = 'overview' | 'competitive' | 'details' | 'alerts';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Citation Analytics', icon: '📊' },
    { id: 'competitive', name: 'Competitive Analysis', icon: '🏆' },
    { id: 'details', name: 'Citation Details', icon: '📋' },
    { id: 'alerts', name: 'Real-Time Alerts', icon: '🔔' },
  ] as const;

  return (
    <>
      <Head>
        <title>DirectDrive Authority Engine - Dashboard</title>
        <meta name="description" content="AI Citation Monitoring Dashboard for DirectDrive Logistics - Enhanced UI" />
      </Head>

      <div className="min-h-screen bg-gray-50" data-version="v2.0-enhanced">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  DirectDrive Authority Engine
                </h1>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Live
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Last updated: {currentTime || '--:--:--'}
                </div>
                <button className="order-1 sm:order-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-2" role="img" aria-label={tab.name}>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'overview' && (
            <CitationAnalyticsComponent />
          )}
          
          {activeTab === 'competitive' && (
            <CompetitiveAnalysisComponent />
          )}
          
          {activeTab === 'details' && (
            <CitationDetailComponent showRecent={true} limit={20} />
          )}
          
          {activeTab === 'alerts' && (
            <RealTimeAlertsComponent />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                © 2025 DirectDrive Authority Engine. Powered by Claude Code.
              </div>
              <div className="flex space-x-6 text-sm text-gray-600">
                <a href="/docs" className="hover:text-gray-900">Documentation</a>
                <a href="/api" className="hover:text-gray-900">API Reference</a>
                <a href="/support" className="hover:text-gray-900">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}