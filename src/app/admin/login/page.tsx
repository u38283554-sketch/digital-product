'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLoginForm } from '@/components/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      <div className="max-w-6xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-12">
        <AdminLoginForm />
      </div>

      <div className="text-center text-xs text-slate-400 py-4">
        SuperDigital Security Architecture &bull; Phase 1
      </div>
    </div>
  );
}
