/**
 * React Native Paper Theme - Marketplace App
 * Clean, commerce-friendly color palette, in a light and a dark version.
 *
 * Paper (the component library) reads its colors from the theme we give PaperProvider.
 * We fill that theme from our own color tokens (constants/colors.ts) so Paper's buttons,
 * cards, inputs and dialogs always match the rest of the app.
 */
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { darkColors, lightColors } from '@/constants/colors';
import type { ColorScheme } from '@/utils/theme';

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

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary, // Warm yellow accent
    primaryContainer: lightColors.primaryContainer,
    onPrimaryContainer: lightColors.text,
    secondary: '#2B2B2B', // Near-black, for secondary buttons
    secondaryContainer: lightColors.surfaceMuted,
    onSecondaryContainer: lightColors.text,
    tertiary: '#34A853', // Success green
    tertiaryContainer: lightColors.successContainer,
    surface: lightColors.surface,
    surfaceVariant: lightColors.background,
    background: lightColors.background,
    error: lightColors.error,
    errorContainer: lightColors.errorContainer,
    onPrimary: lightColors.onPrimary,
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: lightColors.text,
    onSurfaceVariant: lightColors.textMuted,
    onBackground: lightColors.text,
    outline: lightColors.borderStrong,
    outlineVariant: lightColors.borderSubtle,
  },
  roundness: 14,
  fonts,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: darkColors.onPrimary,
    primaryContainer: darkColors.primaryContainer,
    onPrimaryContainer: darkColors.text,
    secondary: '#D6D6D6',
    onSecondary: '#1A1A1A',
    secondaryContainer: darkColors.surfaceMuted,
    onSecondaryContainer: darkColors.text,
    tertiary: darkColors.success,
    onTertiary: '#0B2A17',
    tertiaryContainer: darkColors.successContainer,
    onTertiaryContainer: darkColors.text,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceMuted,
    surfaceDisabled: 'rgba(232, 234, 237, 0.12)',
    background: darkColors.background,
    error: darkColors.error,
    onError: darkColors.onError,
    errorContainer: darkColors.errorContainer,
    onErrorContainer: darkColors.errorText,
    onSurface: darkColors.text,
    onSurfaceVariant: darkColors.textMuted,
    onSurfaceDisabled: 'rgba(232, 234, 237, 0.38)',
    onBackground: darkColors.text,
    outline: darkColors.borderStrong,
    outlineVariant: darkColors.border,
    // Paper paints cards/menus with these "elevation" shades: a bit lighter = higher up
    elevation: {
      level0: 'transparent',
      level1: darkColors.surface,
      level2: '#23262B',
      level3: '#282B31',
      level4: '#2B2F35',
      level5: '#2F333A',
    },
  },
  roundness: 14,
  fonts,
};

export type AppPaperTheme = typeof lightTheme;

/** The Paper theme for the scheme that is on screen. */
export function getPaperTheme(scheme: ColorScheme): AppPaperTheme {
  return scheme === 'dark' ? (darkTheme as unknown as AppPaperTheme) : lightTheme;
}

/** Kept so older imports of `theme` still work: the light theme. */
export const theme = lightTheme;