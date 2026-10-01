import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './client';
import type { Database } from '@/types';

/**
 * Privileged Supabase Admin Client.
 *
 * CRITICAL SECURITY RULES:
 * 1. Uses SUPABASE_SECRET_KEY (Service Role Key) which bypasses Row Level Security (RLS).
 * 2. MUST NEVER be imported or used in Client Components or exposed to the browser.
 * 3. Use strictly for server-side operations (verifying webhook signatures, generating signed PDF download URLs, background administrative tasks).
 */

let adminInstance: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  // Hard guard: Prevent client-side execution
  if (typeof window !== 'undefined') {
    throw new Error(
      'SECURITY VIOLATION: Attempted to initialize Supabase Admin Client in client-side / browser context. This client must only be used in server environments.'
    );
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing server-side Supabase credentials: ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set in environment variables.'
    );
  }

  if (!adminInstance) {
    adminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminInstance;
}
