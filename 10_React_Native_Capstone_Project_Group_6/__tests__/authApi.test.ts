import { AuthApiService, extractErrorMessage } from '@/services/authApi';
import { accountStorage, getStorageItem, profileEditStorage } from '@/utils/storage';
import { hashPassword } from '@/utils/hash';
import { AuthUser } from '@/types/auth';

// The fake axios client from jest.setup.js: we decide what each call returns
const { __client: client } = jest.requireMock('axios') as {
  __client: jest.Mock & {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
  };
};

/** What axios throws for an HTTP error such as 400 */
const httpError = (status: number, message?: string) => ({
  isAxiosError: true,
  response: { status, data: message ? { message } : {} },
});

/** What DummyJSON returns from POST /auth/login (note: accessToken, not token) */
const loginResponse = (overrides: Record<string, unknown> = {}) => ({
  data: {
    id: 1,
    username: 'emilys',
    email: 'emily@x.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    gender: 'female',
    image: 'e.png',
    accessToken: 'ACCESS',
    refreshToken: 'REFRESH',
    ...overrides,
  },
});

const makeUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  username: 'emilys',
  email: 'emily@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: '',
  token: 'T',
  refreshToken: 'R',
  ...overrides,
});

let api: AuthApiService;

beforeEach(async () => {
  client.mockReset();
  client.get.mockReset();
  client.post.mockReset();
  client.put.mockReset();
  const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  api = new AuthApiService();
});

describe('extractErrorMessage', () => {
  it('prefers the message sent by the API', () => {
    expect(extractErrorMessage(httpError(400, 'Invalid credentials'), 'fallback')).toBe('Invalid credentials');
  });

  it('explains network errors (no response)', () => {
    expect(extractErrorMessage({ isAxiosError: true }, 'fallback')).toMatch(/network error/i);
  });

  it('uses the message of a normal Error, or the fallback', () => {
    expect(extractErrorMessage(new Error('Boom'), 'fallback')).toBe('Boom');
    expect(extractErrorMessage('weird', 'fallback')).toBe('fallback');
    expect(extractErrorMessage(httpError(500), 'fallback')).toBe('fallback');
  });
});

describe('login', () => {
  it('logs in through the API, renames accessToken to token and saves the session', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    const user = await api.login({ username: 'emilys', password: 'emilyspass' });

    expect(user.token).toBe('ACCESS');
    expect(user).not.toHaveProperty('accessToken');
    expect(api.hasValidTokens()).toBe(true);
    expect((await getStorageItem<AuthUser>('auth_user'))?.token).toBe('ACCESS');
  });

  it('re-applies profile edits saved earlier for a real account', async () => {
    await profileEditStorage.set('emilys', { firstName: 'Em', lastName: 'J', email: 'em@x.co', phone: '123' });
    client.post.mockResolvedValueOnce(loginResponse());
    const user = await api.login({ username: 'emilys', password: 'emilyspass' });
    expect(user).toMatchObject({ firstName: 'Em', email: 'em@x.co', phone: '123', profileEdited: true });
  });

  it('logs in a device-only account when the API rejects it but the saved password matches', async () => {
    await accountStorage.add({
      username: 'jlaw',
      passwordHash: hashPassword('secret123', 'jlaw'),
      firstName: 'Jennifer',
      lastName: 'Lawrence',
      email: 'jen@x.com',
    });
    client.post
      .mockRejectedValueOnce(httpError(400, 'Invalid credentials')) // jlaw is unknown to DummyJSON
      .mockResolvedValueOnce(loginResponse()); // borrowed demo session

    const user = await api.login({ username: 'JLaw', password: 'secret123' });
    expect(user).toMatchObject({ username: 'jlaw', firstName: 'Jennifer', isSimulated: true, token: 'ACCESS' });
  });

  it('rethrows when the saved password is wrong', async () => {
    await accountStorage.add({
      username: 'jlaw', passwordHash: hashPassword('secret123', 'jlaw'),
      firstName: 'J', lastName: 'L', email: 'j@x.com',
    });
    client.post.mockRejectedValueOnce(httpError(400, 'Invalid credentials'));
    await expect(api.login({ username: 'jlaw', password: 'wrong' })).rejects.toMatchObject({ isAxiosError: true });
  });

  it('does not treat a server error as a wrong password', async () => {
    await accountStorage.add({
      username: 'jlaw', passwordHash: hashPassword('secret123', 'jlaw'),
      firstName: 'J', lastName: 'L', email: 'j@x.com',
    });
    client.post.mockRejectedValueOnce(httpError(503));
    await expect(api.login({ username: 'jlaw', password: 'secret123' })).rejects.toBeDefined();
    expect(client.post).toHaveBeenCalledTimes(1); // never fell back to the saved account
  });
});

