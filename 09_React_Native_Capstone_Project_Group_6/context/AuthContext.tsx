/**
 * Auth Context with useReducer
 * Phase 1: hydration + session-expiry work with async storage.
 * Phase 2: register (local accounts are never sent to the server).
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AuthState, AuthAction, AuthUser, RegisterData } from '@/types/auth';
import { authApi, ProfileUpdate } from '@/services/authApi';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with true for hydration
  error: null,
};

// Reducer (exported so it can be unit-tested in Phase 7)
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
  updateProfile: (changes: ProfileUpdate) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // If a token refresh fails anywhere in the app, log the user out.
  // The (app) layout guard then redirects to /login automatically.
  useEffect(() => {
    authApi.setSessionExpiredHandler(() => dispatch({ type: 'AUTH_LOGOUT' }));
    return () => authApi.setSessionExpiredHandler(null);
  }, []);

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const storedUser = await authApi.getStoredUser();
        if (!storedUser?.token || !storedUser.refreshToken) {
          dispatch({ type: 'AUTH_HYDRATE', payload: null });
          return;
        }

        // Accounts created on this device have no server session to verify.
        if (storedUser.isLocalAccount) {
          dispatch({ type: 'AUTH_HYDRATE', payload: storedUser });
          return;
        }

        try {
          // getMe() goes through the interceptor, so an expired token is
          // refreshed automatically. Tokens may have changed, so re-read them.
          const freshUser = await authApi.getMe();
          const latest = (await authApi.getStoredUser()) ?? storedUser;
          // Stored values win, so profile edits aren't lost on reload
          // (the server never keeps them)
          const mergedUser: AuthUser = { ...freshUser, ...latest };
          await authApi.setTokens(mergedUser);
          dispatch({ type: 'AUTH_HYDRATE', payload: mergedUser });
        } catch {
          // Token and refresh both failed: clear the dead session.
          await authApi.logout();
          dispatch({ type: 'AUTH_HYDRATE', payload: null });
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
    try {
      const user = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user }); // auto-login
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const updateProfile = useCallback(async (changes: ProfileUpdate) => {
    const updated = await authApi.updateProfile(changes);
    dispatch({ type: 'AUTH_UPDATE_USER', payload: updated });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async () => {
    // Local accounts have nothing to refresh from the server.
    if (!state.isAuthenticated || state.user?.isLocalAccount) return;
    try {
      const user = await authApi.getMe();
      const storedUser = await authApi.getStoredUser();
      if (storedUser) {
        const mergedUser: AuthUser = { ...user, ...storedUser };
        await authApi.setTokens(mergedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: mergedUser });
      }
    } catch {
      // Silent: the interceptor handles 401s and logs out if refresh fails.
    }
  }, [state.isAuthenticated, state.user?.isLocalAccount]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateProfile, clearError, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
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