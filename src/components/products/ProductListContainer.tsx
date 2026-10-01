'use client';

import React from 'react';
import { ProductList } from './ProductList';
import type { Product } from '@/types';

export const ProductListContainer: React.FC = () => {
  const navigate = (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  return (
    <ProductList
      onAddProduct={() => {
        navigate('/admin/products/new');
      }}
      onEditProduct={(p: Product) => {
        navigate(`/admin/products/${p.id}/edit`);
      }}
      onViewLandingPage={(slug: string) => {
        navigate(`/product/${slug}`);
      }}
    />
  );
};

