import { authReducer, initialAuthState } from '@/context/AuthContext';
import type { AuthUser } from '@/types/auth';

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://example.com/e.png',
  token: 'access',
  refreshToken: 'refresh',
};

describe('authReducer', () => {
  it('starts loading (hydration) with no user', () => {
    expect(initialAuthState).toMatchObject({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('AUTH_START sets loading and clears the error', () => {
    const state = authReducer({ ...initialAuthState, isLoading: false, error: 'x' }, { type: 'AUTH_START' });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('AUTH_SUCCESS stores the user and authenticates', () => {
    const state = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    expect(state).toMatchObject({ user, isAuthenticated: true, isLoading: false, error: null });
  });

  it('AUTH_FAILURE stores the error and signs out', () => {
    const state = authReducer(
      { ...initialAuthState, user, isAuthenticated: true },
      { type: 'AUTH_FAILURE', payload: 'Invalid credentials' }
    );
    expect(state).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid credentials',
    });
  });

  it('AUTH_LOGOUT clears the session', () => {
    const state = authReducer({ ...initialAuthState, user, isAuthenticated: true }, { type: 'AUTH_LOGOUT' });
    expect(state).toMatchObject({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('AUTH_HYDRATE authenticates only when a user was restored', () => {
    expect(authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: user }).isAuthenticated).toBe(true);
    const empty = authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: null });
    expect(empty.isAuthenticated).toBe(false);
    expect(empty.isLoading).toBe(false);
  });

  it('AUTH_UPDATE_USER merges fields and ignores updates without a user', () => {
    const updated = authReducer(
      { ...initialAuthState, user, isAuthenticated: true },
      { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } }
    );
    expect(updated.user?.firstName).toBe('Em');
    expect(updated.user?.lastName).toBe('Johnson');
    expect(authReducer(initialAuthState, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'x' } }).user).toBeNull();
  });

  it('AUTH_CLEAR_ERROR removes the error', () => {
    expect(authReducer({ ...initialAuthState, error: 'boom' }, { type: 'AUTH_CLEAR_ERROR' }).error).toBeNull();
  });
});
