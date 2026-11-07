import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

export default function MediaGallery({
  photos,
  loading,
  locationName,
  error,
}: {
  photos: Photo[];
  loading: boolean;
  locationName?: string;
  error?: string;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const minCardWidth = Math.min(240, width - 48);

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator animating size="large" />
        <Text variant="bodyMedium" style={[styles.stateText, { color: theme.colors.onSurfaceVariant }]}>
          Searching for places in {locationName || 'your selected area'}...
        </Text>
      </View>
    );
  }

  if (error || photos.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <Text variant="titleMedium" style={[styles.stateTitle, { color: theme.colors.onSurface }]}>
          {error ? 'Search could not be completed' : 'No tourist spots found yet'}
        </Text>
        <Text
          accessibilityRole={error ? 'alert' : 'text'}
          variant="bodyMedium"
          style={[styles.stateText, { color: theme.colors.onSurfaceVariant }]}
        >
          {error ??
            (locationName
              ? `We couldn’t find matching photos for ${locationName}. Try another city or municipality.`
              : 'No tourist spots found for this area yet.')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text variant="bodyMedium" style={[styles.resultCount, { color: theme.colors.onSurfaceVariant }]}>
        {photos.length} photo{photos.length === 1 ? '' : 's'} found for {locationName || 'this location'}
      </Text>
      <View style={styles.grid}>
        {photos.map((photo) => (
          <View key={String(photo.id)} style={[styles.gridItem, { minWidth: minCardWidth }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View details for ${photo.altText || 'photo'}`}
              onPress={() =>
                router.push({
                  pathname: '/photo/[id]',
                  params: {
                    id: String(photo.id),
                    imageUrl: photo.imageUrl,
                    photographer: photo.photographer,
                    photographerUrl: photo.photographerUrl,
                    altText: photo.altText,
                    title: photo.altText || 'Photo details',
                    subtitle: locationName ?? '',
                  },
                })
              }
            >
              <Card style={styles.card} elevation={2}>
                <Card.Cover source={{ uri: photo.imageUrl }} accessibilityLabel={photo.altText} />
                <Card.Content style={styles.cardContent}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    📸 Captured by:
                  </Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={(event) => {
                      event.stopPropagation();
                      void WebBrowser.openBrowserAsync(photo.photographerUrl);
                    }}
                    style={styles.photographerLink}
                  >
                    <Text variant="bodyMedium" style={[styles.photographerText, { color: theme.colors.primary }]}>
                      {photo.photographer}
                    </Text>
                  </Pressable>
                </Card.Content>
              </Card>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultCount: {
    marginBottom: 12,
    fontWeight: '600',
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
  photographerLink: {
    marginTop: 4,
  },
  photographerText: {
    textDecorationLine: 'underline',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 10,
  },
  stateTitle: {
    textAlign: 'center',
    fontWeight: '700',
  },
  stateText: {
    textAlign: 'center',
  },
});
