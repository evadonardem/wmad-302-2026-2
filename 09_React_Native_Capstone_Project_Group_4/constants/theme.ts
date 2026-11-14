/**
 * React Native Paper Theme - Cookbook App
 * Warm, food-friendly color palette
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const appColors = {
  light: {
    background: '#FFFDF8',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF3E0',
    text: '#3E2723',
    muted: '#8D6E63',
    accent: '#E85D04',
    accentSoft: '#FFCC80',
    border: '#D7CCC8',
    error: '#C62828',
    positiveSurface: '#E8F5E9',
    errorSurface: '#FDEDED',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceAlt: '#2A2521',
    text: '#F5EDE8',
    muted: '#C2B1AA',
    accent: '#FF9A4D',
    accentSoft: '#80512F',
    border: '#51443E',
    error: '#FF8A80',
    positiveSurface: '#24352A',
    errorSurface: '#3A2525',
  },
} as const;

const fonts = {
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

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appColors.light.accent,
    primaryContainer: appColors.light.surfaceAlt,
    secondary: '#6D4C41',
    secondaryContainer: '#EFEBE9',
    tertiary: '#2E7D32',
    tertiaryContainer: appColors.light.positiveSurface,
    surface: appColors.light.surface,
    surfaceVariant: '#FFF8F0',
    background: appColors.light.background,
    error: appColors.light.error,
    errorContainer: appColors.light.errorSurface,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: appColors.light.text,
    onSurfaceVariant: '#5D4037',
    onBackground: appColors.light.text,
    outline: '#BCAAA4',
    outlineVariant: appColors.light.border,
  },
  roundness: 12,
  fonts,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: appColors.dark.accent,
    primaryContainer: '#593820',
    secondary: '#D7B5A7',
    secondaryContainer: '#3A302C',
    tertiary: '#9AD6A2',
    tertiaryContainer: '#26392B',
    surface: appColors.dark.surface,
    surfaceVariant: appColors.dark.surfaceAlt,
    background: appColors.dark.background,
    error: appColors.dark.error,
    errorContainer: appColors.dark.errorSurface,
    onPrimary: '#24170F',
    onSecondary: '#241A17',
    onTertiary: '#102015',
    onSurface: appColors.dark.text,
    onSurfaceVariant: appColors.dark.muted,
    onBackground: appColors.dark.text,
    outline: '#88756B',
    outlineVariant: appColors.dark.border,
  },
  roundness: 12,
  fonts,
};