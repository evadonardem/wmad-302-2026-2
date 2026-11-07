import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator animating size="large" />
        <Text variant="bodyMedium" style={styles.stateText}>
          Loading tourist spots...
        </Text>
      </View>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text variant="bodyMedium" style={styles.stateText}>
          No tourist spots found for this area yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={String(photo.id)} style={styles.gridItem}>
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
              <Card.Cover
                source={{ uri: photo.imageUrl }}
                accessibilityLabel={photo.altText}
              />

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  📸 Captured by:
                </Text>
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}
                  style={styles.photographerLink}
                >
                  <Text variant="bodyMedium" style={styles.photographerText}>
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
  photographerLink: {
    marginTop: 4,
  },
  photographerText: {
    textDecorationLine: 'underline',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  stateText: {
    textAlign: 'center',
  },
});
