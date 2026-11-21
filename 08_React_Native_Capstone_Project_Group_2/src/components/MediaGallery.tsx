import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';
import PhotoDetailsModal from './PhotoDetailsModal';
import { MAX_CONTENT_WIDTH, useBreakpoint } from '@/useBreakpoint';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  const theme = useTheme();
  // Photo whose map/details sheet is open
  const [mapPhoto, setMapPhoto] = useState<Photo | null>(null);

  // Responsive grid: 1 column on phones, 2 on tablets, 3 on laptops, 4 on large desktops.
  const { width, columns, pad } = useBreakpoint();
  const gap = 22;
  const containerWidth = Math.min(width, MAX_CONTENT_WIDTH) - pad * 2;
  const itemWidth = Math.floor((containerWidth - gap * (columns - 1)) / columns) - 1;

  // TODO 3.1 [Loading Skeletal Feedbacks]
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" animating color={theme.colors.primary} />
        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          Finding tourist spots…
        </Text>
      </View>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]
  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: theme.colors.outlineVariant }]}>
        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          No tourist spots found for this area yet.
        </Text>
      </View>
    );
  }

  return (
    // TODO 3.3 [Fluid Layout Architecture]
    <>
    <View style={styles.grid}>
      {/* TODO 3.4 [Card Content Loop Mapping] */}
      {photos.map((photo) => (
        <View key={photo.id} style={{ width: itemWidth }}>
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
            <Card
              style={[
                styles.card,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
              ]}
              elevation={1}
            >
              {/* TODO 3.5 [Multimedia Presentation Layer] */}
              <Card.Cover
                source={{ uri: photo.imageUrl }}
                style={styles.cover}
                accessibilityLabel={photo.altText}
              />

              <Card.Content style={styles.cardContent}>
                <Text
                  variant="labelSmall"
                  style={[styles.creditLabel, { color: theme.colors.onSurfaceVariant }]}
                >
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

                {/* Photo details + map pin */}
                <Text
                  variant="bodySmall"
                  numberOfLines={2}
                  style={[styles.altText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {photo.altText}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  icon="map-marker"
                  textColor={theme.colors.primary}
                  style={styles.pinButton}
                  accessibilityLabel={`Show ${photo.altText} on the map`}
                  onPress={() => setMapPhoto(photo)}
                >
                  View on map
                </Button>
              </Card.Content>
            </Card>
          </Pressable>
        </View>
      ))}
    </View>
    <PhotoDetailsModal photo={mapPhoto} onDismiss={() => setMapPhoto(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  empty: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
  },
  message: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    width: '100%',
  },
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
  },
  cover: {
    height: 200,
    borderRadius: 0,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 2,
  },
  creditLabel: {
    fontWeight: '500',
  },
  altText: {
    marginTop: 8,
  },
  pinButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 10,
  },
  credit: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});