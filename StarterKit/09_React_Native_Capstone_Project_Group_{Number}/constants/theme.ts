
/**
 * React Native Paper Theme - Cookbook App
 * Light and Dark theme configurations
 */

import {
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';

const customFonts = {
  displayLarge: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 24,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    fontSize: 22,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E85D04',
    primaryContainer: '#FFF3E0',
    secondary: '#6D4C41',
    secondaryContainer: '#EFEBE9',
    tertiary: '#2E7D32',
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
  fonts: {
    ...MD3LightTheme.fonts,
    ...customFonts,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF9A55',
    primaryContainer: '#713000',
    secondary: '#D7B8A8',
    secondaryContainer: '#4A342B',
    tertiary: '#81C784',
    tertiaryContainer: '#1B5E20',
    surface: '#24201E',
    surfaceVariant: '#39312D',
    background: '#171412',
    error: '#FFB4AB',
    errorContainer: '#93000A',
    onPrimary: '#492000',
    onSecondary: '#38251D',
    onTertiary: '#003909',
    onSurface: '#F2E5DE',
    onSurfaceVariant: '#D7C2B8',
    onBackground: '#F2E5DE',
    outline: '#A08B80',
    outlineVariant: '#51443D',
  },
  roundness: 12,
  fonts: {
    ...MD3DarkTheme.fonts,
    ...customFonts,
  },
};

// Keep the original theme export for existing imports.
export const theme = lightTheme;
