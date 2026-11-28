/**
 * Auth Types - Shared between both capstone projects
 * Based on DummyJSON Auth API: https://dummyjson.com/docs/auth
 */

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  phone?: string;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number; // optional, default 60
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female';
  image?: string;
}

/**
 * Raw login response. Newer DummyJSON versions return `accessToken`,
 * older ones return `token`; `authApi` normalises both into AuthUser.token.
 */
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  token?: string;
  accessToken?: string;
  refreshToken: string;
}

export type AuthResponse = AuthUser;

export interface RefreshTokenResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_HYDRATE'; payload: AuthUser | null }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<AuthUser> }
  | { type: 'AUTH_CLEAR_ERROR' };