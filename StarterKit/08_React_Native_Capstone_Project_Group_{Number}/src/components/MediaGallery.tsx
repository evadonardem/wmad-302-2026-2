import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  // 3.1 Loading feedback
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" />
        <Text variant="bodyMedium" style={styles.statusText}>
          Loading photos...
        </Text>
      </View>
    );
  }

  // 3.2 Empty-state boundary
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.statusText}>
          No tourist spots found for this area yet.
        </Text>
      </View>
    );
  }

  return (
    // 3.3 Fluid wrapping grid
    <View style={styles.grid}>
      {/* 3.4 Card loop */}
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
          {/* 4.3 Detail navigation trigger */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/photo/[id]',
                params: {
                  id: String(photo.id),
                  imageUrl: photo.imageUrl,
                  photographer: photo.photographer,
                  photographerUrl: photo.photographerUrl,
                  altText: photo.altText,
                },
              })
            }
          >
            <Card style={styles.card} elevation={2}>
              {/* 3.5 Image */}
              <Card.Cover
                source={{ uri: photo.imageUrl }}
                accessibilityLabel={photo.altText}
              />

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  📸 Captured by:
                </Text>
                {/* 3.6 Attribution link */}
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}
                  accessibilityRole="link"
                >
                  <Text variant="bodyMedium" style={styles.link}>
                    {photo.photographer}
                  </Text>
                </Pressable>
              </Card.Content>
            </Card>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  statusText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 240,
  },
  card: {
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    paddingBottom: 12,
  },
  creditLabel: {
    opacity: 0.7,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
