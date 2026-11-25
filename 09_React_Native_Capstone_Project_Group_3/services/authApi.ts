/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 *
 * Tokens live in memory for fast access and are persisted through utils/storage
 * (SecureStore on device, AsyncStorage on web).
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AuthUser,
  LoginCredentials,
  RawLoginResponse,
  RefreshTokenResponse,
  RegisterData,
  UpdateProfileData,
} from '@/types/auth';
import { authStorage } from '@/utils/storage';

const BASE_URL = 'https://dummyjson.com';
const AUTH_URL = `${BASE_URL}/auth`;

/** DummyJSON test account - used to obtain real tokens for freshly registered users */
export const DEMO_CREDENTIALS = { username: 'emilys', password: 'emilyspass' } as const;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Convert the raw login payload into our AuthUser shape. */
export function toAuthUser(raw: RawLoginResponse): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    gender: raw.gender,
    image: raw.image,
    token: raw.accessToken ?? raw.token ?? '',
    refreshToken: raw.refreshToken,
  };
}

/** Pull a readable message out of an axios/unknown error. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      return 'Network problem. Check your connection and try again.';
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

class AuthApiService {
  /** Client for /auth endpoints (login, me, refresh) */
  private client: AxiosInstance;
  /** Client for the rest of DummyJSON (/users) */
  private http: AxiosInstance;
  private session: AuthUser | null = null;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private onSessionExpired: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: AUTH_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach the bearer token to every request
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.session?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // On 401: refresh the access token once and replay the request
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetriableConfig | undefined;
        const requestUrl = originalRequest?.url ?? '';
        // never try to refresh because of a failed login/refresh call (would loop or deadlock)
        const isAuthCall = requestUrl.includes('/login') || requestUrl.includes('/refresh');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
          originalRequest._retry = true;
          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed: drop the session and let the app redirect to login
            await this.clearSession();
            this.onSessionExpired?.();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /** The app registers a callback so the UI can react when the session can't be refreshed. */
  setSessionExpiredHandler(handler: (() => void) | null): void {
    this.onSessionExpired = handler;
  }

  /** Store a session in memory and persist it. */
  async setSession(user: AuthUser): Promise<void> {
    this.session = user;
    await authStorage.saveSession(user);
  }

  async clearSession(): Promise<void> {
    this.session = null;
    await authStorage.clearSession();
  }

  /** Load a persisted session (called once on app start). */
  async restoreSession(): Promise<AuthUser | null> {
    this.session = await authStorage.loadSession();
    return this.session;
  }

  getStoredUser(): AuthUser | null {
    return this.session;
  }

  hasValidTokens(): boolean {
    return Boolean(this.session?.token && this.session?.refreshToken);
  }

  /**
   * Login user with username and password
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<RawLoginResponse>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins ?? 60,
    });
    const user = toAuthUser(response.data);
    await this.setSession(user);
    return user;
  }

  /**
   * Register a new user.
   * DummyJSON exposes user creation at POST /users/add (there is no /auth/register route)
   * and does not persist the new user. Flow:
   *   1. POST /users/add with the form data
   *   2. try to login with the new credentials (works if the API ever persists them)
   *   3. otherwise open a session using demo tokens, with the new user's profile on top
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const created = await this.http.post<{ id: number }>('/users/add', {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      email: data.email,
      age: data.age,
      gender: data.gender,
      image: data.image,
    });

    try {
      return await this.login({ username: data.username, password: data.password });
    } catch {
      const demo = await this.login(DEMO_CREDENTIALS);
      const user: AuthUser = {
        ...demo,
        id: created.data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender ?? demo.gender,
        image: data.image ?? demo.image,
        age: data.age,
        isSimulated: true,
      };
      await this.setSession(user);
      return user;
    }
  }

  /**
   * Get current user profile (requires valid token)
   * GET /auth/me
   */
  async getMe(): Promise<Omit<AuthUser, 'token' | 'refreshToken'>> {
    const response = await this.client.get<Omit<AuthUser, 'token' | 'refreshToken'>>('/me');
    return response.data;
  }

  /**
   * Update profile
   * PUT /users/{id}. Simulated (locally registered) users don't exist on the server,
   * so their changes are applied locally only.
   */
  async updateProfile(data: UpdateProfileData): Promise<AuthUser> {
    const current = this.session;
    if (!current) throw new Error('You must be logged in to update your profile');

    if (!current.isSimulated) {
      await this.http.put(`/users/${current.id}`, data, {
        headers: { Authorization: `Bearer ${current.token}` },
      });
    }

    const updated: AuthUser = { ...current, ...data };
    await this.setSession(updated);
    return updated;
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

    const refreshToken = this.session?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', { refreshToken, expiresInMins: 60 })
      .then(async (response) => {
        if (this.session) {
          await this.setSession({
            ...this.session,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });
        }
        return response.data;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  /**
   * Logout - clear local tokens
   * Note: DummyJSON doesn't have a logout endpoint, so this is client-side only
   */
  async logout(): Promise<void> {
    await this.clearSession();
  }
}

// Export singleton instance
export const authApi = new AuthApiService();

// Export class for testing
export { AuthApiService };
