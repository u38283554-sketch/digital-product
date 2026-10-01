/**
 * SuperDigital Platform - Core TypeScript Types (Phase 1)
 */

export type UserRole = 'admin' | 'customer';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export type DiscountType = 'percentage' | 'flat';

export interface BenefitItem {
  id?: string;
  title: string;
  description?: string;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface SampleMessageItem {
  id?: string;
  title: string;
  content: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  cover_image_path: string | null;
  pdf_storage_path: string | null;
  benefits: string[];
  faqs: FaqItem[];
  sample_messages: SampleMessageItem[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  amount: number;
  discount: number;
  final_amount: number;
  currency: string;
  coupon_code: string | null;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export interface Download {
  id: string;
  order_id: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
}

export interface Settings {
  id: string;
  site_name: string;
  logo_path: string | null;
  primary_color: string;
  accent_color: string;
  whatsapp_number: string | null;
  support_email: string | null;
  razorpay_key_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Database schema definition for Supabase client typing
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: { id: string; role?: UserRole; created_at?: string };
        Update: { id?: string; role?: UserRole; created_at?: string };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer>;
        Update: Partial<Customer>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
        Relationships: [];
      };
      coupons: {
        Row: Coupon;
        Insert: Partial<Coupon>;
        Update: Partial<Coupon>;
        Relationships: [];
      };
      downloads: {
        Row: Download;
        Insert: Partial<Download>;
        Update: Partial<Download>;
        Relationships: [];
      };
      settings: {
        Row: Settings;
        Insert: Partial<Settings>;
        Update: Partial<Settings>;
        Relationships: [];
      };
      pages: {
        Row: Page;
        Insert: Partial<Page>;
        Update: Partial<Page>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
    };
  };
};

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}
