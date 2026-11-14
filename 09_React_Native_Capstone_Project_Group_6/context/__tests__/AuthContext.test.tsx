/* eslint-env jest */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, authReducer, useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/authApi';
import type { AuthState } from '@/types/auth';
import { makeUser } from '../../test-utils/fixtures';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const idle: AuthState = { user: null, isAuthenticated: false, isLoading: false, error: null };

describe('authReducer', () => {
  it('AUTH_START sets loading and clears the error', () => {
    const state = authReducer({ ...idle, error: 'old' }, { type: 'AUTH_START' });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('AUTH_SUCCESS stores the user', () => {
    const user = makeUser();
    const state = authReducer(idle, { type: 'AUTH_SUCCESS', payload: user });
    expect(state).toMatchObject({ user, isAuthenticated: true, isLoading: false, error: null });
  });

  it('AUTH_FAILURE stores the message and no user', () => {
    const state = authReducer(
      { ...idle, user: makeUser(), isAuthenticated: true },
      { type: 'AUTH_FAILURE', payload: 'Invalid credentials' },
    );
    expect(state).toMatchObject({
      user: null,
      isAuthenticated: false,
      error: 'Invalid credentials',
    });
  });

  it('AUTH_LOGOUT clears the user', () => {
    const state = authReducer(
      { ...idle, user: makeUser(), isAuthenticated: true },
      { type: 'AUTH_LOGOUT' },
    );
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('AUTH_HYDRATE sets authenticated only when a user exists', () => {
    expect(
      authReducer({ ...idle, isLoading: true }, { type: 'AUTH_HYDRATE', payload: null }),
    ).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
    });
    expect(authReducer(idle, { type: 'AUTH_HYDRATE', payload: makeUser() }).isAuthenticated).toBe(
      true,
    );
  });

  it('AUTH_UPDATE_USER merges changes into the user', () => {
    const state = authReducer(
      { ...idle, user: makeUser(), isAuthenticated: true },
      { type: 'AUTH_UPDATE_USER', payload: { firstName: 'Jec' } },
    );
    expect(state.user?.firstName).toBe('Jec');
    expect(state.user?.lastName).toBe('Agustin');
  });

  it('AUTH_UPDATE_USER does nothing without a user', () => {
    expect(
      authReducer(idle, { type: 'AUTH_UPDATE_USER', payload: { firstName: 'X' } }).user,
    ).toBeNull();
  });

  it('AUTH_CLEAR_ERROR clears the error', () => {
    expect(authReducer({ ...idle, error: 'x' }, { type: 'AUTH_CLEAR_ERROR' }).error).toBeNull();
  });
});

describe('AuthProvider / useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });

  it('starts logged out after hydrating', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('register logs the new user in, and logout logs them out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register({
        firstName: 'Jecressa',
        lastName: 'Agustin',
        username: 'jecressa',
        password: 'secret123',
        email: 'jecressa@example.com',
      });
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('jecressa');

    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login with a wrong password shows an error', async () => {
    await authApi.register({
      firstName: 'A',
      lastName: 'B',
      username: 'abc',
      password: 'right-pass',
      email: 'abc@example.com',
    });
    await authApi.logout();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('abc', 'wrong').catch(() => undefined);
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('restores the saved session on start (hydrate)', async () => {
    await authApi.register({
      firstName: 'A',
      lastName: 'B',
      username: 'saved',
      password: 'pass1234',
      email: 'saved@example.com',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.username).toBe('saved');
  });

  it('updateProfile changes the user in state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.register({
        firstName: 'A',
        lastName: 'B',
        username: 'edit',
        password: 'pass1234',
        email: 'edit@example.com',
      });
    });
    await act(async () => {
      await result.current.updateProfile({
        firstName: 'New',
        lastName: 'Name',
        email: 'new@example.com',
      });
    });
    expect(result.current.user?.firstName).toBe('New');
    expect(result.current.user?.email).toBe('new@example.com');
  });
});
