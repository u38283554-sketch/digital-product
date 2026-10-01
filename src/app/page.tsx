import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, Lock, ArrowRight, Layers, KeyRound } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">SuperDigital</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Phase 1
              </span>
            </div>
          </div>
          <nav>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              Admin Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero / System Status */}
      <section className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Phase 1 Infrastructure Ready
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Self-Hosted Digital Products Platform
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            The foundation for selling ebooks, templates, and digital assets in India.
            Equipped with Supabase PostgreSQL, Row-Level Security, secure storage buckets, and server-side RBAC.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              Access Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Phase 1 Deliverables Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Supabase Schema & RLS</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Complete PostgreSQL schema with 8 relational tables, updated_at triggers, and strict Row Level Security policies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Dual Storage Buckets</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Public <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">product-images</code> bucket and strictly private <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">product-pdfs</code> bucket preventing unauthorized downloads.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Server-Side RBAC Auth</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Admin authorization validated via Supabase Auth server session and cryptographic profile checks on the server.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <span>SuperDigital Platform &copy; 2026. Self-hosted digital product ecosystem.</span>
          <span className="font-mono text-slate-400">Phase 1: Architecture &amp; Foundation</span>
        </div>
      </footer>
    </main>
  );
}
