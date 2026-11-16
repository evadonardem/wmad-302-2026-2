/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';

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
            this.clearTokens();
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

  setTokens(user: AuthUser): void {
    this.cachedUser = user;
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)).catch(() => {
      // Ignore persistence errors; auth state still stays in memory.
    });
  }

  private clearTokens(): void {
    this.cachedUser = null;
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {
      // Ignore persistence errors.
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<AuthUser>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    this.setTokens(response.data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await this.client.post<AuthUser>('/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      email: data.email,
      age: data.age,
      gender: data.gender,
    });

    if (!response.data?.username) {
      throw new Error('Registration succeeded but no user data was returned');
    }

    return this.login({
      username: data.username,
      password: data.password,
      expiresInMins: 60,
    });
  }

  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/me');
    return response.data;
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'image'>>
  ): Promise<AuthUser> {
    const token = this.getAccessToken();
    const response = await axios.put<Partial<AuthUser>>(
      `https://dummyjson.com/users/${id}`,
      updates,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    const currentUser = this.getStoredUser();
    if (!currentUser) throw new Error('You need to sign in again to update your profile.');
    const updatedUser = { ...currentUser, ...response.data, ...updates };
    this.setTokens(updatedUser);
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

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', {
        refreshToken,
        expiresInMins: 60,
      })
      .then((response) => {
        const currentUser = this.getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };
          this.setTokens(updatedUser);
        }
        return response.data;
      })
      .catch((error) => {
        this.clearTokens();
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  getStoredUser(): AuthUser | null {
    return this.cachedUser;
  }

  logout(): void {
    this.clearTokens();
  }

  hasValidTokens(): boolean {
    const user = this.getStoredUser();
    return !!(user?.token && user?.refreshToken);
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };
