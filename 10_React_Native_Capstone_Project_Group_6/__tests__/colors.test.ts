import { darkColors, lightColors, ThemeColors } from '@/constants/colors';

/** WCAG relative luminance of a #RRGGBB color (0 = black, 1 = white). */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors: 1 (identical) to 21 (black on white). */
function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe('color palettes', () => {
  it('give every token a value in both light and dark', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('use real color strings', () => {
    const valid = /^(#[0-9A-Fa-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/;
    [lightColors, darkColors].forEach((palette) =>
      Object.entries(palette).forEach(([name, value]) => {
        expect({ name, ok: valid.test(value) }).toEqual({ name, ok: true });
      })
    );
  });

  it('are actually different where it matters', () => {
    (['background', 'surface', 'text', 'primary'] as (keyof ThemeColors)[]).forEach((name) =>
      expect(darkColors[name]).not.toBe(lightColors[name])
    );
  });
});

describe('dark palette readability (WCAG AA)', () => {
  // [text color, what it sits on, minimum contrast]. 4.5 = normal text, 3 = hints and big icons.
  const pairs: [keyof ThemeColors, keyof ThemeColors, number][] = [
    ['text', 'background', 4.5],
    ['text', 'surface', 4.5],
    ['text', 'surfaceMuted', 4.5],
    ['text', 'primaryContainer', 4.5],
    ['textBody', 'surface', 4.5],
    ['textBody', 'background', 4.5],
    ['textBody', 'primaryContainer', 4.5],
    ['textBody', 'warningContainer', 4.5],
    ['textBody', 'successContainer', 4.5],
    ['textMuted', 'background', 4.5],
    ['textMuted', 'surface', 4.5],
    ['textMuted', 'surfaceMuted', 4.5],
    ['textMuted', 'primaryContainer', 4.5],
    ['textFaint', 'surface', 3],
    ['textFaint', 'background', 3],
    ['primary', 'background', 4.5],
    ['primary', 'surface', 4.5],
    ['primary', 'primaryContainer', 4.5],
    ['primary', 'surfaceMuted', 4.5],
    ['onPrimary', 'primary', 4.5],
    ['primaryText', 'background', 4.5],
    ['primaryText', 'surface', 4.5],
    ['primaryText', 'primaryContainer', 4.5],
    ['onError', 'error', 4.5],
    ['error', 'background', 4.5],
    ['error', 'surface', 4.5],
    ['errorText', 'surface', 4.5],
    ['errorText', 'background', 4.5],
    ['errorText', 'errorContainer', 4.5],
    ['success', 'surface', 4.5],
    ['success', 'background', 4.5],
    ['success', 'successContainer', 4.5],
    ['warning', 'warningContainer', 4.5],
    ['onWarningContainer', 'warningContainer', 4.5],
    ['warningMuted', 'warningContainer', 3],
    ['iconMuted', 'background', 3],
    ['star', 'surface', 3],
  ];

  it.each(pairs)('%s on %s is at least %s:1', (foreground, background, minimum) => {
    expect(contrast(darkColors[foreground], darkColors[background])).toBeGreaterThanOrEqual(minimum);
  });

  it('keeps surfaces layered: background < surface < surfaceMuted', () => {
    expect(luminance(darkColors.background)).toBeLessThan(luminance(darkColors.surface));
    expect(luminance(darkColors.surface)).toBeLessThan(luminance(darkColors.surfaceMuted));
  });
});

describe('light palette readability (WCAG AA)', () => {
  // Yellow is a light color, so text on it must be dark and brand-colored text must not be yellow.
  const pairs: [keyof ThemeColors, keyof ThemeColors, number][] = [
    ['text', 'background', 4.5],
    ['text', 'surfaceMuted', 4.5],
    ['textBody', 'surface', 4.5],
    ['textMuted', 'surface', 4.5],
    ['textMuted', 'surfaceMuted', 4.5],
    ['textFaint', 'surface', 2.5],
    ['onPrimary', 'primary', 4.5],
    ['primaryText', 'surface', 4.5],
    ['primaryText', 'primaryContainer', 4.5],
    ['text', 'primaryContainer', 4.5],
    ['onError', 'error', 3],
    ['errorText', 'surface', 4.5],
    ['success', 'surface', 4.5],
  ];

  it.each(pairs)('%s on %s is at least %s:1', (foreground, background, minimum) => {
    expect(contrast(lightColors[foreground], lightColors[background])).toBeGreaterThanOrEqual(minimum);
  });
});
