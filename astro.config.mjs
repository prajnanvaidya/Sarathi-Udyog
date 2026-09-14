// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Public URL of the deployed site. Update once Cloudflare Pages gives you the
  // final *.pages.dev address (or a custom domain). Used for canonical/OG URLs.
  site: 'https://sarathi-udyog.pages.dev',
  trailingSlash: 'never',
  build: { inlineStylesheets: 'never' },
  vite: {
    // Never inline component scripts: keeps every script an external file so the
    // Content-Security-Policy in public/_headers can be script-src 'self' (no 'unsafe-inline').
    build: { assetsInlineLimit: 0 },
  },
});
