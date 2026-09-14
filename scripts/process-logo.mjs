// Rebuilds every logo-derived asset from one high-resolution source image.
//
//   node scripts/process-logo.mjs [path/to/logo.png]
//
// Input : the square brand logo on its flat yellow background (default: legacy/original-images/logo-hd.png)
// Output: src/assets/logo.png           transparent full logo (emblem + wordmark)
//         src/assets/logo-mark.png      transparent diamond only (favicons)
//         src/assets/logo-emblem.png    transparent emblem (diamond + ornaments, header)
//         public/favicon.svg|png, favicon-192/512.png, apple-touch-icon.png
//         public/og-image.jpg           1200x630 link preview for WhatsApp / Google
import sharp from 'sharp';
import fs from 'node:fs';

const input = process.argv[2] ?? 'legacy/original-images/logo-hd.png';
if (!fs.existsSync(input)) {
  console.error(`Logo not found: ${input}\nSave the HD logo there (or pass a path) and run again.`);
  process.exit(1);
}

const BRAND_YELLOW = '#ffd400';
const MAROON = '#7a0a0e';

// --- 1. Key out the flat background --------------------------------------
const src = sharp(input).ensureAlpha();
const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const px = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2]];
};
// Background colour = median of a few pixels near each corner (robust to noise).
const samples = [];
for (const [x, y] of [
  [4, 4],
  [W - 5, 4],
  [4, H - 5],
  [W - 5, H - 5],
  [W >> 1, 4],
  [4, H >> 1],
])
  samples.push(px(x, y));
const med = (k) => samples.map((s) => s[k]).sort((a, b) => a - b)[samples.length >> 1];
const bg = [med(0), med(1), med(2)];
console.log(`Background colour sampled as rgb(${bg.join(', ')})`);

// Pixels within T0 of the bg colour become fully transparent, T1 and beyond stay opaque,
// with a linear ramp in between so anti-aliased edges keep their softness.
const T0 = 14,
  T1 = 46;
const out = Buffer.alloc(W * H * 4);
for (let i = 0, j = 0; i < data.length; i += C, j += 4) {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  const d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
  let a = d <= T0 ? 0 : d >= T1 ? 1 : (d - T0) / (T1 - T0);
  a = Math.round(a * (data[i + 3] ?? 255));
  out[j] = r;
  out[j + 1] = g;
  out[j + 2] = b;
  out[j + 3] = a;
}
// Cleanup: transparent specks fully enclosed by artwork (gold midtones that happen to
// match the background) are restored. Only the exterior background and reasonably large
// enclosed holes (letter counters) stay transparent.
{
  const label = new Int32Array(W * H).fill(-1);
  const sizes = [];
  const touchesEdge = [];
  const stack = [];
  for (let start = 0; start < W * H; start++) {
    if (label[start] !== -1 || out[start * 4 + 3] > 40) continue;
    const id = sizes.length;
    sizes.push(0);
    touchesEdge.push(false);
    stack.push(start);
    label[start] = id;
    while (stack.length) {
      const p = stack.pop();
      sizes[id]++;
      const x = p % W,
        y = (p / W) | 0;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touchesEdge[id] = true;
      for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (q < 0 || q >= W * H) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === W - 1)) continue;
        if (label[q] === -1 && out[q * 4 + 3] <= 40) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
  }
  const minHole = Math.max(200, Math.round(W * H * 0.0004));
  let restored = 0;
  for (let p = 0; p < W * H; p++) {
    const id = label[p];
    if (id !== -1 && !touchesEdge[id] && sizes[id] < minHole) {
      out[p * 4 + 3] = 255;
      restored++;
    }
  }
  console.log(`Restored ${restored} enclosed speck pixels (${sizes.length} transparent regions found)`);
}
const keyed = sharp(out, { raw: { width: W, height: H, channels: 4 } }).png();
const keyedBuf = await keyed.toBuffer();

// --- 2. Full logo, trimmed to content --------------------------------------
fs.mkdirSync('src/assets', { recursive: true });
const full = await sharp(keyedBuf).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
await sharp(full.data)
  .resize({ width: Math.min(1400, full.info.width), withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: false })
  .toFile('src/assets/logo.png');
console.log(`src/assets/logo.png  ${full.info.width}x${full.info.height} (trimmed)`);

// --- 3. Emblem (diamond + side ornaments, no wordmark) — used in the header --
const fw = full.info.width,
  fh = full.info.height;
const emblem = await sharp(full.data)
  .extract({ left: 0, top: 0, width: fw, height: Math.round(fh * 0.6) })
  .trim({ threshold: 10 })
  .toBuffer({ resolveWithObject: true });
await sharp(emblem.data).png({ compressionLevel: 9 }).toFile('src/assets/logo-emblem.png');
console.log(`src/assets/logo-emblem.png  ${emblem.info.width}x${emblem.info.height}`);

