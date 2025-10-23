import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key for server-side operations
 * This client bypasses Row Level Security (RLS) policies
 * ONLY use this in API routes, never expose to the client
 */

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - this is required for server-side database updates');
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
