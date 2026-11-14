/* eslint-env jest */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/authApi';
import type { RegisterData } from '@/types/auth';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Only device-local flows are tested here, so no network request is made.
const newUser: RegisterData = {
  firstName: 'Jecressa',
  lastName: 'Agustin',
  username: 'jecressa',
  password: 'secret123',
  email: 'jecressa@example.com',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('authApi (local accounts)', () => {
  it('register creates a local session', async () => {
    const user = await authApi.register(newUser);
    expect(user.username).toBe('jecressa');
    expect(user.isLocalAccount).toBe(true);
    expect(user.token).toMatch(/^local-/);
    expect(await authApi.hasValidTokens()).toBe(true);
    expect((await authApi.getStoredUser())?.email).toBe('jecressa@example.com');
  });

  it('register rejects a duplicate username or email', async () => {
    await authApi.register(newUser);
    await expect(authApi.register(newUser)).rejects.toThrow('already registered');
    await expect(
      authApi.register({ ...newUser, username: 'other', email: 'JECRESSA@example.com' }),
    ).rejects.toThrow('already registered');
  });

  it('register rejects the reserved demo username', async () => {
    await expect(authApi.register({ ...newUser, username: 'emilys' })).rejects.toThrow(
      'already registered',
    );
  });

  it('login works with username or email (case-insensitive)', async () => {
    await authApi.register(newUser);
    await authApi.logout();

    const byName = await authApi.login({ username: 'JECRESSA', password: 'secret123' });
    expect(byName.username).toBe('jecressa');
    await authApi.logout();

    const byEmail = await authApi.login({
      username: 'jecressa@example.com',
      password: 'secret123',
    });
    expect(byEmail.username).toBe('jecressa');
  });

  it('login with a wrong password for a local account fails', async () => {
    await authApi.register(newUser);
    await authApi.logout();
    await expect(authApi.login({ username: 'jecressa', password: 'nope' })).rejects.toThrow(
      'Invalid credentials',
    );
    expect(await authApi.hasValidTokens()).toBe(false);
  });

  it('updateProfile saves the changes on the device', async () => {
    await authApi.register(newUser);
    const updated = await authApi.updateProfile({
      firstName: 'Jec',
      lastName: 'Agustin',
      email: 'jec@example.com',
    });
    expect(updated.firstName).toBe('Jec');
    expect((await authApi.getStoredUser())?.email).toBe('jec@example.com');

    // The change survives logging out and in again
    await authApi.logout();
    const again = await authApi.login({ username: 'jecressa', password: 'secret123' });
    expect(again.firstName).toBe('Jec');
  });

  it('updateProfile fails when nobody is logged in', async () => {
    await expect(
      authApi.updateProfile({ firstName: 'A', lastName: 'B', email: 'a@b.co' }),
    ).rejects.toThrow('not logged in');
  });

  it('logout clears the stored session', async () => {
    await authApi.register(newUser);
    await authApi.logout();
    expect(await authApi.getStoredUser()).toBeNull();
    expect(await authApi.hasValidTokens()).toBe(false);
  });
});
