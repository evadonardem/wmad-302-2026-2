/**
 * Integration tests for the auth service: login, register (+ auto-login fallback),
 * token refresh on 401 and profile updates. axios is mocked at the transport level.
 */
import { authStorage } from '@/utils/storage';

const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockResponseUse = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: (...args: unknown[]) => mockPost(...args),
      get: (...args: unknown[]) => mockGet(...args),
      put: (...args: unknown[]) => mockPut(...args),
      interceptors: { request: { use: jest.fn() }, response: { use: mockResponseUse } },
    })),
    isAxiosError: () => false,
  },
}));

import { AuthApiService, toAuthUser } from '@/services/authApi';

const rawLogin = {
  id: 1,
  username: 'emilys',
  email: 'e@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female' as const,
  image: 'img',
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

const registerData = {
  firstName: 'Ana',
  lastName: 'Cruz',
  username: 'anacruz',
  password: 'secret1',
  email: 'ana@example.com',
  gender: 'female' as const,
  age: 24,
};

beforeEach(async () => {
  jest.clearAllMocks();
  await authStorage.clearSession();
});

describe('toAuthUser', () => {
  it('maps accessToken to token', () => {
    expect(toAuthUser(rawLogin).token).toBe('access-1');
    expect(toAuthUser({ ...rawLogin, accessToken: undefined, token: 'legacy' }).token).toBe('legacy');
  });
});

describe('AuthApiService.login', () => {
  it('stores the session and persists it', async () => {
    mockPost.mockResolvedValueOnce({ data: rawLogin });
    const api = new AuthApiService();
    const user = await api.login({ username: 'emilys', password: 'emilyspass' });

    expect(mockPost).toHaveBeenCalledWith('/login', expect.objectContaining({ username: 'emilys' }));
    expect(user.token).toBe('access-1');
    expect(api.hasValidTokens()).toBe(true);
    expect((await authStorage.loadSession())?.refreshToken).toBe('refresh-1');
  });

  it('propagates failures without creating a session', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));
    const api = new AuthApiService();
    await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow('Invalid credentials');
    expect(api.hasValidTokens()).toBe(false);
  });
});

describe('AuthApiService.register', () => {
  it('creates the user then signs in with the new credentials when login works', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { id: 209 } }) // /users/add
      .mockResolvedValueOnce({ data: { ...rawLogin, id: 209, username: 'anacruz' } }); // /login
    const api = new AuthApiService();
    const user = await api.register(registerData);

    expect(mockPost).toHaveBeenNthCalledWith(1, '/users/add', expect.objectContaining({ username: 'anacruz' }));
    expect(user.id).toBe(209);
    expect(user.isSimulated).toBeUndefined();
  });

  it('falls back to a simulated session when DummyJSON does not persist the user', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { id: 209 } }) // /users/add
      .mockRejectedValueOnce(new Error('Invalid credentials')) // login with new user fails
      .mockResolvedValueOnce({ data: rawLogin }); // demo login
    const api = new AuthApiService();
    const user = await api.register(registerData);

    expect(user).toMatchObject({
      id: 209,
      username: 'anacruz',
      firstName: 'Ana',
      email: 'ana@example.com',
      token: 'access-1',
      isSimulated: true,
    });
    expect((await authStorage.loadSession())?.username).toBe('anacruz');
  });

  it('fails when user creation fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Username already exists'));
    const api = new AuthApiService();
    await expect(api.register(registerData)).rejects.toThrow('Username already exists');
    expect(api.hasValidTokens()).toBe(false);
  });
});

describe('AuthApiService token handling', () => {
  it('refreshes the access token and persists the new pair', async () => {
    mockPost.mockResolvedValueOnce({ data: rawLogin });
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });

    mockPost.mockResolvedValueOnce({ data: { accessToken: 'access-2', refreshToken: 'refresh-2' } });
    const tokens = await api.refreshAccessToken();

    expect(mockPost).toHaveBeenLastCalledWith('/refresh', expect.objectContaining({ refreshToken: 'refresh-1' }));
    expect(tokens.accessToken).toBe('access-2');
    expect(api.getStoredUser()?.token).toBe('access-2');
    expect((await authStorage.loadSession())?.refreshToken).toBe('refresh-2');
  });

  it('refuses to refresh without a session', async () => {
    const api = new AuthApiService();
    await expect(api.refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('the 401 interceptor signs the user out when refresh fails', async () => {
    mockPost.mockResolvedValueOnce({ data: rawLogin });
    const api = new AuthApiService();
    const expired = jest.fn();
    api.setSessionExpiredHandler(expired);
    await api.login({ username: 'emilys', password: 'emilyspass' });

    // the second argument registered on the response interceptor is the error handler
    const errorHandler = mockResponseUse.mock.calls[mockResponseUse.mock.calls.length - 1][1] as (
      error: unknown
    ) => Promise<unknown>;

    mockPost.mockRejectedValueOnce(new Error('refresh failed'));
    await expect(
      errorHandler({ response: { status: 401 }, config: { url: '/me', headers: {} } })
    ).rejects.toThrow('refresh failed');

    expect(expired).toHaveBeenCalledTimes(1);
    expect(api.hasValidTokens()).toBe(false);
    expect(await authStorage.loadSession()).toBeNull();
  });

  it('logout clears memory and storage', async () => {
    mockPost.mockResolvedValueOnce({ data: rawLogin });
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });
    await api.logout();
    expect(api.getStoredUser()).toBeNull();
    expect(await authStorage.loadSession()).toBeNull();
  });
});

describe('AuthApiService.updateProfile', () => {
  it('calls PUT /users/{id} for real users and updates the session', async () => {
    mockPost.mockResolvedValueOnce({ data: rawLogin });
    mockPut.mockResolvedValueOnce({ data: {} });
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });

    const updated = await api.updateProfile({ firstName: 'Em', lastName: 'J', email: 'new@x.com' });
    expect(mockPut).toHaveBeenCalledWith('/users/1', expect.objectContaining({ email: 'new@x.com' }), expect.anything());
    expect(updated.firstName).toBe('Em');
    expect((await authStorage.loadSession())?.email).toBe('new@x.com');
  });

  it('only updates locally for simulated (registered) users', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { id: 209 } })
      .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValueOnce({ data: rawLogin });
    const api = new AuthApiService();
    await api.register(registerData);

    await api.updateProfile({ firstName: 'Anna', lastName: 'Cruz', email: 'ana@example.com' });
    expect(mockPut).not.toHaveBeenCalled();
    expect(api.getStoredUser()?.firstName).toBe('Anna');
  });

  it('requires a session', async () => {
    const api = new AuthApiService();
    await expect(api.updateProfile({ firstName: 'a', lastName: 'b', email: 'c@d.ef' })).rejects.toThrow(
      'logged in'
    );
  });
});
