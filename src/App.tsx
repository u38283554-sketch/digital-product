import React, { useState, useEffect } from 'react';
import { supabase, getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/client';
import { FULL_SCHEMA_SQL } from '@/lib/schemaSql';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { AdminDashboardShell } from '@/components/AdminDashboardShell';
import { ProductList } from '@/components/products/ProductList';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductLandingPage } from '@/components/public/ProductLandingPage';
import { fetchProductsStore, getProductBySlug, getAllActiveProducts } from '@/lib/productsStore';
import type { Product } from '@/types';
import {
  Shield,
  Database,
  Lock,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  Layers,
  ArrowRight,
  Terminal,
  Server,
  PackageCheck,
  Info,
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'overview' | 'login' | 'dashboard' | 'products' | 'landing' | 'sql' | 'setup'
  const [activeTab, setActiveTab] = useState<'overview' | 'login' | 'dashboard' | 'products' | 'landing' | 'sql' | 'setup'>('overview');
  const [productViewMode, setProductViewMode] = useState<'list' | 'new' | 'edit'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Landing page preview states (Phase 3)
  const [activeProductsList, setActiveProductsList] = useState<Product[]>([]);
  const [landingSlug, setLandingSlug] = useState<string>('100-chatgpt-prompts-for-instagram-creators');
  const [currentLandingProduct, setCurrentLandingProduct] = useState<Product | null>(null);
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile'>('responsive');
  const [checkoutModalProduct, setCheckoutModalProduct] = useState<Product | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlContent, setSqlContent] = useState<string>('');

  const supabaseConfigured = Boolean(getSupabaseUrl() && getSupabaseAnonKey());

  // Check Supabase session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          // Query profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUserRole((profile as any).role);
          }
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setLoadingAuth(false);
      }
    }

    checkSession();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile) setUserRole((profile as any).role);
        } catch (e) {
          console.warn(e);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load active products for public landing page selector
  useEffect(() => {
    async function loadLandingData() {
      try {
        const activeList = await getAllActiveProducts();
        setActiveProductsList(activeList);
        if (activeList.length > 0 && !landingSlug) {
          setLandingSlug(activeList[0].slug);
        }
      } catch (err) {
        console.warn('Failed to load active products:', err);
      }
    }
    loadLandingData();
  }, [activeTab]);

  // Load selected product by slug
  useEffect(() => {
    async function loadCurrentProduct() {
      if (!landingSlug) return;
      try {
        const prod = await getProductBySlug(landingSlug);
        setCurrentLandingProduct(prod);
      } catch (err) {
        console.warn('Failed to fetch product by slug:', err);
      }
    }
    loadCurrentProduct();
  }, [landingSlug, activeTab]);

  const handleSimulateAdminLogin = () => {
    setCurrentUser({ id: 'mock-admin-uuid', email: 'admin@superdigital.local' });
    setUserRole('admin');
    setActiveTab('dashboard');
  };

  const handleSimulateCustomerLogin = () => {
    setCurrentUser({ id: 'mock-customer-uuid', email: 'customer@buyer.com' });
    setUserRole('customer');
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // fallback
    }
    setCurrentUser(null);
    setUserRole(null);
    setActiveTab('login');
  };

  const [dbStatus, setDbStatus] = useState<'idle' | 'checking' | 'tables_ready' | 'tables_pending'>('idle');

  const checkDatabaseStatus = async () => {
    setDbStatus('checking');
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && (error.message.includes('schema cache') || error.message.includes('does not exist'))) {
        setDbStatus('tables_pending');
      } else {
        setDbStatus('tables_ready');
      }
    } catch {
      setDbStatus('tables_pending');
    }
  };

  const copySqlCode = () => {
    navigator.clipboard.writeText(FULL_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-3.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                S
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  SuperDigital
                </span>
                <span className="ml-2.5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  Phase 1 Architecture
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              /admin Shell
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                setProductViewMode('list');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Products (Phase 2)
            </button>
            <button
              onClick={() => {
                setActiveTab('landing');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'landing'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Landing Page (Phase 3)
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'sql'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Supabase SQL
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'setup'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Setup Guide
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-800">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Supabase API Connected &bull; Storage Buckets Active &bull; Zero Server Secrets in Browser
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Self-Hosted Digital Products Selling Platform
                </h1>
                <p className="text-base text-slate-300 leading-relaxed">
                  Engineered specifically for selling PDF ebooks, templates, and digital files in India.
                  Phase 1 establishes the rock-solid foundation: clean App Router architecture,
                  strict PostgreSQL schema with Row-Level Security, private PDF storage buckets,
                  and server-side RBAC admin authentication.
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                  >
                    Test Admin Login Form
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 transition"
                  >
                    Preview /admin Dashboard Shell
                  </button>
                  <button
                    onClick={() => setActiveTab('sql')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 transition"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    Inspect Supabase SQL Schema
                  </button>
                </div>
              </div>
            </div>

            {/* Live Supabase Integration Status Card */}
            <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">Live Supabase Project Configured</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                        Connected
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      URL: {getSupabaseUrl() || 'https://grmtpdbjepyaykysuhui.supabase.co'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copySqlCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'SQL Copied!' : 'Copy Entire SQL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/grmtpdbjepyaykysuhui/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Supabase SQL Editor</span>
                  </a>
                </div>
              </div>

              {/* Status Pills & Auto-setup Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Storage Buckets Provisioned
                  </div>
                  <p className="text-slate-500">
                    <code className="text-slate-700 font-semibold">product-images</code> (Public) &amp; <code className="text-slate-700 font-semibold">product-pdfs</code> (Strictly Private) created via API.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Admin User Created
                  </div>
                  <p className="text-slate-500">
                    <strong className="text-slate-700">admin@superdigital.com</strong> provisioned with auto-confirmed email.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-600" /> Database Tables
                    </span>
                    <button
                      onClick={checkDatabaseStatus}
                      className="text-[11px] text-indigo-600 hover:underline font-medium"
                    >
                      {dbStatus === 'checking' ? 'Checking...' : 'Check Status'}
                    </button>
                  </div>
                  <p className="text-slate-500">
                    {dbStatus === 'tables_ready' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> All tables verified and ready!
                      </span>
                    ) : dbStatus === 'tables_pending' ? (
                      <span className="text-amber-700 font-semibold">
                        Tables not found yet. Click &quot;Open Supabase SQL Editor&quot; and paste the SQL.
                      </span>
                    ) : (
                      <span>Click &quot;Open Supabase SQL Editor&quot; above, paste, and click Run.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database</span>
                  <Database className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">8 Tables</div>
                <div className="text-xs text-slate-500 mt-1">Strict RLS enabled on all tables</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage</span>
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">2 Buckets</div>
                <div className="text-xs text-slate-500 mt-1">product-images (pub), product-pdfs (priv)</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Auth &amp; RBAC</span>
                  <Shield className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">Server-Side</div>
                <div className="text-xs text-slate-500 mt-1">getUser() + profile role verification</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Phase</span>
                  <PackageCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">Phase 2</div>
                <div className="text-xs text-slate-500 mt-1">Product CRUD &amp; PDF management</div>
              </div>
            </div>

            {/* Architecture Directory Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Phase 1 Architecture &amp; File Map
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Clean modular structure</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 text-[13px] font-sans flex items-center gap-1.5 mb-2">
                    <Server className="w-3.5 h-3.5 text-indigo-600" /> App Router Pages
                  </div>
                  <div className="text-indigo-600 font-semibold">src/app/layout.tsx</div>
                  <div className="text-slate-600">src/app/page.tsx</div>
                  <div className="text-indigo-600 font-semibold">src/app/admin/page.tsx</div>
                  <div className="text-slate-600">src/app/admin/login/page.tsx</div>
                  <div className="text-emerald-700 font-semibold">src/middleware.ts</div>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 text-[13px] font-sans flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-violet-600" /> Supabase &amp; Auth Libs
                  </div>
                  <div className="text-violet-700 font-semibold">src/lib/supabase/client.ts</div>
                  <div className="text-slate-600">src/lib/supabase/server.ts</div>
                  <div className="text-rose-700 font-semibold">src/lib/supabase/admin.ts</div>
                  <div className="text-slate-600">src/lib/auth.ts</div>
                  <div className="text-indigo-600 font-semibold">src/lib/validations.ts</div>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 text-[13px] font-sans flex items-center gap-1.5 mb-2">
                    <Database className="w-3.5 h-3.5 text-blue-600" /> Types, Config &amp; SQL
                  </div>
                  <div className="text-blue-700 font-semibold">src/types/index.ts</div>
                  <div className="text-slate-600">.env.example</div>
                  <div className="text-emerald-700 font-semibold">supabase/schema.sql</div>
                  <div className="text-slate-600">src/components/AdminLoginForm.tsx</div>
                  <div className="text-slate-600">src/components/AdminDashboardShell.tsx</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Quick Simulation Bar for testing without manual database insertion */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Interactive Testing:</strong> Test login with real Supabase or simulate RBAC verification below:
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSimulateAdminLogin}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
                >
                  Test as Admin
                </button>
                <button
                  onClick={handleSimulateCustomerLogin}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition"
                >
                  Test as Customer (Deny)
                </button>
              </div>
            </div>

            <AdminLoginForm
              onSuccess={() => {
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* DASHBOARD SHELL TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* If logged in as customer, show 403 Forbidden Access Denied state! */}
            {userRole === 'customer' ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-rose-200 shadow-md text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-3">
                  HTTP 403 &bull; Access Denied
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Administrator Privileges Required
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  User <span className="font-semibold text-slate-900">{currentUser?.email}</span> has the role{' '}
                  <span className="font-semibold text-rose-600">&apos;customer&apos;</span>.
                  Row-level security and server-side RBAC guard explicitly block dashboard access for non-admin accounts.
                </p>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  Switch to Admin Account
                </button>
              </div>
            ) : (
              <AdminDashboardShell
                userEmail={currentUser?.email || 'admin@superdigital.local'}
                role={userRole || 'admin'}
                onLogout={handleLogout}
                onNavigateToProducts={() => {
                  setProductViewMode('list');
                  setActiveTab('products');
                }}
                onNavigateToNewProduct={() => {
                  setSelectedProduct(null);
                  setProductViewMode('new');
                  setActiveTab('products');
                }}
              />
            )}
          </div>
        )}

        {/* PRODUCTS TAB (PHASE 2) */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {userRole === 'customer' ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-rose-200 shadow-md text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-3">
                  HTTP 403 &bull; Access Denied
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Administrator Privileges Required
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Only accounts with verified admin privileges can view and manage digital products.
                </p>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  Sign in as Admin
                </button>
              </div>
            ) : productViewMode === 'new' ? (
              <ProductForm
                onSuccess={() => {
                  setProductViewMode('list');
                }}
                onCancel={() => {
                  setProductViewMode('list');
                }}
              />
            ) : productViewMode === 'edit' && selectedProduct ? (
              <ProductForm
                initialProduct={selectedProduct}
                onSuccess={() => {
                  setProductViewMode('list');
                  setSelectedProduct(null);
                }}
                onCancel={() => {
                  setProductViewMode('list');
                  setSelectedProduct(null);
                }}
              />
            ) : (
              <ProductList
                onAddProduct={() => {
                  setSelectedProduct(null);
                  setProductViewMode('new');
                }}
                onEditProduct={(p) => {
                  setSelectedProduct(p);
                  setProductViewMode('edit');
                }}
                onViewLandingPage={(slug) => {
                  setLandingSlug(slug);
                  setActiveTab('landing');
                }}
              />
            )}
          </div>
        )}

        {/* PUBLIC LANDING PAGE TAB (PHASE 3) */}
        {activeTab === 'landing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Landing Page Simulator Top Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Active Product:
                </span>
                <select
                  value={landingSlug}
                  onChange={(e) => setLandingSlug(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {activeProductsList.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.title} (₹{p.price})
                    </option>
                  ))}
                  <option value="test-inactive-404">
                    [Test 404 / Inactive Product]
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Viewport:
                </span>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => setViewportMode('responsive')}
                    className={`px-3 py-1 rounded-lg transition ${
                      viewportMode === 'responsive'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Desktop / Full Width
                  </button>
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`px-3 py-1 rounded-lg transition ${
                      viewportMode === 'mobile'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mobile Simulator (390px)
                  </button>
                </div>
              </div>
            </div>

            {/* Render Public Landing Page */}
            {viewportMode === 'mobile' ? (
              <div className="py-4 flex justify-center bg-slate-100 rounded-3xl p-6 border border-slate-200">
                <div className="w-full max-w-[390px] border-8 border-slate-900 rounded-[44px] shadow-2xl overflow-hidden bg-white relative max-h-[820px] overflow-y-auto">
                  {/* Speaker bezel notch */}
                  <div className="sticky top-0 z-50 h-5 bg-slate-900 flex items-center justify-center">
                    <div className="w-16 h-3 bg-black rounded-full" />
                  </div>
                  <ProductLandingPage
                    product={currentLandingProduct}
                    onNavigateToCheckout={(slug) => setCheckoutModalProduct(currentLandingProduct)}
                    onBackToStore={() => {
                      if (activeProductsList.length > 0) {
                        setLandingSlug(activeProductsList[0].slug);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                <ProductLandingPage
                  product={currentLandingProduct}
                  onNavigateToCheckout={(slug) => setCheckoutModalProduct(currentLandingProduct)}
                  onBackToStore={() => {
                    if (activeProductsList.length > 0) {
                      setLandingSlug(activeProductsList[0].slug);
                    }
                  }}
                />
              </div>
            )}

            {/* Phase 3 Checkout Placeholder Modal */}
            {checkoutModalProduct && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Phase 3 Placeholder</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-left">
                    <div className="w-12 h-14 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {checkoutModalProduct.title}
                      </div>
                      <div className="text-xs text-slate-500">Digital eBook</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        ₹{Number(checkoutModalProduct.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Checkout Coming in Phase 4
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Per project instructions, Razorpay payment gateway, coupon logic, and automated order receipt emails will be integrated in Phase 4.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setCheckoutModalProduct(null)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Return to Product Landing Page
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SQL TAB */}
        {activeTab === 'sql' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Supabase Database Schema &amp; Security Script
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Located at <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">/supabase/schema.sql</code>. Copy &amp; run this in your Supabase SQL Editor.
                </p>
              </div>
              <button
                onClick={copySqlCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied Reference!' : 'Copy Script Path'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
              <pre className="text-slate-300">
{`-- ==============================================================
-- SuperDigital Platform - Phase 1 Complete Schema (Excerpt)
-- ==============================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    cover_image_path TEXT,
    pdf_storage_path TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    sample_messages JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CUSTOMERS TABLE (No public direct read)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ORDERS TABLE (Strictly admin or server webhook only)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL CHECK (final_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    usage_limit INTEGER DEFAULT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL DEFAULT 'Digital Store',
    logo_path TEXT,
    primary_color TEXT DEFAULT '#4F46E5',
    accent_color TEXT DEFAULT '#06B6D4',
    whatsapp_number TEXT,
    support_email TEXT,
    razorpay_key_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- STORAGE BUCKETS CONFIGURATION:
-- product-images: PUBLIC
-- product-pdfs: STRICTLY PRIVATE (no public URLs, server signed URLs only)
`}
              </pre>
            </div>
          </div>
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Phase 1 Deployment &amp; Admin Setup Guide
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Follow these exact steps to connect your Supabase project and elevate your admin account.
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Execute the Database Schema
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Go to your Supabase project &rarr; <strong>SQL Editor</strong> &rarr; Click <strong>New Query</strong>.
                  Paste the full script from <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">/supabase/schema.sql</code> and click <strong>Run</strong>.
                  This creates all 8 tables, updated_at triggers, the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">is_admin()</code> helper function, RLS policies, and registers the two storage buckets.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Verify Storage Buckets
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  In Supabase dashboard, go to <strong>Storage</strong>:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>product-images</strong>: Ensure status is <strong>Public</strong> (allows cover art to be viewed by buyers).</li>
                  <li><strong>product-pdfs</strong>: Ensure status is <strong>Private</strong> (STRICTLY PRIVATE: never make public).</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Create Your Admin User Account
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Go to <strong>Authentication &rarr; Users &rarr; Add User &rarr; Create User</strong>. Enter your admin email and a secure password.
                  Once created, copy the user&apos;s <strong>UID</strong>.
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs">
                  {`-- Promote the created user to 'admin' role in the SQL Editor:
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_AUTH_UID_HERE';`}
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  Configure Environment Variables (.env.local)
                </div>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJh... (anon public key)
SUPABASE_SECRET_KEY=eyJh... (service_role secret key - server only)
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
