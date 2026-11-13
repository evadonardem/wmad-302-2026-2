/**
 * React Native Paper themes - Cookbook App
 * Warm, food-friendly palette in a light and a dark version.
 * Screens read these colors with Paper's useTheme() so they follow the mode.
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const fonts = {
  ...MD3LightTheme.fonts,
  ...MD3LightTheme.fonts,
  displayLarge: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
  headlineLarge: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 32, lineHeight: 40 },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 28, lineHeight: 36 },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 24, lineHeight: 32 },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 22, lineHeight: 28 },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },

};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E85D04', // Warm orange
    primaryContainer: '#FFF3E0',
    secondary: '#6D4C41', // Brown
    secondaryContainer: '#EFEBE9',
    tertiary: '#2E7D32', // Green (fresh ingredients)
    tertiaryContainer: '#E8F5E9',
    surface: '#FFFFFF',
    surfaceVariant: '#FFF8F0',
    background: '#FFFDF8',
    error: '#C62828',
    errorContainer: '#FDEDED',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#3E2723',
    onSurfaceVariant: '#5D4037',
    onBackground: '#3E2723',
    outline: '#BCAAA4',
    outlineVariant: '#D7CCC8',
  },
  roundness: 12,
  fonts,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // True dark: near-black backgrounds, neutral greys, orange accent
    primary: '#FF8A3D',
    primaryContainer: '#3A2412',
    secondary: '#BDBDBD',
    secondaryContainer: '#2A2A2A',
    tertiary: '#81C784',
    tertiaryContainer: '#1B3320',
    surface: '#1A1A1A',
    surfaceVariant: '#242424',
    background: '#0D0D0D',
    error: '#FF6B6B',
    errorContainer: '#4A1C1C',
    onPrimary: '#1F0D00',
    onSecondary: '#121212',
    onTertiary: '#0B2010',
    onSurface: '#EDEDED',
    onSurfaceVariant: '#B3B3B3',
    onBackground: '#EDEDED',
    outline: '#666666',
    outlineVariant: '#333333',
    // Paper uses these for cards, dialogs, menus and the tab bar
    elevation: {
      level0: 'transparent',
      level1: '#171717',
      level2: '#1C1C1C',
      level3: '#212121',
      level4: '#242424',
      level5: '#282828',
    },
  },
  roundness: 12,
  fonts,
};

/** Kept so older imports of `theme` keep working (light theme). */
export const theme = lightTheme;