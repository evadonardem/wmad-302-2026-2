/**
 * React Native Paper Theme - Marketplace App
 * Clean, commerce-friendly color palette
 */

/**
 * React Native Paper Theme - Marketplace App
 * Modern, clean blue marketplace theme
 */

/**
 * React Native Paper Theme - Marketplace App
 * Modern Lavender and White Theme
 */
import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    primary: '#8B5CF6',
    primaryContainer: '#EDE9FE',

    secondary: '#A78BFA',
    secondaryContainer: '#F3E8FF',

    tertiary: '#16A34A',
    tertiaryContainer: '#DCFCE7',

    surface: '#FFFFFF',
    surfaceVariant: '#F5F3FF',
    background: '#FAF9FF',

    error: '#DC2626',
    errorContainer: '#FEE2E2',

    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',

    onSurface: '#27213A',
    onSurfaceVariant: '#77718A',
    onBackground: '#27213A',

    outline: '#DDD6FE',
    outlineVariant: '#EDE9FE',
  },

  roundness: 14,

  fonts: {
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
  },
};
