/**
 * Product Types - DummyJSON Products API
 * Docs: https://dummyjson.com/docs/products
 */

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
  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
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

export interface Cart {
  id: number;
  products: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnail: string;
  }[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  userId: number;
}

/** GET /carts/user/{id} returns a list of carts, not a single cart. */
export interface CartsResponse {
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

// ============ Cart state (Context + useReducer) ============

export interface CartState {
  items: CartItem[];
  /** False until the saved cart has been read from AsyncStorage. */
  hydrated: boolean;
}

export type CartAction =
  | { type: 'CART_HYDRATE'; payload: CartItem[] }
  | { type: 'CART_ADD'; payload: CartItem }
  | { type: 'CART_REMOVE'; payload: { productId: number } }
  | { type: 'CART_SET_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CART_CLEAR' };

export interface CartTotals {
  /** Sum of price x quantity before discounts. */
  subtotal: number;
  /** Total saved through per-product discounts. */
  discount: number;
  /** Amount to pay (subtotal - discount). */
  total: number;
  /** Distinct products in the cart. */
  totalProducts: number;
  /** Sum of all quantities (used for the tab badge). */
  totalQuantity: number;
}
