/**
 * /api/v1/keywords
 * Admin panel API for keyword management (separate from n8n endpoints)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema
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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

async function handleGetKeywords(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, limit = 50 } = req.query;

    let query = supabase
      .from('keywords')
      .select('*')
      .limit(parseInt(limit as string));

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('priority', { ascending: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Keywords fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch keywords' });
    }

    return res.status(200).json({
      keywords: data,
      total: data.length,
      success: true,
    });

  } catch (error) {
    console.error('Keywords GET error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreateKeyword(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const validatedData = KeywordSchema.parse(req.body);

    // Insert keyword
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
      .select('id, primary_keyword, status, priority, created_at')
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
        error: 'Validation error: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }

    console.error('Keyword creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}