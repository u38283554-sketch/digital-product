import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase, getSupabaseUrl } from '@/lib/supabase/client';
import type { Database, Product } from '@/types';

/**
 * Generate a URL-safe slug from a product title.
 * Example: "100 ChatGPT Prompts for Instagram Creators" -> "100-chatgpt-prompts-for-instagram-creators"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except space and hyphen
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Generates the public CDN URL for a product cover image.
 */
export function getCoverImageUrl(coverPath: string | null | undefined): string | null {
  if (!coverPath) return null;
  // If already a full URL
  if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
    return coverPath;
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(coverPath);
  return data?.publicUrl || null;
}

/**
 * Generate unique, sanitized storage paths
 */
export function generateCoverStoragePath(productId: string, originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'webp';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'webp';
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `products/${productId}/cover-${Date.now()}-${randomSuffix}.${cleanExt}`;
}

export function generatePdfStoragePath(productId: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `products/${productId}/file-${Date.now()}-${randomSuffix}.pdf`;
}

/**
 * Check if a product has orders before allowing hard deletion.
 * Preserves historical revenue & order data integrity.
 */
export async function canDeleteProduct(
  client: SupabaseClient<Database>,
  productId: string
): Promise<{ canDelete: boolean; orderCount: number }> {
  try {
    const { count, error } = await client
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId);

    if (error) {
      console.warn('Could not check orders count:', error.message);
      return { canDelete: true, orderCount: 0 };
    }

    const orderCount = count || 0;
    return {
      canDelete: orderCount === 0,
      orderCount,
    };
  } catch {
    return { canDelete: true, orderCount: 0 };
  }
}
