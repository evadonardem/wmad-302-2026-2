
/**
 * Auth Context with useReducer
 * Handles authentication, persistence, and profile updates
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
} from '@/types/auth';

import { authApi } from '@/services/authApi';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Profile update fields
export type ProfileUpdateData = Partial<
  Pick<
    AuthUser,
    'firstName' | 'lastName' | 'username' | 'email' | 'gender' | 'image'
  >
>;

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
        user: state.user
          ? { ...state.user, ...action.payload }
          : null,
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

// Context interface
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: ProfileUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restore authentication from AsyncStorage
   */
  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        const storedUser = await authApi.getStoredUser();

        if (!storedUser?.token || !storedUser?.refreshToken) {
          if (mounted) {
            dispatch({ type: 'AUTH_HYDRATE', payload: null });
          }
          return;
        }

        try {
          const freshUser = await authApi.getMe();

          const mergedUser: AuthUser = {
            ...storedUser,
            ...freshUser,
            token: storedUser.token,
            refreshToken: storedUser.refreshToken,
          };

          await authApi.setTokens(mergedUser);

          if (mounted) {
            dispatch({
              type: 'AUTH_HYDRATE',
              payload: mergedUser,
            });
          }
        } catch {
          try {
            await authApi.refreshAccessToken();

            const refreshedUser = await authApi.getStoredUser();

            if (mounted) {
              dispatch({
                type: 'AUTH_HYDRATE',
                payload: refreshedUser,
              });
            }
          } catch {
            await authApi.logout();

            if (mounted) {
              dispatch({
                type: 'AUTH_HYDRATE',
                payload: null,
              });
            }
          }
        }
      } catch {
        if (mounted) {
          dispatch({
            type: 'AUTH_HYDRATE',
            payload: null,
          });
        }
      }
    };

    hydrateAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Login
   */
  const login = useCallback(
    async (username: string, password: string) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const user = await authApi.login({
          username,
          password,
        });

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: user,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Login failed';

        dispatch({
          type: 'AUTH_FAILURE',
          payload: message,
        });

        throw error;
      }
    },
    []
  );

  /**
   * Register
   */
  const register = useCallback(
    async (data: RegisterData) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const user = await authApi.register(data);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: user,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Registration failed';

        dispatch({
          type: 'AUTH_FAILURE',
          payload: message,
        });

        throw error;
      }
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(() => {
    void authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  /**
   * Refresh current user information
   */
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) {
      return;
    }

    try {
      const freshUser = await authApi.getMe();
      const storedUser = await authApi.getStoredUser();

      if (storedUser) {
        const mergedUser: AuthUser = {
          ...storedUser,
          ...freshUser,
          token: storedUser.token,
          refreshToken: storedUser.refreshToken,
        };

        await authApi.setTokens(mergedUser);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: mergedUser,
        });
      }
    } catch (error) {
      console.warn('Unable to refresh user information:', error);
    }
  }, [state.isAuthenticated]);

  /**
   * Update user profile
   */
  const updateUser = useCallback(
    async (data: ProfileUpdateData) => {
      if (!state.user) {
        throw new Error('You must be logged in to update your profile.');
      }

      try {
        const updatedUser = await authApi.updateUser(
          state.user.id,
          data
        );

        dispatch({
          type: 'AUTH_UPDATE_USER',
          payload: updatedUser,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to update profile';

        throw new Error(message);
      }
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthContext };

