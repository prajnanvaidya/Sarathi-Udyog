// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Public URL of the deployed site. Update once Cloudflare Pages gives you the
  // final *.pages.dev address (or a custom domain). Used for canonical/OG URLs.
  site: 'https://sarathi-udyog.pages.dev',
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto' },
  image: {
    // Product photos are served as WebP with a JPEG fallback handled by the browser
    responsiveStyles: false,
  },
});
