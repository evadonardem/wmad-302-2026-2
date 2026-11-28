/**
 * Auth API Service - DummyJSON Authentication & Users
 * Docs: https://dummyjson.com/docs/auth
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AuthUser,
  LoginCredentials,
  RefreshTokenResponse,
  RegisterData,
  UpdateUserData,
} from '@/types/auth';
import { authStorage } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class AuthApiService {
  private client: AxiosInstance;
  private cachedUser: AuthUser | null = null;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

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
        const user = await this.getStoredUser();
        const token = user?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            this.onUnauthorizedCallback?.();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  onUnauthorized(callback: (() => void) | null): void {
    this.onUnauthorizedCallback = callback;
  }

  async setTokens(user: AuthUser): Promise<void> {
    this.cachedUser = user;
    await authStorage.setUser(user);
  }

  async clearTokens(): Promise<void> {
    this.cachedUser = null;
    await authStorage.clearUser();
  }

  async getStoredUser(): Promise<AuthUser | null> {
    if (this.cachedUser) {
      return this.cachedUser;
    }
    const stored = await authStorage.getUser();
    this.cachedUser = stored;
    return stored;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await this.client.post<
        Omit<AuthUser, 'token'> & { accessToken?: string; token?: string }
      >('/auth/login', {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.expiresInMins ?? 60,
      });

      const raw = response.data;
      const normalizedUser: AuthUser = {
        ...raw,
        token: raw.token ?? raw.accessToken ?? '',
        refreshToken: raw.refreshToken ?? '',
      };

      await this.setTokens(normalizedUser);
      return normalizedUser;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          'Invalid username or password';
        throw new Error(message);
      }
      throw err;
    }
  }

  /**
   * Register new user
   * Calls POST /users/add (DummyJSON's registration endpoint), then attempts login.
   * Note: DummyJSON mocks writes without persisting new users in its login DB,
   * so if /auth/login rejects the new user, we issue a valid session for the created user.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const response = await this.client.post<Partial<AuthUser>>('/users/add', {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: data.password,
        email: data.email,
        age: data.age,
        gender: data.gender ?? 'male',
        image:
          data.image ??
          `https://dummyjson.com/icon/${encodeURIComponent(data.username)}/128`,
      });

      try {
        return await this.login({
          username: data.username,
          password: data.password,
        });
      } catch {
        const created = response.data;
        const registeredUser: AuthUser = {
          id: created.id ?? Date.now(),
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender ?? 'male',
          age: data.age,
          image:
            created.image ??
            `https://dummyjson.com/icon/${encodeURIComponent(data.username)}/128`,
          token: `mock-access-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
        };
        await this.setTokens(registeredUser);
        return registeredUser;
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          'Registration failed';
        throw new Error(message);
      }
      throw err;
    }
  }

  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/auth/me');
    return response.data;
  }

  async updateUser(userId: number, updates: UpdateUserData): Promise<AuthUser> {
    const current = await this.getStoredUser();
    try {
      const response = await this.client.put<Partial<AuthUser>>(`/users/${userId}`, updates);
      const merged: AuthUser = {
        ...(current as AuthUser),
        ...response.data,
        ...updates,
        token: current?.token ?? '',
        refreshToken: current?.refreshToken ?? '',
      };
      await this.setTokens(merged);
      return merged;
    } catch {
      // Fallback for locally registered mock IDs (> 208) that don't exist in DummyJSON's static DB
      if (!current) throw new Error('No active user session');
      const merged: AuthUser = { ...current, ...updates };
      await this.setTokens(merged);
      return merged;
    }
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const storedUser = await this.getStoredUser();
    const refreshToken = storedUser?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
        expiresInMins: 60,
      })
      .then(async (response) => {
        const currentUser = await this.getStoredUser();
        if (currentUser) {
          const updatedUser: AuthUser = {
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

  async logout(): Promise<void> {
    await this.clearTokens();
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };