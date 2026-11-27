/**
 * Jest setup - runs before every test file
 */

// AsyncStorage has no native module in tests, use the official in-memory mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);