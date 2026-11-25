/**
 * React Native Paper Theme - Botanical Sage & Terracotta Bistro Palette
 */
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const APP_COLORS = {
  background: '#F4F1EA',       // Warm Alabaster Parchment
  surface: '#FAF9F5',          // Crisp Ivory Card Surface
  surfaceElevated: '#FFFFFF',
  primary: '#1B4332',          // Deep Botanical Forest Green
  primaryLight: '#2D6A4F',     // Fresh Sage Leaf
  primaryContainer: '#D8F3DC', // Soft Mint/Sage Tint
  accent: '#BC4749',           // Spiced Terracotta / Saffron
  accentContainer: '#F9E5E5',  // Soft Terracotta Blush
  textPrimary: '#1A2421',      // Deep Charcoal-Pine Ink
  textSecondary: '#52605B',    // Muted Olive Slate
  border: '#E2DDD3',           // Warm Stone Border
  chipBg: '#EAE5D9',           // Stone Linen Chip
  easyBg: '#D8F3DC',
  easyText: '#1B4332',
  mediumBg: '#FEF3C7',
  mediumText: '#92400E',
  hardBg: '#FEE2E2',
  hardText: '#991B1B',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: APP_COLORS.primary,
    primaryContainer: APP_COLORS.primaryContainer,
    secondary: APP_COLORS.primaryLight,
    secondaryContainer: APP_COLORS.chipBg,
    tertiary: APP_COLORS.accent,
    tertiaryContainer: APP_COLORS.accentContainer,
    surface: APP_COLORS.surface,
    surfaceVariant: APP_COLORS.chipBg,
    background: APP_COLORS.background,
    error: '#B91C1C',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: APP_COLORS.textPrimary,
    onSurfaceVariant: APP_COLORS.textSecondary,
    onBackground: APP_COLORS.textPrimary,
    outline: APP_COLORS.border,
    outlineVariant: APP_COLORS.border,
  },
  roundness: 16,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#52B788',
    primaryContainer: '#1B4332',
    secondary: '#74C69D',
    secondaryContainer: '#2D6A4F',
    tertiary: '#E07A5F',
    tertiaryContainer: '#5C2223',
    surface: '#16221E',
    surfaceVariant: '#1E2D28',
    background: '#0F1714',
    error: '#EF4444',
    errorContainer: '#7F1D1D',
    onPrimary: '#0F1714',
    onSecondary: '#0F1714',
    onTertiary: '#0F1714',
    onSurface: '#F4F1EA',
    onSurfaceVariant: '#B7C4BF',
    onBackground: '#F4F1EA',
    outline: '#2D3E38',
    outlineVariant: '#24332E',
  },
  roundness: 16,
};

export const theme = lightTheme;