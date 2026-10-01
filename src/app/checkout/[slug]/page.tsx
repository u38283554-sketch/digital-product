import React from 'react';
import { getProductBySlug } from '@/lib/productsStore';
import { getCoverImageUrl } from '@/lib/products';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPlaceholderPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const formattedPrice = product
    ? `₹${Number(product.price).toLocaleString('en-IN')}`
    : '₹499';
  const coverUrl = product ? getCoverImageUrl(product.cover_image_path) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
        {/* Placeholder Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Phase 3 Placeholder</span>
        </div>

        {/* Product Card Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-left">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={product?.title || 'Product'}
              className="w-14 h-18 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-slate-900 truncate">
              {product?.title || 'Digital Product'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Instant PDF eBook Edition
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {formattedPrice}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">
            Checkout Coming in Phase 4
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Razorpay payment gateway, coupon redemption, and automated customer order creation will be integrated in Phase 4.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 text-left space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Phase 3 Status: Landing Page Verified</span>
          </div>
          <div className="text-[11px] text-indigo-700">
            The public high-converting landing page at <code>/product/{slug}</code> is fully functioning and dynamically connected.
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <a
            href={`/product/${slug}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Product Landing Page</span>
          </a>
        </div>
      </div>
    </div>
  );
}
