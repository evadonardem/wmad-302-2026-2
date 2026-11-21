import { useWindowDimensions } from 'react-native';

// Shared responsive helper.
//   phone   < 600     tablet 600–1023     laptop 1024–1439     desktop ≥ 1440
export const MAX_CONTENT_WIDTH = 1280;

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isLaptop = width >= 1024 && width < 1440;
  const isDesktop = width >= 1440;

  // Number of photo columns, and the side padding used on every screen section.
  const columns = isPhone ? 1 : isTablet ? 2 : isLaptop ? 3 : 4;
  const pad = isPhone ? 16 : isTablet ? 28 : 40;

  return { width, isPhone, isTablet, isLaptop, isDesktop, columns, pad };
}