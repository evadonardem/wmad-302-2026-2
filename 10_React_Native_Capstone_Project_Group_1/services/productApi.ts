/**
 * Product & Cart API Service - DummyJSON
 * Docs: https://dummyjson.com/docs/products, https://dummyjson.com/docs/carts
 */

import axios, { AxiosInstance } from 'axios';
import {
  Product,
  ProductsResponse,
  ProductSummary,
  PRODUCT_SUMMARY_FIELDS,
  ProductSearchParams,
  Cart,
  CartsResponse,
  CartAddRequest,
  Category,
} from '@/types/product';
import { formatCategoryName } from '@/utils/pricing';
import { getErrorStatus } from '@/utils/errors';

const API_BASE_URL = 'https://dummyjson.com';

/**
 * DummyJSON user used for order requests when the signed-in user does not exist
 * on the server (accounts created on the register screen are only simulated).
 */
const FALLBACK_USER_ID = 1;

class ProductApiService {
  private client: AxiosInstance;

  /** `client` can be injected for testing. */
  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  }

  // ============ Products ============

  /**
   * Get all products with pagination
   */
  async getProducts(params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>('/products', { params });
    return response.data;
  }

  /** Same as getProducts() but only the fields needed by list screens. */
  async getProductSummaries(params: ProductSearchParams = {}): Promise<ProductsResponse<ProductSummary>> {
    const response = await this.client.get<ProductsResponse<ProductSummary>>('/products', {
      params: { ...params, select: PRODUCT_SUMMARY_FIELDS },
    });
    return response.data;
  }

  /** Search with list-sized results. `limit: 0` returns every match. */
  async searchProductSummaries(
    query: string,
    params: ProductSearchParams = {}
  ): Promise<ProductsResponse<ProductSummary>> {
    const response = await this.client.get<ProductsResponse<ProductSummary>>('/products/search', {
      params: { q: query, ...params, select: PRODUCT_SUMMARY_FIELDS },
    });
    return response.data;
  }

  /** Category listing with list-sized results. */
  async getProductSummariesByCategory(
    category: string,
    params: ProductSearchParams = {}
  ): Promise<ProductsResponse<ProductSummary>> {
    const response = await this.client.get<ProductsResponse<ProductSummary>>(
      `/products/category/${encodeURIComponent(category)}`,
      { params: { ...params, select: PRODUCT_SUMMARY_FIELDS } }
    );
    return response.data;
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    const response = await this.client.get<Product>(`/products/${id}`);
    return response.data;
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>('/products/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>(`/products/category/${encodeURIComponent(category)}`, {
      params,
    });
    return response.data;
  }

  /**
   * Get all categories. Newer DummyJSON versions return objects
   * ({ slug, name, url }) while older ones return plain strings - both are
   * normalised to { slug, name }.
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Array<string | { slug: string; name?: string }>>(
      '/products/categories'
    );
    return response.data.map((item) =>
      typeof item === 'string'
        ? { slug: item, name: formatCategoryName(item) }
        : { slug: item.slug, name: item.name ?? formatCategoryName(item.slug) }
    );
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(brand: string, params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>(`/products/brand/${encodeURIComponent(brand)}`, {
      params,
    });
    return response.data;
  }

  // ============ Carts ============

  /**
   * Get all carts (orders) of a user: GET /carts/user/{id}
   * The endpoint returns a list, not a single cart.
   */
  async getUserCarts(userId: number): Promise<Cart[]> {
    try {
      const response = await this.client.get<CartsResponse>(`/carts/user/${userId}`);
      return response.data.carts;
    } catch (error) {
      // Users created on the register screen don't exist on DummyJSON: no carts, not an error
      if (getErrorStatus(error) === 404) return [];
      throw error;
    }
  }

  /**
   * Get cart by ID
   */
  async getCartById(id: number): Promise<Cart> {
    const response = await this.client.get<Cart>(`/carts/${id}`);
    return response.data;
  }

  /**
   * Create new cart (checkout)
   */
  async addCart(cartData: CartAddRequest): Promise<Cart> {
    const response = await this.client.post<Cart>('/carts/add', cartData);
    return response.data;
  }

  /**
   * Place an order. DummyJSON rejects a cart for a user that doesn't exist
   * ("User with id '209' not found"), which is the case for freshly registered
   * accounts, so we retry once with a real DummyJSON user. The order is only
   * simulated by the API anyway and is stored locally under the real user id.
   */
  async placeOrder(userId: number, products: CartAddRequest['products']): Promise<Cart> {
    try {
      return await this.addCart({ userId, products });
    } catch (error) {
      if (getErrorStatus(error) === 404 && userId !== FALLBACK_USER_ID) {
        return this.addCart({ userId: FALLBACK_USER_ID, products });
      }
      throw error;
    }
  }

  /**
   * Update cart
   */
  async updateCart(id: number, products: CartAddRequest['products'], merge: boolean = true): Promise<Cart> {
    const response = await this.client.put<Cart>(`/carts/${id}`, { products, merge });
    return response.data;
  }

  /**
   * Delete cart
   */
  async deleteCart(id: number): Promise<{ isDeleted: boolean; deletedOn: string }> {
    const response = await this.client.delete<{ isDeleted: boolean; deletedOn: string }>(`/carts/${id}`);
    return response.data;
  }

  /**
   * Get all carts (admin)
   */
  async getAllCarts(params: { limit?: number; skip?: number } = {}): Promise<{ carts: Cart[]; total: number }> {
    const response = await this.client.get<{ carts: Cart[]; total: number }>('/carts', { params });
    return response.data;
  }
}

export const productApi = new ProductApiService();
export { ProductApiService };