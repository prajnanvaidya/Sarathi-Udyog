// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Live URL on Cloudflare Pages. Used for canonical/OG URLs and JSON-LD ids;
  // change it here if a custom domain is added later.
  site: 'https://sarathi-udyog.pages.dev',
  trailingSlash: 'never',
  build: { inlineStylesheets: 'never' },
  vite: {
    // Never inline component scripts: keeps every script an external file so the
    // Content-Security-Policy in public/_headers can be script-src 'self' (no 'unsafe-inline').
    build: { assetsInlineLimit: 0 },
  },
});
