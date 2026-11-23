/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 *
 * Session storage: the session lives in an in-memory cache (so axios
 * interceptors can read the token synchronously) and is mirrored to
 * AsyncStorage so it survives app restarts. Call `hydrate()` once on startup.
 * This works on Android, iOS and web (the starter's localStorage did not).
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthUser,
  AuthResponse,
  UserProfile,
  RefreshTokenResponse,
} from '@/types/auth';
import { authStorage } from '@/utils/storage';

const API_ROOT = 'https://dummyjson.com';
const AUTH_BASE_URL = `${API_ROOT}/auth`;

// DummyJSON's documented demo account, used as a fallback for register (see below).
const DEMO_CREDENTIALS: LoginCredentials = { username: 'emilys', password: 'emilyspass' };

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Turn an axios error into an Error carrying DummyJSON's own message when present. */
export function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return new Error(data.message);
    if (!error.response) return new Error('Network error. Please check your connection.');
  }
  return error instanceof Error ? error : new Error(fallback);
}

/** DummyJSON returns `accessToken`; older versions returned `token`. Normalise both. */
function toAuthUser(data: AuthResponse): AuthUser {
  const { accessToken, token, ...rest } = data;
  return { ...rest, token: token ?? accessToken };
}

class AuthApiService {
  private client: AxiosInstance;
  private rootClient: AxiosInstance;
  private session: AuthUser | null = null;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private sessionExpiredHandler: (() => void) | null = null;

  constructor() {
    this.rootClient = axios.create({
      baseURL: API_ROOT,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client = axios.create({
      baseURL: AUTH_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach the bearer token to every request
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // On 401: refresh the token once, then retry the original request
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetriableConfig | undefined;
        const url = originalRequest?.url ?? '';
        const isAuthCall = url.includes('/login') || url.includes('/refresh');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
          originalRequest._retry = true;
          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed: drop the session and tell the app to go back to login
            this.expireSession();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ Session handling ============

  /** Load the saved session from AsyncStorage into memory. Call once at startup. */
  async hydrate(): Promise<AuthUser | null> {
    try {
      this.session = await authStorage.getUser();
    } catch {
      this.session = null;
    }
    return this.session;
  }

  /** Register a callback fired when the session can no longer be refreshed. */
  setSessionExpiredHandler(handler: (() => void) | null): void {
    this.sessionExpiredHandler = handler;
  }

  private expireSession(): void {
    this.clearTokens();
    this.sessionExpiredHandler?.();
  }

  private getAccessToken(): string | null {
    return this.session?.token ?? null;
  }

  private getRefreshToken(): string | null {
    return this.session?.refreshToken ?? null;
  }

  /** Save the session in memory and AsyncStorage. */
  setTokens(user: AuthUser): void {
    this.session = user;
    authStorage.setUser(user).catch(() => undefined);
  }

  /** Merge changes (e.g. an edited profile) into the saved session. */
  updateSession(changes: Partial<AuthUser>): AuthUser | null {
    if (!this.session) return null;
    const updated = { ...this.session, ...changes };
    this.setTokens(updated);
    return updated;
  }

  private clearTokens(): void {
    this.session = null;
    authStorage.clearUser().catch(() => undefined);
  }

  getStoredUser(): AuthUser | null {
    return this.session;
  }

  hasValidTokens(): boolean {
    return !!(this.session?.token && this.session?.refreshToken);
  }

  // ============ Endpoints ============

  /** POST /auth/login */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await this.client.post<AuthResponse>('/login', {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.expiresInMins ?? 60,
      });
      const user = toAuthUser(response.data);
      this.setTokens(user);
      return user;
    } catch (error) {
      throw toApiError(error, 'Login failed');
    }
  }

  /**
   * Register a new user.
   *
   * DummyJSON has no real /auth/register: POST /users/add only *simulates*
   * creating a user and never saves it, so logging in with the new credentials
   * normally fails. So we (1) call /users/add, (2) try a real login in case the
   * API ever persists users, and (3) otherwise sign in with DummyJSON's demo
   * account to get working tokens and overlay the new user's details on it.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      await this.rootClient.post('/users/add', data);
    } catch (error) {
      throw toApiError(error, 'Registration failed');
    }

    try {
      return await this.login({ username: data.username, password: data.password });
    } catch {
      const demo = await this.login(DEMO_CREDENTIALS);
      const merged: AuthUser = {
        ...demo,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        gender: data.gender ?? demo.gender,
        image: data.image ?? demo.image,
      };
      this.setTokens(merged);
      return merged;
    }
  }

  /** GET /auth/me (requires a valid token) */
  async getMe(): Promise<UserProfile> {
    try {
      const response = await this.client.get<UserProfile>('/me');
      return response.data;
    } catch (error) {
      throw toApiError(error, 'Failed to load profile');
    }
  }

  /** POST /auth/refresh - concurrent callers share one in-flight request. */
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', { refreshToken, expiresInMins: 60 })
      .then((response) => {
        if (this.session) {
          this.setTokens({
            ...this.session,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });
        }
        return response.data;
      })
      .catch((error: unknown) => {
        this.clearTokens();
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  /** Client-side logout (DummyJSON has no logout endpoint). */
  logout(): void {
    this.clearTokens();
  }
}

export const authApi = new AuthApiService();

// Export class for testing
export { AuthApiService };
