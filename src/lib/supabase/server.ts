import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { normalizeSupabaseUrl } from './client';
import type { Database } from '@/types';

/**
 * Creates a server-side Supabase client for Next.js App Router (Server Components, Route Handlers, Server Actions).
 * 
 * NOTE: Never expose SUPABASE_SECRET_KEY here. This client uses the authenticated user's session
 * extracted from cookies to enforce Row Level Security (RLS).
 */
export async function createServerComponentClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)'
    );
  }

  // Next.js dynamic cookies handling
  let cookieStore: any;
  try {
    const nextHeaders = await import('next/headers');
    cookieStore = await nextHeaders.cookies();
  } catch {
    // If running in generic server context (e.g. Express or tests)
    cookieStore = null;
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        if (!cookieStore) return [];
        return cookieStore.getAll().map((cookie: { name: string; value: string }) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
