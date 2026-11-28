import { authReducer, initialAuthState } from '@/context/authReducer';
import { AuthUser } from '@/types/auth';

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'e@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: '',
  token: 't',
  refreshToken: 'r',
};

describe('authReducer', () => {
  it('starts loading so the guard waits for hydration', () => {
    expect(initialAuthState.isLoading).toBe(true);
    expect(initialAuthState.isAuthenticated).toBe(false);
  });

  it('AUTH_START sets loading and clears the error', () => {
    const state = authReducer({ ...initialAuthState, isLoading: false, error: 'x' }, { type: 'AUTH_START' });
    expect(state).toMatchObject({ isLoading: true, error: null });
  });

  it('AUTH_SUCCESS stores the user and authenticates', () => {
    const state = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    expect(state).toMatchObject({ user, isAuthenticated: true, isLoading: false, error: null });
  });

  it('AUTH_FAILURE clears the user and keeps the message', () => {
    const state = authReducer(
      { ...initialAuthState, user, isAuthenticated: true },
      { type: 'AUTH_FAILURE', payload: 'Invalid credentials' }
    );
    expect(state).toMatchObject({ user: null, isAuthenticated: false, error: 'Invalid credentials' });
  });

  it('AUTH_LOGOUT resets the session', () => {
    const state = authReducer({ ...initialAuthState, user, isAuthenticated: true }, { type: 'AUTH_LOGOUT' });
    expect(state).toMatchObject({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('AUTH_HYDRATE with a user authenticates, with null does not', () => {
    expect(authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: user })).toMatchObject({
      isAuthenticated: true,
      isLoading: false,
    });
    expect(authReducer(initialAuthState, { type: 'AUTH_HYDRATE', payload: null })).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('AUTH_UPDATE_USER merges changes and ignores when signed out', () => {
    const signedIn = authReducer(initialAuthState, { type: 'AUTH_SUCCESS', payload: user });
    const updated = authReducer(signedIn, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } });
    expect(updated.user?.firstName).toBe('Em');
    expect(updated.user?.lastName).toBe('Johnson');
    expect(authReducer(initialAuthState, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } }).user).toBeNull();
  });

  it('AUTH_CLEAR_ERROR removes the error', () => {
    expect(authReducer({ ...initialAuthState, error: 'x' }, { type: 'AUTH_CLEAR_ERROR' }).error).toBeNull();
  });
});
