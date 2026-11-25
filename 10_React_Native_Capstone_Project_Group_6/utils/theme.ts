/**
 * Theme helpers - the plain (no React) logic behind dark mode.
 * Kept separate from ThemeContext so it can be unit-tested without rendering anything.
 */
import { darkColors, lightColors, ThemeColors } from '@/constants/colors';

/** What the person chose in Settings. "system" means: follow the phone. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** What is actually on screen. */
export type ColorScheme = 'light' | 'dark';

export const THEME_MODE_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'System default', description: 'Match your phone' },
  { value: 'light', label: 'Light', description: 'Always light' },
  { value: 'dark', label: 'Dark', description: 'Always dark' },
];

/** True only for the three valid modes (saved data may be old or damaged). */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * Turn the person's choice into the scheme to draw.
 * @param mode   the saved choice
 * @param system what the phone reports (can be null/undefined if it doesn't know)
 */
export function resolveScheme(mode: ThemeMode, system: string | null | undefined): ColorScheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}

export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
