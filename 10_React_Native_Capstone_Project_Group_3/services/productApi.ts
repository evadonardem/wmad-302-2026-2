/**
 * Product & Cart API Service - DummyJSON
 * Docs: https://dummyjson.com/docs/products, https://dummyjson.com/docs/carts
 */

import axios, { AxiosInstance } from 'axios';
import {
  Cart,
  CartAddRequest,
  CartsListResponse,
  Product,
  ProductsResponse,
  ProductSearchParams,
} from '@/types/product';

const API_BASE_URL = 'https://dummyjson.com';

interface RawCategoryItem {
  slug?: string;
  name?: string;
  url?: string;
}

class ProductApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getProducts(params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>('/products', { params });
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.client.get<Product>(`/products/${id}`);
    return response.data;
  }

  async searchProducts(
    query: string,
    params: ProductSearchParams = {}
  ): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>('/products/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  async getProductsByCategory(
    category: string,
    params: ProductSearchParams = {}
  ): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      { params }
    );
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await this.client.get<(string | RawCategoryItem)[]>(
      '/products/categories'
    );
    return response.data.map((item) => {
      if (typeof item === 'string') return item;
      return item.slug ?? item.name ?? '';
    }).filter(Boolean);
  }

  async getProductsByBrand(
    brand: string,
    params: ProductSearchParams = {}
  ): Promise<ProductsResponse> {
    const response = await this.client.get<ProductsResponse>(
      `/products/brand/${encodeURIComponent(brand)}`,
      { params }
    );
    return response.data;
  }

  async getUserCarts(userId: number): Promise<CartsListResponse> {
    const response = await this.client.get<CartsListResponse>(`/carts/user/${userId}`);
    return response.data;
  }

  async getCartById(id: number): Promise<Cart> {
    const response = await this.client.get<Cart>(`/carts/${id}`);
    return response.data;
  }

  async addCart(cartData: CartAddRequest): Promise<Cart> {
    const response = await this.client.post<Cart>('/carts/add', cartData);
    return response.data;
  }

  async updateCart(
    id: number,
    products: CartAddRequest['products'],
    merge = true
  ): Promise<Cart> {
    const response = await this.client.put<Cart>(`/carts/${id}`, { products, merge });
    return response.data;
  }

  async deleteCart(id: number): Promise<{ isDeleted: boolean; deletedOn: string }> {
    const response = await this.client.delete<{ isDeleted: boolean; deletedOn: string }>(
      `/carts/${id}`
    );
    return response.data;
  }
}

export const productApi = new ProductApiService();
export { ProductApiService };