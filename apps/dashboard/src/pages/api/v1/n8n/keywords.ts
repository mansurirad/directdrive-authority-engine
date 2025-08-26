/**
 * GET/POST /api/v1/n8n/keywords
 * Handle keyword operations for n8n workflows
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schemas
const CreateKeywordSchema = z.object({
  industry: z.string().default('logistics'),
  language: z.string(),
  primary_keyword: z.string().min(1).max(200),
  secondary_keywords: z.array(z.string()).optional(),
  intent: z.enum(['informational', 'commercial', 'transactional', 'navigational']),
  region: z.string().optional(),
  priority: z.number().min(1).max(10).default(5),
  status: z.enum(['pending', 'active', 'completed', 'archived']).default('pending'),
});


const QuerySchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'archived']).optional(),
  industry: z.string().optional(),
  language: z.string().optional(),
  priority: z.coerce.number().min(1).max(10).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// API Key validation
const N8N_API_KEY = process.env.N8N_WEBHOOK_SECRET;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface KeywordResponse {
  keywords?: Array<{
    id: number;
    industry: string;
    language: string;
    primary_keyword: string;
    secondary_keywords: string[] | null;
    intent: string;
    region: string | null;
    priority: number | null;
    status: string | null;
    created_at: string;
    updated_at: string;
  }>;
  keyword?: {
    id: number;
    primary_keyword: string;
    status: string;
    created_at: string;
  };
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KeywordResponse | { error: string }>
) {
  // Validate API key for n8n access
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${N8N_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetKeywords(req, res);
    case 'POST':
      return handleCreateKeyword(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetKeywords(
  req: NextApiRequest,
  res: NextApiResponse<KeywordResponse | { error: string }>
) {
  try {
    // Validate query parameters
    const queryParams = QuerySchema.parse(req.query);

    // Build query
    let query = supabase
      .from('keywords')
      .select('*')
      .limit(queryParams.limit);

    // Apply filters
    if (queryParams.status) {
      query = query.eq('status', queryParams.status);
    }
    if (queryParams.industry) {
      query = query.eq('industry', queryParams.industry);
    }
    if (queryParams.language) {
      query = query.eq('language', queryParams.language);
    }
    if (queryParams.priority) {
      query = query.eq('priority', queryParams.priority);
    }

    // Order by priority and creation date
    query = query.order('priority', { ascending: false });
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Keywords fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch keywords' });
    }

    return res.status(200).json({
      keywords: data,
      success: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters: ' + error.errors.map(e => e.message).join(', '),
      });
    }

    console.error('Keywords GET error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function handleCreateKeyword(
  req: NextApiRequest,
  res: NextApiResponse<KeywordResponse | { error: string }>
) {
  try {
    // Validate request body
    const validatedData = CreateKeywordSchema.parse(req.body);

    // Insert keyword record
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        industry: validatedData.industry,
        language: validatedData.language,
        primary_keyword: validatedData.primary_keyword,
        secondary_keywords: validatedData.secondary_keywords,
        intent: validatedData.intent,
        region: validatedData.region,
        priority: validatedData.priority,
        status: validatedData.status,
      })
      .select('id, primary_keyword, status, created_at')
      .single();

    if (error) {
      console.error('Keyword creation error:', error);
      return res.status(500).json({ error: 'Failed to create keyword' });
    }

    return res.status(201).json({
      keyword: data,
      success: true,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data: ' + error.errors.map(e => e.message).join(', '),
      });
    }

    console.error('Keyword creation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}