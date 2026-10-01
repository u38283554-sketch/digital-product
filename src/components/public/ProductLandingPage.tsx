'use client';

import React, { useState } from 'react';
import type { Product } from '@/types';
import { getCoverImageUrl } from '@/lib/products';
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
  FileText,
  Lock,
  Clock,
  BookOpen,
  Laptop,
  Check,
  PackageX,
  ArrowLeft,
  Share2,
} from 'lucide-react';

interface ProductLandingPageProps {
  product: Product | null;
  onNavigateToCheckout?: (slug: string) => void;
  onBackToStore?: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({
  product,
  onNavigateToCheckout,
  onBackToStore,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // If product is not found or inactive, show clean 404
  if (!product || !product.active) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <PackageX className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Product Not Found</h1>
            <p className="text-sm text-slate-500 mt-1">
              This digital product is currently inactive, unavailable, or does not exist.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                if (onBackToStore) {
                  onBackToStore();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coverUrl = getCoverImageUrl(product.cover_image_path);
  const formattedPrice = `₹${Number(product.price).toLocaleString('en-IN')}`;

  const handleBuyNow = () => {
    if (onNavigateToCheckout) {
      onNavigateToCheckout(product.slug);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/checkout/${product.slug}`;
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 sm:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              S
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">SuperDigital</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600" />
              Instant PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Share product link"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition text-xs flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-medium">
                {copiedLink ? 'Link Copied!' : 'Share'}
              </span>
            </button>
            <button
              onClick={handleBuyNow}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0"
            >
              Buy Now — {formattedPrice}
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Cover Image Column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100 group">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                    <BookOpen className="w-12 h-12 mb-3 text-indigo-300" />
                    <span className="font-bold text-base leading-snug">{product.title}</span>
                    <span className="text-xs text-indigo-300 mt-2 font-mono uppercase tracking-wider">
                      Digital Edition
                    </span>
                  </div>
                )}
                {/* Instant delivery pill */}
                <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Download className="w-3 h-3 text-emerald-400" />
                  PDF eBook
                </div>
              </div>
            </div>

            {/* Product Title, Subheadline & Primary CTA */}
            <div className="md:col-span-7 space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Digital Guide &bull; 2026 Edition</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
                {product.title}
              </h1>

              {product.short_description && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                  {product.short_description}
                </p>
              )}

              {/* Price & Primary CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {formattedPrice}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {product.currency}
                  </span>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Instant download after checkout
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  Direct PDF delivery
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Lifetime access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BENEFITS */}
      {product.benefits && product.benefits.length > 0 && (
        <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Why Creators &amp; Professionals Love This Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Everything inside is structured for fast implementation without fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {product.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 hover:border-indigo-200 transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 leading-snug">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: PRODUCT DESCRIPTION */}
      {product.description && (
        <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Detailed Product Overview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Full curriculum and key topics covered in the PDF.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line font-sans">
              {product.description}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: WHAT YOU'LL GET */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              What You&apos;ll Receive Instantly
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear, transparent deliverables sent directly to your screen and inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Item 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Full Digital PDF eBook</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Downloadable high-resolution PDF formatted for easy reading on all devices.
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Instant Download Link</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                No waiting. Access your download immediately on the thank-you screen.
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Any Device Reading</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read on Apple Books, Kindle, Google Drive, tablet, or web browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SAMPLE / PREVIEW (Only shown if samples exist) */}
      {product.sample_messages && product.sample_messages.length > 0 && (
        <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Sneak Peek
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Sample Content &amp; Prompt Previews
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A glimpse of the actionable material waiting inside the full PDF.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.sample_messages.map((sample, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-bold text-sm text-slate-900">{sample.title}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                    &ldquo;{sample.content}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: FAQS (Only shown if FAQs exist) */}
      {product.faqs && product.faqs.length > 0 && (
        <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Have questions before grabbing your copy? Here are quick answers.
              </p>
            </div>

            <div className="space-y-3">
              {product.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-4 transition"
                    >
                      <span className="font-bold text-sm text-slate-900">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: FINAL PURCHASE CTA & SECTION 8: TRUST NOTE */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden border border-slate-800">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="space-y-3 max-w-lg mx-auto relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
                Ready to get started?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Get &ldquo;{product.title}&rdquo; Today
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Instant delivery. Download immediately and unlock high-converting prompts and strategies.
              </p>
            </div>

            <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-2xl sm:text-3xl font-black text-white">{formattedPrice}</div>
              <button
                onClick={handleBuyNow}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/40 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Buy Now — {formattedPrice}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-200 relative z-10">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure Digital Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-300" />
                <span>Instant PDF Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SuperDigital</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <button
              onClick={() => alert('Privacy Policy: We protect customer email and order privacy. No data is shared with third parties.')}
              className="hover:text-slate-800 transition underline underline-offset-2"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => alert('Terms & Conditions: Digital eBook access is for personal and commercial client application. Redistribution of the original PDF is prohibited.')}
              className="hover:text-slate-800 transition underline underline-offset-2"
            >
              Terms &amp; Conditions
            </button>
            <button
              onClick={() => alert('Refund Policy: Due to the instant delivery nature of digital goods, please contact support for any order assistance.')}
              className="hover:text-slate-800 transition underline underline-offset-2"
            >
              Refund Policy
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden z-40 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Total Price
          </div>
          <div className="text-lg font-extrabold text-slate-900 leading-tight">
            {formattedPrice}
          </div>
        </div>

        <button
          onClick={handleBuyNow}
          className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Buy Now &rarr;</span>
        </button>
      </div>
    </div>
  );
};
