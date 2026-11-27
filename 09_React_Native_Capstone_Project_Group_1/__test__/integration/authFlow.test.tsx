/**
 * Integration tests - auth flow
 * Real AuthProvider + real authApi + AsyncStorage mock. Only the network (axios) is faked.
 */
import React from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/authApi';
import { sampleUser } from '../../test-utils/fixtures';

jest.mock('axios', () => {
  const client = Object.assign(jest.fn(), {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  });
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => client),
      post: jest.fn(),
      put: jest.fn(),
      isAxiosError: (error: unknown) =>
        typeof error === 'object' && error !== null && 'isAxiosError' in error,
    },
  };
});

type MockClient = jest.Mock & {
  get: jest.Mock;
  post: jest.Mock;
  interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
};

// Grab these before any mock gets reset
const client = (axios.create as jest.Mock).mock.results[0].value as MockClient;
const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1] as (
  error: unknown
) => Promise<unknown>;
const mockedAxios = axios as unknown as { post: jest.Mock; put: jest.Mock };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const readSaved = async () => JSON.parse((await AsyncStorage.getItem('auth_user')) ?? 'null');

beforeEach(async () => {
  client.get.mockReset();
  client.post.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  authApi.logout();
  await AsyncStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('starting the app', () => {
  it('is logged out when nothing is saved', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('restores a saved session and keeps the saved profile', async () => {
    const saved = { ...sampleUser, firstName: 'Saved Name' };
    await AsyncStorage.setItem('auth_user', JSON.stringify(saved));
    client.get.mockResolvedValue({ data: { ...sampleUser, firstName: 'Server Name' } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.firstName).toBe('Saved Name');
    expect(client.get).toHaveBeenCalledWith('/me');
  });

  it('refreshes an expired token on start', async () => {
    await AsyncStorage.setItem('auth_user', JSON.stringify(sampleUser));
    client.get.mockRejectedValueOnce(new Error('401')).mockResolvedValue({ data: sampleUser });
    client.post.mockResolvedValue({
      data: { ...sampleUser, accessToken: 'new-access', refreshToken: 'new-refresh' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.token).toBe('new-access');
  });

  it('logs out and clears storage when the session cannot be refreshed', async () => {
    await AsyncStorage.setItem('auth_user', JSON.stringify(sampleUser));
    client.get.mockRejectedValue(new Error('401'));
    client.post.mockRejectedValue(new Error('expired'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    await waitFor(async () => expect(await readSaved()).toBeNull());
  });
});

describe('login and logout', () => {
  it('logs in and saves the session', async () => {
    client.post.mockResolvedValue({ data: sampleUser });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('emilys');
    await waitFor(async () => expect(await readSaved()).toEqual(sampleUser));
  });

  it('shows the error and stays logged out when the login fails', async () => {
    client.post.mockRejectedValue(new Error('Invalid credentials'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.login('bad', 'bad')).rejects.toThrow('Invalid credentials');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('logout clears the state and the saved session', async () => {
    client.post.mockResolvedValue({ data: sampleUser });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });

    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    await waitFor(async () => expect(await readSaved()).toBeNull());
  });
});

describe('register', () => {
  const form = {
    firstName: 'Ana',
    lastName: 'Reyes',
    username: 'ana',
    password: 'secret1',
    email: 'ana@example.com',
  };

  it('creates the account and signs the user in', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 209 } });
    client.post.mockResolvedValue({ data: sampleUser });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register(form);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({ id: 209, username: 'ana', firstName: 'Ana' });
    await waitFor(async () => expect(await readSaved()).toMatchObject({ username: 'ana' }));
  });

  it('reports a failed registration', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.register(form)).rejects.toThrow('Server error');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Server error');
  });
});

describe('profile', () => {
  it('updateUser saves the changes in state and storage', async () => {
    client.post.mockResolvedValue({ data: sampleUser });
    mockedAxios.put.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });

    await act(async () => {
      await result.current.updateUser({ firstName: 'Em', email: 'em@example.com' });
    });

    expect(result.current.user).toMatchObject({ firstName: 'Em', email: 'em@example.com' });
    expect(mockedAxios.put).toHaveBeenCalledWith(
      'https://dummyjson.com/users/1',
      { firstName: 'Em', email: 'em@example.com' },
      expect.any(Object)
    );
    await waitFor(async () => expect(await readSaved()).toMatchObject({ firstName: 'Em' }));
  });

  it('updateUser does nothing when logged out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateUser({ firstName: 'Em' });
    });
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it('refreshUser reloads the profile but keeps saved edits', async () => {
    client.post.mockResolvedValue({ data: sampleUser });
    mockedAxios.put.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });
    await act(async () => {
      await result.current.updateUser({ firstName: 'Em' });
    });

    client.get.mockResolvedValue({ data: { ...sampleUser, lastName: 'FromServer' } });
    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.firstName).toBe('Em');
    expect(result.current.isAuthenticated).toBe(true);
  });
});

describe('expired session', () => {
  it('sends the user back to logged-out state when a refresh fails', async () => {
    client.post.mockResolvedValueOnce({ data: sampleUser });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login('emilys', 'emilyspass');
    });
    expect(result.current.isAuthenticated).toBe(true);

    // A request returns 401 and the refresh is rejected too
    client.post.mockRejectedValue(new Error('refresh expired'));
    await act(async () => {
      await expect(
        responseErrorInterceptor({ config: { headers: {}, _retry: false }, response: { status: 401 } })
      ).rejects.toThrow('refresh expired');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

describe('useAuth', () => {
  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });
});