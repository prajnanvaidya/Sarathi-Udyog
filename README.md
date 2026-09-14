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

| What | Where |
| --- | --- |
| Products (one JSON file each) | `src/content/products/*.json` |
| Product photos | `src/assets/products/` |
| Phone numbers, address, FSSAI, delivery text, WhatsApp message | `src/data/site.json` |
| Colours, fonts, buttons | `src/styles/global.css` |
| Page sections | `src/components/*.astro`, assembled in `src/pages/index.astro` |
| `<head>` (title, OG tags, JSON-LD) | `src/layouts/Base.astro` |
| Favicon, OG image, robots, security headers | `public/` |
| CMS form definitions | `.pages.yml` |
| Original 2026 single-file site + original images | `legacy/` (reference only, not built) |

### Adding or changing a product

1. Drop the photo in `src/assets/products/` (JPG/PNG, ≥1000 px long edge — the build resizes it).
2. Copy any file in `src/content/products/`, rename it (the file name becomes the URL anchor, e.g. `#product-nankhatai`), edit the fields.
3. `price: null` renders "Ask for price". `available: false` shows a "Currently unavailable" tag.
4. Commit and push — the host rebuilds automatically.

Or do the same through the CMS (below) without touching code.

### Product schema

See `src/content.config.ts`. The build fails loudly if a field has the wrong type
or an image file is missing, so a bad edit can never reach the live site.

## CMS for the owner (Pages CMS — free, no server)

[Pages CMS](https://pagescms.org) edits files in this GitHub repo through a web form.

1. Owner creates a GitHub account (or you add them as a collaborator on this private repo).
2. Go to <https://app.pagescms.org>, sign in with GitHub, pick this repository.
3. The **Products** and **Site settings** sections come from `.pages.yml`.
4. Every "Save" is a git commit → Cloudflare Pages rebuilds in ~1 minute.

Alternative if you'd rather self-host: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (drop one HTML file in `public/admin/` + a tiny Cloudflare Worker for GitHub login).

## Deploy (Cloudflare Pages, free)

1. Push this repo to GitHub (private is fine).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`.
4. Environment variable: `NODE_VERSION` = `22`.
5. Deploy. You get `https://<project>.pages.dev` with HTTPS. Put that URL in the Google Business Profile — no domain needed.
6. Update `site:` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt` to the final URL, push again.

`public/_headers` sets CSP, HSTS, nosniff, referrer-policy and long-cache for `/_astro/*` — Cloudflare and Netlify both read it automatically.

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
