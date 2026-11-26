/**
 * Home Screen Styles - Marketplace
 */

/**
 * Home Screen Styles - Lavender Marketplace
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
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
    color: '#77718A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
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
    paddingHorizontal: 22,
    paddingVertical: 26,
    backgroundColor: '#EDE9FE',
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 28,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeGreeting: {
    fontSize: 23,
    fontWeight: '800',
    color: '#35245E',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#76659A',
    marginTop: 7,
  },
  welcomeAvatar: {
    backgroundColor: '#8B5CF6',
  },
  sectionContainer: {
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#35245E',
  },
  seeAll: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  categoryList: {
    paddingHorizontal: 2,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'capitalize',
  },
  productCard: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0ECFA',
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#F7F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
    maxWidth: '88%',
    maxHeight: '88%',
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
    backgroundColor: '#DCFCE7',
  },
  medium: {
    backgroundColor: '#FEF3C7',
  },
  hard: {
    backgroundColor: '#FEE2E2',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#35245E',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#35245E',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#77718A',
    fontWeight: '500',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  cuisineChip: {
    backgroundColor: '#F3E8FF',
  },
  mealChip: {
    backgroundColor: '#DCFCE7',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 12,
    color: '#77718A',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 19,
    fontWeight: '800',
    color: '#7C3AED',
  },
  originalPrice: {
    fontSize: 13,
    color: '#A8A1B5',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  cardSeparator: {
    height: 2,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#77718A',
  },
});
