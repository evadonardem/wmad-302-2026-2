import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthUser, RegisterData } from '@/types/auth';

interface LocalAccount {
  user: AuthUser;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
}

const ACCOUNT_PREFIX = 'kartora.account.';
const EMAIL_PREFIX = 'kartora.email.';
const secureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};
const pendingRegistrations = new Set<string>();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function accountKey(username: string): string {
  return `${ACCOUNT_PREFIX}${normalizeUsername(username)}`;
}

function emailKey(email: string): string {
  const normalizedEmail = normalizeEmail(email);
  const encodedEmail = Array.from(
    { length: normalizedEmail.length },
    (_, index) => normalizedEmail.charCodeAt(index).toString(16).padStart(4, '0')
  ).join('');
  return `${EMAIL_PREFIX}${encodedEmail}`;
}

async function ensureSecureStorageAvailable(): Promise<void> {
  if (Platform.OS !== 'web' && !(await SecureStore.isAvailableAsync())) {
    throw new Error('Secure account storage is unavailable on this device.');
  }
}

async function getAccountItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  await ensureSecureStorageAvailable();
  return SecureStore.getItemAsync(key, secureStoreOptions);
}

async function setAccountItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await ensureSecureStorageAvailable();
  await SecureStore.setItemAsync(key, value, secureStoreOptions);
}

async function deleteAccountItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await ensureSecureStorageAvailable();
  await SecureStore.deleteItemAsync(key, secureStoreOptions);
}

async function readAccount(key: string): Promise<LocalAccount | null> {
  const value = await getAccountItem(key);
  return value ? (JSON.parse(value) as LocalAccount) : null;
}

export async function registerLocalAccount(data: RegisterData): Promise<AuthUser> {
  if (Platform.OS !== 'web') await ensureSecureStorageAvailable();

  const username = normalizeUsername(data.username);
  const email = normalizeEmail(data.email);
  const userKey = accountKey(username);
  const userEmailKey = emailKey(email);
  const usernameReservation = `username:${username}`;
  const emailReservation = `email:${email}`;

  if (pendingRegistrations.has(usernameReservation)) {
    throw new Error('That username is already being registered on this device.');
  }
  if (pendingRegistrations.has(emailReservation)) {
    throw new Error('That email is already being registered on this device.');
  }

  pendingRegistrations.add(usernameReservation);
  pendingRegistrations.add(emailReservation);

  try {
    if (await getAccountItem(userKey)) {
      throw new Error('That username is already registered on this device.');
    }
    if (await getAccountItem(userEmailKey)) {
      throw new Error('That email is already registered on this device.');
    }

    const user: AuthUser = {
      id: Date.now(),
      username,
      email,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      age: data.age,
      gender: data.gender ?? 'male',
      image: data.image ?? '',
      authProvider: 'local',
    };
    const passwordSalt = bytesToHex(await Crypto.getRandomBytesAsync(16));
    const passwordHash = await hashPassword(data.password, passwordSalt);
    const account: LocalAccount = { user, passwordHash, passwordSalt };

    await setAccountItem(userKey, JSON.stringify(account));
    try {
      await setAccountItem(userEmailKey, username);
    } catch (error) {
      await deleteAccountItem(userKey);
      throw error;
    }

    return user;
  } finally {
    pendingRegistrations.delete(usernameReservation);
    pendingRegistrations.delete(emailReservation);
  }
}

export async function authenticateLocalAccount(
  identifier: string,
  password: string
): Promise<AuthUser | null> {
  if (Platform.OS !== 'web') await ensureSecureStorageAvailable();

  const trimmedIdentifier = identifier.trim();
  const username = trimmedIdentifier.includes('@')
    ? await getAccountItem(emailKey(trimmedIdentifier))
    : normalizeUsername(trimmedIdentifier);
  if (!username) return null;

  const account = await readAccount(accountKey(username));
  if (!account) return null;
  if (account.passwordHash && account.passwordSalt) {
    const passwordHash = await hashPassword(password, account.passwordSalt);
    if (passwordHash !== account.passwordHash) {
      throw new Error('Invalid username/email or password.');
    }
  } else if (account.password === password) {
    const passwordSalt = bytesToHex(await Crypto.getRandomBytesAsync(16));
    const passwordHash = await hashPassword(password, passwordSalt);
    await setAccountItem(
      accountKey(username),
      JSON.stringify({ user: account.user, passwordHash, passwordSalt })
    );
  } else {
    throw new Error('Invalid username/email or password.');
  }
  return account.user;
}

export async function updateLocalAccount(
  user: AuthUser,
  updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'image'>>
): Promise<AuthUser> {
  if (Platform.OS !== 'web') await ensureSecureStorageAvailable();

  const key = accountKey(user.username);
  const account = await readAccount(key);
  if (!account || account.user.id !== user.id) {
    throw new Error('This device account could not be found.');
  }

  const updatedUser = { ...account.user, ...updates };
  const oldEmailKey = emailKey(account.user.email);
  const newEmailKey = emailKey(updatedUser.email);

  if (oldEmailKey !== newEmailKey) {
    const existingUsername = await getAccountItem(newEmailKey);
    if (existingUsername && existingUsername !== normalizeUsername(user.username)) {
      throw new Error('That email is already registered on this device.');
    }
    await setAccountItem(newEmailKey, normalizeUsername(user.username));
  }

  try {
    await setAccountItem(key, JSON.stringify({ ...account, user: updatedUser }));
    if (oldEmailKey !== newEmailKey) {
      await deleteAccountItem(oldEmailKey);
    }
  } catch (error) {
    if (oldEmailKey !== newEmailKey) {
      await deleteAccountItem(newEmailKey);
    }
    throw error;
  }

  return updatedUser;
}
