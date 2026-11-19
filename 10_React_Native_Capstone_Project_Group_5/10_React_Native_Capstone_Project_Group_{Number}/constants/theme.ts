/**
 * React Native Paper Theme - Kartora
 * Violet palette inspired by the Kartora logo.
 */
import { MD3LightTheme } from 'react-native-paper';

export const marketplaceColors = {
  primary: '#75648A',
  primaryDark: '#59486F',
  primarySoft: '#F2EEF5',
  background: '#F8F6FA',
  surface: '#FFFFFF',
  text: '#2D2633',
  muted: '#746C7A',
  border: '#E8E2EC',
  success: '#25845A',
  successSoft: '#E8F5EE',
  danger: '#B4233C',
  dangerSoft: '#FCECEF',
  accent: '#D99517',
} as const;

export const marketplaceCardShadow = {
  elevation: 2,
  shadowColor: '#30283A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: marketplaceColors.primary,
    primaryContainer: marketplaceColors.primarySoft,
    secondary: '#806C91',
    secondaryContainer: '#F2EEF5',
    tertiary: marketplaceColors.success,
    tertiaryContainer: marketplaceColors.successSoft,
    surface: marketplaceColors.surface,
    surfaceVariant: marketplaceColors.background,
    background: marketplaceColors.background,
    error: marketplaceColors.danger,
    errorContainer: marketplaceColors.dangerSoft,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: marketplaceColors.text,
    onSurfaceVariant: marketplaceColors.muted,
    onBackground: marketplaceColors.text,
    outline: marketplaceColors.border,
    outlineVariant: '#F0ECF2',
  },
  roundness: 12,
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