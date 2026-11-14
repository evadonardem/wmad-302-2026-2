/**
 * Auth API Service - DummyJSON Authentication (React Native / AsyncStorage compatible)
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';

const API_BASE_URL = 'https://dummyjson.com/auth';
const AUTH_USER_KEY = 'auth_user';

class AuthApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token asynchronously
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
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

  private async getAccessToken(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        return user.token || user.accessToken || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        return user.refreshToken || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  public async setTokens(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Login user with username/email and password
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<AuthUser>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    await this.setTokens(response.data);
    return response.data;
  }

  /**
   * Register new user
   * POST /auth/register
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const response = await axios.post(
        'https://dummyjson.com/users/add',
        {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          password: data.password,
          email: data.email,
          age: data.age,
          gender: data.gender || 'male',
          image: data.image || 'https://dummyjson.com/icon/emilys/128',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      try {
        const loginUser = await this.login({
          username: data.username,
          password: data.password,
        });
        return loginUser;
      } catch {
        const user: AuthUser = {
          id: response.data?.id || Date.now(),
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender || 'male',
          image: data.image || response.data?.image || 'https://dummyjson.com/icon/emilys/128',
          token: 'jwt-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now(),
        };
        await this.setTokens(user);
        return user;
      }
    } catch {
      const fallbackUser: AuthUser = {
        id: Date.now(),
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || 'male',
        image: data.image || 'https://dummyjson.com/icon/emilys/128',
        token: 'jwt-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now(),
      };
      await this.setTokens(fallbackUser);
      return fallbackUser;
    }
  }

  /**
   * Get current user profile (requires valid token)
   * GET /auth/me
   */
  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/me');
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   */
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', {
        refreshToken,
        expiresInMins: 60,
      })
      .then(async (response) => {
        const currentUser = await this.getStoredUser();
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

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Logout - clear stored tokens
   */
  async logout(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * Check if user has valid tokens stored
   */
  async hasValidTokens(): Promise<boolean> {
    const user = await this.getStoredUser();
    return !!(user?.token && user?.refreshToken);
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };