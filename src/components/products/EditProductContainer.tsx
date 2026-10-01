'use client';

import React from 'react';
import { ProductForm } from './ProductForm';
import type { Product } from '@/types';

interface EditProductContainerProps {
  product: Product;
}

export const EditProductContainer: React.FC<EditProductContainerProps> = ({ product }) => {
  const navigate = (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  return (
    <ProductForm
      initialProduct={product}
      onSuccess={() => {
        navigate('/admin/products');
      }}
      onCancel={() => {
        navigate('/admin/products');
      }}
    />
  );
};

