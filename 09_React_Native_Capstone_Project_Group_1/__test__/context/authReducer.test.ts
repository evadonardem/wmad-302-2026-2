/**
 * Unit tests - authReducer
 */
import { authReducer } from '@/context/AuthContext';
import type { AuthState } from '@/types/auth';
import { sampleUser } from '../../test-utils/fixtures';

// The reducer is pure, no need to load the real API client
jest.mock('@/services/authApi', () => ({ authApi: {} }));

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

describe('authReducer', () => {
  it('AUTH_START sets loading and clears the error', () => {
    const state = authReducer({ ...initialState, isLoading: false, error: 'old' }, { type: 'AUTH_START' });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('AUTH_SUCCESS stores the user and authenticates', () => {
    const state = authReducer(initialState, { type: 'AUTH_SUCCESS', payload: sampleUser });
    expect(state).toEqual({
      user: sampleUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it('AUTH_FAILURE clears the user and stores the message', () => {
    const loggedIn = authReducer(initialState, { type: 'AUTH_SUCCESS', payload: sampleUser });
    const state = authReducer(loggedIn, { type: 'AUTH_FAILURE', payload: 'Invalid credentials' });
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('AUTH_LOGOUT resets the session', () => {
    const loggedIn = authReducer(initialState, { type: 'AUTH_SUCCESS', payload: sampleUser });
    const state = authReducer(loggedIn, { type: 'AUTH_LOGOUT' });
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('AUTH_HYDRATE with a user authenticates', () => {
    const state = authReducer(initialState, { type: 'AUTH_HYDRATE', payload: sampleUser });
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(sampleUser);
    expect(state.isLoading).toBe(false);
  });

  it('AUTH_HYDRATE with null stays logged out', () => {
    const state = authReducer(initialState, { type: 'AUTH_HYDRATE', payload: null });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('AUTH_UPDATE_USER merges the changes into the user', () => {
    const loggedIn = authReducer(initialState, { type: 'AUTH_SUCCESS', payload: sampleUser });
    const state = authReducer(loggedIn, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } });
    expect(state.user?.firstName).toBe('Em');
    expect(state.user?.lastName).toBe('Johnson');
  });

  it('AUTH_UPDATE_USER does nothing without a user', () => {
    const state = authReducer(initialState, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Em' } });
    expect(state.user).toBeNull();
  });

  it('AUTH_CLEAR_ERROR removes the error', () => {
    const state = authReducer({ ...initialState, error: 'boom' }, { type: 'AUTH_CLEAR_ERROR' });
    expect(state.error).toBeNull();
  });
});