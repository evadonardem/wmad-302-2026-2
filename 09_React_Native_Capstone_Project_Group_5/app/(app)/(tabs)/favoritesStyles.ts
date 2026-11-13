/**
 * Favorites Screen Styles - Cookbook
 */
import { StyleSheet } from 'react-native';

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
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    minWidth: 0,
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
    alignSelf: 'stretch',
    marginBottom: 8,
    minWidth: 0,
  },
  favoriteRemoveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 0,
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
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2723',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    flexShrink: 1,
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