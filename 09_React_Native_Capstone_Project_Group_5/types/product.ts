export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
  category?: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
}
