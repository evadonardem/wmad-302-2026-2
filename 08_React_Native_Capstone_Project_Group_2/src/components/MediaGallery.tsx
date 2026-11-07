import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  const theme = useTheme();

  // TODO 3.1 [Loading Skeletal Feedbacks]
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" animating />
        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          Finding tourist spots…
        </Text>
      </View>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          No tourist spots found for this area yet.
        </Text>
      </View>
    );
  }

  return (
    // TODO 3.3 [Fluid Layout Architecture]
    <View style={styles.grid}>
      {/* TODO 3.4 [Card Content Loop Mapping] */}
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
          {/* TODO 4.3 [Detail Navigation Trigger]: id rides in the path, the rest as search params */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open details for ${photo.altText}`}
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
              {/* TODO 3.5 [Multimedia Presentation Layer] */}
              <Card.Cover source={{ uri: photo.imageUrl }} accessibilityLabel={photo.altText} />

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  📸 Captured by:
                </Text>
                {/* TODO 3.6 [Attribution Links] */}
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${photo.photographer}'s profile`}
                  onPress={() => {
                    if (photo.photographerUrl) WebBrowser.openBrowserAsync(photo.photographerUrl);
                  }}
                >
                  <Text variant="bodyMedium" style={[styles.credit, { color: theme.colors.primary }]}>
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
  message: {
    textAlign: 'center',
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  creditLabel: {
    opacity: 0.7,
  },
  credit: {
    textDecorationLine: 'underline',
  },
});
