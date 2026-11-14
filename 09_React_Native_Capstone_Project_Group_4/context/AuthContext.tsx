/**
 * Auth Context with useReducer
 *
 * - Hydrates the session from AsyncStorage on app start (and verifies it)
 * - login / register / logout / refreshUser
 * - Reacts to failed token refreshes by logging the user out, so the
 *   protected-route guard in app/(app)/_layout.tsx redirects to Login
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { isAxiosError } from 'axios';
import { AuthState, AuthAction, AuthUser, RegisterData } from '@/types/auth';
import { authApi } from '@/services/authApi';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with true for hydration
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_HYDRATE':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

/**
 * Thrown by register() when the account was created but the automatic
 * sign-in afterwards failed. Not a registration failure: the screen should
 * send the user to Login instead of showing an error.
 */
export class AccountCreatedError extends Error {
  constructor() {
    super('Your account was created, but we could not sign you in automatically. Please sign in.');
    this.name = 'AccountCreatedError';
    Object.setPrototypeOf(this, AccountCreatedError.prototype);
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  /** Creates the account, then signs in. Throws AccountCreatedError if only the sign-in step fails. */
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // If a token refresh fails for good, drop the session. The auth guard then redirects to Login.
  // (Declared before the hydration effect so it is in place before any request is made.)
  useEffect(() => {
    authApi.setAuthFailureHandler(() => dispatch({ type: 'AUTH_LOGOUT' }));
    return () => authApi.setAuthFailureHandler(null);
  }, []);

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        // Load the saved session from AsyncStorage into authApi's memory cache
        const storedUser = await authApi.hydrate();

        if (!storedUser?.token || !storedUser?.refreshToken) {
          dispatch({ type: 'AUTH_HYDRATE', payload: null });
          return;
        }

        try {
          // Verify the session. If the access token expired, authApi's interceptor
          // refreshes it and retries this request automatically.
          const freshUser = await authApi.getMe();

          // Re-read the tokens: a refresh may have replaced the ones loaded above
          const current = authApi.getStoredUser();
          if (!current) {
            dispatch({ type: 'AUTH_HYDRATE', payload: null });
            return;
          }

          const mergedUser: AuthUser = {
            ...freshUser,
            token: current.token,
            refreshToken: current.refreshToken,
          };
          authApi.setTokens(mergedUser);
          dispatch({ type: 'AUTH_HYDRATE', payload: mergedUser });
        } catch (error: unknown) {
          if (isAxiosError(error) && !error.response) {
            // Offline or timed out: we can't verify, so keep the saved session
            dispatch({ type: 'AUTH_HYDRATE', payload: authApi.getStoredUser() });
          } else {
            // Token rejected and refresh failed
            authApi.logout();
            dispatch({ type: 'AUTH_HYDRATE', payload: null });
          }
        }
      } catch {
        dispatch({ type: 'AUTH_HYDRATE', payload: null });
      }
    };

    hydrateAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authApi.login({ username, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });

    // 1. Create the account
    try {
      await authApi.register(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }

    // 2. Sign in with the new credentials
    try {
      const user = await authApi.login({ username: data.username, password: data.password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch {
      // Account exists but sign-in failed (DummyJSON doesn't actually save new users).
      // Not an error state: just stop loading and let the screen redirect to Login.
      dispatch({ type: 'AUTH_LOGOUT' });
      throw new AccountCreatedError();
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authApi.hasValidTokens()) return;
    try {
      const user = await authApi.getMe();
      // Re-read tokens after the request: the interceptor may have refreshed them
      const current = authApi.getStoredUser();
      if (current) {
        const mergedUser: AuthUser = {
          ...user,
          token: current.token,
          refreshToken: current.refreshToken,
        };
        authApi.setTokens(mergedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: mergedUser });
      }
    } catch {
      // Silently fail - the interceptor handles 401s and logs out if the refresh fails
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
      refreshUser,
    }),
    [state, login, register, logout, clearError, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };