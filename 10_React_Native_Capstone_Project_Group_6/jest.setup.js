/* eslint-env jest */
/**
 * Jest setup - runs before every test file.
 * Replaces the two things that need a real phone/network with simple fakes:
 *  - AsyncStorage  -> the official in-memory mock
 *  - axios         -> a fake client whose get/post/put we control inside each test
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('axios', () => {
  const client = {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => client),
      isAxiosError: (error) => !!error && error.isAxiosError === true,
    },
    __client: client,
  };
});