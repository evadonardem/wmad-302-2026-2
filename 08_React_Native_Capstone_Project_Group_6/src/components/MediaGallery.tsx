import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  // TODO 3.1
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" animating />
      </View>
    );
  }

  // TODO 3.2
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No tourist spots found for this area yet.
        </Text>
      </View>
    );
  }

  return (
    // TODO 3.3
    <View style={styles.grid}>
      {/* TODO 3.4 */}
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
          {/* TODO 4.3 */}
          <Card
            style={styles.card}
            elevation={2}
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
            {/* TODO 3.5 */}
            <Card.Cover
              source={{ uri: photo.imageUrl }}
              accessibilityLabel={photo.altText}
            />

            <Card.Content style={styles.cardContent}>
              <Text variant="labelSmall" style={styles.creditLabel}>
                📸 Captured by:
              </Text>
              {/* TODO 3.6 */}
              <Pressable onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}>
                <Text variant="bodyMedium" style={styles.creditLink}>
                  {photo.photographer}
                </Text>
              </Pressable>
            </Card.Content>
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  center: {
    width: '100%',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  creditLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});