# Sarathi Udyog — website

Static site for Sarathi Udyog, a family-run food business in Udupi, Karnataka — biscuits, cakes,
pickles, spices and dry fruits, ordered over WhatsApp.
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
| Colours, fonts, buttons; light + dark palettes                  | `src/styles/global.css`                                        |
| Theme toggle and first-paint theme script                       | `src/components/Header.astro`, `src/scripts/theme-init.js`     |
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

### Light / dark theme

Every colour is a CSS custom property in `src/styles/global.css`: the `:root` block is the
original light design and `[data-theme='dark']` at the bottom redefines only the tokens that
change (page and card surfaces, text, borders, headings, shadows). Brand colours — the maroon
bands, gold accents, WhatsApp green — are the same in both themes.

- `src/scripts/theme-init.js` runs synchronously in `<head>` and sets `data-theme` on `<html>`
  before anything paints, so there is no flash of the wrong theme. It uses the choice saved in
  `localStorage` (`theme` = `light` | `dark`) and otherwise follows the OS preference.
- The sun/moon button in the header (`Header.astro`) flips the theme and saves the choice.
  Until the visitor has chosen, the site also follows OS theme changes live.
- The script is an external file, not inline, so the CSP can stay `script-src 'self'`.

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

- **Hosting:** Cloudflare Pages, connected to this repo (build `npm run build`, output `dist`,
  `NODE_VERSION=22`). Every commit to `main` redeploys; a failed build keeps the previous
  deployment live. `public/_headers` carries the security headers.
- **CMS:** the owner edits products and site settings at <https://app.pagescms.org>, invited by
  e-mail (no GitHub account). Forms are defined in `.pages.yml`; each save is a commit made by
  the Pages CMS GitHub App, which is installed on this repository only.
- **Build check:** `.github/workflows/build.yml` runs `npm run build` on every push. If `main`
  stops building (typically a product pointing at a photo deleted from the CMS _Media_ page),
  it opens an issue assigned to the repo owner — GitHub e-mails it — and closes it when the
  build passes again.

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
