/**
 * Spacing / sizing tokens shared by all screens (keeps spacing consistent).
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Breakpoints (px) used for phone / tablet layouts. */
export const breakpoints = {
  tablet: 600,
  largeTablet: 900,
} as const;

/** Content never grows wider than this on tablets / web. */
export const MAX_CONTENT_WIDTH = 960;
