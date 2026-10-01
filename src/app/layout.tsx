import React from 'react';
import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'SuperDigital - Digital Products Platform',
  description: 'Self-hosted digital products selling platform with Supabase backend, Indian payment gateways, and PDF delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
