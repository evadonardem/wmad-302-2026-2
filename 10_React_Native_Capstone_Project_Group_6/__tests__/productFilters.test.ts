import {
  SORT_OPTIONS,
  filterAndSort,
  formatCategory,
  getBrands,
  getFinalPrice,
  parsePrice,
} from '@/utils/productFilters';
import { Product } from '@/types/product';

/** A complete Product with sensible defaults; each test only sets what it cares about */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Item',
    description: '',
    category: 'beauty',
    price: 100,
    discountPercentage: 0,
    rating: 4,
    stock: 10,
    tags: [],
    sku: 'SKU',
    weight: 1,
    dimensions: { width: 1, height: 1, depth: 1 },
    warrantyInformation: '',
    shippingInformation: '',
    availabilityStatus: 'In Stock',
    reviews: [],
    returnPolicy: '',
    minimumOrderQuantity: 1,
    meta: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '', barcode: '', qrCode: '' },
    images: [],
    thumbnail: '',
    ...overrides,
  };
}

const products: Product[] = [
  makeProduct({ id: 1, category: 'beauty', brand: 'Essence', price: 10, rating: 4.5, discountPercentage: 10 }),
  makeProduct({ id: 2, category: 'beauty', brand: 'Glamour', price: 50, rating: 3.1, discountPercentage: 40 }),
  makeProduct({ id: 3, category: 'furniture', price: 200, rating: 4.9, discountPercentage: 5,
    meta: { createdAt: '2025-06-01T00:00:00.000Z', updatedAt: '', barcode: '', qrCode: '' } }),
];
const ids = (list: Product[]) => list.map((p) => p.id);

describe('getFinalPrice', () => {
  it('applies the discount', () => {
    expect(getFinalPrice({ price: 100, discountPercentage: 25 })).toBeCloseTo(75);
  });
  it('returns the price when there is no discount', () => {
    expect(getFinalPrice({ price: 80, discountPercentage: 0 })).toBe(80);
  });
});

describe('formatCategory', () => {
  it('turns a slug into a title', () => {
    expect(formatCategory('home-decoration')).toBe('Home Decoration');
    expect(formatCategory('beauty')).toBe('Beauty');
  });
});

describe('getBrands', () => {
  it('returns unique brands sorted A-Z and skips products without a brand', () => {
    expect(getBrands(products)).toEqual(['Essence', 'Glamour']);
    expect(getBrands([{ brand: 'B' }, { brand: 'A' }, { brand: 'B' }, {}])).toEqual(['A', 'B']);
  });
});

describe('filterAndSort', () => {
  it('keeps the API order for relevance and does not change the input', () => {
    const copy = [...products];
    expect(ids(filterAndSort(products, { sort: 'relevance' }))).toEqual([1, 2, 3]);
    expect(products).toEqual(copy);
  });

  it('filters by category and brand', () => {
    expect(ids(filterAndSort(products, { sort: 'relevance', category: 'beauty' }))).toEqual([1, 2]);
    expect(ids(filterAndSort(products, { sort: 'relevance', brand: 'Glamour' }))).toEqual([2]);
    expect(ids(filterAndSort(products, { sort: 'relevance', category: 'furniture', brand: 'Glamour' }))).toEqual([]);
  });

  it('filters by the price after the discount', () => {
    // final prices: 9, 30, 190
    expect(ids(filterAndSort(products, { sort: 'relevance', minPrice: 10 }))).toEqual([2, 3]);
    expect(ids(filterAndSort(products, { sort: 'relevance', maxPrice: 30 }))).toEqual([1, 2]);
    expect(ids(filterAndSort(products, { sort: 'relevance', minPrice: 10, maxPrice: 100 }))).toEqual([2]);
  });

  it('sorts by price both ways', () => {
    expect(ids(filterAndSort(products, { sort: 'price-asc' }))).toEqual([1, 2, 3]);
    expect(ids(filterAndSort(products, { sort: 'price-desc' }))).toEqual([3, 2, 1]);
  });

  it('sorts by rating, discount and newest', () => {
    expect(ids(filterAndSort(products, { sort: 'rating' }))).toEqual([3, 1, 2]);
    expect(ids(filterAndSort(products, { sort: 'discount' }))).toEqual([2, 1, 3]);
    expect(filterAndSort(products, { sort: 'newest' })[0].id).toBe(3);
  });

  it('has a label for every sort option', () => {
    expect(SORT_OPTIONS.map((o) => o.value)).toEqual([
      'relevance', 'price-asc', 'price-desc', 'rating', 'discount', 'newest',
    ]);
  });
});

describe('parsePrice', () => {
  it('reads numbers', () => {
    expect(parsePrice('12.5')).toBe(12.5);
    expect(parsePrice('0')).toBe(0);
  });
  it('treats empty, text and negative numbers as "no limit"', () => {
    expect(parsePrice('')).toBeUndefined();
    expect(parsePrice('abc')).toBeUndefined();
    expect(parsePrice('-5')).toBeUndefined();
  });
});
