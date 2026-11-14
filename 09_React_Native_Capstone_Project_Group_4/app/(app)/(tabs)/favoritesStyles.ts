/**
 * Favorites Screen Styles - Cookbook
 */
import { StyleSheet } from 'react-native';
import { appColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8D6E63',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3E2723',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 24,
    borderRadius: 12,
    height: 52,
  },
  buttonContent: {
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  favoriteCard: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2723',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  difficultyChip: {
    backgroundColor: '#FFF3E0',
  },
  cuisineChip: {
    backgroundColor: '#E8F5E9',
  },
  details: {
    fontSize: 12,
    color: '#8D6E63',
  },
  separator: {
    height: 8,
  },
  guideContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E85D04',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
  },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: appColors.dark.background },
  loadingContainer: { backgroundColor: appColors.dark.background },
  loadingText: { color: appColors.dark.muted },
  emptyTitle: { color: appColors.dark.text },
  emptyText: { color: appColors.dark.muted },
  headerTitle: { color: appColors.dark.text },
  card: { backgroundColor: appColors.dark.surface },
  title: { color: appColors.dark.text },
  difficultyChip: { backgroundColor: appColors.dark.surfaceAlt },
  cuisineChip: { backgroundColor: appColors.dark.positiveSurface },
  details: { color: appColors.dark.muted },
  guideContainer: {
    backgroundColor: appColors.dark.surfaceAlt,
    borderColor: appColors.dark.accentSoft,
  },
  guideTitle: { color: appColors.dark.accent },
  guideText: { color: appColors.dark.muted },
});

export function getFavoritesStyles(isDarkMode: boolean) {
  if (!isDarkMode) return styles;

  return {
    ...styles,
    ...Object.fromEntries(
      Object.entries(darkStyles).map(([key, value]) => [
        key,
        [styles[key as keyof typeof styles], value],
      ])
    ),
  };
}