import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authStorage,
  clearAllStorage,
  favoritesStorage,
  reviewsStorage,
  settingsStorage,
  DEFAULT_SETTINGS,
} from '@/utils/storage';
import type { AuthUser } from '@/types/auth';

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'e@x.com',
  firstName: 'Emily',
  lastName: 'J',
  gender: 'female',
  image: '',
  token: 't',
  refreshToken: 'r',
};

beforeEach(async () => {
  await AsyncStorage.clear();
  await authStorage.clearSession();
});

describe('favoritesStorage', () => {
  it('starts empty and persists add / remove / toggle', async () => {
    expect(await favoritesStorage.getIds()).toEqual([]);
    await favoritesStorage.addId(3);
    await favoritesStorage.addId(3); // no duplicates
    await favoritesStorage.addId(4);
    expect(await favoritesStorage.getIds()).toEqual([3, 4]);
    await favoritesStorage.removeId(3);
    expect(await favoritesStorage.getIds()).toEqual([4]);
    expect(await favoritesStorage.toggleId(4)).toBe(false);
    expect(await favoritesStorage.toggleId(9)).toBe(true);
    expect(await favoritesStorage.getIds()).toEqual([9]);
  });
});

describe('authStorage', () => {
  it('round-trips a session and clears it on logout', async () => {
    expect(await authStorage.loadSession()).toBeNull();
    await authStorage.saveSession(user);
    expect(await authStorage.loadSession()).toEqual(user);
    await authStorage.clearSession();
    expect(await authStorage.loadSession()).toBeNull();
  });

  it('does not keep tokens in the plain profile entry', async () => {
    await authStorage.saveSession(user);
    const profile = await AsyncStorage.getItem('auth_profile');
    expect(profile).not.toContain('refreshToken');
  });
});

describe('settingsStorage', () => {
  it('falls back to defaults and merges stored values', async () => {
    expect(await settingsStorage.get()).toEqual(DEFAULT_SETTINGS);
    await settingsStorage.set({ darkMode: true, notifications: false });
    expect(await settingsStorage.get()).toEqual({ darkMode: true, notifications: false });
  });
});

describe('reviewsStorage', () => {
  it('stores reviews per recipe and counts them per user', async () => {
    const base = { recipeId: 1, userId: 7, author: 'A', rating: 5, comment: 'Great', createdAt: '2026-01-01' };
    await reviewsStorage.add({ ...base, id: 'a' });
    await reviewsStorage.add({ ...base, id: 'b', recipeId: 2 });
    await reviewsStorage.add({ ...base, id: 'c', userId: 8 });
    expect((await reviewsStorage.getForRecipe(1)).map((r) => r.id)).toEqual(['c', 'a']);
    expect(await reviewsStorage.countByUser(7)).toBe(2);
  });
});

describe('clearAllStorage', () => {
  it('removes everything the app stores', async () => {
    await favoritesStorage.addId(1);
    await authStorage.saveSession(user);
    await clearAllStorage();
    expect(await favoritesStorage.getIds()).toEqual([]);
    expect(await authStorage.loadSession()).toBeNull();
  });
});
