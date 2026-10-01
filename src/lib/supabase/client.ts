import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

export const normalizeSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}.supabase.co`;
};

// Browser-safe environment variable resolution (supports Next.js and Vite)
export const getSupabaseUrl = (): string => {
  let url = '';
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) {
    url = (import.meta as any).env.VITE_SUPABASE_URL;
  }
  return normalizeSupabaseUrl(url);
};

export const getSupabaseAnonKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  // Vite client env fallback
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as any).env;
    if (env?.VITE_SUPABASE_ANON_KEY) return env.VITE_SUPABASE_ANON_KEY;
    if (env?.VITE_SUPABASE_PUBLISHABLE_KEY) return env.VITE_SUPABASE_PUBLISHABLE_KEY;
  }
  return '';
};

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Creates or returns the singleton Supabase browser client.
 * Safe to use in React client components.
 * Only accesses public/anon keys.
 */
export function createClientComponentClient(): SupabaseClient<Database> {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    // Return a dummy fallback or throw clear configuration notice
    console.warn(
      '[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Please configure .env.local.'
    );
  }

  if (browserClient) return browserClient;

  // Use createBrowserClient for cookie-based session synchronization in Next.js
  if (typeof window !== 'undefined') {
    try {
      browserClient = createBrowserClient<Database>(
        url || 'https://placeholder.supabase.co',
        anonKey || 'placeholder-key'
      );
      return browserClient;
    } catch {
      // Fallback to standard Supabase client if createBrowserClient fails
      browserClient = createClient<Database>(
        url || 'https://placeholder.supabase.co',
        anonKey || 'placeholder-key'
      );
      return browserClient;
    }
  }

  return createClient<Database>(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder-key'
  );
}

// Export default helper matching standard convention
export const supabase = createClientComponentClient();
