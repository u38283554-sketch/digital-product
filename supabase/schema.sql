-- ==============================================================
-- SuperDigital Platform - Phase 1 Database Schema & RLS Policies
-- ==============================================================
-- Run this script in your Supabase SQL Editor to set up:
-- 1. Custom extensions (uuid-ossp / pgcrypto)
-- 2. Tables: products, customers, orders, coupons, downloads, settings, pages, profiles
-- 3. Indexes & Triggers (auto-updating updated_at)
-- 4. Auth trigger to automatically create profile for new auth.users
-- 5. Helper function: is_admin(user_id)
-- 6. Strict Row-Level Security (RLS) policies on every table
-- 7. Supabase Storage buckets & policies (product-images, product-pdfs)
-- ==============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================
-- 1. TABLES DEFINITION
-- ==============================================================

-- PROFILES (Maps Supabase Auth user to application role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- PRODUCTS
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

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
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

-- COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    usage_limit INTEGER DEFAULT NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- DOWNLOADS
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SETTINGS
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

-- PAGES
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================
-- 2. INDEXES
-- ==============================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON public.downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================
-- 3. TRIGGERS FOR AUTO-UPDATING updated_at
-- ==============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to tables with updated_at
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_pages_updated_at ON public.pages;
CREATE TRIGGER set_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================
-- 4. AUTH TRIGGER FOR AUTO-CREATING USER PROFILES
-- ==============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================
-- 5. ADMIN ROLE HELPER FUNCTION
-- ==============================================================

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = check_user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin(auth.uid()));

-- Admins can insert/update/delete profiles
CREATE POLICY "Admins can manage profiles" 
    ON public.profiles FOR ALL 
    USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- PRODUCTS POLICIES
-- --------------------------------------------------------------
-- Public users can ONLY read active products
CREATE POLICY "Public can view active products" 
    ON public.products FOR SELECT 
    USING (active = true);

-- Admins have full access to products (including inactive)
CREATE POLICY "Admins can view all products" 
    ON public.products FOR SELECT 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert products" 
    ON public.products FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products" 
    ON public.products FOR UPDATE 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" 
    ON public.products FOR DELETE 
    USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- CUSTOMERS POLICIES (Strictly protected - no public read)
-- --------------------------------------------------------------
CREATE POLICY "Admins have full access to customers" 
    ON public.customers FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- ORDERS POLICIES (Strictly protected - no public read)
-- --------------------------------------------------------------
CREATE POLICY "Admins have full access to orders" 
    ON public.orders FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- COUPONS POLICIES
-- --------------------------------------------------------------
-- Public can only look up active and non-expired coupons by code (server-side verification preferred)
CREATE POLICY "Public can view active coupons" 
    ON public.coupons FOR SELECT 
    USING (active = true AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now())));

-- Admins have full CRUD access
CREATE POLICY "Admins have full access to coupons" 
    ON public.coupons FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- DOWNLOADS POLICIES (Strictly protected - no public read)
-- --------------------------------------------------------------
CREATE POLICY "Admins have full access to downloads" 
    ON public.downloads FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- SETTINGS POLICIES
-- --------------------------------------------------------------
-- Public can view site settings (site_name, logo, styling)
CREATE POLICY "Public can view settings" 
    ON public.settings FOR SELECT 
    USING (true);

-- Admins have full management access
CREATE POLICY "Admins have full access to settings" 
    ON public.settings FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- --------------------------------------------------------------
-- PAGES POLICIES
-- --------------------------------------------------------------
-- Public can ONLY view published pages
CREATE POLICY "Public can view published pages" 
    ON public.pages FOR SELECT 
    USING (published = true);

-- Admins have full access to all pages
CREATE POLICY "Admins have full access to pages" 
    ON public.pages FOR ALL 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================
-- 7. DEFAULT SEED DATA (Single settings row)
-- ==============================================================

INSERT INTO public.settings (site_name, primary_color, accent_color)
SELECT 'Digital Store', '#4F46E5', '#06B6D4'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- ==============================================================
-- 8. STORAGE BUCKETS SETUP & SECURITY POLICIES
-- ==============================================================

-- Create buckets via storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('product-images', 'product-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('product-pdfs', 'product-pdfs', false, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS on storage.objects
-- 1) product-images: Public can view images
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- 2) product-images: Admin upload/update/delete
CREATE POLICY "Admins can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

-- 3) product-pdfs: STRICTLY PRIVATE. No public access!
-- Only Admins can upload/read/delete directly.
-- Public downloads will exclusively use server-generated signed URLs.
CREATE POLICY "Admins can manage product pdfs"
    ON storage.objects FOR ALL
    USING (bucket_id = 'product-pdfs' AND public.is_admin(auth.uid()))
    WITH CHECK (bucket_id = 'product-pdfs' AND public.is_admin(auth.uid()));
