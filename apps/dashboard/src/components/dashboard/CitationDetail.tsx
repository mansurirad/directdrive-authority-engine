/**
 * Citation Detail View Component
 * DirectDrive Authority Engine
 */

import React, { useState, useEffect } from 'react';
import type { AICitation } from '@directdrive/shared';

interface CitationDetailProps {
  citationId?: number;
  showRecent?: boolean;
  limit?: number;
}

export const CitationDetailComponent: React.FC<CitationDetailProps> = ({
  citationId,
  showRecent = true,
  limit = 10,
}) => {
  const [citations, setCitations] = useState<AICitation[]>([]);
  const [selectedCitation, setSelectedCitation] = useState<AICitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (citationId) {
      fetchCitationById(citationId);
    } else if (showRecent) {
      fetchRecentCitations();
    }
  }, [citationId, showRecent, limit]);

  const fetchCitationById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // This would be a dedicated endpoint in a real implementation
      const response = await fetch(`/api/v1/citations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch citation');
      }

      const citation = await response.json();
      setSelectedCitation(citation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentCitations = async () => {
    setLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll simulate fetching recent citations
      // In a real implementation, this would be a paginated API endpoint
      const mockCitations: AICitation[] = [
        {
          id: 1,
          content_id: 123,
          ai_model: 'chatgpt',
          query_text: 'best logistics company Kurdistan',
          cited: true,
          citation_context: 'DirectDrive Logistics is a leading logistics company in Kurdistan region, offering comprehensive freight and shipping services with excellent customer service.',
          position: 2,
          monitored_at: '2025-08-13T08:30:00Z',
        },
        {
          id: 2,
          ai_model: 'google-ai',
          query_text: 'شركة الشحن في العراق',
          cited: true,
          citation_context: 'شركة DirectDrive للوجستيات من أفضل الشركات في إقليم كردستان وتقدم خدمات متميزة.',
          position: 1,
          monitored_at: '2025-08-13T07:15:00Z',
        },
        {
          id: 3,
          ai_model: 'perplexity',
          query_text: 'DirectDrive logistics',
          cited: true,
          citation_context: 'DirectDrive Logistics operates in Kurdistan and provides freight forwarding, customs clearance, and warehousing services. They are known for their local expertise and multi-language support.',
          position: 1,
          monitored_at: '2025-08-13T06:45:00Z',
        },
        {
          id: 4,
          ai_model: 'chatgpt',
          query_text: 'Kurdistan freight services',
          cited: false,
          monitored_at: '2025-08-13T06:00:00Z',
        },
        {
          id: 5,
          ai_model: 'google-ai',
          query_text: 'customs clearance Kurdistan',
          cited: true,
          citation_context: 'For customs clearance in Kurdistan, DirectDrive Logistics offers professional services with expertise in both KRG and Iraqi federal regulations.',
          position: 3,
          monitored_at: '2025-08-13T05:30:00Z',
        },
      ];

      setCitations(mockCitations.slice(0, limit));
      if (!selectedCitation && mockCitations.length > 0) {
        setSelectedCitation(mockCitations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAIModelLabel = (model: string) => {
    switch (model) {
      case 'chatgpt': return 'ChatGPT';
      case 'google-ai': return 'Google AI';
      case 'perplexity': return 'Perplexity';
      default: return model;
    }
  };

  const getPositionBadge = (position?: number) => {
    if (!position) return null;

    const getPositionColor = (pos: number) => {
      if (pos <= 2) return 'bg-green-100 text-green-800';
      if (pos <= 5) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(position)}`}>
        #{position}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading citations...</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Citation Details</h2>
        <div className="text-sm text-gray-500">
          {citations.length} recent citations
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Citations</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {citations.map((citation) => (
                <div
                  key={citation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedCitation?.id === citation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCitation(citation)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      citation.cited ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {citation.cited ? 'Cited' : 'Not Cited'}
                    </span>
                    {citation.position && getPositionBadge(citation.position)}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {citation.query_text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getAIModelLabel(citation.ai_model)} • {formatDate(citation.monitored_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Citation Detail */}
        <div className="lg:col-span-2">
          {selectedCitation ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Citation Analysis</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedCitation.cited ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCitation.cited ? 'Citation Found' : 'No Citation'}
                    </span>
                    {selectedCitation.position && getPositionBadge(selectedCitation.position)}
                  </div>
                </div>

                {/* Query Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
                    <p className="text-gray-900">{selectedCitation.query_text}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                    <p className="text-gray-900">{getAIModelLabel(selectedCitation.ai_model)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monitored At</label>
                    <p className="text-gray-900">{formatDate(selectedCitation.monitored_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <p className="text-gray-900">
                      {selectedCitation.position ? `#${selectedCitation.position}` : 'Not ranked'}
                    </p>
                  </div>
                </div>

                {/* Citation Context */}
                {selectedCitation.cited && selectedCitation.citation_context && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citation Context</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 leading-relaxed">
                        {selectedCitation.citation_context}
                      </p>
                    </div>
                  </div>
                )}

                {/* Analysis Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCitation.cited ? 'YES' : 'NO'}
                    </div>
                    <div className="text-sm text-blue-800">DirectDrive Mentioned</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCitation.position || 'N/A'}
                    </div>
                    <div className="text-sm text-green-800">Ranking Position</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCitation.citation_context ? 
                        Math.round((selectedCitation.citation_context.length / 100) * 10) / 10 : 0}
                    </div>
                    <div className="text-sm text-purple-800">Context Quality Score</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      // In a real implementation, this would open a modal or navigate to content creation
                      alert('Navigate to content optimization based on this citation analysis');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Optimize Content
                  </button>
                  <button
                    onClick={() => {
                      // In a real implementation, this would create a new monitoring task
                      alert('Add similar query variations to monitoring schedule');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Monitor Similar Queries
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">Select a citation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};