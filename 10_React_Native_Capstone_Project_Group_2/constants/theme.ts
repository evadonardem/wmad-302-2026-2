/**
 * React Native Paper Theme - Marketplace App
 * Clean, commerce-friendly color palette
 */
import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#38BDF8',      // Sky blue
    primaryContainer: '#BAE6FD',
    secondary: '#0284C7',    // Deep sky blue
    secondaryContainer: '#E0F2FE',
    tertiary: '#0EA5E9',     // Sky blue
    tertiaryContainer: '#BAE6FD',
    surface: '#F0F9FF',
    surfaceVariant: '#E0F2FE',
    background: '#E0F2FE',
    error: '#0369A1',
    errorContainer: '#BAE6FD',
    onPrimary: '#F0F9FF',
    onSecondary: '#F0F9FF',
    onTertiary: '#F0F9FF',
    onSurface: '#202124',
    onSurfaceVariant: '#5F6368',
    onBackground: '#202124',
    outline: '#7DD3FC',
    outlineVariant: '#BAE6FD',
  },
  roundness: 8,
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