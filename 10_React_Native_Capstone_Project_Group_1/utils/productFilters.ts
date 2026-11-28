/**
 * Client-side product filtering / sorting / paging helpers.
 * DummyJSON only supports query + category + sort server-side, so brand and
 * price-range filters are applied here on the fetched result set.
 */
import { ProductSummary, SortOption } from '@/types/product';
import { getDiscountedPrice } from '@/utils/pricing';

export interface ProductFilters {
  category: string | null;
  brand: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortOption;
}

export const DEFAULT_FILTERS: ProductFilters = {
  category: null,
  brand: null,
  minPrice: null,
  maxPrice: null,
  sort: 'relevance',
};

export function countActiveFilters(filters: ProductFilters): number {
  let count = 0;
  if (filters.category) count += 1;
  if (filters.brand) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  return count;
}

/** Sorted unique list of brands present in a product list. */
export function extractBrands(products: ProductSummary[]): string[] {
  const brands = new Set<string>();
  products.forEach((p) => {
    if (p.brand) brands.add(p.brand);
  });
  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}

export function filterProducts(products: ProductSummary[], filters: ProductFilters): ProductSummary[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.brand && p.brand !== filters.brand) return false;
    const price = getDiscountedPrice(p.price, p.discountPercentage);
    if (filters.minPrice !== null && price < filters.minPrice) return false;
    if (filters.maxPrice !== null && price > filters.maxPrice) return false;
    return true;
  });
}

export function sortProducts(products: ProductSummary[], sort: SortOption): ProductSummary[] {
  const list = [...products];
  switch (sort) {
    case 'price-asc':
      return list.sort(
        (a, b) =>
          getDiscountedPrice(a.price, a.discountPercentage) -
          getDiscountedPrice(b.price, b.discountPercentage)
      );
    case 'price-desc':
      return list.sort(
        (a, b) =>
          getDiscountedPrice(b.price, b.discountPercentage) -
          getDiscountedPrice(a.price, a.discountPercentage)
      );
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating);
    case 'discount':
      return list.sort((a, b) => b.discountPercentage - a.discountPercentage);
    case 'newest':
      return list.sort(
        (a, b) => new Date(b.meta?.createdAt ?? 0).getTime() - new Date(a.meta?.createdAt ?? 0).getTime()
      );
    case 'relevance':
    default:
      return list;
  }
}

export function applyFilters(products: ProductSummary[], filters: ProductFilters): ProductSummary[] {
  return sortProducts(filterProducts(products, filters), filters.sort);
}

/** Parse a price text input; empty/invalid -> null. */
export function parsePriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
