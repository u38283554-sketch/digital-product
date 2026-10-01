import { supabase } from '@/lib/supabase/client';
import type { Product } from '@/types';
import { canDeleteProduct, generateSlug } from '@/lib/products';

const STORAGE_KEY = 'superdigital_products_cache';

// High-quality initial seeded digital products so the store works right out of the box
export const DEFAULT_DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-1',
    title: '100 ChatGPT Prompts for Instagram Creators',
    slug: '100-chatgpt-prompts-for-instagram-creators',
    short_description: 'Viral hooks, caption templates, and monetization frameworks for content creators in India.',
    description: `### Master Viral Instagram Content in 2026
Stop staring at a blank screen. This complete 50-page digital ebook gives you copy-paste prompts tested across 100+ creator accounts.

**What you will get:**
- 25 Viral Hook Templates for Reels
- 25 Story Engagement Prompts with DM automation ideas
- 30 Long-form Carousel copy frameworks
- 20 High-ticket DM closing scripts
- Lifetime updates & PDF deliverables`,
    price: 499,
    currency: 'INR',
    cover_image_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    pdf_storage_path: 'products/demo-prod-1/file-instagram-prompts.pdf',
    benefits: [
      '100+ Tested copy-paste ChatGPT prompts',
      'High-converting viral Reel hooks',
      'DM sales script templates',
      'Instant download PDF ebook',
      'Lifetime access & future prompt updates',
    ],
    faqs: [
      {
        question: 'Is this a physical book or a digital PDF?',
        answer: 'This is a 100% digital PDF ebook that you can read on your phone, tablet, or laptop immediately after purchase.',
      },
      {
        question: 'How do I download the PDF?',
        answer: 'After payment, you receive an instant download link on your screen and an email confirmation.',
      },
      {
        question: 'Can I use these prompts for clients?',
        answer: 'Yes, commercial usage is fully permitted for yourself and client agency work.',
      },
    ],
    sample_messages: [
      {
        title: 'Reels Viral Hook Prompt',
        content: 'Act as an elite Instagram growth strategist. Write 5 contrarian hooks for a reel about digital marketing that stop viewers within the first 1.5 seconds.',
      },
      {
        title: 'Story DM Automation Prompt',
        content: 'Create a 3-part Instagram story sequence asking viewers to reply with the keyword "GROWTH" to receive a free cheat sheet.',
      },
    ],
    active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-prod-2',
    title: 'Notion Digital Creator OS & Life Planner',
    slug: 'notion-digital-creator-os-life-planner',
    short_description: 'All-in-one workspace for content scheduling, revenue tracking, and daily productivity.',
    description: `Organize your entire digital solopreneur business in one intuitive workspace. Includes content calendars, sponsor CRM, expense tracker, and goal management dashboards.`,
    price: 999,
    currency: 'INR',
    cover_image_path: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    pdf_storage_path: 'products/demo-prod-2/file-creator-os-guide.pdf',
    benefits: [
      'Pre-built content pipeline for YouTube & Instagram',
      'Brand deal & invoice tracking system',
      'Step-by-step PDF setup walkthrough',
      'Mobile-optimized Notion layout',
    ],
    faqs: [
      {
        question: 'Do I need Notion Paid Plan?',
        answer: 'No! This template works seamlessly on the 100% free Notion plan.',
      },
    ],
    sample_messages: [
      {
        title: 'Weekly Review Framework',
        content: 'Use the integrated Sunday reset checklist to audit top performing posts and plan weekly revenue sprints.',
      },
    ],
    active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-prod-3',
    title: 'SaaS Landing Page Design System & Copy Toolkit',
    slug: 'saas-landing-page-design-system-copy-toolkit',
    short_description: 'Figma wireframes and high-conversion headline formulas for software startups.',
    description: `A comprehensive kit containing 30+ wireframe components, 15 hero layouts, and 50 tested SaaS headlines that drive signups.`,
    price: 1499,
    currency: 'INR',
    cover_image_path: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    pdf_storage_path: 'products/demo-prod-3/file-saas-copy-guide.pdf',
    benefits: [
      'Complete PDF copywriting playbook',
      '30+ Conversion-focused section templates',
      'Pricing table psychology guidelines',
    ],
    faqs: [
      {
        question: 'Can beginners use this toolkit?',
        answer: 'Yes, each section includes visual examples and plain explanations.',
      },
    ],
    sample_messages: [],
    active: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_PRODUCTS));
      return DEFAULT_DEMO_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEMO_PRODUCTS;
  } catch {
    return DEFAULT_DEMO_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

/**
 * Fetch all products:
 * 1. Queries Supabase PostgreSQL products table.
 * 2. If table is not created yet (PGRST205 / schema cache), seamlessly falls back to local products.
 */
export async function fetchProductsStore(): Promise<{
  products: Product[];
  isLiveDb: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return { products: data as unknown as Product[], isLiveDb: true };
    }

    if (error && (error.message.includes('schema cache') || error.message.includes('does not exist'))) {
      console.info('[ProductsStore] Supabase products table pending in PostgreSQL; using resilient local store.');
      return { products: getLocalProducts(), isLiveDb: false };
    }

    // Fallback
    return { products: getLocalProducts(), isLiveDb: false };
  } catch {
    return { products: getLocalProducts(), isLiveDb: false };
  }
}

