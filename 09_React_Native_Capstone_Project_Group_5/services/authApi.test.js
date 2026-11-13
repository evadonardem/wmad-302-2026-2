const { beforeEach, describe, expect, it, jest } = require('@jest/globals');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-crypto', () => {
  let sequence = 0;
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    getRandomBytesAsync: jest.fn(async (length) => {
      sequence += 1;
      return new Uint8Array(length).fill(sequence);
    }),
    digestStringAsync: jest.fn(async (_algorithm, value) => {
      const checksum = Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0);
      return `digest-${checksum}`;
    }),
  };
});

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { AuthApiService } = require('./authApi');

const registration = {
  firstName: 'Alex',
  lastName: 'Cook',
  username: 'homecook',
  password: 'Kitchen123!',
  email: 'alex@example.com',
  age: 24,
  gender: 'female',
};

describe('local account registration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('creates an account, restores its session, and logs in with the new credentials', async () => {
    const service = new AuthApiService();
    const createdUser = await service.register(registration);

    expect(createdUser).toMatchObject({
      username: registration.username,
      email: registration.email,
      authProvider: 'local',
    });

    const accounts = JSON.parse(await AsyncStorage.getItem('local_auth_accounts'));
    expect(accounts[0]).toMatchObject({ username: registration.username, email: registration.email });
    expect(accounts[0]).not.toHaveProperty('password');
    expect(accounts[0].passwordHash).toMatch(/^\$2[aby]\$/);
    expect(JSON.stringify(accounts)).not.toContain(registration.password);

    const restoredService = new AuthApiService();
    const restoredUser = await restoredService.hydrateFromStorage();
    expect(restoredUser).toMatchObject({ id: createdUser.id, authProvider: 'local' });
    await expect(restoredService.getMe()).resolves.toMatchObject({ username: registration.username });

    await restoredService.logout();
    const loggedInUser = await restoredService.login({
      username: registration.username,
      password: registration.password,
    });
    expect(loggedInUser).toMatchObject({ username: registration.username, authProvider: 'local' });
  });

  it('rejects duplicate usernames and incorrect local passwords', async () => {
    const service = new AuthApiService();
    await service.register(registration);

    await expect(service.register({ ...registration, email: 'another@example.com' })).rejects.toThrow(
      'That username is already in use.'
    );
    await expect(
      service.login({ username: registration.username, password: 'WrongPassword123!' })
    ).rejects.toThrow('Incorrect username or password.');
  });
});