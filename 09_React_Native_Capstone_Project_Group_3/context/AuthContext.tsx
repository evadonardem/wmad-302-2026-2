/**
 * Auth Context with useReducer
 * Handles login, register (auto-login), logout, profile updates, session hydration and
 * session expiry (when a token refresh fails the user is signed out and the route guard
 * redirects to the login screen).
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
import {
  AuthState,
  AuthAction,
  AuthUser,
  RegisterData,
  UpdateProfileData,
} from '@/types/auth';
import { authApi, getErrorMessage } from '@/services/authApi';

// Initial state
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with true for hydration
  error: null,
};

// Reducer
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };

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
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };

    case 'AUTH_HYDRATE':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };

    case 'AUTH_UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };

    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Sign the user out automatically when the token can no longer be refreshed
  useEffect(() => {
    authApi.setSessionExpiredHandler(() => dispatch({ type: 'AUTH_LOGOUT' }));
    return () => authApi.setSessionExpiredHandler(null);
  }, []);

  // Hydrate from storage on mount
  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async () => {
      try {
        const stored = await authApi.restoreSession();
        if (!stored) {
          if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: null });
          return;
        }

        if (stored.isSimulated) {
          // Locally registered account: nothing to verify against /auth/me
          if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: stored });
          return;
        }

        // Verify the token still works (the 401 interceptor refreshes it if needed)
        const fresh = await authApi.getMe();
        const current = authApi.getStoredUser() ?? stored;
        const merged: AuthUser = {
          ...current,
          ...fresh,
          token: current.token,
          refreshToken: current.refreshToken,
        };
        await authApi.setSession(merged);
        if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: merged });
      } catch {
        // Token expired and refresh failed (or we're offline): start logged out
        await authApi.logout();
        if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: null });
      }
    };

    hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authApi.login({ username, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      dispatch({ type: 'AUTH_FAILURE', payload: getErrorMessage(error, 'Login failed') });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // authApi.register creates the account and signs the user in (auto-login)
      const user = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      dispatch({ type: 'AUTH_FAILURE', payload: getErrorMessage(error, 'Registration failed') });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout(); // clears memory + secure storage
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async () => {
    const current = authApi.getStoredUser();
    if (!current || current.isSimulated) return;
    try {
      const fresh = await authApi.getMe();
      const latest = authApi.getStoredUser() ?? current;
      const merged: AuthUser = {
        ...latest,
        ...fresh,
        token: latest.token,
        refreshToken: latest.refreshToken,
      };
      await authApi.setSession(merged);
      dispatch({ type: 'AUTH_UPDATE_USER', payload: merged });
    } catch {
      // The 401 interceptor handles expired sessions
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    const updated = await authApi.updateProfile(data);
    dispatch({ type: 'AUTH_UPDATE_USER', payload: updated });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ ...state, login, register, logout, clearError, refreshUser, updateProfile }),
    [state, login, register, logout, clearError, refreshUser, updateProfile]
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
