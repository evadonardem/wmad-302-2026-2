/**
 * Product filtering & sorting helpers (pure functions, easy to unit test).
 *
 * DummyJSON can search and filter by category on the server, but it has no
 * brand or price-range filter. So the Search screen downloads the matching
 * products once and uses these helpers to filter/sort them on the device.
 */

import { Product } from '@/types/product';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'newest';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'newest', label: 'Newest' },
];

export interface ProductFilters {
  category?: string | null;
  brand?: string | null;
  minPrice?: number;
  maxPrice?: number;
  sort: SortOption;
}

/** Price the customer actually pays (after the discount). */
export function getFinalPrice(product: Pick<Product, 'price' | 'discountPercentage'>): number {
  return product.price * (1 - product.discountPercentage / 100);
}

/** "home-decoration" -> "Home Decoration" */
export function formatCategory(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Unique, alphabetically sorted brand names (many products have no brand). */
export function getBrands(products: Pick<Product, 'brand'>[]): string[] {
  const brands = new Set<string>();
  products.forEach((p) => {
    if (p.brand) brands.add(p.brand);
  });
  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}

/** Apply category / brand / price filters, then sort. Never changes the input array. */
export function filterAndSort(products: Product[], filters: ProductFilters): Product[] {
  const { category, brand, minPrice, maxPrice, sort } = filters;

  const filtered = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (brand && p.brand !== brand) return false;
    const price = getFinalPrice(p);
    if (minPrice !== undefined && price < minPrice) return false;
    if (maxPrice !== undefined && price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
      break;
    case 'price-desc':
      sorted.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount':
      sorted.sort((a, b) => b.discountPercentage - a.discountPercentage);
      break;
    case 'newest':
      sorted.sort((a, b) => (Date.parse(b.meta?.createdAt) || 0) - (Date.parse(a.meta?.createdAt) || 0));
      break;
    default:
      break; // 'relevance' keeps the order the API returned
  }
  return sorted;
}

/** "12.5" -> 12.5, "" or "abc" -> undefined (so an empty box means "no limit") */
export function parsePrice(text: string): number | undefined {
  const value = parseFloat(text);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}
