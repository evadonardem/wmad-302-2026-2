/* global jest */

// Replace AsyncStorage with the official in-memory mock for every test
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
