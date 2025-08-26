/**
 * Content Queue - Admin Panel
 * Display generated content for review and approval
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ContentPiece {
  id: number;
  title: string;
  content: string;
  industry: string;
  language: string;
  ai_model: string;
  quality_score: number | null;
  status: string;
  created_at: string;
  keyword?: {
    primary_keyword: string;
    intent: string;
    priority: number;
  };
  performance_score: number | null;
  verification_status: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800',
};

const verificationColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  not_found: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
  not_applicable: 'bg-gray-100 text-gray-800',
};

export default function ContentQueue() {
  const router = useRouter();
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }
      queryParams.append('limit', '20');

      const response = await fetch(`/api/v1/content?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const data = await response.json();
      setContent(data.content || []);

    } catch (err) {
      console.error('Content fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number | null) => {
    if (!score) return '—';
    if (score >= 90) return '✓';
    if (score >= 75) return '⚠️';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Queue</h1>
        <p className="text-gray-600 mt-2">
          Review generated content and manage publication workflow
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Content</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <span className="text-sm text-gray-500">
            {content.length} items
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchContent}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={() => router.push('/dashboard/keywords/add')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Keywords
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Add some keywords to generate content' 
                : `No content with status "${filter}"`
              }
            </p>
            <button
              onClick={() => router.push('/dashboard/keywords/add')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Keywords
            </button>
          </div>
        ) : (
          content.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    
                    {item.keyword && (
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.keyword.primary_keyword}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.keyword.intent} • Priority: {item.keyword.priority}
                        </span>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4">
                      {truncateContent(item.content.replace(/<[^>]*>/g, ''))}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 ml-6">
                    {/* Quality Score */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(item.quality_score)}`}>
                        {item.quality_score ? Math.round(item.quality_score) : '—'}
                      </div>
                      <div className="text-xs text-gray-500">Quality</div>
                    </div>

                    {/* Performance Score */}
                    <div className="text-center">
                      <div className={`text-2xl ${getScoreColor(item.performance_score)}`}>
                        {getScoreIcon(item.performance_score)}
                      </div>
                      <div className="text-xs text-gray-500">Performance</div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status as keyof typeof statusColors] || statusColors.draft}`}>
                      {item.status}
                    </span>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationColors[item.verification_status as keyof typeof verificationColors] || verificationColors.pending}`}>
                      {item.verification_status === 'not_applicable' ? 'draft' : item.verification_status}
                    </span>

                    <span className="text-xs text-gray-500">
                      {formatDate(item.created_at)} • {item.ai_model}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/content/review/${item.id}`)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Review
                    </button>
                    
                    {item.status === 'draft' && (
                      <button
                        onClick={() => {
                          // TODO: Implement quick approve
                          console.log('Quick approve:', item.id);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Quick Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {content.length >= 20 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // TODO: Implement pagination
              console.log('Load more content');
            }}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Load More Content
          </button>
        </div>
      )}
    </div>
  );
}