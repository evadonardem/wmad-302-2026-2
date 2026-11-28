/**
 * Auth Context with useReducer
 * - hydrates the stored session on app start
 * - login / register / logout / updateProfile
 * - logs the user out when the token can no longer be refreshed
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
import { AuthState, RegisterData } from '@/types/auth';
import { UpdateProfileData } from '@/types/user';
import { authApi } from '@/services/authApi';
import { userApi } from '@/services/userApi';
import { authReducer, initialAuthState } from '@/context/authReducer';
import { getErrorMessage } from '@/utils/errors';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Hydrate from storage on mount
  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async () => {
      const stored = await authApi.loadSession();
      if (!stored) {
        if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: null });
        return;
      }
      try {
        // Validates the token. A 401 is refreshed automatically by the interceptor.
        await authApi.getMe();
      } catch {
        // Session is cleared by authApi if the refresh token was rejected;
        // on a plain network error we keep the stored session (offline use).
      }
      if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: authApi.getStoredUser() });
    };

    hydrateAuth().catch(() => {
      if (!cancelled) dispatch({ type: 'AUTH_HYDRATE', payload: null });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // If the token can't be refreshed, drop to the login screen (guard redirects)
  useEffect(() => {
    authApi.setSessionExpiredListener(() => dispatch({ type: 'AUTH_LOGOUT' }));
    return () => authApi.setSessionExpiredListener(null);
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
      const user = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      dispatch({ type: 'AUTH_FAILURE', payload: getErrorMessage(error, 'Registration failed') });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      if (!state.user) throw new Error('You must be signed in to edit your profile');
      const updated = await userApi.updateUser(state.user.id, data);
      const changes = {
        firstName: updated.firstName ?? data.firstName,
        lastName: updated.lastName ?? data.lastName,
        email: updated.email ?? data.email,
        phone: updated.phone ?? data.phone,
      };
      await authApi.updateStoredUser(changes);
      dispatch({ type: 'AUTH_UPDATE_USER', payload: changes });
    },
    [state.user]
  );

  const value = useMemo(
    () => ({ ...state, login, register, logout, clearError, updateProfile }),
    [state, login, register, logout, clearError, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