/**
 * Save product (Create or Update):
 * Persists to Supabase if table exists, or to local cache if table is pending.
 */
export async function saveProductStore(
  payload: Partial<Product>,
  isEditing: boolean,
  productId?: string
): Promise<{ product: Product; isLiveDb: boolean }> {
  const id = productId || crypto.randomUUID();
  const now = new Date().toISOString();

  // Try live Supabase first
  try {
    if (isEditing && productId) {
      const { data, error } = await (supabase as any)
        .from('products')
        .update({ ...payload, updated_at: now })
        .eq('id', productId)
        .select('*')
        .single();

      if (!error && data) {
        return { product: data as unknown as Product, isLiveDb: true };
      }
    } else {
      const { data, error } = await (supabase as any)
        .from('products')
        .insert({ id, ...payload, created_at: now, updated_at: now })
        .select('*')
        .single();

      if (!error && data) {
        return { product: data as unknown as Product, isLiveDb: true };
      }
    }
  } catch {
    // fall through to local storage
  }

  // Local Storage fallback
  const localList = getLocalProducts();
  let savedItem: Product;

  if (isEditing && productId) {
    const existingIndex = localList.findIndex((p) => p.id === productId);
    if (existingIndex >= 0) {
      savedItem = {
        ...localList[existingIndex],
        ...payload,
        updated_at: now,
      } as Product;
      localList[existingIndex] = savedItem;
    } else {
      savedItem = {
        id: productId,
        title: payload.title || 'Untitled',
        slug: payload.slug || generateSlug(payload.title || 'untitled'),
        short_description: payload.short_description || null,
        description: payload.description || null,
        price: payload.price ?? 499,
        currency: payload.currency || 'INR',
        cover_image_path: payload.cover_image_path || null,
        pdf_storage_path: payload.pdf_storage_path || null,
        benefits: payload.benefits || [],
        faqs: payload.faqs || [],
        sample_messages: payload.sample_messages || [],
        active: payload.active ?? false,
        created_at: now,
        updated_at: now,
      };
      localList.unshift(savedItem);
    }
  } else {
    savedItem = {
      id,
      title: payload.title || 'Untitled',
      slug: payload.slug || generateSlug(payload.title || 'untitled'),
      short_description: payload.short_description || null,
      description: payload.description || null,
      price: payload.price ?? 499,
      currency: payload.currency || 'INR',
      cover_image_path: payload.cover_image_path || null,
      pdf_storage_path: payload.pdf_storage_path || null,
      benefits: payload.benefits || [],
      faqs: payload.faqs || [],
      sample_messages: payload.sample_messages || [],
      active: payload.active ?? false,
      created_at: now,
      updated_at: now,
    };
    localList.unshift(savedItem);
  }

  saveLocalProducts(localList);
  return { product: savedItem, isLiveDb: false };
}

/**
 * Toggle active status
 */
export async function toggleProductActiveStore(
  productId: string,
  newActive: boolean
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from('products')
      .update({ active: newActive })
      .eq('id', productId);

    if (!error) return;
  } catch {
    // fallback
  }

  const localList = getLocalProducts();
  const item = localList.find((p) => p.id === productId);
  if (item) {
    item.active = newActive;
    item.updated_at = new Date().toISOString();
    saveLocalProducts(localList);
  }
}

/**
 * Delete product
 */
export async function deleteProductStore(productId: string): Promise<void> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) return;
  } catch {
    // fallback
  }

  const localList = getLocalProducts().filter((p) => p.id !== productId);
  saveLocalProducts(localList);
}

/**
 * Fetch a single product by slug for public landing page.
 * Strictly filters active = true.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const cleanSlug = slug.toLowerCase().trim();

  // Try live Supabase first
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', cleanSlug)
      .eq('active', true)
      .maybeSingle();

    if (!error && data) {
      return data as unknown as Product;
    }
  } catch {
    // fallback to local
  }

  // Fallback to local cache / demo products
  const localList = getLocalProducts();
  const product = localList.find(
    (p) => p.slug.toLowerCase() === cleanSlug && p.active === true
  );

  return product || null;
}

/**
 * Fetch all public active products
 */
export async function getAllActiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as unknown as Product[];
    }
  } catch {
    // fallback
  }

  return getLocalProducts().filter((p) => p.active === true);
}

