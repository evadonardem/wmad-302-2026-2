import {
  DEFAULT_FILTERS,
  applyFilters,
  countActiveFilters,
  extractBrands,
  parsePriceInput,
} from '@/utils/productFilters';
import { makeProduct } from '@/test-utils/fixtures';

const products = [
  makeProduct({ id: 1, title: 'A', price: 100, discountPercentage: 0, rating: 3, brand: 'Zed', category: 'laptops' }),
  makeProduct({ id: 2, title: 'B', price: 50, discountPercentage: 50, rating: 5, brand: 'Acme', category: 'smartphones' }),
  makeProduct({ id: 3, title: 'C', price: 80, discountPercentage: 10, rating: 4, brand: undefined, category: 'smartphones',
    meta: { createdAt: '2025-06-01T00:00:00.000Z', updatedAt: '', barcode: '', qrCode: '' } }),
];

describe('productFilters', () => {
  it('extracts a sorted unique brand list', () => {
    expect(extractBrands(products)).toEqual(['Acme', 'Zed']);
  });

  it('filters by category and brand', () => {
    expect(applyFilters(products, { ...DEFAULT_FILTERS, category: 'smartphones' }).map((p) => p.id)).toEqual([2, 3]);
    expect(applyFilters(products, { ...DEFAULT_FILTERS, brand: 'Zed' }).map((p) => p.id)).toEqual([1]);
  });

  it('filters by discounted price range', () => {
    // discounted prices: 100, 25, 72
    expect(applyFilters(products, { ...DEFAULT_FILTERS, minPrice: 30, maxPrice: 90 }).map((p) => p.id)).toEqual([3]);
    expect(applyFilters(products, { ...DEFAULT_FILTERS, maxPrice: 25 }).map((p) => p.id)).toEqual([2]);
  });

  it.each([
    ['price-asc', [2, 3, 1]],
    ['price-desc', [1, 3, 2]],
    ['rating', [2, 3, 1]],
    ['discount', [2, 3, 1]],
    ['newest', [3, 1, 2]],
    ['relevance', [1, 2, 3]],
  ] as const)('sorts by %s', (sort, expected) => {
    expect(applyFilters(products, { ...DEFAULT_FILTERS, sort }).map((p) => p.id)).toEqual(expected);
  });

  it('does not mutate the input', () => {
    const copy = [...products];
    applyFilters(products, { ...DEFAULT_FILTERS, sort: 'price-asc' });
    expect(products).toEqual(copy);
  });

  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, category: 'x', brand: 'y', minPrice: 1 })).toBe(3);
  });

  it('parses price input', () => {
    expect(parsePriceInput('')).toBeNull();
    expect(parsePriceInput('abc')).toBeNull();
    expect(parsePriceInput('-5')).toBeNull();
    expect(parsePriceInput(' 12.5 ')).toBe(12.5);
  });
});
