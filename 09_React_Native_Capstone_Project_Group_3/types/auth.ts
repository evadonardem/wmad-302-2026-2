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
  age?: number;
  /**
   * True when the account was created through the register screen. DummyJSON does not
   * persist new users, so these sessions are backed by a demo token and profile data is
   * kept locally instead of being re-fetched from /auth/me.
   */
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

/** Fields the user may change from the Edit Profile screen (PUT /users/{id}). */
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

/** Raw login payload. DummyJSON returns `accessToken`; older versions returned `token`. */
export interface RawLoginResponse {
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
