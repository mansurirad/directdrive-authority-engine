/**
 * Keywords Input Form - Admin Panel
 * Replaces Google Sheets manual keyword entry
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';

// Validation schema matching n8n API
const KeywordSchema = z.object({
  industry: z.string().default('logistics'),
  language: z.enum(['en', 'ar', 'ku', 'fa']),
  primary_keyword: z.string().min(3).max(200),
  secondary_keywords: z.array(z.string()).optional(),
  intent: z.enum(['informational', 'commercial', 'transactional', 'navigational']),
  region: z.string().optional(),
  priority: z.number().min(1).max(10),
  status: z.enum(['pending', 'active']).default('pending'),
});

type KeywordFormData = z.infer<typeof KeywordSchema>;

export default function AddKeywords() {
  const router = useRouter();
  const [formData, setFormData] = useState<KeywordFormData>({
    industry: 'logistics',
    language: 'en',
    primary_keyword: '',
    secondary_keywords: [],
    intent: 'informational',
    region: 'Kurdistan',
    priority: 5,
    status: 'pending',
  });
  const [secondaryKeywordsText, setSecondaryKeywordsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleInputChange = (field: keyof KeywordFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage(null);
  };

  const handleSecondaryKeywordsChange = (value: string) => {
    setSecondaryKeywordsText(value);
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    handleInputChange('secondary_keywords', keywords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validate form data
      const validatedData = KeywordSchema.parse(formData);

      // Submit to API
      const response = await fetch('/api/v1/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create keyword');
      }

      const result = await response.json();
      
      setMessage({
        type: 'success',
        text: `Keyword "${validatedData.primary_keyword}" added successfully! ID: ${result.keyword.id}`
      });

      // Reset form
      setFormData({
        industry: 'logistics',
        language: 'en',
        primary_keyword: '',
        secondary_keywords: [],
        intent: 'informational',
        region: 'Kurdistan',
        priority: 5,
        status: 'pending',
      });
      setSecondaryKeywordsText('');

    } catch (error) {
      console.error('Keyword submission error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add keyword'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Keywords</h1>
          <p className="text-gray-600 mt-2">
            Replace Google Sheets with professional keyword management
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Keyword */}
          <div>
            <label htmlFor="primary_keyword" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Keyword *
            </label>
            <input
              type="text"
              id="primary_keyword"
              value={formData.primary_keyword}
              onChange={(e) => handleInputChange('primary_keyword', e.target.value)}
              placeholder="e.g. best logistics company Kurdistan"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Secondary Keywords */}
          <div>
            <label htmlFor="secondary_keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Keywords (comma-separated)
            </label>
            <input
              type="text"
              id="secondary_keywords"
              value={secondaryKeywordsText}
              onChange={(e) => handleSecondaryKeywordsChange(e.target.value)}
              placeholder="e.g. freight services, supply chain, cargo transport"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="ku">Kurdish</option>
                <option value="fa">Farsi</option>
              </select>
            </div>

            {/* Intent */}
            <div>
              <label htmlFor="intent" className="block text-sm font-medium text-gray-700 mb-2">
                Search Intent *
              </label>
              <select
                id="intent"
                value={formData.intent}
                onChange={(e) => handleInputChange('intent', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="informational">Informational</option>
                <option value="commercial">Commercial</option>
                <option value="transactional">Transactional</option>
                <option value="navigational">Navigational</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority (1-10) *
              </label>
              <input
                type="number"
                id="priority"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Higher numbers = higher priority</p>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                id="region"
                value={formData.region || ''}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Kurdistan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Industry (Read-only for DirectDrive) */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              value={formData.industry}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Keyword'}
            </button>
          </div>
        </form>

        {/* Information Panel */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Keywords are added to the database with "pending" status</li>
            <li>• n8n workflow will automatically pick up pending keywords</li>
            <li>• Content will be generated and saved to the database</li>
            <li>• Generated content appears in the Content Queue for review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}