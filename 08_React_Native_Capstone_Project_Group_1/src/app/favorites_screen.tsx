import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useFavorites } from '@/favorites';

export default function FavoritesScreen() {
  const theme = useTheme();
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Tap a photo to open it. Tap the heart to remove it from your favorites.
      </Text>

      {favorites.map((photo) => (
        <Pressable
          key={photo.id}
          onPress={() =>
            router.push({
              pathname: '/photo/[id]',
              params: {
                id: String(photo.id),
                imageUrl: photo.imageUrl,
                photographer: photo.photographer,
                photographerUrl: photo.photographerUrl,
                altText: photo.altText,
                place: photo.place ?? '',
              },
            })
          }
        >
          <Card elevation={2} style={styles.card}>
            <Card.Cover source={{ uri: photo.thumbUrl ?? photo.imageUrl }} accessibilityLabel={photo.altText} />
            <Card.Title
              title={`📸 ${photo.photographer}`}
              titleVariant="titleSmall"
              right={() => (
                <IconButton
                  icon="heart"
                  iconColor="#e53935"
                  onPress={() => toggleFavorite(photo)}
                  accessibilityLabel="Remove from favorites"
                />
              )}
            />
          </Card>
        </Pressable>
      ))}

      {favorites.length === 0 && (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          No favorites yet — tap the heart on a photo to save it here.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 20,
    gap: 12,
  },
  card: {
    overflow: 'hidden',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});