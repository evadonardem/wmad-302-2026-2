/**
 * Unit tests - AsyncStorage helpers
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAllStorage,
  getMultipleStorageItems,
  setMultipleStorageItems,
  authStorage,
  favoritesStorage,
  cartStorage,
} from '@/utils/storage';
import { sampleUser } from '../../test-utils/fixtures';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('basic helpers', () => {
  it('saves and reads a value', async () => {
    await setStorageItem('user_settings', { notifications: true });
    expect(await getStorageItem('user_settings')).toEqual({ notifications: true });
  });

  it('returns null for a missing key', async () => {
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('returns null when the stored text is not valid JSON', async () => {
    await AsyncStorage.setItem('user_settings', '{not json');
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('returns null when reading fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('throws when writing fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
    await expect(setStorageItem('user_settings', {})).rejects.toThrow('full');
  });

  it('removes a value', async () => {
    await setStorageItem('user_settings', 1);
    await removeStorageItem('user_settings');
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('does not throw when removing fails', async () => {
    jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('x'));
    await expect(removeStorageItem('user_settings')).resolves.toBeUndefined();
  });

  it('clears every app key', async () => {
    await setStorageItem('user_settings', 1);
    await setStorageItem('favorite_recipe_ids', [1]);
    await clearAllStorage();
    expect(await getStorageItem('user_settings')).toBeNull();
    expect(await getStorageItem('favorite_recipe_ids')).toBeNull();
  });

  it('does not throw when clearing fails', async () => {
    jest.spyOn(AsyncStorage, 'multiRemove').mockRejectedValueOnce(new Error('x'));
    await expect(clearAllStorage()).resolves.toBeUndefined();
  });

  it('reads and writes several keys at once', async () => {
    await setMultipleStorageItems([
      { key: 'user_settings', value: { a: 1 } },
      { key: 'favorite_recipe_ids', value: [5] },
    ]);
    const result = await getMultipleStorageItems<Record<string, unknown>>([
      'user_settings',
      'favorite_recipe_ids',
      'cart_items',
    ]);
    expect(result).toEqual({
      user_settings: { a: 1 },
      favorite_recipe_ids: [5],
      cart_items: null,
    });
  });

  it('returns an empty object when a multi-read fails', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockRejectedValueOnce(new Error('x'));
    expect(await getMultipleStorageItems(['user_settings'])).toEqual({});
  });

  it('throws when a multi-write fails', async () => {
    jest.spyOn(AsyncStorage, 'multiSet').mockRejectedValueOnce(new Error('x'));
    await expect(
      setMultipleStorageItems([{ key: 'user_settings', value: 1 }])
    ).rejects.toThrow('x');
  });
});

describe('authStorage', () => {
  it('saves, reads and clears the user', async () => {
    await authStorage.setUser(sampleUser);
    expect(await authStorage.getUser()).toEqual(sampleUser);
    await authStorage.clearUser();
    expect(await authStorage.getUser()).toBeNull();
  });
});

describe('favoritesStorage', () => {
  it('returns an empty list when nothing is saved', async () => {
    expect(await favoritesStorage.getIds()).toEqual([]);
  });

  it('adds an id once', async () => {
    await favoritesStorage.addId(4);
    await favoritesStorage.addId(4);
    expect(await favoritesStorage.getIds()).toEqual([4]);
  });

  it('removes an id', async () => {
    await favoritesStorage.setIds([1, 2, 3]);
    await favoritesStorage.removeId(2);
    expect(await favoritesStorage.getIds()).toEqual([1, 3]);
  });

  it('toggles an id and reports the new state', async () => {
    expect(await favoritesStorage.toggleId(7)).toBe(true);
    expect(await favoritesStorage.getIds()).toEqual([7]);
    expect(await favoritesStorage.toggleId(7)).toBe(false);
    expect(await favoritesStorage.getIds()).toEqual([]);
  });
});

describe('cartStorage', () => {
  it('starts empty', async () => {
    expect(await cartStorage.getCart()).toEqual([]);
  });

  it('merges quantities for the same product', async () => {
    await cartStorage.addItem({ productId: 1, quantity: 1 });
    await cartStorage.addItem({ productId: 1, quantity: 2 });
    await cartStorage.addItem({ productId: 2, quantity: 1 });
    expect(await cartStorage.getCart()).toEqual([
      { productId: 1, quantity: 3 },
      { productId: 2, quantity: 1 },
    ]);
  });

  it('updates a quantity and removes the item at zero', async () => {
    await cartStorage.addItem({ productId: 1, quantity: 1 });
    await cartStorage.updateQuantity(1, 5);
    expect(await cartStorage.getCart()).toEqual([{ productId: 1, quantity: 5 }]);
    await cartStorage.updateQuantity(1, 0);
    expect(await cartStorage.getCart()).toEqual([]);
  });

  it('ignores updates for unknown products', async () => {
    await cartStorage.updateQuantity(99, 3);
    expect(await cartStorage.getCart()).toEqual([]);
  });

  it('removes an item and clears the cart', async () => {
    await cartStorage.addItem({ productId: 1, quantity: 1 });
    await cartStorage.addItem({ productId: 2, quantity: 1 });
    await cartStorage.removeItem(1);
    expect(await cartStorage.getCart()).toEqual([{ productId: 2, quantity: 1 }]);
    await cartStorage.clear();
    expect(await cartStorage.getCart()).toEqual([]);
  });
});