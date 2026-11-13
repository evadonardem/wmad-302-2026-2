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
import { PaperProvider } from 'react-native-paper';
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
