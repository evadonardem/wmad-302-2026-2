/**
 * Theme Context - light / dark mode for the whole app
 *
 * How it fits together:
 *   1. The person picks System / Light / Dark in Settings -> setMode().
 *   2. We save the choice on the device (themeStorage) and read it back at launch.
 *   3. resolveScheme() turns the choice into "light" or "dark" ("system" asks the phone).
 *   4. Every screen calls useThemedStyles(...) to get styles built from that scheme's
 *      colors, so the whole app re-draws the moment the scheme changes.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Appearance, StatusBar, useColorScheme } from 'react-native';
import { lightColors, ThemeColors } from '@/constants/colors';
import { AppPaperTheme, getPaperTheme, lightTheme } from '@/constants/theme';
import { themeStorage } from '@/utils/storage';
import { ColorScheme, getColors, resolveScheme, ThemeMode } from '@/utils/theme';

export interface ThemeContextValue {
  /** What the person chose: 'system' | 'light' | 'dark' */
  mode: ThemeMode;
  /** What is actually drawn right now */
  scheme: ColorScheme;
  isDark: boolean;
  /** The color tokens for the current scheme */
  colors: ThemeColors;
  /** The matching theme for react-native-paper */
  paperTheme: AppPaperTheme;
  setMode: (mode: ThemeMode) => void;
}

// Default = light, so a component rendered outside the provider (e.g. in a test) still works
const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  scheme: 'light',
  isDark: false,
  colors: lightColors,
  paperTheme: lightTheme,
  setMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Read the saved choice once, at launch
  useEffect(() => {
    let cancelled = false;
    themeStorage
      .get()
      .then((saved) => {
        if (!cancelled && saved) setModeState(saved);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Tell the phone too, so native pieces (keyboard, system dialogs) match the app.
  // null = "go back to following the phone".
  useEffect(() => {
    try {
      Appearance.setColorScheme?.(mode === 'system' ? null : mode);
    } catch {
      // Older React Native versions don't have it: the app still themes itself.
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next); // change the screen immediately...
    themeStorage.set(next).catch(() => undefined); // ...and remember it for next launch
  }, []);

  const scheme = resolveScheme(mode, systemScheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      isDark: scheme === 'dark',
      colors: getColors(scheme),
      paperTheme: getPaperTheme(scheme),
      setMode,
    }),
    [mode, scheme, setMode]
  );

  // We never hold the app back waiting for the saved choice: the app starts right away in
  // "system" mode and switches as soon as the saved choice is read (a split second).
  // Blocking here could leave a blank screen if reading storage ever stalled.

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={value.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={value.colors.surface}
      />
      {children}
    </ThemeContext.Provider>
  );
}

/** The current theme: { colors, isDark, mode, setMode, paperTheme } */
export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Build a screen's styles from the current colors.
 *
 *   const createStyles = (colors: ThemeColors) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(createStyles);   // inside the component
 *
 * `factory` must be defined OUTSIDE the component (module level) so it keeps the same
 * identity; the styles are then rebuilt only when the colors change, not on every render.
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}