import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for Supabase Session Management.
 * 
 * Objectives:
 * 1. Refreshes expired Auth tokens automatically by syncing cookies between Request and Response.
 * 2. Provides preliminary redirect for unauthenticated users visiting /admin (excluding /admin/login).
 * 3. Note: The final authorization check is strictly performed server-side inside /admin/page.tsx
 *    to prevent bypass if middleware is skipped or mocked.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie: { name: string; value: string }) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Calling getUser() refreshes the session token if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAccessingAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Fast redirect if visiting protected admin pages while unauthenticated
  if (isAccessingAdmin && !isLoginPage && !user) {
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If already authenticated and visiting /admin/login, redirect to /admin
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (assets, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
