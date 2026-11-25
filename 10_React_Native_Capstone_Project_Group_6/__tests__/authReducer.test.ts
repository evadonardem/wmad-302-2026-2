import { authReducer, initialState } from '@/context/AuthContext';
import { AuthState, AuthUser } from '@/types/auth';

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'e@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: '',
  token: 'T',
  refreshToken: 'R',
};

const loggedIn: AuthState = { user, isAuthenticated: true, isLoading: false, error: null };

describe('authReducer', () => {
  it('starts loading and logged out (while the saved session is being checked)', () => {
    expect(initialState).toEqual({ user: null, isAuthenticated: false, isLoading: true, error: null });
  });

  it('AUTH_START shows loading and clears the old error', () => {
    const next = authReducer({ ...initialState, isLoading: false, error: 'old' }, { type: 'AUTH_START' });
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('AUTH_SUCCESS logs the user in', () => {
    const next = authReducer(initialState, { type: 'AUTH_SUCCESS', payload: user });
    expect(next).toEqual(loggedIn);
  });

  it('AUTH_FAILURE logs out and keeps the message for the screen', () => {
    const next = authReducer(loggedIn, { type: 'AUTH_FAILURE', payload: 'Invalid credentials' });
    expect(next).toEqual({ user: null, isAuthenticated: false, isLoading: false, error: 'Invalid credentials' });
  });

  it('AUTH_LOGOUT clears the user and any error', () => {
    const next = authReducer({ ...loggedIn, error: 'x' }, { type: 'AUTH_LOGOUT' });
    expect(next).toEqual({ user: null, isAuthenticated: false, isLoading: false, error: null });
  });

  it('AUTH_HYDRATE restores a saved user, or none', () => {
    expect(authReducer(initialState, { type: 'AUTH_HYDRATE', payload: user })).toMatchObject({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    expect(authReducer(initialState, { type: 'AUTH_HYDRATE', payload: null })).toMatchObject({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('AUTH_UPDATE_USER changes only the given fields, and only if someone is logged in', () => {
    const next = authReducer(loggedIn, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } });
    expect(next.user).toMatchObject({ firstName: 'Em', lastName: 'Johnson', token: 'T' });
    expect(authReducer(initialState, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } }).user).toBeNull();
  });

  it('AUTH_CLEAR_ERROR removes the error only', () => {
    const next = authReducer({ ...loggedIn, error: 'x' }, { type: 'AUTH_CLEAR_ERROR' });
    expect(next.error).toBeNull();
    expect(next.user).toBe(user);
  });

  it('ignores unknown actions', () => {
    expect(authReducer(loggedIn, { type: 'NOPE' } as never)).toBe(loggedIn);
  });
});
