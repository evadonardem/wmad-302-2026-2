/**
 * Responsive product grid: 2 columns on phones, 3-4 on tablets / wide web.
 */
import { useWindowDimensions } from 'react-native';
import { MAX_CONTENT_WIDTH, breakpoints, spacing } from '@/constants/layout';

export function useProductGrid(horizontalPadding: number = spacing.md, gap: number = spacing.md) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const numColumns = contentWidth >= breakpoints.largeTablet ? 4 : contentWidth >= breakpoints.tablet ? 3 : 2;
  const cardWidth = Math.floor((contentWidth - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns);

  return { numColumns, cardWidth, gap, horizontalPadding };
}
