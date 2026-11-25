/* eslint-env jest */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  accountsStorage,
  authStorage,
  favoritesStorage,
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@/utils/storage';
import { makeUser } from '../../test-utils/fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('storage helpers', () => {
  it('saves and reads a JSON value', async () => {
    await setStorageItem('user_settings', { dark: true });
    expect(await getStorageItem('user_settings')).toEqual({ dark: true });
  });

  it('returns null when nothing is saved', async () => {
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('removes a value', async () => {
    await setStorageItem('user_settings', 1);
    await removeStorageItem('user_settings');
    expect(await getStorageItem('user_settings')).toBeNull();
  });
});

describe('authStorage', () => {
  it('stores and clears the user', async () => {
    const user = makeUser();
    await authStorage.setUser(user);
    expect(await authStorage.getUser()).toEqual(user);
    await authStorage.clearUser();
    expect(await authStorage.getUser()).toBeNull();
  });
});

describe('favoritesStorage', () => {
  it('starts empty', async () => {
    expect(await favoritesStorage.getIds()).toEqual([]);
  });

  it('adds an id only once', async () => {
    await favoritesStorage.addId(5);
    await favoritesStorage.addId(5);
    expect(await favoritesStorage.getIds()).toEqual([5]);
  });

  it('removes an id', async () => {
    await favoritesStorage.setIds([1, 2, 3]);
    await favoritesStorage.removeId(2);
    expect(await favoritesStorage.getIds()).toEqual([1, 3]);
  });

  it('toggleId adds then removes and reports the new state', async () => {
    expect(await favoritesStorage.toggleId(7)).toBe(true);
    expect(await favoritesStorage.getIds()).toEqual([7]);
    expect(await favoritesStorage.toggleId(7)).toBe(false);
    expect(await favoritesStorage.getIds()).toEqual([]);
  });
});

describe('accountsStorage', () => {
  const profile = {
    id: 1,
    username: 'jecressa',
    email: 'jecressa@example.com',
    firstName: 'Jecressa',
    lastName: 'Agustin',
    gender: 'female' as const,
    image: 'https://example.com/me.png',
  };

  it('adds and lists accounts', async () => {
    await accountsStorage.add({ password: 'secret1', user: profile });
    const all = await accountsStorage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].user.username).toBe('jecressa');
  });

  it('updates an account by id', async () => {
    await accountsStorage.add({ password: 'secret1', user: profile });
    await accountsStorage.update(profile.id, { firstName: 'Jec' });
    const all = await accountsStorage.getAll();
    expect(all[0].user.firstName).toBe('Jec');
    expect(all[0].password).toBe('secret1');
  });
});
