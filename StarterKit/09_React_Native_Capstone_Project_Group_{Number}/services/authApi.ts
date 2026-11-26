
/**
 * Auth API Service - DummyJSON Authentication
 * Docs: https://dummyjson.com/docs/auth
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import {
  LoginCredentials,
  RegisterData,
  AuthUser,
  RefreshTokenResponse,
} from '@/types/auth';

import { authStorage } from '@/utils/storage';

const API_BASE_URL = 'https://dummyjson.com';

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ProfileUpdateData = Partial<
  Pick<
    AuthUser,
    'firstName' | 'lastName' | 'username' | 'email' | 'gender' | 'image'
  >
>;

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

    // Add authentication token to every request
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const user = await authStorage.getUser();

        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle expired access tokens
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as
          | RetryableRequest
          | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();

            originalRequest.headers.Authorization =
              `Bearer ${tokens.accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            console.warn('Token refresh failed. User logged out.');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Save user and authentication tokens
   */
  async setTokens(user: AuthUser): Promise<void> {
    await authStorage.setUser(user);
  }

  /**
   * Clear stored authentication data
   */
  private async clearTokens(): Promise<void> {
    await authStorage.clearUser();
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await this.client.post<AuthUser>(
      '/auth/login',
      {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.expiresInMins || 60,
      }
    );

    await this.setTokens(response.data);

    return response.data;
  }

  /**
   * Register new user
   * DummyJSON does not provide a persistent public registration API.
   */
  async register(_data: RegisterData): Promise<AuthUser> {
    throw new Error(
      'Registration is not supported by the DummyJSON public API.'
    );
  }

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/auth/me');

    return response.data;
  }

  /**
   * Update user profile
   * PUT /users/{id}
   */
  async updateUser(
    id: number,
    data: ProfileUpdateData
  ): Promise<AuthUser> {
    const response = await this.client.put<
      Partial<AuthUser> & { id: number }
    >(`/users/${id}`, data);

    const currentUser = await authStorage.getUser();

    if (!currentUser) {
      throw new Error('No authenticated user found.');
    }

    // Preserve existing authentication tokens
    const updatedUser: AuthUser = {
      ...currentUser,
      ...response.data,
      token: currentUser.token,
      refreshToken: currentUser.refreshToken,
    };

    await authStorage.setUser(updatedUser);

    return updatedUser;
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      const currentUser = await authStorage.getUser();

      if (!currentUser?.refreshToken) {
        throw new Error('No refresh token available.');
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken: currentUser.refreshToken,
          expiresInMins: 60,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedUser: AuthUser = {
        ...currentUser,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };

      await authStorage.setUser(updatedUser);

      return response.data;
    })()
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
   * Get stored user
   */
  async getStoredUser(): Promise<AuthUser | null> {
    return authStorage.getUser();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * Check if valid tokens exist
   */
  async hasValidTokens(): Promise<boolean> {
    const user = await authStorage.getUser();

    return !!(user?.token && user?.refreshToken);
  }
}

// Export singleton instance
export const authApi = new AuthApiService();

// Export class for testing
export { AuthApiService };
