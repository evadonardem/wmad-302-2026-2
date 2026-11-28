/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';
import { authenticateLocalAccount, registerLocalAccount, updateLocalAccount } from '@/services/localAccounts';

const API_BASE_URL = 'https://dummyjson.com/auth';
const AUTH_STORAGE_KEY = 'auth_user';

class AuthApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private cachedUser: AuthUser | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
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
        const originalRequest = error?.config;

        if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            const accessToken = this.getAccessToken();
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearStoredUser();
            console.warn('Token refresh failed, user logged out');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return this.cachedUser?.token ?? this.getStoredUser()?.token ?? null;
  }

  private getRefreshToken(): string | null {
    return this.cachedUser?.refreshToken ?? this.getStoredUser()?.refreshToken ?? null;
  }

  async getStoredUserAsync(): Promise<AuthUser | null> {
    try {
      const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      this.cachedUser = value ? (JSON.parse(value) as AuthUser) : null;
      return this.cachedUser;
    } catch {
      this.cachedUser = null;
      return null;
    }
  }

  async setStoredUser(user: AuthUser): Promise<void> {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.cachedUser = user;
  }

  private clearStoredUser(): void {
    this.cachedUser = null;
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {
      // Ignore persistence errors.
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const localUser = await authenticateLocalAccount(credentials.username, credentials.password);
    if (!localUser) {
      throw new Error('Invalid username/email or password.');
    }

    await this.setStoredUser(localUser);
    return localUser;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const user = await registerLocalAccount(data);
    await this.setStoredUser(user);
    return user;
  }

  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/me');
    return response.data;
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'image'>>
  ): Promise<AuthUser> {
    const currentUser = this.getStoredUser();
    if (currentUser?.authProvider === 'local') {
      const updatedUser = await updateLocalAccount(currentUser, updates);
      await this.setStoredUser(updatedUser);
      return updatedUser;
    }

    const token = this.getAccessToken();
    const response = await axios.put<Partial<AuthUser>>(
      `https://dummyjson.com/users/${id}`,
      updates,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    if (!currentUser) throw new Error('You need to sign in again to update your profile.');
    const updatedUser = { ...currentUser, ...response.data, ...updates };
    await this.setStoredUser(updatedUser);
    return updatedUser;
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await this.client.post<RefreshTokenResponse>('/refresh', {
          refreshToken,
          expiresInMins: 60,
        });
        const currentUser = this.getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };
          await this.setStoredUser(updatedUser);
        }
        return response.data;
      } catch (error) {
        this.clearStoredUser();
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  getStoredUser(): AuthUser | null {
    return this.cachedUser;
  }

  logout(): void {
    this.clearStoredUser();
  }

  hasValidTokens(): boolean {
    const user = this.getStoredUser();
    return user?.authProvider === 'local' || !!(user?.token && user?.refreshToken);
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };
