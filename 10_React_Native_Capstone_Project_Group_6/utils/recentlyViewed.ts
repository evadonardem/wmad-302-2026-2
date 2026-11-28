/**
 * Recently viewed products (pure functions, easy to unit test)
 * - addRecentlyViewed: the product you just opened goes to the front (no repeats, capped)
 * - recentlyViewedReducer: the state behind RecentlyViewedContext
 * - sanitizeRecentlyViewed: makes sure what we read back from the device is a usable list
 */

import type { Product, WishlistItem } from '@/types/product';

/** What we keep about each product (same small copy the wishlist uses). */
export type RecentlyViewedItem = WishlistItem;

/** How many products the history keeps. */
export const MAX_RECENTLY_VIEWED = 10;

/** Keep only the product fields the history row needs. */
export function toRecentItem(product: RecentlyViewedItem | Product): RecentlyViewedItem {
  return {
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    category: product.category,
    price: product.price,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
  };
}

/** Newest first. Viewing a product again moves it to the front instead of listing it twice. */
export function addRecentlyViewed(
  list: RecentlyViewedItem[],
  product: RecentlyViewedItem | Product,
  max: number = MAX_RECENTLY_VIEWED
): RecentlyViewedItem[] {
  return [toRecentItem(product), ...list.filter((item) => item.id !== product.id)].slice(0, max);
}

export function removeRecentlyViewed(list: RecentlyViewedItem[], id: number): RecentlyViewedItem[] {
  return list.filter((item) => item.id !== id);
}

/** Anything read back from storage may be old or damaged: keep only proper items. */
export function sanitizeRecentlyViewed(raw: unknown, max: number = MAX_RECENTLY_VIEWED): RecentlyViewedItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const clean: RecentlyViewedItem[] = [];
  for (const entry of raw) {
    const item = entry as Partial<RecentlyViewedItem> | null;
    if (
      !item ||
      typeof item.id !== 'number' ||
      typeof item.title !== 'string' ||
      typeof item.thumbnail !== 'string' ||
      typeof item.price !== 'number' ||
      seen.has(item.id)
    ) {
      continue;
    }
    seen.add(item.id);
    clean.push({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      category: typeof item.category === 'string' ? item.category : '',
      price: item.price,
      discountPercentage: typeof item.discountPercentage === 'number' ? item.discountPercentage : 0,
      rating: typeof item.rating === 'number' ? item.rating : 0,
      stock: typeof item.stock === 'number' ? item.stock : 0,
    });
  }
  return clean.slice(0, max);
}

// ---------- Reducer ----------

export interface RecentlyViewedState {
  items: RecentlyViewedItem[]; // newest first
  isHydrated: boolean; // true once this account's saved history has been loaded
}

export type RecentlyViewedAction =
  | { type: 'RECENT_RESET' }
  | { type: 'RECENT_HYDRATE'; payload: RecentlyViewedItem[] }
  | { type: 'RECENT_VIEW'; payload: RecentlyViewedItem | Product }
  | { type: 'RECENT_REMOVE'; payload: number }
  | { type: 'RECENT_CLEAR' };

export const initialRecentlyViewedState: RecentlyViewedState = { items: [], isHydrated: false };

export function recentlyViewedReducer(state: RecentlyViewedState, action: RecentlyViewedAction): RecentlyViewedState {
  switch (action.type) {
    case 'RECENT_RESET':
      return initialRecentlyViewedState;

    case 'RECENT_HYDRATE':
      return { items: sanitizeRecentlyViewed(action.payload), isHydrated: true };

    case 'RECENT_VIEW':
      // Before the saved history is loaded, adding would be overwritten by it: ignore
      if (!state.isHydrated) return state;
      return { ...state, items: addRecentlyViewed(state.items, action.payload) };

    case 'RECENT_REMOVE':
      return { ...state, items: removeRecentlyViewed(state.items, action.payload) };

    case 'RECENT_CLEAR':
      return state.items.length === 0 ? state : { ...state, items: [] };

    default:
      return state;
  }
}
