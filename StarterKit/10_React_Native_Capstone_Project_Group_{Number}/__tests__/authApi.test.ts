/**
 * Integration-style tests for the auth service with axios mocked.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imported after the mock is registered
import { AuthApiService, toApiError } from '@/services/authApi';

const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('axios', () => {
  const instance = {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
    },
  };
});

const loginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'emily.png',
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

const registerData = {
  firstName: 'Ana',
  lastName: 'Cruz',
  username: 'anacruz',
  password: 'secret123',
  email: 'ana@example.com',
};

beforeEach(async () => {
  mockPost.mockReset();
  mockGet.mockReset();
  await AsyncStorage.clear();
});

describe('AuthApiService.login', () => {
  it('normalises accessToken into token and saves the session', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    const api = new AuthApiService();

    const user = await api.login({ username: 'emilys', password: 'emilyspass' });

    expect(user.token).toBe('access-1');
    expect(user.refreshToken).toBe('refresh-1');
    expect(api.hasValidTokens()).toBe(true);
    expect(api.getStoredUser()?.username).toBe('emilys');
  });

  it('surfaces the API error message', async () => {
    mockPost.mockRejectedValueOnce({ isAxiosError: true, response: { data: { message: 'Invalid credentials' } } });
    const api = new AuthApiService();
    await expect(api.login({ username: 'x', password: 'y' })).rejects.toThrow('Invalid credentials');
    expect(api.hasValidTokens()).toBe(false);
  });
});

describe('AuthApiService.register', () => {
  it('signs in with the new credentials when the API accepts them', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { id: 209 } }) // POST /users/add
      .mockResolvedValueOnce({ data: { ...loginResponse, username: 'anacruz' } }); // POST /auth/login
    const api = new AuthApiService();

    const user = await api.register(registerData);

    expect(user.username).toBe('anacruz');
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('falls back to the demo account and overlays the new details', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { id: 209 } }) // POST /users/add
      .mockRejectedValueOnce(new Error('Invalid credentials')) // login with new user fails
      .mockResolvedValueOnce({ data: loginResponse }); // demo login
    const api = new AuthApiService();

    const user = await api.register(registerData);

    expect(user.firstName).toBe('Ana');
    expect(user.username).toBe('anacruz');
    expect(user.email).toBe('ana@example.com');
    expect(user.token).toBe('access-1');
    expect(user.id).toBe(1); // demo account id, so cart/order endpoints keep working
  });

  it('fails when the account cannot be created', async () => {
    mockPost.mockRejectedValueOnce({ isAxiosError: true, response: { data: { message: 'Username taken' } } });
    const api = new AuthApiService();
    await expect(api.register(registerData)).rejects.toThrow('Username taken');
  });
});

describe('session storage', () => {
  it('hydrates a saved session and clears it on logout', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    const first = new AuthApiService();
    await first.login({ username: 'emilys', password: 'emilyspass' });
    await new Promise((resolve) => setTimeout(resolve, 0)); // let the AsyncStorage write finish

    const second = new AuthApiService();
    const restored = await second.hydrate();
    expect(restored?.token).toBe('access-1');

    second.logout();
    expect(second.getStoredUser()).toBeNull();
  });

  it('updateSession merges changes into the saved user', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse });
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });
    expect(api.updateSession({ firstName: 'Em' })?.firstName).toBe('Em');
  });
});

describe('refreshAccessToken', () => {
  it('stores the new tokens', async () => {
    mockPost
      .mockResolvedValueOnce({ data: loginResponse })
      .mockResolvedValueOnce({ data: { ...loginResponse, accessToken: 'access-2', refreshToken: 'refresh-2' } });
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });

    await api.refreshAccessToken();

    expect(api.getStoredUser()?.token).toBe('access-2');
    expect(api.getStoredUser()?.refreshToken).toBe('refresh-2');
  });

  it('clears the session when refresh fails', async () => {
    mockPost.mockResolvedValueOnce({ data: loginResponse }).mockRejectedValueOnce(new Error('expired'));
    const api = new AuthApiService();
    await api.login({ username: 'emilys', password: 'emilyspass' });

    await expect(api.refreshAccessToken()).rejects.toThrow('expired');
    expect(api.getStoredUser()).toBeNull();
  });

  it('rejects when there is no refresh token', async () => {
    const api = new AuthApiService();
    await expect(api.refreshAccessToken()).rejects.toThrow('No refresh token available');
  });
});

describe('toApiError', () => {
  it('reports a network error when there is no response', () => {
    expect(toApiError({ isAxiosError: true }, 'fallback').message).toMatch(/Network error/);
  });
  it('uses the fallback for unknown values', () => {
    expect(toApiError('boom', 'fallback').message).toBe('fallback');
  });
});
