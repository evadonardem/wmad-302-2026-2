/**
 * Home Screen Styles - Botanical Sage & Terracotta Theme
 */
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '@/constants/theme';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: APP_COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: APP_COLORS.accent,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: APP_COLORS.primary,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 24,
    marginBottom: 22,
  },
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#95D5B2',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  welcomeGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FAF9F5',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#D8F3DC',
    marginTop: 4,
  },
  welcomeAvatar: {
    backgroundColor: APP_COLORS.accent,
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
    fontSize: 19,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  seeAll: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: APP_COLORS.primaryContainer,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.primary,
  },
  categoryList: {
    paddingHorizontal: 2,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surface,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.primary,
  },
  recipeCard: {
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  imageContainer: {
    position: 'relative',
    height: 190,
  },
  recipeImage: {
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
    borderRadius: 10,
  },
  easy: {
    backgroundColor: APP_COLORS.easyBg,
  },
  medium: {
    backgroundColor: APP_COLORS.mediumBg,
  },
  hard: {
    backgroundColor: APP_COLORS.hardBg,
  },
  cardContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: APP_COLORS.background,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    fontWeight: '600',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  cuisineChip: {
    backgroundColor: APP_COLORS.primaryContainer,
  },
  mealChip: {
    backgroundColor: APP_COLORS.chipBg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: APP_COLORS.accent,
    fontWeight: '700',
  },
  cardSeparator: {
    height: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
  },
});