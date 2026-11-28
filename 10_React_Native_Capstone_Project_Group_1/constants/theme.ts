/**
 * React Native Paper Theme - Marketplace App
 * Christmas palette: festive red, pine green, snowy cream and a touch of gold.
 */
import { MD3LightTheme } from 'react-native-paper';

/** Festive accents for places that need a colour outside the Paper theme. */
export const christmas = {
  red: '#C62828',
  pine: '#1B5E3A',
  cream: '#FFF8F1',
  gold: '#F2B632',
} as const;

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#C62828',      // Christmas red
    primaryContainer: '#FDE4E1',
    secondary: '#1B5E3A',    // Pine green
    secondaryContainer: '#DDEFE3',
    tertiary: '#2E7D32',     // Success green (in stock, savings)
    tertiaryContainer: '#E3F4E4',
    surface: '#FFFFFF',
    surfaceVariant: '#FBEFE6',
    background: '#FFF8F1',   // Warm snow
    error: '#B00020',
    errorContainer: '#FDE4E1',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#2B1B17',
    onSurfaceVariant: '#6B5750',
    onBackground: '#2B1B17',
    outline: '#E3D3CA',
    outlineVariant: '#EFE3DB',
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