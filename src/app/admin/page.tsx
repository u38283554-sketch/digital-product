import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth';
import { AdminDashboardShell } from '@/components/AdminDashboardShell';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * /admin - Protected Server Component
 *
 * Security Requirements Enforced:
 * 1. Server-side session verification via Supabase Auth server (getUser()).
 * 2. Database query to `profiles` table to verify role === 'admin'.
 * 3. Client cookies/localStorage/role variables are never trusted.
 * 4. Automatic redirect to /admin/login if unauthenticated.
 * 5. Explicit 403 Forbidden UI if authenticated but non-admin.
 */
export default async function AdminPage() {
  let supabase;
  try {
    supabase = await createServerComponentClient();
  } catch (err) {
    // If environment variables are missing during initial deployment
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Configuration Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            Supabase environment variables are missing or incomplete. Please configure{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const { isAdmin, user, profile, error } = await verifyAdminSession(supabase);

  // 1. Unauthenticated -> redirect to /admin/login
  if (!user) {
    redirect('/admin/login');
    return null;
  }

  // 2. Authenticated but non-admin -> 403 Forbidden
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-rose-200 shadow-lg shadow-rose-100/50 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-3">
            HTTP 403 &bull; Access Denied
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Privileges Required</h2>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            You are logged in as <span className="font-semibold text-slate-800">{user?.email}</span> with the role{' '}
            <span className="font-semibold text-rose-600">&apos;{profile?.role || 'customer'}&apos;</span>. Only accounts with the verified{' '}
            <span className="font-semibold text-slate-900">&apos;admin&apos;</span> role in the database can access this dashboard.
          </p>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Sign in with another account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin -> render dashboard shell
  return (
    <AdminDashboardShell
      userEmail={user.email || 'admin@superdigital.local'}
      role={profile?.role || 'admin'}
    />
  );
}
