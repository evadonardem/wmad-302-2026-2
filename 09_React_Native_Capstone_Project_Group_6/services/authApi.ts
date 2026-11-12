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
import { authStorage, accountsStorage, LocalAccount } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com/auth';
// Usernames that belong to real DummyJSON users we log in with (the demo
// account). Registering with one would hide it on this device.
const USERS_URL = 'https://dummyjson.com/users';
const RESERVED_USERNAMES = ['emilys'];

/** The profile fields a user can edit. */
export type ProfileUpdate = Pick<AuthUser, 'firstName' | 'lastName' | 'email'>;

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

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !isRefreshCall
        ) {
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
      },
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
    // 1. Accounts created on this device (Register screen) win first.
    const local = await this.findLocalAccount(credentials.username);
    if (local) {
      if (local.password !== credentials.password) {
        throw new Error('Invalid credentials');
      }
      return this.startLocalSession(local.user);
    }

    // 2. Otherwise ask DummyJSON (real users such as the demo account).
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
   * Register new user.
   * DummyJSON can't store new users, so the account is saved on this device
   * and the user is signed in right away with a local session.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const username = data.username.trim();
    const email = data.email.trim();

    const taken =
      RESERVED_USERNAMES.includes(username.toLowerCase()) ||
      (await this.findLocalAccount(username)) ||
      (await this.findLocalAccount(email));
    if (taken) {
      throw new Error('That username or email is already registered');
    }

    const profile: LocalAccount['user'] = {
      id: Date.now(), // unique enough for a device-local account
      username,
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender ?? 'male',
      image: data.image ?? `https://dummyjson.com/icon/${encodeURIComponent(username)}/128`,
    };
    await accountsStorage.add({ password: data.password, user: profile });
    return this.startLocalSession(profile);
  }

  /** Find a saved local account by username or email (case-insensitive). */
  private async findLocalAccount(identifier: string): Promise<LocalAccount | null> {
    const wanted = identifier.trim().toLowerCase();
    const accounts = await accountsStorage.getAll();
    return (
      accounts.find(
        (a) => a.user.username.toLowerCase() === wanted || a.user.email.toLowerCase() === wanted,
      ) ?? null
    );
  }

  /** Create the stored session for a local account. Tokens are placeholders. */
  private async startLocalSession(profile: LocalAccount['user']): Promise<AuthUser> {
    const user: AuthUser = {
      ...profile,
      token: `local-${profile.id}`,
      refreshToken: `local-refresh-${profile.id}`,
      isLocalAccount: true,
    };
    await this.setTokens(user);
    return user;
  }

  /**
   * Edit the logged-in user's profile.
   * - Real DummyJSON users: PUT /users/{id}. DummyJSON only simulates the
   *   update, so we also save the new values on this device.
   * - Local (registered) accounts: saved on this device only.
   */
  async updateProfile(changes: ProfileUpdate): Promise<AuthUser> {
    const stored = await this.getStoredUser();
    if (!stored) {
      throw new Error('You are not logged in');
    }

    if (stored.isLocalAccount) {
      const other = await this.findLocalAccount(changes.email);
      if (other && other.user.id !== stored.id) {
        throw new Error('That email is already registered');
      }
      await accountsStorage.update(stored.id, changes);
    } else {
      try {
        await axios.put(`${USERS_URL}/${stored.id}`, changes, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Could not update profile'));
      }
    }

    const updated: AuthUser = { ...stored, ...changes };
    await this.setTokens(updated);
    return updated;
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