describe('register', () => {
  const data = {
    firstName: 'Jennifer', lastName: 'Lawrence', username: 'JLaw3',
    password: 'secret123', email: 'jen@x.com', gender: 'female' as const,
  };

  it('creates the account, saves it hashed, and signs the person in', async () => {
    client.post
      .mockResolvedValueOnce({ data: { id: 209 } }) // POST /users/add
      .mockResolvedValueOnce(loginResponse()); // demo login

    const user = await api.register(data);
    expect(user).toMatchObject({ username: 'JLaw3', firstName: 'Jennifer', isSimulated: true });

    const saved = await accountStorage.find('jlaw3');
    expect(saved?.passwordHash).toBe(hashPassword('secret123', 'JLaw3'));
    expect(JSON.stringify(saved)).not.toContain('secret123'); // never the plain password
  });

  it('refuses a username that is already taken', async () => {
    client.post.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce(loginResponse());
    await api.register(data);
    await expect(api.register({ ...data, username: 'jlaw3' })).rejects.toThrow('already taken');
  });

  it('saves nothing when the API call fails', async () => {
    client.post.mockRejectedValueOnce(httpError(500));
    await expect(api.register(data)).rejects.toBeDefined();
    expect(await accountStorage.getAll()).toEqual([]);
  });
});

describe('session helpers', () => {
  it('loads a saved session and converts an old accessToken-only one', async () => {
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('auth_user', JSON.stringify({ id: 1, accessToken: 'OLD', refreshToken: 'R' }));
    const user = await api.loadStoredUser();
    expect(user?.token).toBe('OLD');
    expect(api.getStoredUser()?.token).toBe('OLD');
  });

  it('has no session before login and none after logout', async () => {
    expect(api.hasValidTokens()).toBe(false);
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    await api.logout();
    expect(api.getStoredUser()).toBeNull();
    expect(await getStorageItem('auth_user')).toBeNull();
  });

  it('getMe returns the profile from /auth/me', async () => {
    client.get.mockResolvedValueOnce({ data: makeUser({ firstName: 'Fresh' }) });
    expect((await api.getMe()).firstName).toBe('Fresh');
  });
});

describe('mergeWithStored', () => {
  const fresh = makeUser({ firstName: 'Fresh', token: '', refreshToken: '' });

  it('uses the fresh profile when nothing is stored', () => {
    expect(api.mergeWithStored(fresh, null)).toBe(fresh);
  });

  it('keeps the newest tokens with the fresh profile for real accounts', () => {
    const merged = api.mergeWithStored(fresh, makeUser({ token: 'NEW', refreshToken: 'NEWR' }));
    expect(merged).toMatchObject({ firstName: 'Fresh', token: 'NEW', refreshToken: 'NEWR' });
  });

  it('keeps the typed-in profile for registered or edited accounts', () => {
    const stored = makeUser({ firstName: 'Typed', username: 'jlaw', isSimulated: true, phone: '999' });
    expect(api.mergeWithStored(fresh, stored)).toMatchObject({ firstName: 'Typed', username: 'jlaw', phone: '999', isSimulated: true });
    const edited = makeUser({ firstName: 'Edited', profileEdited: true });
    expect(api.mergeWithStored(fresh, edited).firstName).toBe('Edited');
  });
});

describe('updateProfile', () => {
  const update = { firstName: ' Em ', lastName: 'J', email: 'em@x.co ', phone: ' 0917 ' };

  it('fails when nobody is logged in', async () => {
    await expect(api.updateProfile(update)).rejects.toThrow('log in');
  });

  it('real account: sends PUT /users/{id}, saves the edit and updates the session (trimmed)', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    client.put.mockResolvedValueOnce({ data: {} });

    const user = await api.updateProfile(update);
    expect(client.put).toHaveBeenCalledWith(
      'https://dummyjson.com/users/1',
      { firstName: 'Em', lastName: 'J', email: 'em@x.co', phone: '0917' }
    );
    expect(user).toMatchObject({ firstName: 'Em', phone: '0917', profileEdited: true });
    expect((await profileEditStorage.get('emilys'))?.firstName).toBe('Em');
  });

  it('registered account: saves into the account and does NOT call the API', async () => {
    await accountStorage.add({
      username: 'jlaw', passwordHash: hashPassword('pw', 'jlaw'), firstName: 'Old', lastName: 'Name', email: 'o@x.com',
    });
    client.post
      .mockRejectedValueOnce(httpError(400))
      .mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'jlaw', password: 'pw' });

    await api.updateProfile(update);
    expect(client.put).not.toHaveBeenCalled();
    expect((await accountStorage.find('jlaw'))?.firstName).toBe('Em');
  });

  it('keeps the old profile when the API call fails', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    client.put.mockRejectedValueOnce(httpError(500));
    await expect(api.updateProfile(update)).rejects.toBeDefined();
    expect(api.getStoredUser()?.firstName).toBe('Emily');
    expect(await profileEditStorage.get('emilys')).toBeNull();
  });
});

