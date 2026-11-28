import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthApiService, authApi } from '@/services/authApi';

interface FakeResponse {
  status: number;
  data: unknown;
}
type Handler = (config: InternalAxiosRequestConfig) => FakeResponse;

/** An axios instance whose "network" is a plain function (no real requests). */
function makeClient(handler: Handler): AxiosInstance {
  return axios.create({
    baseURL: 'https://dummyjson.com/auth',
    adapter: async (config) => {
      const { status, data } = handler(config);
      const response = { data, status, statusText: '', headers: {}, config };
      if (status >= 200 && status < 300) return response;
      throw new AxiosError('Request failed', String(status), config, null, response);
    },
  });
}

const body = (config: InternalAxiosRequestConfig): Record<string, unknown> =>
  JSON.parse(String(config.data ?? '{}')) as Record<string, unknown>;

const loginPayload = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  username: 'emilys',
  email: 'emily@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'img',
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  ...overrides,
});

describe('AuthApiService', () => {
  beforeEach(async () => {
    await authApi.logout(); // clear anything persisted by a previous test
  });

  it('logs in, normalises accessToken -> token and persists the session', async () => {
    const service = new AuthApiService(makeClient(() => ({ status: 200, data: loginPayload() })));
    const user = await service.login({ username: 'emilys', password: 'emilyspass' });

    expect(user.token).toBe('access-1');
    expect(service.hasValidTokens()).toBe(true);

    // A fresh service (like an app restart) restores the session from storage
    const restarted = new AuthApiService(makeClient(() => ({ status: 200, data: {} })));
    expect(await restarted.loadSession()).toMatchObject({ username: 'emilys', token: 'access-1', refreshToken: 'refresh-1' });
  });

  it('rejects bad credentials without storing a session', async () => {
    const service = new AuthApiService(makeClient(() => ({ status: 400, data: { message: 'Invalid credentials' } })));
    await expect(service.login({ username: 'x', password: 'y' })).rejects.toBeTruthy();
    expect(service.getStoredUser()).toBeNull();
  });

  it('refreshes the token once on 401 and retries the request', async () => {
    const calls: string[] = [];
    const service = new AuthApiService(
      makeClient((config) => {
        calls.push(String(config.url));
        if (config.url === '/login') return { status: 200, data: loginPayload({ accessToken: 'old' }) };
        if (config.url === '/refresh') return { status: 200, data: { accessToken: 'new', refreshToken: 'refresh-2' } };
        if (config.url === '/me') {
          return String(config.headers.Authorization) === 'Bearer new'
            ? { status: 200, data: { id: 1 } }
            : { status: 401, data: { message: 'Token Expired!' } };
        }
        return { status: 404, data: {} };
      })
    );

    await service.login({ username: 'emilys', password: 'emilyspass' });
    await expect(service.getMe()).resolves.toMatchObject({ id: 1 });

    expect(calls).toEqual(['/login', '/me', '/refresh', '/me']);
    expect(service.getStoredUser()).toMatchObject({ token: 'new', refreshToken: 'refresh-2' });
  });

  it('clears the session and notifies the listener when refresh is rejected', async () => {
    const service = new AuthApiService(
      makeClient((config) => {
        if (config.url === '/login') return { status: 200, data: loginPayload() };
        return { status: 401, data: { message: 'Invalid refresh token' } };
      })
    );
    const onExpired = jest.fn();
    service.setSessionExpiredListener(onExpired);

    await service.login({ username: 'emilys', password: 'emilyspass' });
    await expect(service.getMe()).rejects.toBeTruthy();

    expect(service.getStoredUser()).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('registers a user and signs them in', async () => {
    const service = new AuthApiService(
      makeClient((config) => {
        if (config.url === '/register') return { status: 201, data: { id: 209 } };
        if (config.url === '/login') return { status: 200, data: loginPayload({ username: 'newbie', id: 209 }) };
        return { status: 404, data: {} };
      })
    );
    const user = await service.register({
      firstName: 'New',
      lastName: 'Bie',
      username: 'newbie',
      password: 'secret1',
      email: 'new@bie.com',
    });
    expect(user).toMatchObject({ id: 209, username: 'newbie' });
  });

  it('falls back to /users/add and to demo tokens because DummyJSON does not store new users', async () => {
    const urls: string[] = [];
    const service = new AuthApiService(
      makeClient((config) => {
        urls.push(String(config.url));
        if (config.url === '/register') return { status: 404, data: {} };
        if (config.url === 'https://dummyjson.com/users/add') return { status: 201, data: { id: 209 } };
        if (config.url === '/login') {
          return body(config).username === 'emilys'
            ? { status: 200, data: loginPayload() }
            : { status: 400, data: { message: 'Invalid credentials' } };
        }
        return { status: 404, data: {} };
      })
    );

    const user = await service.register({
      firstName: 'New',
      lastName: 'Bie',
      username: 'newbie',
      password: 'secret1',
      email: 'new@bie.com',
      gender: 'male',
    });

    expect(urls).toEqual(['/register', 'https://dummyjson.com/users/add', '/login', '/login']);
    expect(user).toMatchObject({
      id: 209,
      username: 'newbie',
      firstName: 'New',
      email: 'new@bie.com',
      gender: 'male',
      token: 'access-1', // valid tokens borrowed from the demo account
    });
    expect(service.getStoredUser()?.username).toBe('newbie');
  });

  it('merges profile changes into the stored session and logs out', async () => {
    const service = new AuthApiService(makeClient(() => ({ status: 200, data: loginPayload() })));
    await service.login({ username: 'emilys', password: 'emilyspass' });

    await service.updateStoredUser({ firstName: 'Em' });
    const restarted = new AuthApiService(makeClient(() => ({ status: 200, data: {} })));
    expect((await restarted.loadSession())?.firstName).toBe('Em');

    await service.logout();
    expect(service.getStoredUser()).toBeNull();
    expect(await new AuthApiService(makeClient(() => ({ status: 200, data: {} }))).loadSession()).toBeNull();
  });
});
