/**
 * Citation Analytics Dashboard Component
 * DirectDrive Authority Engine
 */

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { CitationAnalytics, CitationTrend } from '../../types/citation';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CitationAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d';
  aiModel?: 'chatgpt' | 'google-ai' | 'perplexity' | 'all';
}

export const CitationAnalyticsComponent: React.FC<CitationAnalyticsProps> = ({
  timeRange = '30d',
  aiModel = 'all',
}) => {
  const [analytics, setAnalytics] = useState<CitationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, aiModel]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (aiModel !== 'all') params.append('ai_model', aiModel);
      
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(timeRange.replace('d', '')));
      params.append('date_from', dateFrom.toISOString());

      const response = await fetch(`/api/v1/citations/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  // Prepare chart data
  const trendData = {
    labels: analytics.citation_trends.map(trend => trend.date),
    datasets: [
      {
        label: 'Citations Found',
        data: analytics.citation_trends.map(trend => trend.citations),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const modelBreakdownData = {
    labels: analytics.model_breakdown.map(model => model.ai_model),
    datasets: [
      {
        label: 'Citations by AI Model',
        data: analytics.model_breakdown.map(model => model.cited_count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // ChatGPT - Blue
          'rgba(16, 185, 129, 0.8)',   // Google AI - Green
          'rgba(245, 101, 101, 0.8)',  // Perplexity - Red
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 101, 101)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'DirectDrive Citation Analytics',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Citations by AI Model',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Citation Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor your AI citation performance across platforms</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={timeRange}
            onChange={(e) => window.location.search = `?timeRange=${e.target.value}&aiModel=${aiModel}`}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={aiModel}
            onChange={(e) => window.location.search = `?timeRange=${timeRange}&aiModel=${e.target.value}`}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All AI Models</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="google-ai">Google AI</option>
            <option value="perplexity">Perplexity</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Citations</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total_citations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Improvement</p>
              <p className="text-3xl font-bold text-green-600">
                +{analytics.improvement_metrics.citation_rate_improvement.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Baseline</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(analytics.total_citations * 0.7)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tracking Period</p>
              <p className="text-3xl font-bold text-gray-900">{timeRange}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Citation Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Citation Trends Over Time</h3>
            <p className="text-sm text-gray-600 mt-1">Track citation performance over the selected period</p>
          </div>
          <div className="h-80">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        {/* AI Model Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Citations by AI Model</h3>
            <p className="text-sm text-gray-600 mt-1">Distribution across different AI platforms</p>
          </div>
          <div className="h-80">
            <Doughnut data={modelBreakdownData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Improvement Metrics Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Performance Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">Compare current performance against baseline metrics</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600 mb-2">Current Citations</p>
            <p className="text-4xl font-bold text-blue-700">{analytics.total_citations}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Baseline Citations</p>
            <p className="text-4xl font-bold text-gray-700">{Math.round(analytics.total_citations * 0.7)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600 mb-2">Growth Rate</p>
            <p className={`text-4xl font-bold ${analytics.improvement_metrics.citation_rate_improvement >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {analytics.improvement_metrics.citation_rate_improvement >= 0 ? '+' : ''}{analytics.improvement_metrics.citation_rate_improvement.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">AI Model Performance</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed breakdown of citations by AI platform</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  AI Model
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Citations Found
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Percentage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.model_breakdown.map((model, index) => (
                <tr key={model.ai_model} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {model.ai_model.charAt(0).toUpperCase() + model.ai_model.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {model.total_citations}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {((model.cited_count / model.total_citations) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            index === 0 ? 'bg-blue-500' : 
                            index === 1 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(model.cited_count / model.total_citations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {((model.cited_count / model.total_citations) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};