// --- 3b. Mark (the diamond alone) — used for favicons ----------------------------
// The ornaments are attached to the diamond's side tips, so a rectangular crop can't
// separate them; a rhombus mask (tips measured on the source, as fractions) can.
const tips = { top: [0.5, 0.066], right: [0.68, 0.318], bottom: [0.5, 0.571], left: [0.322, 0.318] };
const grow = 0.006; // push the mask a little outward so the outer gold rim is kept
const pt = ([x, y], dx, dy) => `${((x + dx * grow) * W).toFixed(1)},${((y + dy * grow) * H).toFixed(1)}`;
const rhombus = Buffer.from(
  `<svg width="${W}" height="${H}"><polygon points="${pt(tips.top, 0, -1)} ${pt(tips.right, 0, 0)} ${pt(tips.bottom, 0, 1)} ${pt(tips.left, 0, 0)}" fill="#fff"/></svg>`,
);
const markMasked = await sharp(keyedBuf)
  .composite([{ input: rhombus, blend: 'dest-in' }])
  .toBuffer();
const mark = await sharp(markMasked).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
await sharp(mark.data).png({ compressionLevel: 9 }).toFile('src/assets/logo-mark.png');
console.log(`src/assets/logo-mark.png  ${mark.info.width}x${mark.info.height}`);

// --- 4. Favicons ----------------------------------------------------------------
// The tall diamond is unreadable at 16–32 px, so the icon is a bold tile instead: the
// real gold "S" on its red field (an axis-aligned square cut from inside the diamond),
// framed in gold on a rounded brand-yellow square. Same design at every size.
const mw = mark.info.width,
  mh = mark.info.height;
const side = Math.floor((mw * mh) / (mw + mh)); // largest axis-aligned square inside a rhombus
const sTile = await sharp(mark.data)
  .extract({ left: Math.round((mw - side) / 2), top: Math.round((mh - side) / 2), width: side, height: side })
  .toBuffer();

async function icon(size, file) {
  const inner = Math.round(size * 0.78); // red tile size
  const ring = Math.max(1, Math.round(size * 0.035)); // gold frame width
  const r = Math.round(size * 0.22); // outer corner radius
  const ri = Math.round(inner * 0.2); // inner corner radius
  const off = Math.round((size - inner) / 2);
  const frame = Buffer.from(`<svg width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${r}" fill="${BRAND_YELLOW}"/>
    <rect x="${off - ring}" y="${off - ring}" width="${inner + ring * 2}" height="${inner + ring * 2}" rx="${ri + ring}" fill="#e6b422"/>
    <rect x="${off - ring}" y="${off - ring}" width="${inner + ring * 2}" height="${inner + ring * 2}" rx="${ri + ring}" fill="none" stroke="#b8860b" stroke-width="${Math.max(1, ring / 2)}"/>
  </svg>`);
  const maskSvg = Buffer.from(
    `<svg width="${inner}" height="${inner}"><rect width="${inner}" height="${inner}" rx="${ri}" fill="#fff"/></svg>`,
  );
  const tile = await sharp(sTile)
    .resize(inner, inner, { kernel: 'lanczos3' })
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .toBuffer();
  await sharp(frame)
    .composite([{ input: tile, left: off, top: off }])
    .png()
    .toFile(file);
}
await icon(512, 'public/favicon-512.png');
await icon(192, 'public/favicon-192.png');
await icon(180, 'public/apple-touch-icon.png');
await icon(64, 'public/favicon.png');
await icon(32, 'public/favicon-32.png');
// SVG favicon = the 64px PNG embedded (keeps the real artwork, works everywhere modern)
const png64 = fs.readFileSync('public/favicon.png').toString('base64');
fs.writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${png64}"/></svg>\n`,
);
console.log('public/favicon.* written');

// --- 5. OG image 1200x630 ----------------------------------------------------
const logoForOg = await sharp(full.data)
  .resize({ height: 400, fit: 'inside' })
  .toBuffer({ resolveWithObject: true });
const band = Buffer.from(`<svg width="1200" height="630">
  <rect y="500" width="1200" height="130" fill="${MAROON}"/>
  <rect y="496" width="1200" height="5" fill="#e6b422"/>
  <text x="600" y="552" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#ffe28a">Traditional Biscuits, Cakes, Pickles &amp; Dry Fruits</text>
  <text x="600" y="596" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#fff7d1">100% Veg  •  Udupi, Karnataka  •  Delivery across India</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: BRAND_YELLOW } })
  .composite([
    {
      input: logoForOg.data,
      left: Math.round((1200 - logoForOg.info.width) / 2),
      top: Math.round((496 - logoForOg.info.height) / 2),
    },
    { input: band, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('public/og-image.jpg written');
console.log('\nDone. Run `npm run build` to regenerate the site.');
