/**
 * Product Types - DummyJSON Products API
 * Docs: https://dummyjson.com/docs/products
 */

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

/** Lightweight product used in lists (fetched with the API's `select` param). */
export type ProductSummary = Pick<
  Product,
  | 'id'
  | 'title'
  | 'category'
  | 'price'
  | 'discountPercentage'
  | 'rating'
  | 'stock'
  | 'thumbnail'
  | 'brand'
  | 'meta'
>;

export const PRODUCT_SUMMARY_FIELDS =
  'title,category,price,discountPercentage,rating,stock,thumbnail,brand,meta';

export interface ProductsResponse<T = Product> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

/** Normalised category (the API returns either plain strings or objects). */
export interface Category {
  slug: string;
  name: string;
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'newest';

export interface ProductSearchParams {
  q?: string;
  category?: string;
  brand?: string;
  limit?: number;
  skip?: number;
  select?: string;
  sortBy?: 'title' | 'price' | 'rating' | 'discountPercentage';
  order?: 'asc' | 'desc';
}

export interface Cart {
  id: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnail: string;
  }>;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  userId: number;
}

export interface CartsResponse {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartAddRequest {
  userId: number;
  products: Array<{
    id: number;
    quantity: number;
  }>;
}

export interface CartItem {
  productId: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  quantity: number;
  stock: number;
}