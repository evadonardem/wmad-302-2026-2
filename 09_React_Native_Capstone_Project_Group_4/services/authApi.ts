/**
 * Auth API service (DummyJSON)
 *
 * Provides everything context/AuthContext.tsx uses:
 *   login, register, getMe, logout, hydrate, setTokens,
 *   getStoredUser, hasValidTokens, setAuthFailureHandler
 *
 * Tokens live in memory (fast, used by the interceptors) and are mirrored
 * to AsyncStorage through authStorage so the session survives app restarts.
 */
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import type { AuthUser, RegisterData } from '@/types/auth';
import { authStorage } from '@/utils/storage';

const BASE_URL = 'https://dummyjson.com';
const TOKEN_EXPIRY_MINS = 60;

type PublicUser = Omit<AuthUser, 'token' | 'refreshToken'>;
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function apiMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string } | undefined)?.message;
    return msg || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

class AuthApiService {
  readonly client: AxiosInstance;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private authFailureHandler: (() => void) | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach the access token to every request
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // On 401, refresh the token once and retry the original request
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as RetriableConfig | undefined;
        const url = original?.url ?? '';
        const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');

        if (
          error.response?.status === 401 &&
          original &&
          !original._retry &&
          !isAuthCall &&
          this.refreshToken
        ) {
          original._retry = true;
          try {
            const newToken = await this.refreshAccessToken();
            original.headers.Authorization = `Bearer ${newToken}`;
            return this.client(original);
          } catch (refreshError) {
            this.clearSession();
            this.authFailureHandler?.();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ---------- session helpers ----------

  /** Called by AuthContext so a failed refresh can log the user out. */
  setAuthFailureHandler(handler: (() => void) | null): void {
    this.authFailureHandler = handler;
  }

  /** Update the in-memory tokens and persist the user. */
  setTokens(user: AuthUser): void {
    this.user = user;
    this.accessToken = user.token;
    this.refreshToken = user.refreshToken;
    authStorage.setUser(user).catch(() => {
      // Persisting is best-effort; the in-memory session still works
    });
  }

  /** Load the saved session from AsyncStorage into memory. */
  async hydrate(): Promise<AuthUser | null> {
    const stored = await authStorage.getUser();
    if (!stored?.token || !stored?.refreshToken) {
      this.clearMemory();
      return null;
    }
    const user = stored as AuthUser;
    this.user = user;
    this.accessToken = user.token;
    this.refreshToken = user.refreshToken;
    return user;
  }

  getStoredUser(): AuthUser | null {
    return this.user;
  }

  hasValidTokens(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  private clearMemory(): void {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
  }

  private clearSession(): void {
    this.clearMemory();
    authStorage.clearUser().catch(() => {});
  }

  // ---------- API calls ----------

  async login(credentials: { username: string; password: string }): Promise<AuthUser> {
    try {
      const { data } = await this.client.post('/auth/login', {
        ...credentials,
        expiresInMins: TOKEN_EXPIRY_MINS,
      });
      const user = {
        ...data,
        token: data.accessToken ?? data.token,
        refreshToken: data.refreshToken,
      } as AuthUser;
      delete (user as unknown as Record<string, unknown>).accessToken;
      this.setTokens(user);
      return user;
    } catch (error) {
      throw new Error(apiMessage(error, 'Login failed'));
    }
  }

  /** DummyJSON accepts this but does not actually save the new user. */
  async register(data: RegisterData): Promise<unknown> {
    const response = await this.client.post('/users/add', data);
    return response.data;
  }

  /** Fetch the current user. Refreshes the token automatically on 401. */
  async getMe(): Promise<PublicUser> {
    const { data } = await this.client.get('/auth/me');
    return data as PublicUser;
  }

  logout(): void {
    this.clearSession();
  }

  // ---------- token refresh ----------

  private refreshAccessToken(): Promise<string> {
    // Share one refresh between concurrent 401s
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: this.refreshToken, expiresInMins: TOKEN_EXPIRY_MINS },
            { timeout: 15000 }
          );
          const newAccess: string = data.accessToken ?? data.token;
          this.accessToken = newAccess;
          if (data.refreshToken) this.refreshToken = data.refreshToken;
          if (this.user) {
            this.setTokens({
              ...this.user,
              token: newAccess,
              refreshToken: this.refreshToken as string,
            });
          }
          return newAccess;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }
}

export { AuthApiService };
export const authApi = new AuthApiService();
export const apiClient = authApi.client;
export default authApi;