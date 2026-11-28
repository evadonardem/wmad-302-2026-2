/**
 * Wishlist Context - saved products ("hearts")
 * Same pattern as CartContext: useReducer + AsyncStorage, one wishlist per account.
 * The wishlist keeps a small copy of each product (see WishlistItem) so the Wishlist
 * screen can show it without loading every product again.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product, WishlistItem } from '@/types/product';
import { wishlistStorage } from '@/utils/storage';

export interface WishlistState {
  items: WishlistItem[]; // newest first
  isHydrated: boolean;
}

export type WishlistAction =
  | { type: 'WISHLIST_HYDRATE'; payload: WishlistItem[] }
  | { type: 'WISHLIST_TOGGLE'; payload: WishlistItem }
  | { type: 'WISHLIST_REMOVE'; payload: number };

export const initialWishlistState: WishlistState = { items: [], isHydrated: false };

/** Keep only the product fields the wishlist needs. */
export function toWishlistItem(product: WishlistItem | Product): WishlistItem {
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

export function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'WISHLIST_HYDRATE':
      return { items: action.payload, isHydrated: true };

    case 'WISHLIST_TOGGLE': {
      const exists = state.items.some((i) => i.id === action.payload.id);
      return {
        ...state,
        items: exists
          ? state.items.filter((i) => i.id !== action.payload.id)
          : [action.payload, ...state.items], // newest first
      };
    }

    case 'WISHLIST_REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    default:
      return state;
  }
}

interface WishlistContextType {
  items: WishlistItem[];
  isHydrated: boolean;
  count: number;
  isInWishlist: (productId: number) => boolean;
  /** Adds the product if it is not saved, removes it if it is. Returns true when it was ADDED. */
  toggleWishlist: (product: WishlistItem | Product) => boolean;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialWishlistState);
  const { user } = useAuth();
  const owner = user?.username ?? null;
  // Which account's wishlist is loaded: stops one account's hearts being saved under another
  const loadedOwner = useRef<string | null>(null);

  // Load the wishlist of whoever is logged in (again when the account changes)
  useEffect(() => {
    let cancelled = false;
    loadedOwner.current = null;
    dispatch({ type: 'WISHLIST_HYDRATE', payload: [] });
    if (!owner) return;

    wishlistStorage
      .get(owner)
      .then((saved) => {
        if (cancelled) return;
        loadedOwner.current = owner;
        dispatch({ type: 'WISHLIST_HYDRATE', payload: saved });
      })
      .catch(() => {
        if (cancelled) return;
        loadedOwner.current = owner;
      });
    return () => {
      cancelled = true;
    };
  }, [owner]);

  // Save whenever the list changes (only once THIS account's list has been loaded)
  useEffect(() => {
    if (!owner || loadedOwner.current !== owner) return;
    wishlistStorage.set(owner, state.items).catch((error: unknown) => {
      console.error('Failed to save wishlist:', error);
    });
  }, [state.items, owner]);

  const isInWishlist = useCallback(
    (productId: number) => state.items.some((i) => i.id === productId),
    [state.items]
  );

  const toggleWishlist = useCallback(
    (product: WishlistItem | Product): boolean => {
      const added = !state.items.some((i) => i.id === product.id);
      dispatch({ type: 'WISHLIST_TOGGLE', payload: toWishlistItem(product) });
      return added;
    },
    [state.items]
  );

  const removeFromWishlist = useCallback((productId: number) => {
    dispatch({ type: 'WISHLIST_REMOVE', payload: productId });
  }, []);

  const value = useMemo<WishlistContextType>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      count: state.items.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [state.items, state.isHydrated, isInWishlist, toggleWishlist, removeFromWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export { WishlistContext };
