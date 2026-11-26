import type { Product } from '@/types/product';

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Test Phone',
    description: 'A phone',
    category: 'smartphones',
    price: 100,
    discountPercentage: 10,
    rating: 4.5,
    stock: 5,
    tags: [],
    brand: 'Acme',
    sku: 'SKU-1',
    weight: 100,
    dimensions: { width: 1, height: 2, depth: 3 },
    warrantyInformation: '1 year',
    shippingInformation: 'Ships in 2 days',
    availabilityStatus: 'In Stock',
    reviews: [],
    returnPolicy: '30 days',
    minimumOrderQuantity: 1,
    meta: { createdAt: '', updatedAt: '', barcode: '', qrCode: '' },
    images: ['https://example.com/1.png'],
    thumbnail: 'https://example.com/thumb.png',
    ...overrides,
  };
}
