/** Shared test data builders. */
import { CartItem, ProductSummary } from '@/types/product';

export function makeProduct(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 1,
    title: 'Test Product',
    category: 'smartphones',
    price: 100,
    discountPercentage: 10,
    rating: 4.5,
    stock: 10,
    thumbnail: 'https://example.com/t.png',
    brand: 'Acme',
    meta: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', barcode: '1', qrCode: 'q' },
    ...overrides,
  };
}

export function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 1,
    title: 'Test Product',
    thumbnail: 'https://example.com/t.png',
    price: 100,
    discountPercentage: 10,
    quantity: 1,
    stock: 5,
    ...overrides,
  };
}
