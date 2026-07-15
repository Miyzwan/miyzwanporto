import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
}

/**
 * Public Supabase client (uses anon key – Row Level Security enforced).
 * Safe for use in browser components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Service-role Supabase client (bypasses RLS).
 * Only use in server-side code (API routes, server actions, etc.).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
