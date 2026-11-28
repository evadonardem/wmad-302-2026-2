/**
 * Secure token storage.
 * - iOS/Android: expo-secure-store (Keychain / Keystore)
 * - Web: SecureStore is unavailable, so AsyncStorage is used as a fallback.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKENS_KEY = 'auth_tokens';

export interface StoredTokens {
  token: string;
  refreshToken: string;
}

const useNativeStore = Platform.OS !== 'web';

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  const value = JSON.stringify(tokens);
  if (useNativeStore) {
    await SecureStore.setItemAsync(TOKENS_KEY, value);
  } else {
    await AsyncStorage.setItem(TOKENS_KEY, value);
  }
}

export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const value = useNativeStore
      ? await SecureStore.getItemAsync(TOKENS_KEY)
      : await AsyncStorage.getItem(TOKENS_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredTokens>;
    if (typeof parsed.token === 'string' && typeof parsed.refreshToken === 'string') {
      return { token: parsed.token, refreshToken: parsed.refreshToken };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    if (useNativeStore) {
      await SecureStore.deleteItemAsync(TOKENS_KEY);
    } else {
      await AsyncStorage.removeItem(TOKENS_KEY);
    }
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}
