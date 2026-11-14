/**
 * Theme Context - Light / Dark / System
 * - Keeps the chosen mode and saves it on the device (AsyncStorage, 'user_settings')
 * - "system" follows the phone's own light/dark setting
 * - Wraps the app in Paper's provider with the matching theme and sets the status bar
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { darkTheme, lightTheme } from '@/constants/theme';
import { getStorageItem, setStorageItem } from '@/utils/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SavedSettings {
  themeMode?: ThemeMode;
}

const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

/** Decide if the app should be dark (exported so it can be unit-tested). */
export function resolveIsDark(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined) {
  if (mode === 'system') return systemScheme === 'dark';
  return mode === 'dark';
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load the saved choice once
  useEffect(() => {
    let active = true;
    getStorageItem<SavedSettings>('user_settings')
      .then((saved) => {
        if (active && isThemeMode(saved?.themeMode)) setModeState(saved.themeMode);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    // Merge with any other saved settings instead of overwriting them
    getStorageItem<SavedSettings>('user_settings')
      .then((saved) => setStorageItem('user_settings', { ...saved, themeMode: next }))
      .catch(() => undefined);
  }, []);

  const isDark = resolveIsDark(mode, systemScheme);
  const value = useMemo(() => ({ mode, isDark, setMode }), [mode, isDark, setMode]);

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

/* ------------------------------------------------------------------ */
/* Themed styles                                                       */
/* ------------------------------------------------------------------ */
/**
 * The screens' style files use fixed light colors (e.g. '#FFFDF8'). In dark
 * mode this swaps each of those colors for the matching dark-theme color, so
 * the style files themselves don't need to change. In light mode the styles
 * are returned untouched.
 */
type Palette = MD3Theme['colors'];

const COLOR_PROP = /color$/i;

export function remapColor(value: string, prop: string, c: Palette): string {
  switch (value.toUpperCase()) {
    case '#FFFDF8':
      return c.background;
    case '#FFFFFF':
      // White text (e.g. on orange buttons) stays white; white backgrounds become dark
      return prop === 'color' ? value : c.surface;
    case '#3E2723':
    case '#202124':
      return c.onSurface;
    case '#8D6E63':
    case '#5D4037':
      return c.onSurfaceVariant;
    case '#FFF3E0':
      return c.primaryContainer;
    case '#E85D04':
      return c.primary;
    case '#C62828':
      return c.error;
    case '#FDEDED':
      return c.errorContainer;
    case '#E8F5E9':
      return c.tertiaryContainer;
    case '#FFCC80':
    case '#E0E0E0':
      return c.outlineVariant;
    case '#BCAAA4':
    case '#9E9E9E':
      return c.outline;
    case '#1A73E8':
      return '#8AB4F8';
    default:
      return value;
  }
}

/** Pure version (exported for tests): returns a copy with colors swapped. */
export function themeStyles<T extends Record<string, object>>(styles: T, colors: Palette): T {
  const result: Record<string, unknown> = {};
  Object.keys(styles).forEach((name) => {
    const style = styles[name] as unknown as Record<string, unknown>;
    const copy: Record<string, unknown> = {};
    Object.keys(style).forEach((prop) => {
      const value = style[prop];
      copy[prop] =
        typeof value === 'string' && value.startsWith('#') && COLOR_PROP.test(prop)
          ? remapColor(value, prop, colors)
          : value;
    });
    result[name] = copy;
  });
  return result as T;
}

/** Use inside a component: const styles = useThemedStyles(rawStyles); */
export function useThemedStyles<T extends Record<string, object>>(styles: T): T {
  const theme = useTheme();
  return useMemo(() => (theme.dark ? themeStyles(styles, theme.colors) : styles), [styles, theme]);
}