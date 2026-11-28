const DARK_SURFACES: Record<string, string> = {
  '#FFFFFF': '#1E1E1E',
  '#F8F9FA': '#121212',
  '#F5F5F5': '#252525',
  '#F1F3F4': '#252525',
  '#DADCE0': '#424242',
  '#E8EAED': '#383838',
  '#E0E0E0': '#444444',
  '#E8F5E9': '#243728',
  '#E6F4EA': '#243728',
  '#C0E6C3': '#3A5A3D',
  '#E8F0FE': '#243728',
  '#D0E1F9': '#3A5A3D',
};

const DARK_TEXT: Record<string, string> = {
  '#202124': '#F5F5F5',
  '#3C4043': '#E0E0E0',
  '#5F6368': '#BDBDBD',
  '#80868B': '#BDBDBD',
  '#9E9E9E': '#A0A0A0',
  '#9AA0A6': '#A0A0A0',
};

export function getThemedStyles<T extends Record<string, object>>(styles: T, isDark: boolean): T {
  if (!isDark) return styles;

  const themed = {} as T;
  for (const [name, style] of Object.entries(styles)) {
    const updated: Record<string, unknown> = { ...style };
    for (const [property, value] of Object.entries(updated)) {
      if (typeof value !== 'string') continue;
      const color = value.toUpperCase();
      if (property === 'color') {
        updated[property] = DARK_TEXT[color] ?? value;
      } else if (property === 'backgroundColor' || property === 'borderColor' || property.endsWith('BorderColor')) {
        updated[property] = DARK_SURFACES[color] ?? value;
      }
    }
    themed[name as keyof T] = updated as T[keyof T];
  }
  return themed;
}
