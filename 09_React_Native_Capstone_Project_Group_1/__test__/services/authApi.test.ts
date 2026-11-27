/**
 * Unit tests - authApi (axios is mocked, no network)
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/authApi';
import { sampleUser } from '../../test-utils/fixtures';

jest.mock('axios', () => {
  // Callable like a real axios instance (the 401 retry calls client(config))
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

// The service creates its axios client once, when it is imported.
// Grab the interceptors now, before any mock gets reset.
const client = (axios.create as jest.Mock).mock.results[0].value as MockClient;
const requestInterceptor = client.interceptors.request.use.mock.calls[0][0] as (
  config: { headers: Record<string, string> }
) => { headers: Record<string, string> };
const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1] as (
  error: unknown
) => Promise<unknown>;

const mockedAxios = axios as unknown as { post: jest.Mock; put: jest.Mock };

beforeEach(async () => {
  client.mockReset();
  client.get.mockReset();
  client.post.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  authApi.setSessionExpiredHandler(null);
  authApi.logout();
  await AsyncStorage.clear();
});

describe('login', () => {
  it('posts the credentials and saves the session', async () => {
    client.post.mockResolvedValue({ data: sampleUser });

    const user = await authApi.login({ username: 'emilys', password: 'emilyspass' });

    expect(client.post).toHaveBeenCalledWith('/login', {
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 60,
    });
    expect(user).toEqual(sampleUser);
    expect(authApi.getStoredUser()).toEqual(sampleUser);
    expect(authApi.hasValidTokens()).toBe(true);
  });

  it('keeps the session in AsyncStorage', async () => {
    client.post.mockResolvedValue({ data: sampleUser });
    await authApi.login({ username: 'emilys', password: 'emilyspass', expiresInMins: 30 });

    await new Promise((resolve) => setImmediate(resolve));
    expect(JSON.parse((await AsyncStorage.getItem('auth_user')) ?? 'null')).toEqual(sampleUser);
    expect(client.post).toHaveBeenCalledWith('/login', expect.objectContaining({ expiresInMins: 30 }));
  });

  it('passes login errors on and stores nothing', async () => {
    client.post.mockRejectedValue(new Error('Invalid credentials'));
    await expect(authApi.login({ username: 'x', password: 'y' })).rejects.toThrow('Invalid credentials');
    expect(authApi.getStoredUser()).toBeNull();
  });
});

describe('register', () => {
  const data = {
    firstName: 'Ana',
    lastName: 'Reyes',
    username: 'ana',
    password: 'secret1',
    email: 'ana@example.com',
  };

  it('creates the user, signs in and keeps the new details', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 209 } });
    client.post.mockResolvedValue({ data: sampleUser });

    const user = await authApi.register({ ...data, gender: 'female' });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://dummyjson.com/users/add',
      expect.objectContaining({ username: 'ana' }),
      expect.any(Object)
    );
    // Signed in with the demo account to get real tokens
    expect(client.post).toHaveBeenCalledWith(
      '/login',
      expect.objectContaining({ username: 'emilys', password: 'emilyspass' })
    );
    expect(user).toMatchObject({
      id: 209,
      username: 'ana',
      email: 'ana@example.com',
      firstName: 'Ana',
      lastName: 'Reyes',
      gender: 'female',
      token: sampleUser.token,
      refreshToken: sampleUser.refreshToken,
    });
    expect(authApi.getStoredUser()).toEqual(user);
  });

  it('falls back to the demo gender and image when none are given', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 210 } });
    client.post.mockResolvedValue({ data: sampleUser });

    const user = await authApi.register(data);
    expect(user.gender).toBe(sampleUser.gender);
    expect(user.image).toBe(sampleUser.image);
  });

  it('fails when the user cannot be created', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Server error'));
    await expect(authApi.register(data)).rejects.toThrow('Server error');
    expect(client.post).not.toHaveBeenCalled();
  });
});

describe('profile and session', () => {
  it('getMe reads /me', async () => {
    client.get.mockResolvedValue({ data: sampleUser });
    expect(await authApi.getMe()).toEqual(sampleUser);
    expect(client.get).toHaveBeenCalledWith('/me');
  });

  it('updateProfile sends PUT /users/{id}', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await authApi.updateProfile(1, { firstName: 'Em' });
    expect(mockedAxios.put).toHaveBeenCalledWith(
      'https://dummyjson.com/users/1',
      { firstName: 'Em' },
      expect.any(Object)
    );
  });

  it('updateProfile treats a 404 as a local-only user', async () => {
    mockedAxios.put.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });
    await expect(authApi.updateProfile(209, { firstName: 'Em' })).resolves.toBeUndefined();
  });

  it('updateProfile rethrows other errors', async () => {
    mockedAxios.put.mockRejectedValue({ isAxiosError: true, response: { status: 500 } });
    await expect(authApi.updateProfile(1, { firstName: 'Em' })).rejects.toEqual(
      expect.objectContaining({ response: { status: 500 } })
    );
    mockedAxios.put.mockRejectedValue(new Error('offline'));
    await expect(authApi.updateProfile(1, { firstName: 'Em' })).rejects.toThrow('offline');
  });

  it('loadStoredUser restores the saved session', async () => {
    await AsyncStorage.setItem('auth_user', JSON.stringify(sampleUser));
    expect(await authApi.loadStoredUser()).toEqual(sampleUser);
    expect(authApi.getStoredUser()).toEqual(sampleUser);
  });

  it('logout clears the session', async () => {
    authApi.setTokens(sampleUser);
    authApi.logout();
    expect(authApi.getStoredUser()).toBeNull();
    expect(authApi.hasValidTokens()).toBe(false);
    await new Promise((resolve) => setImmediate(resolve));
    expect(await AsyncStorage.getItem('auth_user')).toBeNull();
  });
});

describe('token refresh', () => {
  it('stores the new tokens', async () => {
    authApi.setTokens(sampleUser);
    client.post.mockResolvedValue({
      data: { ...sampleUser, accessToken: 'new-access', refreshToken: 'new-refresh' },
    });

    const tokens = await authApi.refreshAccessToken();

    expect(client.post).toHaveBeenCalledWith('/refresh', {
      refreshToken: 'refresh-token',
      expiresInMins: 60,
    });
    expect(tokens.accessToken).toBe('new-access');
    expect(authApi.getStoredUser()).toMatchObject({ token: 'new-access', refreshToken: 'new-refresh' });
  });

  it('shares one request between simultaneous refreshes', async () => {
    authApi.setTokens(sampleUser);
    client.post.mockResolvedValue({
      data: { ...sampleUser, accessToken: 'a', refreshToken: 'b' },
    });

    await Promise.all([authApi.refreshAccessToken(), authApi.refreshAccessToken()]);
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it('fails without a refresh token', async () => {
    await expect(authApi.refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('clears the session when the refresh is rejected', async () => {
    authApi.setTokens(sampleUser);
    client.post.mockRejectedValue(new Error('expired'));
    await expect(authApi.refreshAccessToken()).rejects.toThrow('expired');
    expect(authApi.getStoredUser()).toBeNull();
  });
});

describe('interceptors', () => {
  it('adds the Bearer token to requests', () => {
    authApi.setTokens(sampleUser);
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('adds nothing when logged out', () => {
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('retries a 401 request with a fresh token', async () => {
    authApi.setTokens(sampleUser);
    client.post.mockResolvedValue({
      data: { ...sampleUser, accessToken: 'fresh', refreshToken: 'fresh-refresh' },
    });
    client.mockResolvedValue({ data: 'retried' });

    const originalRequest = { headers: {} as Record<string, string>, _retry: false };
    const result = await responseErrorInterceptor({
      config: originalRequest,
      response: { status: 401 },
    });

    expect(originalRequest._retry).toBe(true);
    expect(originalRequest.headers.Authorization).toBe('Bearer fresh');
    expect(client).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: 'retried' });
  });

  it('tells the app the session ended when the refresh fails', async () => {
    const onExpired = jest.fn();
    authApi.setSessionExpiredHandler(onExpired);
    authApi.setTokens(sampleUser);
    client.post.mockRejectedValue(new Error('expired'));
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(
      responseErrorInterceptor({ config: { headers: {}, _retry: false }, response: { status: 401 } })
    ).rejects.toThrow('expired');

    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(authApi.getStoredUser()).toBeNull();
    jest.restoreAllMocks();
  });

  it('does not retry a request that was already retried', async () => {
    const error = { config: { headers: {}, _retry: true }, response: { status: 401 } };
    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(client.post).not.toHaveBeenCalled();
  });

  it('passes other errors straight through', async () => {
    const error = { config: { headers: {} }, response: { status: 500 } };
    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
  });
});