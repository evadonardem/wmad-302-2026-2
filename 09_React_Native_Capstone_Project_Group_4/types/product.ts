/**
 * Shared product/cart types used across the app.
 */

export interface Product {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}
