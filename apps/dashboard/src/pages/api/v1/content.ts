/**
 * /api/v1/content
 * Admin panel API for content management
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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
      return handleGetContent(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetContent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      status, 
      limit = 20, 
      offset = 0,
      language,
      industry = 'logistics'
    } = req.query;

    // Build query with keyword relationship
    let query = supabase
      .from('content_pieces')
      .select(`
        id,
        title,
        content,
        industry,
        language,
        ai_model,
        quality_score,
        status,
        created_at,
        performance_score,
        verification_status,
        published_url,
        keyword:keywords!content_pieces_keyword_id_fkey(
          id,
          primary_keyword,
          intent,
          priority
        )
      `)
      .eq('industry', industry)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Content fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch content' });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('content_pieces')
      .select('id', { count: 'exact', head: true })
      .eq('industry', industry);

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (language) {
      countQuery = countQuery.eq('language', language);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.warn('Count query error:', countError);
    }

    return res.status(200).json({
      content: data || [],
      total: count || 0,
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
      success: true,
    });

  } catch (error) {
    console.error('Content GET error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}