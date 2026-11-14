/**
 * Favorites Screen Styles - Botanical Sage & Terracotta Theme
 */
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: APP_COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
    marginTop: 18,
  },
  emptyText: {
    fontSize: 15,
    color: APP_COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 24,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
  },
  buttonContent: {
    paddingHorizontal: 28,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FAF9F5',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_COLORS.textPrimary,
  },
  favoriteCard: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recipeImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  difficultyChip: {
    backgroundColor: APP_COLORS.primaryContainer,
  },
  cuisineChip: {
    backgroundColor: APP_COLORS.chipBg,
  },
  details: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    fontWeight: '600',
  },
  separator: {
    height: 4,
  },
});