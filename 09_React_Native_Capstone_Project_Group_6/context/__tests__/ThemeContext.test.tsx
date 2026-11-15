/* eslint-env jest */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeProvider,
  isThemeMode,
  remapColor,
  resolveIsDark,
  themeStyles,
  useThemeMode,
} from '@/context/ThemeContext';
import { darkTheme } from '@/constants/theme';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('theme helpers', () => {
  it('resolveIsDark follows the mode, and the phone only in "system"', () => {
    expect(resolveIsDark('dark', 'light')).toBe(true);
    expect(resolveIsDark('light', 'dark')).toBe(false);
    expect(resolveIsDark('system', 'dark')).toBe(true);
    expect(resolveIsDark('system', 'light')).toBe(false);
    expect(resolveIsDark('system', null)).toBe(false);
  });

  it('isThemeMode accepts only the three modes', () => {
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('blue')).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
  });

  it('remapColor swaps light colors for dark ones, but keeps white text white', () => {
    expect(remapColor('#FFFDF8', 'backgroundColor', darkTheme.colors)).toBe(darkTheme.colors.background);
    expect(remapColor('#FFFFFF', 'backgroundColor', darkTheme.colors)).toBe(darkTheme.colors.surface);
    expect(remapColor('#FFFFFF', 'color', darkTheme.colors)).toBe('#FFFFFF');
    expect(remapColor('#123456', 'color', darkTheme.colors)).toBe('#123456');
  });

  it('themeStyles changes color props only and leaves the input unchanged', () => {
    const raw = {
      box: { backgroundColor: '#FFFDF8', padding: 8, borderColor: '#FFCC80' },
    };
    const themed = themeStyles(raw, darkTheme.colors);
    expect(themed.box.backgroundColor).toBe(darkTheme.colors.background);
    expect(themed.box.borderColor).toBe(darkTheme.colors.outlineVariant);
    expect(themed.box.padding).toBe(8);
    expect(raw.box.backgroundColor).toBe('#FFFDF8');
  });
});

describe('ThemeProvider / useThemeMode', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('throws outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useThemeMode())).toThrow('useThemeMode must be used within a ThemeProvider');
    spy.mockRestore();
  });

  it('starts on "system" and light (the test phone is light)', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    expect(result.current.mode).toBe('system');
    expect(result.current.isDark).toBe(false);
  });

  it('setMode changes the theme and saves it', async () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    act(() => result.current.setMode('dark'));
    expect(result.current.isDark).toBe(true);
    await waitFor(async () => {
      const saved = await AsyncStorage.getItem('user_settings');
      expect(JSON.parse(saved ?? '{}')).toEqual({ themeMode: 'dark' });
    });
  });

  it('restores the saved mode on start', async () => {
    await AsyncStorage.setItem('user_settings', JSON.stringify({ themeMode: 'dark' }));
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(result.current.mode).toBe('dark'));
    expect(result.current.isDark).toBe(true);
  });
});
