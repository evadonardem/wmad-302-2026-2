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
      light: {
        background: '#f7f4fc',
        surface: '#ffffff',
        text: '#2d1b4e',
        textSecondary: '#6c5b7b',
        primary: '#7c4dff',
        accent: '#536dfe',
        border: '#e8e0f5',
      },
      dark: {
        background: '#130d21',
        surface: '#1e1432',
        text: '#f3edff',
        textSecondary: '#bfa9d6',
        primary: '#b388ff',
        accent: '#8c9eff',
        border: '#32244f',
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
