/**
 * Pricing and cart math helpers (pure functions - easy to unit test)
 */
import { CartItem, ProductSummary } from '@/types/product';
import { CartTotals } from '@/types/cart';

/** Round to 2 decimals without floating point drift (e.g. 1.005). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Price after applying a percentage discount. */
export function getDiscountedPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return roundMoney(price);
  return roundMoney(price * (1 - discountPercentage / 100));
}

export function formatCurrency(value: number): string {
  return `$${roundMoney(value).toFixed(2)}`;
}

/** Convert a Product into a cart line item (quantity is clamped to stock). */
export function productToCartItem(product: ProductSummary, quantity = 1): CartItem {
  return {
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    quantity: Math.max(1, Math.min(quantity, Math.max(product.stock, 1))),
    stock: product.stock,
  };
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const subtotal = roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const discountedTotal = roundMoney(
    items.reduce((sum, i) => sum + getDiscountedPrice(i.price, i.discountPercentage) * i.quantity, 0)
  );
  return {
    subtotal,
    discountedTotal,
    savings: roundMoney(subtotal - discountedTotal),
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    totalProducts: items.length,
  };
}

/** "home-decoration" -> "Home decoration" */
export function formatCategoryName(slug: string): string {
  const text = slug.replace(/[-_]/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
