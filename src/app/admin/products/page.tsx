import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth';
import { ProductListContainer } from '@/components/products/ProductListContainer';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminProductsPage() {
  let supabase;
  try {
    supabase = await createServerComponentClient();
  } catch (err) {
    redirect('/admin/login');
    return null;
  }

  const { isAdmin, user, profile } = await verifyAdminSession(supabase);

  if (!user) {
    redirect('/admin/login');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-rose-200 shadow-lg text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">
            Only administrators are authorized to access the Products management section.
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProductListContainer />
      </div>
    </div>
  );
}
