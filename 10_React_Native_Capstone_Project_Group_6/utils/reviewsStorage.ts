/**
 * Reviews the person wrote, on the device: one review per product, per account.
 * It talks to AsyncStorage directly, so it does not depend on utils/storage.ts.
 * Saved as one object: { "emilys": { "12": review, "40": review }, "jlaw": { ... } }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeUserReview, type UserReview } from '@/utils/reviews';

const STORAGE_KEY = 'product_reviews';

type ReviewMap = Record<string, Record<string, unknown>>;

const ownerKey = (owner: string) => owner.trim().toLowerCase();

/** Everyone's reviews. Missing or damaged data counts as "nothing saved". */
async function readAll(): Promise<ReviewMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as ReviewMap) : {};
  } catch {
    return {};
  }
}

async function writeOwner(owner: string, reviews: Record<string, unknown>): Promise<void> {
  const all = await readAll();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [ownerKey(owner)]: reviews }));
}

async function readOwner(owner: string): Promise<Record<string, unknown>> {
  const mine = (await readAll())[ownerKey(owner)];
  return mine && typeof mine === 'object' && !Array.isArray(mine) ? mine : {};
}

export const reviewsStorage = {
  get: async (owner: string, productId: number): Promise<UserReview | null> =>
    sanitizeUserReview((await readOwner(owner))[String(productId)]),

  set: async (owner: string, review: UserReview): Promise<void> => {
    const mine = await readOwner(owner);
    await writeOwner(owner, { ...mine, [String(review.productId)]: review });
  },

  remove: async (owner: string, productId: number): Promise<void> => {
    const { [String(productId)]: _removed, ...rest } = await readOwner(owner);
    await writeOwner(owner, rest);
  },
};
