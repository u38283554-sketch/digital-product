import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Shield,
  LogOut,
  Database,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardShellProps {
  userEmail?: string;
  role?: string;
  onLogout?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToNewProduct?: () => void;
}

export const AdminDashboardShell: React.FC<AdminDashboardShellProps> = ({
  userEmail = 'admin@superdigital.local',
  role = 'admin',
  onLogout,
  onNavigateToProducts,
  onNavigateToNewProduct,
}) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  React.useEffect(() => {
    async function loadCount() {
      try {
        const { count, error } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true });
        if (!error && count !== null) {
          setProductCount(count);
        }
      } catch {
        // ignore
      }
    }
    loadCount();
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      if (onLogout) {
        onLogout();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      console.error('Error signing out:', err);
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              D
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight">Digital Store</div>
              <div className="text-xs text-slate-500 font-medium">Admin Dashboard &bull; Phase 2</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToProducts && (
              <button
                onClick={onNavigateToProducts}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Manage Products</span>
              </button>
            )}

            {/* Authenticated Admin Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs text-slate-700 font-medium">
                <span className="text-slate-400 font-normal">Logged as:</span> {userEmail}
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-md">
                {role}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
              <Shield className="w-3.5 h-3.5 text-indigo-300" />
              Role Verified: Administrator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Digital Store Admin Dashboard
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Phase 1 foundation is operational. The database schema, Row Level Security, Supabase
              Auth, and storage buckets are configured. Product CRUD, Indian checkout, and downloads
              will be wired in subsequent phases.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-right">
              <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">
                Access Level
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5 justify-end">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Full Admin
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Required Cards: Products, Orders, Revenue */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Store Metrics Shell
            </h2>
            <span className="text-xs text-slate-400 italic">
              Live statistics populate in Phase 7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Products Card */}
            <div
              onClick={() => onNavigateToProducts && onNavigateToProducts()}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Products
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {productCount !== null ? productCount : '0'}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-indigo-600 font-semibold group-hover:underline">
                  Manage Products &rarr;
                </span>
                {onNavigateToNewProduct && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToNewProduct();
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-md font-medium"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">0</div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                Payment gateway skipped (ready for next phase)
              </p>
            </div>

            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">₹0.00</div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                Checkout integration will activate revenue
              </p>
            </div>
          </div>
        </section>

        {/* Phase 1 Infrastructure Checklist */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Phase 1 Security &amp; Storage Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enforcing production constraints before enabling product creation
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
              Architecture Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">8 Database Tables &amp; RLS</div>
                <p className="text-xs text-slate-500 mt-1">
                  Tables: <code className="text-slate-700">products</code>, <code className="text-slate-700">orders</code>, <code className="text-slate-700">customers</code>, <code className="text-slate-700">coupons</code>, <code className="text-slate-700">downloads</code>, <code className="text-slate-700">settings</code>, <code className="text-slate-700">pages</code>, <code className="text-slate-700">profiles</code>. Public access strictly blocked on sensitive tables.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <FolderLock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Storage Buckets Configured</div>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-800">product-images</span> (Public for banners/covers) and <span className="font-semibold text-slate-800">product-pdfs</span> (Strictly Private; downloads via server-signed URLs).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Server-Side RBAC Guard</div>
                <p className="text-xs text-slate-500 mt-1">
                  Client-side storage/cookies are not trusted. Access requires validated cryptographic Auth session and <code className="text-slate-700">role = &apos;admin&apos;</code> in the database.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="p-2 rounded-lg bg-violet-100 text-violet-700 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Zero Secret Leakage</div>
                <p className="text-xs text-slate-500 mt-1">
                  <code className="text-slate-700">SUPABASE_SECRET_KEY</code>, Razorpay secrets, and Resend keys are isolated to server environments and blocked from browser bundles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <span>Digital Store Admin Shell &bull; Phase 1</span>
          <span>Awaiting user command &quot;NEXT&quot; for Phase 2 (Product CRUD)</span>
        </div>
      </footer>
    </div>
  );
};
