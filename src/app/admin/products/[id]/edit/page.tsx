import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth';
import { EditProductContainer } from '@/components/products/EditProductContainer';
import { ShieldAlert, ArrowLeft, PackageX } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createServerComponentClient();
  } catch (err) {
    redirect('/admin/login');
    return null;
  }

  const { isAdmin, user } = await verifyAdminSession(supabase);

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
            Only administrators are authorized to edit products.
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

  // Fetch product data
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The product you requested does not exist or has been deleted.
          </p>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Products List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-8 px-6">
      <EditProductContainer product={product as Product} />
    </div>
  );
}
