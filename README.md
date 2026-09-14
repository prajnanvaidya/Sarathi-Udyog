# Sarathi Udyog — website

Static site for Sarathi Udyog, a home food business in Udupi, Karnataka.
Built with [Astro](https://astro.build); orders go straight to the owner's WhatsApp.

## Quick start

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally
```

Node 22.12+ is required.

## Where things live

| What                                                            | Where                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| Products (one JSON file each)                                   | `src/content/products/*.json`                                  |
| Product photos                                                  | `src/assets/products/`                                         |
| Phone numbers, address, FSSAI, delivery text, WhatsApp message  | `src/data/site.json`                                           |
| Colours, fonts, buttons                                         | `src/styles/global.css`                                        |
| Page sections                                                   | `src/components/*.astro`, assembled in `src/pages/index.astro` |
| `<head>` (title, OG tags, JSON-LD)                              | `src/layouts/Base.astro`                                       |
| Logo / emblem / mark (transparent) — generated, don't hand-edit | `src/assets/logo*.png`                                         |
| Favicon, OG image, robots, security headers                     | `public/`                                                      |
| Logo pipeline                                                   | `scripts/process-logo.mjs`                                     |
| CMS form definitions                                            | `.pages.yml`                                                   |
| Original 2026 single-file site + original images                | `legacy/` (reference only, not built)                          |

### Regenerating the logo assets

Save the high-resolution logo (square, on its flat yellow background) as
`legacy/original-images/logo-hd.jpg` (the owner's HD file is already there) and run:

```sh
node scripts/process-logo.mjs legacy/original-images/logo-hd.jpg
npm run build
```

It keys out the yellow, trims, and writes the transparent logo, the emblem used in the
header, every favicon size and the 1200×630 WhatsApp/Google preview image.

### Screenshots / visual testing

Append `?noanim` to the URL (e.g. `http://localhost:4321/?noanim`) to render every section
without the scroll-reveal animation — useful for full-page screenshots.

### Adding or changing a product

1. Drop the photo in `src/assets/products/` (JPG/PNG, ≥1000 px long edge — the build resizes it).
2. Copy any file in `src/content/products/`, rename it (the file name becomes the URL anchor, e.g. `#product-nankhatai`), edit the fields. `image` is the full path, `/src/assets/products/<file>.jpg` — the same form the CMS writes, so its photo previews work.
3. `price: null` renders "Ask for price". `available: false` shows a "Currently unavailable" tag.
4. Commit and push — the host rebuilds automatically.

Or do the same through the CMS (below) without touching code.

### Product schema

See `src/content.config.ts`. The build fails loudly if a field has the wrong type
or an image file is missing, so a bad edit can never reach the live site.

## Deploy & CMS

Full step-by-step (Cloudflare Pages hosting, Pages CMS for the owner, the no-GitHub-account
setup, and what access is actually granted) lives in [docs/DEPLOY-AND-CMS.md](docs/DEPLOY-AND-CMS.md).
In short: push to GitHub → connect the repo to Cloudflare Pages (build `npm run build`, output
`dist`, `NODE_VERSION=22`) → every commit redeploys. The owner edits products at
<https://app.pagescms.org> with an e-mail invite (no GitHub account needed); each save is a commit. `public/_headers` carries the security headers.

## Scripts

| Command                             | What it does                                       |
| ----------------------------------- | -------------------------------------------------- |
| `npm run dev`                       | local dev server with hot reload                   |
| `npm run build` / `npm run preview` | production build to `dist/`, serve it locally      |
| `npm run check`                     | Astro + TypeScript diagnostics                     |
| `npm run format` / `format:check`   | Prettier (with the Astro plugin)                   |
| `npm run logo`                      | regenerate logo/favicon/OG assets from the HD logo |

## Security posture

- No forms, cookies, analytics or third-party scripts. All JavaScript is same-origin and
  external, so the CSP is `script-src 'self'` with no `unsafe-inline`.
- `public/_headers`: CSP, HSTS (preload), `nosniff`, `X-Frame-Options: DENY`, referrer
  policy, Permissions-Policy, COOP/CORP.
- Every external link carries `rel="noopener noreferrer"`; the only external targets are
  `wa.me` and Google Maps.
- Content is validated at build time (`src/content.config.ts`); a bad CMS edit fails the
  build instead of reaching the live site.
- `npm audit` is clean; dependencies are pinned in `package-lock.json`.

## Things still to confirm with the owner

Placeholders currently in `src/data/site.json` / product files — edit when answers arrive:

- Cashew kernel grades and prices; red chilly powder and dry-fruit prices/pack sizes (currently "Ask for price").
- Delivery charges, dispatch time, minimum order (currently generic wording).
- Payment methods (currently "UPI (GPay / PhonePe), bank transfer").
- Business hours (`hours` is empty → hidden).
- Google Maps share link (`mapsUrl` empty → falls back to a Maps search).
- Village spelling: the label artwork says **Kankebettu**, the old site said Vankebettu / Vankdebettu. Currently "Vankebettu".
- Whether to show the full door number publicly.
- Email, Instagram/Facebook (hidden when empty).
