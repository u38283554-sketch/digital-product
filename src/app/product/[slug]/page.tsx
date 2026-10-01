import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/productsStore';
import { getCoverImageUrl } from '@/lib/products';
import { ProductLandingPage } from '@/components/public/ProductLandingPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    return {
      title: 'Product Not Found | SuperDigital',
      description: 'The requested digital product is unavailable.',
    };
  }

  const coverUrl = getCoverImageUrl(product.cover_image_path);

  return {
    title: `${product.title} | SuperDigital`,
    description: product.short_description || `Get ${product.title} - instant digital PDF eBook download.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} | SuperDigital`,
      description: product.short_description || `Digital eBook Edition`,
      url: `/product/${product.slug}`,
      siteName: 'SuperDigital Store',
      images: coverUrl ? [{ url: coverUrl, width: 800, height: 1066, alt: product.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.short_description || undefined,
      images: coverUrl ? [coverUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    return <ProductLandingPage product={null} />;
  }

  return <ProductLandingPage product={product} />;
}
