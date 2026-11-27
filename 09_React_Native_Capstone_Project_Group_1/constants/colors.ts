/**
 * Croc Book colors - taken from the croc chef logo.
 * Change a color here and the whole app (screens + Paper theme) follows.
 */
export const colors = {
  // Croc green (main brand color: buttons, links, selected chips)
  primary: '#15702F',
  primaryDark: '#0F4E21',
  primaryLight: '#E3F1E6',
  onPrimary: '#FFFFFF',

  // Chef pants teal (second color)
  secondary: '#347C96',
  secondaryLight: '#E1EEF3',

  // Scarf wine (favorites / hearts)
  accent: '#8E1B3A',

  // Chef-hat white and neutrals
  background: '#F6F7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2EC',
  border: '#D4D4D4',

  // Text (deep teal from the pants, all pass AA contrast on the backgrounds above)
  text: '#193D49',
  textSecondary: '#3D5A66',
  textMuted: '#5B7480',
  icon: '#9DB0B8',

  // Status
  error: '#C62828',
  errorLight: '#FDEDED',
  star: '#E3B505',

  // Recipe difficulty badges
  easy: '#E3F1E6',
  medium: '#FFF4D6',
  hard: '#FDEDED',
} as const;