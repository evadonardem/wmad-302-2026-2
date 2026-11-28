/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';

const API_BASE_URL = 'https://dummyjson.com/auth';

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

    // Request interceptor to add auth token
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

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // If error is 401 and we haven't retried yet
        const requestConfig = originalRequest as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !requestConfig._retry && !String(requestConfig.url || '').includes('/refresh')) {
          requestConfig._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            requestConfig.headers = requestConfig.headers || {};
            requestConfig.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(requestConfig);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            // The auth context observes the cleared session and returns to the auth flow.
            console.warn('Token refresh failed, user logged out');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    // Request interceptors are synchronous; use the in-memory cached session.
    return this.cachedUser?.token || null;
  }

  private getRefreshToken(): string | null {
    return this.cachedUser?.refreshToken || null;
  }

  setTokens(user: AuthUser): void {
    this.cachedUser = user;
    void AsyncStorage.setItem('auth_user', JSON.stringify(user));
  }

  private clearTokens(): void {
    this.cachedUser = null;
    void AsyncStorage.removeItem('auth_user');
  }

  /**
   * Login user with username/email and password
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<AuthUser & { accessToken?: string }>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    const user = { ...response.data, token: response.data.token || response.data.accessToken || '', refreshToken: response.data.refreshToken || '' } as AuthUser;
    this.setTokens(user);
    return user;
  }

  /**
   * Register new user. DummyJSON simulates user creation through /users/add;
   * its demo database is not persistent and newly-added users cannot log in.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await axios.post<AuthUser>('https://dummyjson.com/users/add', {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      email: data.email,
      age: data.age,
      gender: data.gender,
      image: data.image,
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    // DummyJSON's add endpoint is a mock and does not issue auth tokens.
    // Keep the returned profile, but require a normal login for a real session.
    return { ...response.data, token: '', refreshToken: '' } as AuthUser;
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
    // Prevent multiple simultaneous refresh calls
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
        // Update stored tokens with new ones
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

  /**
   * Get stored user data
   */
  getStoredUser(): AuthUser | null {
    return this.cachedUser;
  }

  async hydrateStoredUser(): Promise<AuthUser | null> {
    try {
      const raw = await AsyncStorage.getItem('auth_user');
      this.cachedUser = raw ? JSON.parse(raw) as AuthUser : null;
      return this.cachedUser;
    } catch { return null; }
  }

  /**
   * Logout - clear local tokens
   * Note: DummyJSON doesn't have a logout endpoint, so this is client-side only
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Check if user has valid tokens stored
   */
  hasValidTokens(): boolean {
    const user = this.getStoredUser();
    return !!(user?.token && user?.refreshToken);
  }
}

// Export singleton instance
export const authApi = new AuthApiService();

// Export class for testing
export { AuthApiService };