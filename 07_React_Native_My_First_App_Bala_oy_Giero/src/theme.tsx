import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react';

// Pre-built theme infrastructure (not part of the assignment).
// Students call createTheme() with a palette mode in TODO 13 and wrap their
// screen with ThemeProvider in TODO 16 — this file itself does not need editing.
export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
};

export const createTheme = (config?: { palette?: { mode?: ThemeMode } }): Theme => {
  const mode: ThemeMode = config?.palette?.mode ?? 'light';
  return {
    mode,
    colors: {
      // Light mode: cold daylight city, cyan primary, hot magenta accent
      light: {
        background: '#e9edf5',
        surface: '#f8fafd',
        text: '#0d1020',
        textSecondary: '#5a6280',
        primary: '#0097b2',
        accent: '#d4006a',
        border: '#b9c3dc',
      },
      // Dark mode: night city, neon cyan primary, neon pink accent
      dark: {
        background: '#07070f',
        surface: '#10101e',
        text: '#e6f7ff',
        textSecondary: '#8a93b8',
        primary: '#00f0ff',
        accent: '#ff2a8f',
        border: '#2a2a4a',
      },
    }[mode],
  };
};

const ThemeContext = createContext<Theme>(createTheme({ palette: { mode: 'light' } }));

export function ThemeProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Cross-screen theme mode bridge: the root layout (src/app/_layout.tsx) owns the
// isDarkMode state (TODO 14) and provides it here, so screens like Settings can
// flip it without prop drilling. Pre-built — does not need editing.
type ThemeModeValue = {
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
};

const ThemeModeContext = createContext<ThemeModeValue>({
  isDarkMode: false,
  setIsDarkMode: () => {},
});

export function ThemeModeProvider({ value, children }: { value: ThemeModeValue; children: ReactNode }) {
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeModeContext);