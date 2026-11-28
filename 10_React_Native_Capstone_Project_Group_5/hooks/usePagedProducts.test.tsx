import { act, renderHook, waitFor } from '@testing-library/react-native';
import { beforeEach, expect, it, jest } from '@jest/globals';
import { productApi } from '@/services/productApi';
import { Product, ProductsResponse } from '@/types/product';
import { usePagedProducts } from './usePagedProducts';

jest.mock('@/services/productApi', () => ({
  productApi: {
    getProducts: jest.fn(),
    getProductsByCategory: jest.fn(),
    searchProducts: jest.fn(),
  },
}));

const createProduct = (id: number, title = `Product ${id}`): Product => ({
  id,
  title,
  description: `Description for ${title}`,
  category: 'groceries',
  price: 10,
  discountPercentage: 0,
  rating: 4,
  stock: 5,
  tags: [],
  sku: `SKU-${id}`,
  weight: 1,
  dimensions: { width: 1, height: 1, depth: 1 },
  warrantyInformation: '',
  shippingInformation: '',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: '',
  minimumOrderQuantity: 1,
  meta: { createdAt: '', updatedAt: '', barcode: '', qrCode: '' },
  images: [],
  thumbnail: '',
});

const response = (
  products: Product[],
  total: number,
  skip: number
): ProductsResponse => ({ products, total, skip, limit: 2 });

beforeEach(() => {
  jest.mocked(productApi.getProducts).mockReset();
  jest.mocked(productApi.searchProducts).mockReset();
  jest.mocked(productApi.getProductsByCategory).mockReset();
});

it('loads subsequent pages once and stops at the API total', async () => {
  jest.mocked(productApi.getProducts)
    .mockResolvedValueOnce(response([createProduct(1), createProduct(2)], 3, 0))
    .mockResolvedValueOnce(response([createProduct(3)], 3, 2));
  const { result } = renderHook(() => usePagedProducts({ pageSize: 2 }));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.products.map((product) => product.id)).toEqual([1, 2]);
  expect(result.current.hasMore).toBe(true);

  await act(async () => {
    await result.current.loadMore();
  });

  expect(result.current.products.map((product) => product.id)).toEqual([1, 2, 3]);
  expect(result.current.hasMore).toBe(false);
  expect(productApi.getProducts).toHaveBeenCalledTimes(2);
  expect(productApi.getProducts).toHaveBeenLastCalledWith({ limit: 2, skip: 2 });
});

it('keeps loading after a page error and allows retrying that page', async () => {
  jest.mocked(productApi.getProducts)
    .mockResolvedValueOnce(response([createProduct(1), createProduct(2)], 3, 0))
    .mockRejectedValueOnce(new Error('Network unavailable'))
    .mockResolvedValueOnce(response([createProduct(3)], 3, 2));
  const { result } = renderHook(() => usePagedProducts({ pageSize: 2 }));

  await waitFor(() => expect(result.current.hasMore).toBe(true));
  await act(async () => {
    await result.current.loadMore();
  });
  expect(result.current.loadMoreError).toBe('Network unavailable');
  expect(result.current.products).toHaveLength(2);
  expect(productApi.getProducts).toHaveBeenCalledTimes(2);

  await act(async () => {
    await result.current.retryLoadMore();
  });
  expect(result.current.products.map((product) => product.id)).toEqual([1, 2, 3]);
  expect(result.current.loadMoreError).toBeNull();
});
