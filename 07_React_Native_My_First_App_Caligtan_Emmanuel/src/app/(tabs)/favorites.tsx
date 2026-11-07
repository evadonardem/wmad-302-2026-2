import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/favorites';
import { useTheme } from '@/theme';

export default function FavoritesScreen() {
  const theme = useTheme();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>Your Favorite Quotes</Text>

      {/* TODO 23 [Favorites List Mapping]: Build the favorites list below:
          a. Wrap the pre-rendered empty-state message below in a conditional so it only
             appears when 'favorites' is empty — otherwise show the list instead.
          b. Otherwise map through 'favorites' and render a row for each quote with a unique key,
             its text (styles.rowText) and author (styles.rowAuthor).
          c. Give each row a remove <Pressable> (Ionicons "trash-outline", styles.removeButton)
             wired to removeFavorite(quote). */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={44} color={theme.colors.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
          <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
            No favorites yet — tap the heart on a quote to save it here.
          </Text>
        </View>
      ) : (
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {favorites.map((quote, index) => (
            <View
              key={`${quote.text}-${index}`}
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderLeftColor: theme.colors.primary,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: theme.colors.text }]}>
                  {`"${quote.text}"`}
                </Text>
                <Text style={[styles.rowAuthor, { color: theme.colors.textSecondary }]}>
                  — {quote.author}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => removeFavorite(quote)}
              >
                <Ionicons name="trash-outline" size={20} color="#e53935" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  rowAuthor: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
  },
});