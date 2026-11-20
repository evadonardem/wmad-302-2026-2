import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, LocalAccount } from '@/types/auth';
import { CartItem, Order } from '@/types/product';
import {
  accountStorage,
  addressStorage,
  cartStorage,
  clearAllStorage,
  getStorageItem,
  orderStorage,
  profileEditStorage,
  removeStorageItem,
  setStorageItem,
  settingsStorage,
} from '@/utils/storage';

const account = (overrides: Partial<LocalAccount> = {}): LocalAccount => ({
  username: 'JLaw',
  passwordHash: 'hash',
  firstName: 'Jennifer',
  lastName: 'Lawrence',
  email: 'jen@example.com',
  ...overrides,
});

const cartItem = (productId: number): CartItem => ({
  productId,
  title: 'Item',
  thumbnail: '',
  price: 10,
  discountPercentage: 0,
  stock: 5,
  quantity: 1,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('basic helpers', () => {
  it('saves, reads and removes a value', async () => {
    await setStorageItem('user_settings', { a: 1 });
    expect(await getStorageItem('user_settings')).toEqual({ a: 1 });
    await removeStorageItem('user_settings');
    expect(await getStorageItem('user_settings')).toBeNull();
  });

  it('returns null for damaged JSON instead of crashing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await AsyncStorage.setItem('orders', '{not json');
    expect(await getStorageItem('orders')).toBeNull();
    jest.restoreAllMocks();
  });

  it('clears everything the app saves', async () => {
    await setStorageItem('orders', [1]);
    await setStorageItem('cart', {});
    await clearAllStorage();
    expect(await getStorageItem('orders')).toBeNull();
    expect(await getStorageItem('cart')).toBeNull();
  });
});

describe('accountStorage', () => {
  it('starts empty and saves accounts', async () => {
    expect(await accountStorage.getAll()).toEqual([]);
    await accountStorage.add(account());
    expect(await accountStorage.getAll()).toHaveLength(1);
  });

  it('finds an account ignoring case and spaces', async () => {
    await accountStorage.add(account());
    expect((await accountStorage.find('  jlaw '))?.firstName).toBe('Jennifer');
    expect(await accountStorage.find('nobody')).toBeNull();
    expect(await accountStorage.find('')).toBeNull();
    expect(await accountStorage.find(undefined)).toBeNull();
  });

  it('ignores damaged entries', async () => {
    await setStorageItem('local_accounts', [null, {}, { username: 5 }, account({ username: 'ok' })]);
    const all = await accountStorage.getAll();
    expect(all.map((a) => a.username)).toEqual(['ok']);
  });

  it('updates only the matching account', async () => {
    await accountStorage.add(account());
    await accountStorage.add(account({ username: 'other' }));
    await accountStorage.update('jlaw', { firstName: 'Jen' });
    expect((await accountStorage.find('JLaw'))?.firstName).toBe('Jen');
    expect((await accountStorage.find('other'))?.firstName).toBe('Jennifer');
  });
});

describe('cartStorage (one cart per account)', () => {
  it('keeps each account\'s cart separate', async () => {
    await cartStorage.setCart('emilys', [cartItem(1)]);
    await cartStorage.setCart('JLaw', [cartItem(2), cartItem(3)]);
    expect(await cartStorage.getCart('emilys')).toHaveLength(1);
    expect(await cartStorage.getCart('jlaw')).toHaveLength(2); // case-insensitive
    expect(await cartStorage.getCart('someone-else')).toEqual([]);
  });

  it('ignores an old cart saved as a plain list', async () => {
    await setStorageItem('cart', [cartItem(1)]);
    expect(await cartStorage.getCart('emilys')).toEqual([]);
    await cartStorage.setCart('emilys', [cartItem(2)]); // and replaces it cleanly
    expect(await cartStorage.getCart('emilys')).toHaveLength(1);
  });

  it('clears the saved carts', async () => {
    await cartStorage.setCart('emilys', [cartItem(1)]);
    await cartStorage.clear();
    expect(await cartStorage.getCart('emilys')).toEqual([]);
  });
});

describe('orderStorage', () => {
  const order = (id: string) => ({ id } as unknown as Order);

  it('puts the newest order first', async () => {
    await orderStorage.addOrder(order('ORD-1'));
    await orderStorage.addOrder(order('ORD-2'));
    expect((await orderStorage.getOrders()).map((o) => o.id)).toEqual(['ORD-2', 'ORD-1']);
    await orderStorage.clear();
    expect(await orderStorage.getOrders()).toEqual([]);
  });
});

describe('per-account storage (addresses, settings, profile edits)', () => {
  const address: Address = {
    id: 'A1', label: 'Home', fullName: 'Jen', phone: '0917', address: '12 Rizal St',
    city: 'Manila', postalCode: '1000', isDefault: true,
  };

  it('keeps addresses separate for each account', async () => {
    await addressStorage.set('emilys', [address]);
    expect(await addressStorage.get('EMILYS')).toHaveLength(1);
    expect(await addressStorage.get('jlaw')).toEqual([]);
  });

  it('keeps settings separate for each account', async () => {
    const settings = { orderUpdates: false, promotions: true, defaultPayment: 'gcash' as const };
    await settingsStorage.set('jlaw', settings);
    expect(await settingsStorage.get('jlaw')).toEqual(settings);
    expect(await settingsStorage.get('emilys')).toBeNull();
  });

  it('keeps profile edits separate for each account', async () => {
    const edits = { firstName: 'Em', lastName: 'Smith', email: 'e@x.co', phone: '' };
    await profileEditStorage.set('emilys', edits);
    expect(await profileEditStorage.get('emilys')).toEqual(edits);
    expect(await profileEditStorage.get('jlaw')).toBeNull();
  });

  it('survives data saved in the wrong shape', async () => {
    await setStorageItem('addresses', [address]); // a list instead of {username: list}
    expect(await addressStorage.get('emilys')).toEqual([]);
  });
});
