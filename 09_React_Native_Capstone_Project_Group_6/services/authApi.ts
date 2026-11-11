/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 *
 * Session data lives in AsyncStorage (via utils/storage), which works on
 * web AND native. Every storage method is therefore async.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterData, AuthUser, RefreshTokenResponse } from '@/types/auth';
import { authStorage } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com/auth';

// Axios config + a flag so a request is only retried once after a refresh.
type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// DummyJSON has returned the access token as `token` in older versions and
// `accessToken` in newer ones. We accept both and always store it as `token`.
type RawAuthResponse = Omit<AuthUser, 'token'> & { token?: string; accessToken?: string };

/** Pull a human-readable message out of an Axios error (or any error). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

class AuthApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  // Set by AuthContext so the service can tell the UI "your session is gone".
  private onSessionExpired: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor: attach the stored access token.
    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const user = await this.getStoredUser();
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    });

    // Response interceptor: on 401, refresh the token once and replay the request.
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequest | undefined;
        const isRefreshCall = originalRequest?.url === '/refresh';

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshCall) {
          originalRequest._retry = true;
          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed: wipe the session and tell the app to go to login.
            await this.clearTokens();
            this.onSessionExpired?.();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /** AuthContext registers a callback here to react when the session dies. */
  setSessionExpiredHandler(handler: (() => void) | null): void {
    this.onSessionExpired = handler;
  }

  async setTokens(user: AuthUser): Promise<void> {
    await authStorage.setUser(user);
  }

  async clearTokens(): Promise<void> {
    await authStorage.clearUser();
  }

  async getStoredUser(): Promise<AuthUser | null> {
    return authStorage.getUser();
  }

  /**
   * Login user with username and password
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await this.client.post<RawAuthResponse>('/login', {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.expiresInMins ?? 60,
      });
      const { accessToken, token, ...rest } = response.data;
      const user: AuthUser = { ...rest, token: accessToken ?? token ?? '' };
      await this.setTokens(user);
      return user;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  }

  /**
   * Register new user
   * POST /auth/register
   * TODO (Phase 2): implement
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error('TODO: Implement register - call /auth/register then login');
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
    // Several requests can 401 at once; they all share one refresh call.
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const stored = await this.getStoredUser();
    if (!stored?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', {
        refreshToken: stored.refreshToken,
        expiresInMins: 60,
      })
      .then(async (response) => {
        await this.setTokens({
          ...stored,
          token: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        return response.data;
      })
      .catch(async (error: unknown) => {
        await this.clearTokens();
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  /**
   * Logout - clear local tokens
   * Note: DummyJSON has no logout endpoint, so this is client-side only
   */
  async logout(): Promise<void> {
    await this.clearTokens();
  }

  /** Check if user has valid tokens stored */
  async hasValidTokens(): Promise<boolean> {
    const user = await this.getStoredUser();
    return !!(user?.token && user?.refreshToken);
  }
}

// Export singleton instance
export const authApi = new AuthApiService();

// Export class for testing
export { AuthApiService };