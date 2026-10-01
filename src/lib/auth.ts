import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, Profile, UserRole } from '@/types';

export interface AdminVerificationResult {
  isAdmin: boolean;
  user: User | null;
  profile: Profile | null;
  error?: string;
}

/**
 * Server-side verification for Admin Authorization.
 *
 * Enforces security constraints:
 * 1. Calls supabase.auth.getUser() to cryptographically validate the JWT against Supabase Auth servers (prevents forged JWTs).
 * 2. Checks the database `profiles` table to verify role === 'admin'.
 * 3. Never trusts client-side storage, cookie claims, or localStorage.
 */
export async function verifyAdminSession(
  supabase: SupabaseClient<Database>
): Promise<AdminVerificationResult> {
  try {
    // 1. Get authenticated user securely from server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isAdmin: false,
        user: null,
        profile: null,
        error: userError?.message || 'Unauthenticated: No active session',
      };
    }

    // 2. Fetch profile from database to verify role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        isAdmin: false,
        user,
        profile: null,
        error: 'Profile not found. Access denied.',
      };
    }

    // 3. Verify role is specifically 'admin'
    const isAdmin = (profile as any)?.role === 'admin';

    return {
      isAdmin,
      user,
      profile: profile as Profile,
      error: isAdmin ? undefined : 'Forbidden: Insufficient privileges. Admin role required.',
    };
  } catch (err: any) {
    return {
      isAdmin: false,
      user: null,
      profile: null,
      error: err?.message || 'Unexpected error during admin verification',
    };
  }
}

/**
 * Utility to verify if any role matches
 */
export function hasRole(profile: Profile | null, requiredRole: UserRole): boolean {
  return profile?.role === requiredRole;
}
