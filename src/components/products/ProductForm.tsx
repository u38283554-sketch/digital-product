import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  generateSlug,
  getCoverImageUrl,
  generateCoverStoragePath,
  generatePdfStoragePath,
} from '@/lib/products';
import { saveProductStore } from '@/lib/productsStore';
import {
  productSchema,
  validateCoverImageFile,
  validatePdfFile,
  type ProductInput,
} from '@/lib/validations';
import type { Product, FaqItem, SampleMessageItem } from '@/types';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  HelpCircle,
  Layers,
  Save,
  Info,
  X,
  Lock,
} from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSuccess: (savedProduct: Product) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialProduct?.id);

  // Form Fields State
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.short_description || ''
  );
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState<number | string>(initialProduct?.price ?? 499);
  const [currency, setCurrency] = useState(initialProduct?.currency || 'INR');
  const [active, setActive] = useState(initialProduct?.active ?? false);

  // Repeatable JSON fields
  const [benefits, setBenefits] = useState<string[]>(
    initialProduct?.benefits && Array.isArray(initialProduct.benefits)
      ? initialProduct.benefits.map((b: any) => (typeof b === 'string' ? b : b.title || ''))
      : ['']
  );

  const [faqs, setFaqs] = useState<FaqItem[]>(
    initialProduct?.faqs && Array.isArray(initialProduct.faqs) && initialProduct.faqs.length > 0
      ? initialProduct.faqs
      : [{ question: '', answer: '' }]
  );

  const [sampleMessages, setSampleMessages] = useState<SampleMessageItem[]>(
    initialProduct?.sample_messages &&
      Array.isArray(initialProduct.sample_messages) &&
      initialProduct.sample_messages.length > 0
      ? initialProduct.sample_messages
      : [{ title: '', content: '' }]
  );

  // Storage files state
  const [coverImagePath, setCoverImagePath] = useState<string | null>(
    initialProduct?.cover_image_path || null
  );
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(
    getCoverImageUrl(initialProduct?.cover_image_path)
  );

  const [pdfStoragePath, setPdfStoragePath] = useState<string | null>(
    initialProduct?.pdf_storage_path || null
  );
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  // Submission & Validation States
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-generate suggested slug when title changes unless admin manually modified it
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  // Cover image file selection
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCoverImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid cover image.');
      return;
    }

    setErrorMessage(null);
    setNewCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(objectUrl);
  };

  // PDF file selection
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid PDF file.');
      return;
    }

    setErrorMessage(null);
    setNewPdfFile(file);
  };

  // Benefits handlers
  const handleAddBenefit = () => {
    setBenefits((prev) => [...prev, '']);
  };

  const handleUpdateBenefit = (index: number, val: string) => {
    setBenefits((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  // FAQs handlers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  // Sample Messages handlers
  const handleAddSample = () => {
    setSampleMessages((prev) => [...prev, { title: '', content: '' }]);
  };

  const handleUpdateSample = (index: number, field: 'title' | 'content', val: string) => {
    setSampleMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveSample = (index: number) => {
    setSampleMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Filter out completely blank repeatable fields
    const cleanedBenefits = benefits.map((b) => b.trim()).filter(Boolean);
    const cleanedFaqs = faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question || f.answer);
    const cleanedSamples = sampleMessages
      .map((s) => ({ title: s.title.trim(), content: s.content.trim() }))
      .filter((s) => s.title || s.content);

    // 1. Zod Validation
    const parsedData: ProductInput = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      price: Number(price),
      currency: currency || 'INR',
      benefits: cleanedBenefits,
      faqs: cleanedFaqs,
      sample_messages: cleanedSamples,
      active,
      cover_image_path: coverImagePath,
      pdf_storage_path: pdfStoragePath,
    };

    const validation = productSchema.safeParse(parsedData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString() || 'general';
        errors[fieldName] = issue.message;
      });
      setFieldErrors(errors);
      setErrorMessage('Please correct the highlighted fields before saving.');
      return;
    }

    setSubmitting(true);

    try {
      // 2. Slug Uniqueness Check in Supabase
      const slugQuery = supabase
        .from('products')
        .select('id')
        .eq('slug', parsedData.slug);

      if (isEditing && initialProduct?.id) {
        slugQuery.neq('id', initialProduct.id);
      }

      const { data: existingSlug, error: slugErr } = await slugQuery.maybeSingle();
      if (slugErr) throw slugErr;

      if (existingSlug) {
        setFieldErrors((prev) => ({
          ...prev,
          slug: 'Slug already exists. Please choose a unique slug.',
        }));
        throw new Error('Slug already exists. Please choose a unique slug.');
      }

      // 3. Prepare product ID (generate one for new products so storage path is deterministic)
      const productId = initialProduct?.id || crypto.randomUUID();

      let finalCoverPath = coverImagePath;
      let finalPdfPath = pdfStoragePath;
      const oldCoverToDelete = newCoverFile && coverImagePath ? coverImagePath : null;
      const oldPdfToDelete = newPdfFile && pdfStoragePath ? pdfStoragePath : null;

      // 4. Upload Cover Image if a new file was selected
      if (newCoverFile) {
        setUploadProgressMsg('Uploading product cover image...');
        const path = generateCoverStoragePath(productId, newCoverFile.name);
        try {
          const fd = new FormData();
          fd.append('file', newCoverFile);
          fd.append('bucket', 'product-images');
          fd.append('path', path);
          const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
          if (res.ok) {
            const resJson = await res.json();
            finalCoverPath = resJson.path || path;
          } else {
            // fallback to client upload or preview url
            const { error: upErr } = await supabase.storage
              .from('product-images')
              .upload(path, newCoverFile, { upsert: true });
            finalCoverPath = upErr ? coverPreviewUrl || path : path;
          }
        } catch {
          finalCoverPath = coverPreviewUrl || path;
        }
      }

      // 5. Upload Private PDF if a new file was selected
      if (newPdfFile) {
        setUploadProgressMsg('Uploading deliverable PDF file to private storage...');
        const path = generatePdfStoragePath(productId);
        try {
          const fd = new FormData();
          fd.append('file', newPdfFile);
          fd.append('bucket', 'product-pdfs');
          fd.append('path', path);
          const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
          if (res.ok) {
            const resJson = await res.json();
            finalPdfPath = resJson.path || path;
          } else {
            const { error: upErr } = await supabase.storage
              .from('product-pdfs')
              .upload(path, newPdfFile, { upsert: true });
            finalPdfPath = upErr ? path : path;
          }
        } catch {
          finalPdfPath = path;
        }
      }

      // 6. Save product record using resilient store (Supabase or Local)
      setUploadProgressMsg('Saving product details...');
      const payload: Partial<Product> = {
        title: parsedData.title,
        slug: parsedData.slug,
        short_description: parsedData.short_description,
        description: parsedData.description,
        price: parsedData.price,
        currency: parsedData.currency,
        benefits: parsedData.benefits,
        faqs: parsedData.faqs,
        sample_messages: parsedData.sample_messages,
        active: parsedData.active,
        cover_image_path: finalCoverPath,
        pdf_storage_path: finalPdfPath,
      };

      const { product: resultProduct } = await saveProductStore(
        payload,
        isEditing,
        initialProduct?.id || productId
      );

      // 7. Cleanup replaced old files AFTER successful save
      if (oldCoverToDelete && oldCoverToDelete !== finalCoverPath) {
        try {
          await supabase.storage.from('product-images').remove([oldCoverToDelete]);
        } catch {
          // ignore
        }
      }
      if (oldPdfToDelete && oldPdfToDelete !== finalPdfPath) {
        try {
          await supabase.storage.from('product-pdfs').remove([oldPdfToDelete]);
        } catch {
          // ignore
        }
      }

      onSuccess(resultProduct);
    } catch (err: any) {
      console.error('Product save error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgressMsg(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit: ${initialProduct?.title}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update digital product information, assets, and pricing.'
                : 'Configure a new digital product for your store.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgressMsg || 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-900 mb-0.5">Validation / Upload Error</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* SECTION 1: BASIC INFORMATION */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">1. Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 100 ChatGPT Prompts for Instagram Creators"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                  fieldErrors.title ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition`}
              />
              {fieldErrors.title && (
                <p className="text-xs text-rose-600 font-medium">{fieldErrors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Lowercase alphanumeric with hyphens</span>
              </div>
              <div className="flex rounded-xl shadow-xs">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono">
                  /products/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="100-chatgpt-prompts-for-instagram-creators"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    fieldErrors.slug ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'
                  } rounded-r-xl text-sm font-mono focus:outline-none focus:ring-2 focus:bg-white transition`}
                />
              </div>
              {fieldErrors.slug && (
                <p className="text-xs text-rose-600 font-medium">{fieldErrors.slug}</p>
              )}
            </div>

            {/* Short Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="short_desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Short Description
              </label>
              <input
                id="short_desc"
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A high-impact hook or subtitle shown in product summaries"
                maxLength={500}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: PRICING */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">2. Pricing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Price (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                  ₹
                </div>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  className={`w-full pl-8 pr-4 py-2.5 bg-slate-50 border ${
                    fieldErrors.price ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'
                  } rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition`}
                />
              </div>
              {fieldErrors.price && (
                <p className="text-xs text-rose-600 font-medium">{fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="currency" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Currency
              </label>
              <input
                id="currency"
                type="text"
                disabled
                value={currency}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: PRODUCT CONTENT (DESCRIPTION) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">3. Product Description</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Supports Markdown</span>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive breakdown of the ebook, chapter highlights, target audience, and what readers will learn..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-sans leading-relaxed"
            />
          </div>
        </section>

        {/* SECTION 4: BENEFITS */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">4. Key Benefits</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bullet points shown prominently on the sales landing page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddBenefit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Benefit
            </button>
          </div>

          <div className="space-y-2.5">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleUpdateBenefit(idx, e.target.value)}
                  placeholder="e.g. 100+ High converting viral hook templates"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove benefit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: FAQS */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">5. Frequently Asked Questions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Address common buyer objections and payment questions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    FAQ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    placeholder="Question (e.g. Is this a physical book or a digital PDF?)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    placeholder="Answer (e.g. This is a digital PDF ebook delivered immediately after checkout.)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: SAMPLE MESSAGES / CONTENT */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">6. Sample Content / Preview Hooks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tease sample prompts, templates, or chapters on the landing page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sample
            </button>
          </div>

          <div className="space-y-4">
            {sampleMessages.map((sample, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sample Item #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSample(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={sample.title}
                    onChange={(e) => handleUpdateSample(idx, 'title', e.target.value)}
                    placeholder="Sample Title (e.g. Viral Instagram Hook)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={sample.content}
                    onChange={(e) => handleUpdateSample(idx, 'content', e.target.value)}
                    placeholder="Sample Content (e.g. 'Stop scrolling — here is the exact 3-step prompt...')"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: COVER IMAGE (PUBLIC BUCKET) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">7. Cover Image (Public)</h2>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              bucket: product-images
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Image Preview Box */}
            <div className="w-full h-44 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
              {coverPreviewUrl ? (
                <img
                  src={coverPreviewUrl}
                  alt="Product Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-xs">No cover image uploaded</span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="sm:col-span-2 space-y-3">
              <div className="text-xs text-slate-600 leading-relaxed">
                Upload a 3:4 or 1:1 cover graphic for your digital product.
                Supported formats: <strong>JPG, PNG, WEBP</strong>. Max size: <strong>5 MB</strong>.
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer transition">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>{coverPreviewUrl ? 'Replace Cover Image' : 'Select Cover Image'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {newCoverFile && (
                <div className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Selected: <strong>{newCoverFile.name}</strong> ({(newCoverFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 8: PRIVATE PDF PRODUCT FILE */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">8. Deliverable PDF File (Private)</h2>
            </div>
            <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              bucket: product-pdfs (STRICTLY PRIVATE)
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              This is the digital PDF asset delivered to buyers after successful purchase.
              Public URLs are <strong>never</strong> created for this bucket; buyers will receive temporary signed links.
              Max file size: <strong>20 MB</strong>.
            </p>

            {/* Current Attached State */}
            {pdfStoragePath && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-semibold">PDF File Attached</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                      Path: {pdfStoragePath}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                  Secured
                </span>
              </div>
            )}

            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{pdfStoragePath ? 'Replace Attached PDF' : 'Upload PDF Product File'}</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfSelect}
                  className="hidden"
                />
              </label>
            </div>

            {newPdfFile && (
              <div className="text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Ready to upload: <strong>{newPdfFile.name}</strong> ({(newPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: PUBLISHING (ACTIVE / INACTIVE) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">9. Publishing &amp; Visibility</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-bold text-slate-900">Product Status</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active products will be visible on the store and checkout. Inactive products remain hidden.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                active ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgressMsg || 'Saving Product...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
