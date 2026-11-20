/**
 * Color tokens - one place for every color in the app.
 *
 * Screens never write a hex code. They ask for a NAME ("surface", "textMuted") and the
 * current theme decides which color that name means: light mode and dark mode each have
 * their own value for every name. Add a new color by adding the name to ThemeColors, then
 * giving it a value in BOTH palettes (TypeScript refuses to compile if one is missing).
 *
 * Naming rules:
 *   - "on<X>" is the color for text/icons that sit ON TOP of <X> (onPrimary is on primary).
 *   - "<X>Container" is a soft, tinted background for <X> (errorContainer = pale red).
 */
export interface ThemeColors {
  // Backgrounds
  background: string; // the screen itself
  surface: string; // cards, sections, bars: anything sitting on the screen
  surfaceMuted: string; // image placeholders, skeletons, inactive chips

  // Text
  text: string; // titles and main text
  textBody: string; // paragraphs, slightly softer than text
  textMuted: string; // labels, captions, secondary info
  textFaint: string; // hints, old (crossed-out) prices

  // Brand
  primary: string; // buttons, links, active icons
  onPrimary: string; // text/icons on a primary background
  primaryContainer: string; // pale brand tint (selected rows, badges)
  primaryBorder: string; // border that goes with primaryContainer

  // Lines
  border: string; // outlines and dividers
  borderStrong: string; // heavier outlines, inactive dots
  borderSubtle: string; // the faintest dividers
  iconMuted: string; // big decorative icons (empty states)

  // Status
  error: string; // error text, delete, the sale tag
  onError: string; // text on an error background
  errorText: string; // error messages
  errorContainer: string;
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;
  onWarningContainer: string;
  warningMuted: string;
  star: string; // rating stars

  // Misc
  overlay: string; // translucent layer over content while loading
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F4',

  text: '#202124',
  textBody: '#3C4043',
  textMuted: '#5F6368',
  textFaint: '#9AA0A6',

  primary: '#1A73E8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8F0FE',
  primaryBorder: '#D0E1F9',

  border: '#E0E0E0',
  borderStrong: '#DADCE0',
  borderSubtle: '#E8EAED',
  iconMuted: '#DADCE0',

  error: '#EA4335',
  onError: '#FFFFFF',
  errorText: '#D93025',
  errorContainer: '#FCE8E6',
  success: '#188038',
  successContainer: '#E6F4EA',
  warning: '#B06000',
  warningContainer: '#FEF7E0',
  onWarningContainer: '#3E2723',
  warningMuted: '#8D6E63',
  star: '#F9AB00',

  overlay: 'rgba(255, 255, 255, 0.8)',
  shadow: '#000000',
};

/**
 * Dark palette. Rules used to build it (so new colors stay consistent):
 *  - No pure black or pure white: #111317 is easier on the eyes than #000 and text is
 *    off-white, so nothing glares at night.
 *  - Depth comes from LIGHTER surfaces (background < surface < surfaceMuted), not shadows.
 *  - Brand and status colors are the pale versions (blue 300 instead of blue 600).
 *    The saturated light-mode colors vibrate and fail contrast on a dark background.
 *  - Every text/background pair passes WCAG AA (4.5:1). __tests__/colors.test.ts checks it.
 */
export const darkColors: ThemeColors = {
  background: '#111317',
  surface: '#1C1E22',
  surfaceMuted: '#2A2D32',

  text: '#E8EAED',
  textBody: '#C4C7CC',
  textMuted: '#9AA0A6',
  textFaint: '#80868B',

  primary: '#8AB4F8',
  onPrimary: '#0F2A52',
  primaryContainer: '#1F3556',
  primaryBorder: '#2E4A78',

  border: '#3C4043',
  borderStrong: '#4A4E54',
  borderSubtle: '#2F3136',
  iconMuted: '#5F6368',

  error: '#F28B82',
  onError: '#3B0A07',
  errorText: '#F28B82',
  errorContainer: '#3C1E1D',
  success: '#81C995',
  successContainer: '#1B3A28',
  warning: '#FDD663',
  warningContainer: '#3A3019',
  onWarningContainer: '#FDE9C0',
  warningMuted: '#D8BFA0',
  star: '#FBBC04',

  overlay: 'rgba(17, 19, 23, 0.8)',
  shadow: '#000000',
};