describe('refreshAccessToken', () => {
  it('throws when there is no refresh token', async () => {
    await expect(api.refreshAccessToken()).rejects.toThrow('No refresh token');
  });

  it('stores the new tokens', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    client.post.mockResolvedValueOnce({ data: { accessToken: 'NEW', refreshToken: 'NEWR' } });

    await api.refreshAccessToken();
    expect(api.getStoredUser()).toMatchObject({ token: 'NEW', refreshToken: 'NEWR' });
  });

  it('clears the session when the refresh fails', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    client.post.mockRejectedValueOnce(httpError(401));
    await expect(api.refreshAccessToken()).rejects.toBeDefined();
    expect(api.getStoredUser()).toBeNull();
  });
});

// The two axios interceptors the service registers when it is created
describe('interceptors', () => {
  type RequestConfig = { headers?: Record<string, string> };
  type FailedRequest = { url?: string; headers: Record<string, string>; _retry?: boolean };

  const lastCall = (mock: jest.Mock) => mock.mock.calls[mock.mock.calls.length - 1];
  const onRequest = () => lastCall(client.interceptors.request.use)[0] as (c: RequestConfig) => RequestConfig;
  const onRequestError = () => lastCall(client.interceptors.request.use)[1] as (e: unknown) => Promise<never>;
  const onResponseOk = () => lastCall(client.interceptors.response.use)[0] as (r: unknown) => unknown;
  const onResponseError = () => lastCall(client.interceptors.response.use)[1] as (e: unknown) => Promise<unknown>;

  const unauthorized = (config: FailedRequest) => ({ isAxiosError: true, config, response: { status: 401, data: {} } });

  const logIn = async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
  };

  it('adds the Bearer token to requests once logged in', async () => {
    expect(onRequest()({ headers: {} }).headers).toEqual({}); // no token yet
    await logIn();
    expect(onRequest()({ headers: {} }).headers).toEqual({ Authorization: 'Bearer ACCESS' });
  });

  it('leaves a request without headers alone, and passes request errors on', async () => {
    await logIn();
    expect(onRequest()({})).toEqual({});
    const error = new Error('bad request');
    await expect(onRequestError()(error)).rejects.toBe(error);
  });

  it('passes successful responses through', () => {
    const response = { data: 1 };
    expect(onResponseOk()(response)).toBe(response);
  });

  it('on 401 it refreshes the token and replays the request with the new token', async () => {
    await logIn();
    client.post.mockResolvedValueOnce({ data: { accessToken: 'NEW', refreshToken: 'NEWR' } }); // /refresh
    client.mockResolvedValueOnce({ data: 'replayed' }); // the replayed request

    const request: FailedRequest = { url: '/me', headers: {} };
    const result = await onResponseError()(unauthorized(request));

    expect(result).toEqual({ data: 'replayed' });
    expect(request.headers.Authorization).toBe('Bearer NEW');
    expect(request._retry).toBe(true);
    expect(api.getStoredUser()?.token).toBe('NEW');
  });

  it('logs the person out (and tells the app) when the refresh fails', async () => {
    await logIn();
    const handler = jest.fn();
    api.setSessionExpiredHandler(handler);
    client.post.mockRejectedValueOnce(httpError(401)); // /refresh fails

    await expect(onResponseError()(unauthorized({ url: '/me', headers: {} }))).rejects.toBeDefined();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(api.getStoredUser()).toBeNull();
  });

  it('never tries to refresh for login/refresh calls or for a request already retried', async () => {
    await logIn();
    const loginFailure = unauthorized({ url: '/login', headers: {} });
    await expect(onResponseError()(loginFailure)).rejects.toBe(loginFailure);

    const retried = unauthorized({ url: '/me', headers: {}, _retry: true });
    await expect(onResponseError()(retried)).rejects.toBe(retried);
    expect(client.post).toHaveBeenCalledTimes(1); // only the login, no /refresh
  });

  it('passes other errors (not 401) on unchanged', async () => {
    const serverError = { isAxiosError: true, config: { url: '/me', headers: {} }, response: { status: 500 } };
    await expect(onResponseError()(serverError)).rejects.toBe(serverError);
  });
});

describe('refreshAccessToken (extra)', () => {
  it('shares one refresh when several requests need it at the same time', async () => {
    client.post.mockResolvedValueOnce(loginResponse());
    await api.login({ username: 'emilys', password: 'emilyspass' });
    client.post.mockResolvedValueOnce({ data: { accessToken: 'NEW', refreshToken: 'NEWR' } });

    const [a, b] = await Promise.all([api.refreshAccessToken(), api.refreshAccessToken()]);
    expect(a).toBe(b);
    expect(client.post).toHaveBeenCalledTimes(2); // 1 login + 1 refresh
  });
});