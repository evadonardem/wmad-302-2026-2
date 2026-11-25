/**
 * Home Screen Styles - Cookbook
 * Unified & Improved Design
 */

import { StyleSheet } from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from '@/constants/design';

export const styles = StyleSheet.create({
  // Container & Scroll Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#FFFDF8',
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background || '#FFFDF8',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl || 100,
  },

  // States: Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl || 60,
  },
  loadingText: {
    marginTop: SPACING.md || 16,
    fontSize: TYPOGRAPHY.body || 16,
    color: COLORS.textSecondary || '#8D6E63',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg || 24,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body || 16,
    color: '#C62828',
    textAlign: 'center',
    marginBottom: SPACING.md || 16,
  },
  retryButton: {
    marginTop: SPACING.xs || 8,
  },

  // Welcome Header Banner
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg || 20,
    paddingVertical: SPACING.lg || 20,
    backgroundColor: '#FFF3E0',
    borderBottomLeftRadius: RADIUS.xl || 24,
    borderBottomRightRadius: RADIUS.xl || 24,
    marginBottom: SPACING.md || 16,
    ...SHADOWS.card,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: TYPOGRAPHY.title || 24,
    fontWeight: '700',
    color: COLORS.secondary || '#3E2723',
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.body || 14,
    color: COLORS.textSecondary || '#8D6E63',
    marginTop: SPNS_XS => SPACING.xs || 4,
  },
  welcomeAvatar: {
    backgroundColor: COLORS.primary || '#E85D04',
  },

  // Sections
  sectionContainer: {
    paddingHorizontal: SPACING.md || 16,
    marginBottom: SPACING.xl || 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md || 12,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.heading || 20,
    fontWeight: '700',
    color: COLORS.text || '#3E2723',
  },
  seeAll: {
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.body || 14,
    fontWeight: '600',
    color: COLORS.primary || '#E85D04',
  },

  // Categories / Chips
  categoryList: {
    paddingHorizontal: SPACING.xs || 4,
    gap: SPACING.xs || 8,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md || 16,
    paddingVertical: SPACING.xs || 8,
    borderRadius: RADIUS.round || 20,
    borderWidth: 1.5,
    borderColor: '#FFCC80',
    backgroundColor: COLORS.surface || '#FFFFFF',
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.body || 13,
    fontWeight: '600',
    color: COLORS.primary || '#E85D04',
  },

  // Recipe Cards
  recipeCard: {
    marginBottom: SPACING.md || 12,
  },
  card: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: RADIUS.lg || 16,
    overflow: 'hidden',
    ...SHADOWS.card,
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
    borderRadius: RADIUS.md || 12,
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
    padding: SPACING.md || 16,
  },
  recipeTitle: {
    fontSize: TYPOGRAPHY.subheading || 16,
    fontWeight: '700',
    color: COLORS.text || '#3E2723',
    marginBottom: SPACING.xs || 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm || 12,
  },
  metaText: {
    fontSize: TYPOGRAPHY.body || 12,
    color: COLORS.textSecondary || '#8D6E63',
    fontWeight: '500',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.xs || 8,
  },
  cuisineChip: {
    backgroundColor: '#FFF3E0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.body || 13,
    color: COLORS.textSecondary || '#8D6E63',
    fontWeight: '600',
  },

  // Empty States
  emptyContainer: {
    paddingVertical: SPACING.xxl || 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body || 16,
    color: COLORS.textSecondary || '#8D6E63',
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primary || '#E85D04',
    borderRadius: RADIUS.round || 25,
    paddingVertical: SPACING.md || 14,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  primaryButtonText: {
    color: COLORS.surface || '#FFFFFF',
    fontWeight: '700',
    fontSize: TYPOGRAPHY.body || 16,
  },
});