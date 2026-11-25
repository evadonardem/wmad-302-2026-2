/**
 * Flash Deals helpers (pure functions, easy to unit test)
 * DummyJSON has no "deals" endpoint, so a deal is simply a product with a big discount.
 * The deals "reset" every day at midnight (local time): that is what the countdown shows.
 */
import type { Product } from '@/types/product';

// DummyJSON discounts are small (the biggest is only around 20%), so a fixed "over 20%"
// rule leaves the section EMPTY. A flash deal is simply one of the biggest discounts.
export const FLASH_DEAL_MIN_DISCOUNT = 0; // percent
export const FLASH_DEAL_LIMIT = 8;
export const LOW_STOCK_THRESHOLD = 20;

/** "Only 7 left" when stock is running low, otherwise null (nothing to show). */
export function getStockLabel(stock: number, threshold = LOW_STOCK_THRESHOLD): string | null {
  if (stock <= 0) return 'Sold out';
  return stock <= threshold ? `Only ${stock} left` : null;
}

/** The headline number for the banner: "UP TO 19% OFF" (0 if there are no deals). */
export function getMaxDiscount(deals: { discountPercentage: number }[]): number {
  return deals.reduce((max, d) => Math.max(max, Math.round(d.discountPercentage)), 0);
}

/** Milliseconds from `now` until the next midnight (local time). */
export function getMsUntilMidnight(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // 24:00 = the start of tomorrow
  return midnight.getTime() - now.getTime();
}

/** 5 hours, 3 minutes, 9 seconds -> "05:03:09". Never negative. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

/** In-stock products with a discount, biggest discount first (the input is not changed). */
export function getFlashDeals<T extends Pick<Product, 'discountPercentage' | 'stock'>>(
  products: T[],
  limit = FLASH_DEAL_LIMIT,
  minDiscount = FLASH_DEAL_MIN_DISCOUNT
): T[] {
  return products
    .filter((p) => p.discountPercentage > minDiscount && p.stock > 0)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, limit);
}
