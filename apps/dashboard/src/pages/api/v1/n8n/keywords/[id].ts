/**
 * PUT /api/v1/n8n/keywords/[id]
 * Update keyword status for n8n workflows
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for keyword updates
const UpdateKeywordSchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'archived']).optional(),
  priority: z.number().min(1).max(10).optional(),
});

// API Key validation
const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface KeywordUpdateResponse {
  keyword: {
    id: number;
    primary_keyword: string;
    status: string;
    updated_at: string;
  };
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KeywordUpdateResponse | { error: string }>
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key for n8n access
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${N8N_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get keyword ID from query parameter
    const keywordId = req.query.id;
    if (!keywordId || Array.isArray(keywordId)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    // Validate request body
    const validatedData = UpdateKeywordSchema.parse(req.body);

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.priority) updateData.priority = validatedData.priority;

    // Update keyword record
    const { data, error } = await supabase
      .from('keywords')
      .update(updateData)
      .eq('id', parseInt(keywordId))
      .select('id, primary_keyword, status, updated_at')
      .single();

    if (error) {
      console.error('Keyword update error:', error);
      return res.status(500).json({ error: 'Failed to update keyword' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    return res.status(200).json({
      keyword: data,
      success: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data: ' + error.errors.map(e => e.message).join(', '),
      });
    }

    console.error('Keyword update error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}