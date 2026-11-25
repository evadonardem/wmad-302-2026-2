/* eslint-env jest */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/authApi';
import type { RegisterData } from '@/types/auth';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Device-local account only, so no network request is made.
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

describe('authApi profile photo', () => {
  it('updateProfile can change only the image', async () => {
    await authApi.register(newUser);
    const updated = await authApi.updateProfile({ image: 'file:///app/docs/photo.jpg' });
    expect(updated.image).toBe('file:///app/docs/photo.jpg');
    expect(updated.firstName).toBe('Jecressa');
    expect(updated.email).toBe('jecressa@example.com');
  });

  it('the photo is still there after logging out and in again', async () => {
    await authApi.register(newUser);
    await authApi.updateProfile({ image: 'file:///app/docs/photo.jpg' });
    await authApi.logout();
    const again = await authApi.login({ username: 'jecressa', password: 'secret123' });
    expect(again.image).toBe('file:///app/docs/photo.jpg');
  });

  it('an empty image removes the photo', async () => {
    await authApi.register(newUser);
    await authApi.updateProfile({ image: 'file:///app/docs/photo.jpg' });
    const removed = await authApi.updateProfile({ image: '' });
    expect(removed.image).toBe('');
    expect((await authApi.getStoredUser())?.image).toBe('');
  });

  it('changing the photo does not trigger the duplicate-email check', async () => {
    await authApi.register(newUser);
    await expect(authApi.updateProfile({ image: 'x.jpg' })).resolves.toBeDefined();
  });

  it('editing the name still keeps the photo', async () => {
    await authApi.register(newUser);
    await authApi.updateProfile({ image: 'file:///app/docs/photo.jpg' });
    const updated = await authApi.updateProfile({ firstName: 'Jec' });
    expect(updated.firstName).toBe('Jec');
    expect(updated.image).toBe('file:///app/docs/photo.jpg');
  });
});
