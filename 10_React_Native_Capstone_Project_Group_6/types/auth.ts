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
  token: string;
  refreshToken: string;
  /** true for accounts made via register(): DummyJSON doesn't really store new users */
  isSimulated?: boolean;
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

export interface AuthResponse extends AuthUser {
  // DummyJSON returns the user object with tokens on login/register
}

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

/** An account made with Register. Saved on this device only (DummyJSON doesn't store new users). */
export interface LocalAccount {
  username: string;
  passwordHash: string; // SHA-256, never the plain password
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'male' | 'female';
}