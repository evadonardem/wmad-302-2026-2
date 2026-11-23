/**
 * Auth Context with useReducer
 * Handles login, register, logout, session hydration and expired-session logout.
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

// Context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  /** Apply local profile changes (e.g. after editing the profile). */
  updateUser: (changes: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Log out automatically when the API can no longer refresh the token
  useEffect(() => {
    authApi.setSessionExpiredHandler(() => dispatch({ type: 'AUTH_LOGOUT' }));
    return () => authApi.setSessionExpiredHandler(null);
  }, []);

  // Restore the saved session on app start
  useEffect(() => {
    const hydrateAuth = async () => {
      const stored = await authApi.hydrate();
      if (!stored?.token || !stored.refreshToken) {
        dispatch({ type: 'AUTH_HYDRATE', payload: null });
        return;
      }

      try {
        // The 401 interceptor refreshes the token automatically if it expired
        const profile = await authApi.getMe();
        const current = authApi.getStoredUser() ?? stored;
        const merged: AuthUser = { ...current, ...profile };
        authApi.setTokens(merged);
        dispatch({ type: 'AUTH_HYDRATE', payload: merged });
      } catch {
        authApi.logout();
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
    try {
      // Creates the account and signs the user in (auto-login)
      const user = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
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
    if (!state.isAuthenticated) return;
    try {
      const profile = await authApi.getMe();
      const current = authApi.getStoredUser();
      if (current) {
        const merged: AuthUser = { ...current, ...profile };
        authApi.setTokens(merged);
        dispatch({ type: 'AUTH_SUCCESS', payload: merged });
      }
    } catch {
      // Ignore: the 401 interceptor handles expired tokens
    }
  }, [state.isAuthenticated]);

  const updateUser = useCallback((changes: Partial<AuthUser>) => {
    authApi.updateSession(changes);
    dispatch({ type: 'AUTH_UPDATE_USER', payload: changes });
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ ...state, login, register, logout, clearError, refreshUser, updateUser }),
    [state, login, register, logout, clearError, refreshUser, updateUser]
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

export { AuthContext, authReducer, initialState as initialAuthState };
