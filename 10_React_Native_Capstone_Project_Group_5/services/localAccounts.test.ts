import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { authenticateLocalAccount, registerLocalAccount } from './localAccounts';
import { RegisterData } from '@/types/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  const validateKey = (key: string) => {
    if (!/^[A-Za-z0-9._-]+$/.test(key)) {
      throw new Error('Invalid key provided to SecureStore.');
    }
  };
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'after-first-unlock',
    isAvailableAsync: jest.fn(async () => true),
    getItemAsync: jest.fn(async (key: string) => {
      validateKey(key);
      return values.get(key) ?? null;
    }),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      validateKey(key);
      values.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      validateKey(key);
      values.delete(key);
    }),
    __values: values,
  };
});

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  getRandomBytesAsync: jest.fn(async (length: number) => new Uint8Array(length).fill(7)),
  digestStringAsync: jest.fn(async (_algorithm: string, data: string) => {
    const password = data.slice(data.indexOf(':') + 1);
    return `hashed:${password.split('').reverse().join('')}`;
  }),
}));

const secureStoreValues = (jest.requireMock('expo-secure-store') as { __values: Map<string, string> }).__values;

const accountData: RegisterData = {
  firstName: 'Alex',
  lastName: 'Morgan',
  username: 'alex.morgan',
  email: 'alex@example.com',
  password: 'secure-pass-123',
  age: 24,
  gender: 'female',
};

describe('local device accounts', () => {
  beforeEach(() => {
    secureStoreValues.clear();
    jest.clearAllMocks();
  });

  it('creates an account and allows sign-in using its username or email', async () => {
    const user = await registerLocalAccount(accountData);

    await expect(authenticateLocalAccount('ALEX.MORGAN', accountData.password)).resolves.toEqual(user);
    await expect(authenticateLocalAccount(accountData.email, accountData.password)).resolves.toEqual(user);
    expect(user.authProvider).toBe('local');
    expect(user).not.toHaveProperty('token');
  });

  it('creates secure-storage-compatible email keys', async () => {
    await registerLocalAccount({ ...accountData, email: 'alex+tag@example.com' });

    expect([...secureStoreValues.keys()].every((key) => /^[A-Za-z0-9._-]+$/.test(key))).toBe(true);
    await expect(authenticateLocalAccount('alex+tag@example.com', accountData.password)).resolves.toBeDefined();
  });

  it('rejects duplicate usernames and emails', async () => {
    await registerLocalAccount(accountData);

    await expect(registerLocalAccount({ ...accountData, email: 'another@example.com' }))
      .rejects.toThrow('username is already registered');
    await expect(registerLocalAccount({ ...accountData, username: 'another.user' }))
      .rejects.toThrow('email is already registered');
  });

  it('does not authenticate an account with the wrong password', async () => {
    await registerLocalAccount(accountData);

    await expect(authenticateLocalAccount(accountData.username, 'wrong-password'))
      .rejects.toThrow('Invalid username/email or password');
  });

  it('stores a password hash instead of the plain text password', async () => {
    await registerLocalAccount(accountData);

    const storedValue = secureStoreValues.values().next().value as string | undefined;
    expect(storedValue).toBeDefined();
    expect(storedValue).not.toContain(accountData.password);
  });

  it('does not create the same account twice concurrently', async () => {
    const first = registerLocalAccount(accountData);
    const second = registerLocalAccount(accountData);

    await expect(first).resolves.toBeDefined();
    await expect(second).rejects.toThrow('already being registered');
  });
});
