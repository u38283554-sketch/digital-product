import { z } from 'zod';

/**
 * Authentication Validations (Phase 1)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const roleSchema = z.enum(['admin', 'customer']);

/**
 * Product Validations (Phase 2)
 */
export const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Product title is required')
    .max(200, 'Product title must be under 200 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be under 100 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens (e.g. 100-chatgpt-prompts)'
    ),
  short_description: z.string().max(500, 'Short description cannot exceed 500 characters').optional().nullable(),
  description: z.string().max(20000, 'Description cannot exceed 20,000 characters').optional().nullable(),
  price: z.coerce
    .number()
    .min(0, 'Price must be 0 or greater')
    .refine((val) => Number.isFinite(val), 'Price must be a valid amount'),
  currency: z.string().default('INR'),
  cover_image_path: z.string().optional().nullable(),
  pdf_storage_path: z.string().optional().nullable(),
  benefits: z.array(z.string().trim().min(1, 'Benefit text cannot be empty')).default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(1, 'FAQ question is required'),
        answer: z.string().trim().min(1, 'FAQ answer is required'),
      })
    )
    .default([]),
  sample_messages: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Sample title is required'),
        content: z.string().trim().min(1, 'Sample content is required'),
      })
    )
    .default([]),
  active: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * File Upload Constraints (Phase 2)
 */
export const COVER_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
export const COVER_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const PDF_FILE_MAX_SIZE = 20 * 1024 * 1024; // 20 MB
export const PDF_FILE_ALLOWED_MIME_TYPES = ['application/pdf'];

export function validateCoverImageFile(file: File): { valid: boolean; error?: string } {
  if (!COVER_IMAGE_ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Cover image must be JPG, JPEG, PNG, or WEBP.' };
  }
  if (file.size > COVER_IMAGE_MAX_SIZE) {
    return { valid: false, error: 'Cover image must be under 5MB.' };
  }
  return { valid: true };
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const isPdfMime = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime) {
    return { valid: false, error: 'Product file must be a PDF.' };
  }
  if (file.size > PDF_FILE_MAX_SIZE) {
    return { valid: false, error: 'PDF must be under 20MB.' };
  }
  return { valid: true };
}

/**
 * Coupon Validations (Prepared for Phase 4)
 */
export const couponSchema = z.object({
  code: z
    .string()
    .min(2, 'Coupon code must be at least 2 characters')
    .toUpperCase(),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.coerce.number().positive('Discount value must be greater than 0'),
  usage_limit: z.coerce.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;

/**
 * Settings Validations
 */
export const settingsSchema = z.object({
  site_name: z.string().min(1, 'Store name is required'),
  logo_path: z.string().nullable().optional(),
  primary_color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#4F46E5'),
  accent_color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#06B6D4'),
  whatsapp_number: z.string().nullable().optional(),
  support_email: z.string().email().nullable().optional(),
  razorpay_key_id: z.string().nullable().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
