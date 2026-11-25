import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '@/constants/colors';
import { themeStorage } from '@/utils/storage';
import { THEME_MODE_OPTIONS, getColors, isThemeMode, resolveScheme } from '@/utils/theme';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('isThemeMode', () => {
  it('accepts the three modes', () => {
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isThemeMode('Dark')).toBe(false);
    expect(isThemeMode('')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
    expect(isThemeMode(1)).toBe(false);
  });

  it('matches the options shown in Settings', () => {
    expect(THEME_MODE_OPTIONS.map((o) => o.value)).toEqual(['system', 'light', 'dark']);
    THEME_MODE_OPTIONS.forEach((o) => expect(isThemeMode(o.value)).toBe(true));
  });
});

describe('resolveScheme', () => {
  it('uses the chosen mode when it is light or dark, whatever the phone says', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('dark', null)).toBe('dark');
  });

  it('follows the phone in system mode', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
  });

  it('falls back to light when the phone does not say', () => {
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('system', undefined)).toBe('light');
  });
});

describe('getColors', () => {
  it('returns the palette for the scheme', () => {
    expect(getColors('light')).toBe(lightColors);
    expect(getColors('dark')).toBe(darkColors);
  });
});

describe('themeStorage', () => {
  it('has no saved mode at first', async () => {
    expect(await themeStorage.get()).toBeNull();
  });

  it('saves and reads the mode', async () => {
    await themeStorage.set('dark');
    expect(await themeStorage.get()).toBe('dark');
    await themeStorage.set('system');
    expect(await themeStorage.get()).toBe('system');
  });

  it('ignores a damaged or unknown saved value', async () => {
    await AsyncStorage.setItem('theme_mode', JSON.stringify('purple'));
    expect(await themeStorage.get()).toBeNull();
  });
});
