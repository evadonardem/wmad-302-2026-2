/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';

const API_BASE_URL = 'https://dummyjson.com/auth';
const AUTH_STORAGE_KEY = 'auth_user';
const LOCAL_ACCOUNTS_KEY = 'local_auth_accounts';
const LAST_LOGIN_USERNAME_KEY = 'last_login_username';

interface LocalAccount {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender: 'male' | 'female';
  passwordHash: string;
}

class AuthApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private inMemoryUser: AuthUser | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            console.warn('Token refresh failed, user logged out');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async hydrateFromStorage(): Promise<AuthUser | null> {
    try {
      const storedValue = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const storedUser = storedValue ? (JSON.parse(storedValue) as AuthUser) : null;
      this.inMemoryUser = storedUser;
      return storedUser;
    } catch {
      this.inMemoryUser = null;
      return null;
    }
  }

  private getAccessToken(): string | null {
    return this.inMemoryUser?.token ?? null;
  }

  private getRefreshToken(): string | null {
    return this.inMemoryUser?.refreshToken ?? null;
  }

  private async createRandomHex(byteLength: number): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(byteLength);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private async getLocalAccounts(): Promise<LocalAccount[]> {
    const storedAccounts = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return storedAccounts ? (JSON.parse(storedAccounts) as LocalAccount[]) : [];
  }

  async getLastLoginUsername(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_LOGIN_USERNAME_KEY);
  }

  private async saveLastLoginUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_LOGIN_USERNAME_KEY, username);
    } catch (error) {
      console.warn('Unable to save the last login username:', error);
    }
  }

  private async createLocalSession(account: LocalAccount): Promise<AuthUser> {
    return {
      id: account.id,
      username: account.username,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      gender: account.gender,
      image: '',
      token: await this.createRandomHex(32),
      refreshToken: await this.createRandomHex(32),
      authProvider: 'local',
    };
  }

  public async setTokens(user: AuthUser): Promise<void> {
    this.inMemoryUser = user;
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  }

  public async clearTokens(): Promise<void> {
    this.inMemoryUser = null;
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const identifier = credentials.username.trim().toLowerCase();
    const localAccount = (await this.getLocalAccounts()).find(
      (account) =>
        account.username.toLowerCase() === identifier ||
        account.email.toLowerCase() === identifier
    );

    if (localAccount) {
      const passwordMatches = await bcrypt.compare(credentials.password, localAccount.passwordHash);
      if (!passwordMatches) {
        throw new Error('Incorrect username or password.');
      }

      const user = await this.createLocalSession(localAccount);
      await this.setTokens(user);
      await this.saveLastLoginUsername(user.username);
      return user;
    }

    const response = await this.client.post<AuthUser>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });

    await this.setTokens(response.data);
    await this.saveLastLoginUsername(response.data.username);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();
    const accounts = await this.getLocalAccounts();

    if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('That username is already in use.');
    }

    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      throw new Error('An account with that email already exists.');
    }

    const account: LocalAccount = {
      id: Date.now(),
      username,
      email,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      age: data.age,
      gender: data.gender ?? 'male',
      passwordHash: await bcrypt.hash(data.password, 10),
    };

    await AsyncStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    const user = await this.createLocalSession(account);
    await this.setTokens(user);
    await this.saveLastLoginUsername(user.username);
    return user;
  }

  async getMe(): Promise<AuthUser> {
    const currentUser = this.getStoredUser();
    if (currentUser?.authProvider === 'local') {
      return currentUser;
    }

    const response = await this.client.get<AuthUser>('/me');
    return response.data;
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', {
        refreshToken,
        expiresInMins: 60,
      })
      .then(async (response) => {
        const currentUser = this.getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };
          await this.setTokens(updatedUser);
        }

        return response.data;
      })
      .catch(async (error) => {
        await this.clearTokens();
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  getStoredUser(): AuthUser | null {
    if (this.inMemoryUser) {
      return this.inMemoryUser;
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const userData = localStorage.getItem(AUTH_STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  async getStoredUserAsync(): Promise<AuthUser | null> {
    return this.hydrateFromStorage();
  }

  async logout(): Promise<void> {
    await this.clearTokens();
  }

  hasValidTokens(): boolean {
    const user = this.getStoredUser();
    return !!(user?.token && user?.refreshToken);
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };