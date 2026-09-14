import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each product is one JSON file in src/content/products/.
// Edited by the owner through Pages CMS (see .pages.yml) or by hand.
const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['Bakery', 'Pickles', 'Dry Fruits & Spices']),
    tagline: z.string().optional().default(''),
    description: z.string().optional().default(''),
    // null / missing price => "Ask for price" (e.g. cashew grades that change seasonally)
    price: z.number().nullable().optional(),
    unit: z.string().optional().default(''),
    priceNote: z.string().optional().default(''),
    badges: z.array(z.string()).optional().default([]),
    ingredients: z.string().optional().default(''),
    allergens: z.string().optional().default(''),
    shelfLife: z.string().optional().default(''),
    storage: z.string().optional().default(''),
    available: z.boolean().optional().default(true),
    featured: z.boolean().optional().default(false),
    order: z.number().optional().default(100),
    // File name (or path) inside src/assets/products/
    image: z.string(),
  }),
});

export const collections = { products };
