// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  // Pages read products/photos/texts from Supabase on every request,
  // so the owner's edits show up without a redeploy.
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      // keep in sync with any page that sets `noindex` in Layout.astro
      filter: (page) => !page.includes('/admin') && !page.includes('/kosik'),
    }),
  ],
  adapter: vercel()
});
