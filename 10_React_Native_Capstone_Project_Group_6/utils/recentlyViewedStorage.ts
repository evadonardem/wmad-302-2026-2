/**
 * Recently viewed history on the device (Home > Recently viewed): one history per account,
 * newest first. It talks to AsyncStorage directly, so it does not depend on utils/storage.ts.
 * Saved as one object: { "emilys": [items], "jlaw": [items] }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeRecentlyViewed, type RecentlyViewedItem } from '@/utils/recentlyViewed';

const STORAGE_KEY = 'recently_viewed';

const ownerKey = (owner: string) => owner.trim().toLowerCase();

/** Everyone's histories. Missing or damaged data counts as "nothing saved". */
async function readAll(): Promise<Record<string, unknown>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const recentlyViewedStorage = {
  get: async (owner: string): Promise<RecentlyViewedItem[]> =>
    sanitizeRecentlyViewed((await readAll())[ownerKey(owner)]),

  set: async (owner: string, items: RecentlyViewedItem[]): Promise<void> => {
    const all = await readAll();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [ownerKey(owner)]: items }));
  },
};
