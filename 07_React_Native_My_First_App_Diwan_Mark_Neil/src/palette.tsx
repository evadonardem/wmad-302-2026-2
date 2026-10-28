import { createContext, useContext, type ReactNode } from 'react';

export type PaletteKey = 'aurora' | 'sunset' | 'forest' | 'ocean';

export type Palette = {
  label: string;
  gradient: readonly [string, string, string];
  main: string;
};

export const PALETTES: Record<PaletteKey, Palette> = {
  aurora: { label: 'Aurora', gradient: ['#7c3aed', '#4f46e5', '#06b6d4'], main: '#8b5cf6' },
  sunset: { label: 'Sunset', gradient: ['#f97316', '#ec4899', '#8b5cf6'], main: '#f97316' },
  forest: { label: 'Forest', gradient: ['#10b981', '#059669', '#0ea5e9'], main: '#10b981' },
  ocean: { label: 'Ocean', gradient: ['#0ea5e9', '#2563eb', '#7c3aed'], main: '#38bdf8' },
};

export const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

type Value = { paletteKey: PaletteKey; setPaletteKey: (k: PaletteKey) => void };

const PaletteContext = createContext<Value>({ paletteKey: 'aurora', setPaletteKey: () => {} });

export function PaletteProvider({ value, children }: { value: Value; children: ReactNode }) {
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export const usePalette = () => {
  const { paletteKey, setPaletteKey } = useContext(PaletteContext);
  return { palette: PALETTES[paletteKey], paletteKey, setPaletteKey };
};
