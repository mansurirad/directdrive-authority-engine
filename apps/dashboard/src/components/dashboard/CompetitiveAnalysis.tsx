/**
 * Competitive Analysis Dashboard Component
 * DirectDrive Authority Engine
 */

import React, { useState, useEffect } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import type { CompetitiveAnalysis, CompetitorMention } from '@directdrive/shared';

interface CompetitiveAnalysisProps {
  selectedQuery?: string;
  aiModel?: 'chatgpt' | 'google-ai' | 'perplexity' | 'all';
}

export const CompetitiveAnalysisComponent: React.FC<CompetitiveAnalysisProps> = ({
  selectedQuery = 'best logistics company Kurdistan',
  aiModel = 'all',
}) => {
  const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [queries, setQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    if (selectedQuery) {
      fetchCompetitiveAnalysis();
    }
  }, [selectedQuery, aiModel]);

  const fetchQueries = async () => {
    // For demo purposes, using predefined queries
    // In production, this would fetch from the database
    setQueries([
      'best logistics company Kurdistan',
      'shipping services Erbil',
      'DirectDrive logistics',
      'Kurdistan freight services',
      'customs clearance Kurdistan',
      'Iraq shipping company',
    ]);
  };

  const fetchCompetitiveAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('query_text', selectedQuery);
      if (aiModel !== 'all') params.append('ai_model', aiModel);

      const response = await fetch(`/api/v1/citations/competitive?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch competitive analysis');
      }

      const data = await response.json();
      setAnalysis(data);
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
        <span className="ml-2">Loading competitive analysis...</span>
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

  if (!analysis) {
    return (
      <div className="text-center py-8 text-gray-500">
        No competitive analysis data available
      </div>
    );
  }

  // Prepare competitor positions chart
  const competitorData = {
    labels: [
      'DirectDrive',
      ...analysis.competitors.map(comp => comp.company_name.split(' ')[0]) // Shorten names
    ],
    datasets: [
      {
        label: 'Position Ranking',
        data: [
          analysis.directdrive_position || 10,
          ...analysis.competitors.map(comp => comp.position)
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // DirectDrive - Blue
          ...analysis.competitors.map((_, index) => 
            `rgba(${156 + index * 30}, ${163 + index * 20}, ${175 + index * 10}, 0.8)`
          )
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          ...analysis.competitors.map((_, index) => 
            `rgb(${156 + index * 30}, ${163 + index * 20}, ${175 + index * 10})`
          )
        ],
        borderWidth: 2,
      },
    ],
  };

  const competitorChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Market Position Rankings (Lower is Better)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        reverse: true, // Lower positions are better
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Market share radar chart data
  const marketShareData = {
    labels: ['Visibility', 'Citations', 'Position', 'Context Quality', 'Brand Recognition'],
    datasets: [
      {
        label: 'DirectDrive',
        data: [
          analysis.market_share,
          analysis.directdrive_position ? (11 - analysis.directdrive_position) * 10 : 10,
          analysis.directdrive_position ? (11 - analysis.directdrive_position) * 10 : 10,
          75, // Placeholder for context quality
          60, // Placeholder for brand recognition
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Market Average',
        data: [20, 50, 50, 60, 70],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        pointBackgroundColor: 'rgb(156, 163, 175)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'DirectDrive vs Market Performance',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Competitive Analysis</h2>
        <div className="flex space-x-4">
          <select
            value={selectedQuery}
            onChange={(e) => window.location.search = `?query=${encodeURIComponent(e.target.value)}&aiModel=${aiModel}`}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {queries.map(query => (
              <option key={query} value={query}>{query}</option>
            ))}
          </select>
          <select
            value={aiModel}
            onChange={(e) => window.location.search = `?query=${encodeURIComponent(selectedQuery)}&aiModel=${e.target.value}`}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All AI Models</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="google-ai">Google AI</option>
            <option value="perplexity">Perplexity</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">DirectDrive Position</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analysis.directdrive_position ? `#${analysis.directdrive_position}` : 'Not Listed'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Market Share</p>
              <p className="text-2xl font-semibold text-green-600">{analysis.market_share.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Competitors Tracked</p>
              <p className="text-2xl font-semibold text-purple-600">{analysis.competitors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Rankings Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Rankings</h3>
          <div className="h-64">
            <Bar data={competitorData} options={competitorChartOptions} />
          </div>
        </div>

        {/* Performance Radar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
          <div className="h-64">
            <Radar data={marketShareData} options={radarOptions} />
          </div>
        </div>
      </div>

      {/* Competitors Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competitive Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* DirectDrive Row */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900">DirectDrive Logistics</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    analysis.directdrive_position
                      ? analysis.directdrive_position <= 3
                        ? 'bg-green-100 text-green-800'
                        : analysis.directdrive_position <= 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.directdrive_position ? `#${analysis.directdrive_position}` : 'Not Listed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {analysis.directdrive_position ? 'Listed in search results' : 'Not mentioned in this query'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  Our Company
                </td>
              </tr>

              {/* Competitor Rows */}
              {analysis.competitors.map((competitor, index) => (
                <tr key={competitor.company_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-900">{competitor.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      competitor.position <= 3
                        ? 'bg-red-100 text-red-800'
                        : competitor.position <= 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      #{competitor.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {competitor.mention_context}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      competitor.position < (analysis.directdrive_position || 11)
                        ? 'text-red-600 font-medium'
                        : 'text-green-600'
                    }`}>
                      {competitor.position < (analysis.directdrive_position || 11) ? 'Ahead' : 'Behind'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Opportunities</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {analysis.directdrive_position ? (
                <>
                  <li>• Currently ranked #{analysis.directdrive_position} for "{selectedQuery}"</li>
                  <li>• {analysis.competitors.filter(c => c.position > (analysis.directdrive_position || 0)).length} competitors ranked lower</li>
                  <li>• Market share of {analysis.market_share.toFixed(1)}% shows growth potential</li>
                </>
              ) : (
                <>
                  <li>• Not currently visible for "{selectedQuery}"</li>
                  <li>• Significant opportunity to capture market share</li>
                  <li>• Focus on improving content relevance and SEO</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Competitive Threats</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {analysis.competitors.slice(0, 3).map((competitor, index) => (
                <li key={competitor.company_name}>
                  • {competitor.company_name} ranked #{competitor.position}
                </li>
              ))}
              {analysis.competitors.length === 0 && (
                <li>• Limited competitive intelligence available for this query</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};