/**
 * Auth Context with useReducer
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthState,
  AuthAction,
  AuthUser,
  RegisterData,
  UpdateUserData,
} from '@/types/auth';
import { authApi } from '@/services/authApi';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
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

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: UpdateUserData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  useEffect(() => {
    authApi.onUnauthorized(() => {
      dispatch({ type: 'AUTH_LOGOUT' });
    });
    return () => authApi.onUnauthorized(null);
  }, []);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const storedUser = await authApi.getStoredUser();
        if (!storedUser?.token) {
          dispatch({ type: 'AUTH_HYDRATE', payload: null });
          return;
        }

        // If mock token from newly registered user, restore directly
        if (storedUser.token.startsWith('mock-access-token-')) {
          dispatch({ type: 'AUTH_HYDRATE', payload: storedUser });
          return;
        }

        try {
          const freshUser = await authApi.getMe();
          const mergedUser: AuthUser = {
            ...freshUser,
            token: storedUser.token,
            refreshToken: storedUser.refreshToken,
          };
          await authApi.setTokens(mergedUser);
          dispatch({ type: 'AUTH_HYDRATE', payload: mergedUser });
        } catch {
          try {
            await authApi.refreshAccessToken();
            const refreshedUser = await authApi.getStoredUser();
            dispatch({ type: 'AUTH_HYDRATE', payload: refreshedUser });
          } catch {
            await authApi.logout();
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
    try {
      const user = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateUserData) => {
      if (!state.user) return;
      const updated = await authApi.updateUser(state.user.id, updates);
      dispatch({ type: 'AUTH_UPDATE_USER', payload: updated });
    },
    [state.user]
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const user = await authApi.getMe();
      const storedUser = await authApi.getStoredUser();
      if (storedUser) {
        const mergedUser: AuthUser = {
          ...user,
          token: storedUser.token,
          refreshToken: storedUser.refreshToken,
        };
        await authApi.setTokens(mergedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: mergedUser });
      }
    } catch {
      // Handled by interceptor
    }
  }, [state.isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        updateProfile,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };