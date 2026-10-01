'use client';

import React from 'react';
import { ProductForm } from './ProductForm';

export const NewProductContainer: React.FC = () => {
  const navigate = (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  return (
    <ProductForm
      onSuccess={() => {
        navigate('/admin/products');
      }}
      onCancel={() => {
        navigate('/admin/products');
      }}
    />
  );
};

