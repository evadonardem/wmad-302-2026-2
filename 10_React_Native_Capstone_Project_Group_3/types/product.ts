/**
 * Product & Cart Types - DummyJSON Products & Carts API
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

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

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

export interface CartProductSummary {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface Cart {
  id: number;
  products: CartProductSummary[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  userId: number;
}

export interface CartsListResponse {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
}

export interface CartAddRequest {
  userId: number;
  products: {
    id: number;
    quantity: number;
  }[];
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