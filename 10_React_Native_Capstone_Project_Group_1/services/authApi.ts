/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 * Base URL: https://dummyjson.com/auth
 *
 * Token handling:
 *  - Tokens are kept in memory for fast interceptor access and persisted in
 *    secure storage (Keychain/Keystore on native).
 *  - The public profile is stored in AsyncStorage.
 *  - A 401 triggers ONE refresh attempt; if refresh fails the session is
 *    cleared and the registered listener (AuthContext) logs the user out,
 *    which makes the protected-route guard redirect to the login screen.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterData,
} from '@/types/auth';
import { STORAGE_KEYS, getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';
import { clearTokens, loadTokens, saveTokens } from '@/utils/secureStorage';
import { getErrorStatus } from '@/utils/errors';

const API_BASE_URL = 'https://dummyjson.com/auth';
const USERS_ADD_URL = 'https://dummyjson.com/users/add';

/** DummyJSON test account - used as a token source after registration (see register()). */
export const DEMO_CREDENTIALS = { username: 'emilys', password: 'emilyspass' } as const;

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };
type StoredProfile = Omit<AuthUser, 'token' | 'refreshToken'>;

interface CreatedUserResponse {
  id?: number;
  image?: string;
}

class AuthApiService {
  private client: AxiosInstance;
  private session: AuthUser | null = null;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;
  private sessionExpiredListener: (() => void) | null = null;

  /** `client` can be injected for testing. */
  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

    // Attach the access token to every request
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.session?.token) {
        config.headers.Authorization = `Bearer ${this.session.token}`;
      }
      return config;
    });

    // Refresh the token once on 401, then retry the original request
    this.client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);

        const originalRequest = error.config as RetriableRequest;
        const isAuthCall = /\/(login|refresh|register)$/.test(originalRequest.url ?? '');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall && this.session) {
          originalRequest._retry = true;
          try {
            const tokens = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return await this.client(originalRequest);
          } catch (refreshError) {
            // refreshAccessToken() clears the session when the server rejects the
            // refresh token; a plain network failure keeps the session intact.
            if (!this.session) this.sessionExpiredListener?.();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /** AuthContext registers a callback that runs when the session can't be refreshed. */
  setSessionExpiredListener(listener: (() => void) | null): void {
    this.sessionExpiredListener = listener;
  }

  // ============ Session storage ============

  /** Load the persisted session into memory (call once on app start). */
  async loadSession(): Promise<AuthUser | null> {
    const [profile, tokens] = await Promise.all([
      getStorageItem<StoredProfile>(STORAGE_KEYS.AUTH_USER),
      loadTokens(),
    ]);
    this.session = profile && tokens ? { ...profile, ...tokens } : null;
    return this.session;
  }

  private async saveSession(user: AuthUser): Promise<void> {
    this.session = user;
    const { token, refreshToken, ...profile } = user;
    await Promise.all([
      saveTokens({ token, refreshToken }),
      setStorageItem<StoredProfile>(STORAGE_KEYS.AUTH_USER, profile),
    ]);
  }

  private async clearSession(): Promise<void> {
    this.session = null;
    await Promise.all([clearTokens(), removeStorageItem(STORAGE_KEYS.AUTH_USER)]);
  }

  getStoredUser(): AuthUser | null {
    return this.session;
  }

  hasValidTokens(): boolean {
    return !!(this.session?.token && this.session?.refreshToken);
  }

  /** Merge profile changes (e.g. after editing the profile) into the stored session. */
  async updateStoredUser(changes: Partial<AuthUser>): Promise<AuthUser | null> {
    if (!this.session) return null;
    const updated: AuthUser = { ...this.session, ...changes };
    await this.saveSession(updated);
    return updated;
  }

  // ============ Endpoints ============

  private toAuthUser(data: LoginResponse): AuthUser {
    const { accessToken, token, ...rest } = data;
    return { ...rest, token: accessToken ?? token ?? '' };
  }

  /** POST /auth/login */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<LoginResponse>('/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: credentials.expiresInMins ?? 60,
    });
    const user = this.toAuthUser(response.data);
    await this.saveSession(user);
    return user;
  }

  /**
   * Register a new user, then sign them in.
   *
   * DummyJSON is a mock API: it accepts new users but does NOT store them, so
   * logging in with the new credentials is rejected. When that happens we get
   * valid tokens from the DummyJSON demo account and attach the new user's
   * profile to the session, so "auto-login after registration" still works.
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const created = await this.createAccount(data);

    try {
      return await this.login({ username: data.username, password: data.password });
    } catch {
      const demo = await this.login(DEMO_CREDENTIALS);
      const user: AuthUser = {
        ...demo,
        id: created.id ?? demo.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender ?? demo.gender,
        image: created.image ?? data.image ?? demo.image,
      };
      await this.saveSession(user);
      return user;
    }
  }

  /**
   * POST https://dummyjson.com/users/add
   * DummyJSON has no /auth/register route: anything under /auth/ is treated as a
   * protected resource and answers "access token is required". New users are
   * created with /users/add (and are only simulated - see register()).
   */
  private async createAccount(data: RegisterData): Promise<CreatedUserResponse> {
    const response = await this.client.post<CreatedUserResponse>(USERS_ADD_URL, {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      email: data.email,
      age: data.age,
      gender: data.gender,
    });
    return response.data;
  }

  /** GET /auth/me (requires a valid token) */
  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/me');
    return response.data;
  }

  /** POST /auth/refresh - concurrent callers share one request. */
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) return this.refreshTokenPromise;

    const refreshToken = this.session?.refreshToken;
    if (!refreshToken) throw new Error('No refresh token available');

    this.refreshTokenPromise = this.client
      .post<RefreshTokenResponse>('/refresh', { refreshToken, expiresInMins: 60 })
      .then(async (response) => {
        if (this.session) {
          await this.saveSession({
            ...this.session,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });
        }
        return response.data;
      })
      .catch(async (error: unknown) => {
        const status = getErrorStatus(error);
        if (status === 400 || status === 401 || status === 403) {
          await this.clearSession();
        }
        throw error;
      })
      .finally(() => {
        this.refreshTokenPromise = null;
      });

    return this.refreshTokenPromise;
  }

  /** DummyJSON has no logout endpoint - clear tokens and profile locally. */
  async logout(): Promise<void> {
    await this.clearSession();
  }
}

export const authApi = new AuthApiService();
export { AuthApiService };