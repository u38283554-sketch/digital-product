import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  if (rawUrl && !rawUrl.startsWith('http')) {
    rawUrl = `https://${rawUrl}.supabase.co`;
  }
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(rawUrl),
      'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publishableKey),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(rawUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(publishableKey),
    },
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
