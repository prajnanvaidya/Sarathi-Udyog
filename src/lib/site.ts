import type { ImageMetadata } from 'astro';
import site from '../data/site.json';

export { site };

/** wa.me link with a prefilled message for a product (or a generic enquiry). */
export function whatsappLink(product?: string): string {
  const text = product
    ? site.whatsappMessage.replace('{product}', product)
    : site.whatsappMessage.replace('{product}', 'some of your products');
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const callLink = `tel:+${site.callNumber}`;
export const whatsappPlainLink = `https://wa.me/${site.whatsappNumber}`;

/** "917975925255" -> "+91 79759 25255" */
export function formatPhone(num: string): string {
  const local = num.replace(/^91/, '');
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export const fullAddress = [
  site.address.line1,
  site.address.line2,
  site.address.line3,
  `${site.address.state} – ${site.address.pincode}`,
];

/** Google Maps search link if the owner hasn't supplied a pin. */
export const mapsLink =
  site.mapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.name}, ${site.address.line1}, ${site.address.line3}, ${site.address.state} ${site.address.pincode}`,
  )}`;

// ---------------------------------------------------------------------------
// Product images: every file in src/assets/products/, keyed by file name.
// Product JSON stores just the file name (or any path ending in it), so the CMS
// can write whatever prefix it likes and we still resolve it here.
const files = import.meta.glob<ImageMetadata>('/src/assets/products/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});
const byName: Record<string, ImageMetadata> = {};
for (const [path, img] of Object.entries(files)) byName[path.split('/').pop() as string] = img;

export function productImage(ref: string): ImageMetadata {
  const name = ref.split('/').pop() as string;
  const img = byName[name];
  if (!img) {
    throw new Error(
      `Product image "${ref}" not found in src/assets/products/. Available: ${Object.keys(byName).join(', ')}`,
    );
  }
  return img;
}
