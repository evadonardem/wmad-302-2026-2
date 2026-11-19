/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 *
 * Token storage: AsyncStorage (works on phone AND web). Because AsyncStorage is
 * async but the axios interceptor needs the token synchronously, we keep an
 * in-memory copy (`currentUser`) and write it through to AsyncStorage.
 * Call `loadStoredUser()` once on app start to fill that copy.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthUser,
  RefreshTokenResponse,
  LocalAccount,
} from '@/types/auth';
import { accountStorage, getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';
import { hashPassword } from '@/utils/hash';

const API_BASE_URL = 'https://dummyjson.com/auth';
// DummyJSON has no /auth/register. New users are created with POST /users/add.
const USERS_ADD_URL = 'https://dummyjson.com/users/add';
// Real DummyJSON test account, used only as a fallback after register (see register()).
const DEMO_CREDENTIALS: LoginCredentials = { username: 'emilys', password: 'emilyspass' };
// Auth endpoints must never trigger the "refresh on 401" logic (it would loop).
const AUTH_PATHS = ['/login', '/register', '/refresh'];

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

/** Turn any thrown value into a readable message (prefers the API's own message). */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (apiMessage) return apiMessage;
    if (error.code === 'ECONNABORTED' || !error.response) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

class AuthApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private currentUser: AuthUser | null = null;
  private sessionExpiredHandler: (() => void) | null = null;

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
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest | undefined;
        const url = originalRequest?.url ?? '';
        const isAuthCall = AUTH_PATHS.some((path) => url.endsWith(path));

        // 401 = token expired. Refresh once, then replay the original request.
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed: wipe the session and tell the app (AuthContext) so the
            // route guard in app/(app)/_layout.tsx sends the user back to login.
            await this.clearTokens();
            this.sessionExpiredHandler?.();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /** AuthContext registers a callback here so a failed refresh logs the user out. */
  setSessionExpiredHandler(handler: (() => void) | null): void {
    this.sessionExpiredHandler = handler;
  }

  private getAccessToken(): string | null {
    return this.currentUser?.token ?? null;
  }

  private getRefreshToken(): string | null {
    return this.currentUser?.refreshToken ?? null;
  }

  /** Save the session in memory and in AsyncStorage. */
  async setTokens(user: AuthUser): Promise<void> {
    this.currentUser = user;
    await setStorageItem<AuthUser>('auth_user', user);
  }

  private async clearTokens(): Promise<void> {
    this.currentUser = null;
    await removeStorageItem('auth_user');
  }

  /** Read the saved session from AsyncStorage into memory. Call once on app start. */
  async loadStoredUser(): Promise<AuthUser | null> {
    this.currentUser = await getStorageItem<AuthUser>('auth_user');
    return this.currentUser;
  }

  /** The plain DummyJSON login (POST /auth/login). Saves the session on success. */
  private async requestLogin(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<AuthUser>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    await this.setTokens(response.data);
    return response.data;
  }

  /**
   * Login with username + password.
   * 1. Real DummyJSON accounts (like emilys) log in through the API.
   * 2. Accounts made with Register only exist on this device (DummyJSON doesn't
   *    really store new users). If the API rejects the login, we check those.
   * Network/server errors are NOT treated as "wrong password": they are re-thrown.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      return await this.requestLogin(credentials);
    } catch (error) {
      const rejected = axios.isAxiosError(error) && !!error.response && error.response.status < 500;
      if (rejected) {
        const account = await accountStorage.find(credentials.username);
        if (account && account.passwordHash === hashPassword(credentials.password, account.username)) {
          return this.startLocalSession(account);
        }
      }
      throw error;
    }
  }

  /**
   * Sign in a device-only account. DummyJSON gives tokens only to its own users, so we
   * borrow the test account's tokens (needed for carts etc.) and show this account's
   * profile. `isSimulated` marks the session so the profile is kept after refreshes.
   */
  private async startLocalSession(account: LocalAccount): Promise<AuthUser> {
    const demo = await this.requestLogin(DEMO_CREDENTIALS);
    const user: AuthUser = {
      ...demo,
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      email: account.email,
      gender: account.gender ?? demo.gender,
      isSimulated: true,
    };
    await this.setTokens(user);
    return user;
  }

  /**
   * Register a new user, then sign them in.
   *
   * DummyJSON only SIMULATES creating users (POST /users/add returns the new user but
   * never saves it). So we also save the account on this device (password hashed), which
   * lets the person log in later with the username and password they chose.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    if (await accountStorage.find(data.username)) {
      throw new Error('That username is already taken');
    }

    // 1. "Create" the user on DummyJSON (throws on network/server errors)
    await this.client.post(USERS_ADD_URL, data);

    // 2. Save the account on this device
    const account: LocalAccount = {
      username: data.username,
      passwordHash: hashPassword(data.password, data.username),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: data.gender,
    };
    await accountStorage.add(account);

    // 3. Sign in
    return this.startLocalSession(account);
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
   * Combine a fresh /auth/me result with the saved session: always keep the newest
   * tokens, and keep the typed-in profile for accounts created via register().
   */
  mergeWithStored(fresh: AuthUser, stored: AuthUser | null): AuthUser {
    if (!stored) return fresh;
    const base: AuthUser = stored.isSimulated
      ? {
          ...fresh,
          firstName: stored.firstName,
          lastName: stored.lastName,
          username: stored.username,
          email: stored.email,
          gender: stored.gender,
          isSimulated: true,
        }
      : fresh;
    return { ...base, token: stored.token, refreshToken: stored.refreshToken };
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

    const refreshPromise: Promise<RefreshTokenResponse> = this.client
      .post<RefreshTokenResponse>('/refresh', {
        refreshToken,
        expiresInMins: 60,
      })
      .then(async (response) => {
        // Update stored tokens with new ones
        const currentUser = this.getStoredUser();
        if (currentUser) {
          await this.setTokens({
            ...currentUser,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });
        }
        return response.data;
      })
      .catch(async (error: unknown) => {
        await this.clearTokens();
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    this.refreshTokenPromise = refreshPromise;
    return refreshPromise;
  }

  /**
   * Get the in-memory session (always call loadStoredUser() once on app start)
   */
  getStoredUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Logout - clear local tokens
   * Note: DummyJSON doesn't have a logout endpoint, so this is client-side only
   */
  logout(): Promise<void> {
    return this.clearTokens();
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