/**
 * Home Screen Styles - Cookbook
 */
import { StyleSheet } from 'react-native';
import { appColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8D6E63',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF3E0',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3E2723',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 4,
  },
  welcomeAvatar: {
    backgroundColor: '#E85D04',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  seeAll: {
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E85D04',
  },
  categoryList: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCC80',
    backgroundColor: '#FFF3E0',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E85D04',
  },
  recipeCard: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  difficultyChip: {
    borderRadius: 12,
  },
  easy: {
    backgroundColor: '#E8F5E9',
  },
  medium: {
    backgroundColor: '#FFF3E0',
  },
  hard: {
    backgroundColor: '#FDEDED',
  },
  cardContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '500',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cuisineChip: {
    backgroundColor: '#FFF3E0',
  },
  mealChip: {
    backgroundColor: '#E8F5E9',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A73E8',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  cardSeparator: {
    height: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8D6E63',
  },
});

const darkStyles = StyleSheet.create({
  scrollView: { backgroundColor: appColors.dark.background },
  loadingContainer: { backgroundColor: appColors.dark.background },
  errorContainer: { backgroundColor: appColors.dark.background },
  loadingText: { color: appColors.dark.muted },
  errorText: { color: appColors.dark.error },
  welcomeContainer: { backgroundColor: appColors.dark.surfaceAlt },
  welcomeGreeting: { color: appColors.dark.text },
  welcomeSubtitle: { color: appColors.dark.muted },
  welcomeAvatar: { backgroundColor: appColors.dark.accent },
  sectionTitle: { color: appColors.dark.text },
  seeAllText: { color: appColors.dark.accent },
  categoryChip: {
    borderColor: appColors.dark.accentSoft,
    backgroundColor: appColors.dark.surfaceAlt,
  },
  categoryChipText: { color: appColors.dark.accent },
  card: { backgroundColor: appColors.dark.surface },
  easy: { backgroundColor: appColors.dark.positiveSurface },
  medium: { backgroundColor: appColors.dark.surfaceAlt },
  hard: { backgroundColor: appColors.dark.errorSurface },
  recipeTitle: { color: appColors.dark.text },
  productTitle: { color: appColors.dark.text },
  productCategory: { color: '#8AB4F8' },
  metaText: { color: appColors.dark.muted },
  cuisineChip: { backgroundColor: appColors.dark.surfaceAlt },
  mealChip: { backgroundColor: appColors.dark.positiveSurface },
  ratingText: { color: appColors.dark.muted },
  currentPrice: { color: '#8AB4F8' },
  emptyText: { color: appColors.dark.muted },
});

export function getHomeStyles(isDarkMode: boolean) {
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