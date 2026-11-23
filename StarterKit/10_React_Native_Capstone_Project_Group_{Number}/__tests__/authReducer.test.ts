import { authReducer, initialAuthState } from '@/context/AuthContext';
import type { AuthUser } from '@/types/auth';

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'e@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'img.png',
  token: 't',
  refreshToken: 'r',
};

describe('authReducer', () => {
  it('starts loading (waiting for hydration)', () => {
    expect(initialAuthState).toMatchObject({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('AUTH_START sets loading and clears the error', () => {
    const state = authReducer({ ...initialAuthState, error: 'old', isLoading: false }, { type: 'AUTH_START' });
    expect(state).toMatchObject({ isLoading: true, error: null });
  });

  it('AUTH_SUCCESS stores the user', () => {
    const state = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    expect(state).toMatchObject({ user, isAuthenticated: true, isLoading: false, error: null });
  });

  it('AUTH_FAILURE keeps the message and signs out', () => {
    const state = authReducer(initialAuthState, { type: 'AUTH_FAILURE', payload: 'Invalid credentials' });
    expect(state).toMatchObject({ user: null, isAuthenticated: false, error: 'Invalid credentials' });
  });

  it('AUTH_LOGOUT clears the user', () => {
    const signedIn = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    expect(authReducer(signedIn, { type: 'AUTH_LOGOUT' })).toMatchObject({ user: null, isAuthenticated: false });
  });

  it('AUTH_HYDRATE with a user signs in, with null stays signed out', () => {
    expect(authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: user }).isAuthenticated).toBe(true);
    expect(authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: null })).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('AUTH_UPDATE_USER merges changes only when signed in', () => {
    const signedIn = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    expect(authReducer(signedIn, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } }).user?.firstName).toBe('Em');
    expect(authReducer(initialAuthState, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } }).user).toBeNull();
  });

  it('AUTH_CLEAR_ERROR removes the error', () => {
    const state = authReducer({ ...initialAuthState, error: 'x' }, { type: 'AUTH_CLEAR_ERROR' });
    expect(state.error).toBeNull();
  });
});
