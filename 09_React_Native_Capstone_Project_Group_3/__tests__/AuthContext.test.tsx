/**
 * Integration test of the auth flow: provider + hook + (mocked) service.
 */
import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/authApi';
import type { AuthUser } from '@/types/auth';

jest.mock('@/services/authApi', () => ({
  authApi: {
    restoreSession: jest.fn(),
    getStoredUser: jest.fn(),
    setSession: jest.fn(),
    getMe: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    setSessionExpiredHandler: jest.fn(),
  },
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
}));

const api = authApi as jest.Mocked<typeof authApi>;

const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'e@x.com',
  firstName: 'Emily',
  lastName: 'J',
  gender: 'female',
  image: '',
  token: 't',
  refreshToken: 'r',
};

let latest: ReturnType<typeof useAuth>;
function Probe() {
  latest = useAuth();
  return <Text testID="status">{latest.isLoading ? 'loading' : latest.isAuthenticated ? 'in' : 'out'}</Text>;
}

const mountProvider = async () => {
  const utils = render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
  await waitFor(() => expect(latest.isLoading).toBe(false));
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
  api.restoreSession.mockResolvedValue(null);
  api.logout.mockResolvedValue(undefined);
});

describe('AuthProvider', () => {
  it('starts logged out when nothing is stored', async () => {
    const { getByTestId } = await mountProvider();
    expect(getByTestId('status').props.children).toBe('out');
  });

  it('restores a stored session after verifying it with /auth/me', async () => {
    api.restoreSession.mockResolvedValue(user);
    api.getStoredUser.mockReturnValue(user);
    api.getMe.mockResolvedValue({ ...user, firstName: 'Fresh' });
    await mountProvider();
    expect(latest.isAuthenticated).toBe(true);
    expect(latest.user?.firstName).toBe('Fresh');
    expect(latest.user?.token).toBe('t');
  });

  it('starts logged out when the stored session cannot be verified', async () => {
    api.restoreSession.mockResolvedValue(user);
    api.getMe.mockRejectedValue(new Error('expired'));
    await mountProvider();
    expect(latest.isAuthenticated).toBe(false);
    expect(api.logout).toHaveBeenCalled();
  });

  it('login success authenticates; failure exposes the error and rethrows', async () => {
    await mountProvider();

    api.login.mockResolvedValueOnce(user);
    await act(async () => {
      await latest.login('emilys', 'emilyspass');
    });
    expect(latest.isAuthenticated).toBe(true);

    await act(async () => {
      await latest.logout();
    });
    expect(latest.isAuthenticated).toBe(false);

    api.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    await act(async () => {
      await expect(latest.login('x', 'y')).rejects.toThrow('Invalid credentials');
    });
    expect(latest.error).toBe('Invalid credentials');

    act(() => latest.clearError());
    expect(latest.error).toBeNull();
  });

  it('register signs the new user in (auto-login)', async () => {
    await mountProvider();
    api.register.mockResolvedValueOnce({ ...user, id: 209, username: 'anacruz' });
    await act(async () => {
      await latest.register({
        firstName: 'Ana',
        lastName: 'Cruz',
        username: 'anacruz',
        password: 'secret1',
        email: 'ana@example.com',
      });
    });
    expect(latest.isAuthenticated).toBe(true);
    expect(latest.user?.username).toBe('anacruz');
  });

  it('register failure surfaces the message', async () => {
    await mountProvider();
    api.register.mockRejectedValueOnce(new Error('Username already exists'));
    await act(async () => {
      await expect(
        latest.register({ firstName: 'A', lastName: 'B', username: 'abc', password: 'secret1', email: 'a@b.co' })
      ).rejects.toThrow();
    });
    expect(latest.error).toBe('Username already exists');
    expect(latest.isAuthenticated).toBe(false);
  });

  it('updateProfile merges the saved fields into the user', async () => {
    api.restoreSession.mockResolvedValue(user);
    api.getStoredUser.mockReturnValue(user);
    api.getMe.mockResolvedValue(user);
    await mountProvider();

    api.updateProfile.mockResolvedValueOnce({ ...user, firstName: 'Em' });
    await act(async () => {
      await latest.updateProfile({ firstName: 'Em', lastName: 'J', email: 'e@x.com' });
    });
    expect(latest.user?.firstName).toBe('Em');
  });

  it('useAuth outside the provider throws', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
