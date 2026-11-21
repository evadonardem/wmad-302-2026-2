import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';
import { useFavorites } from '@/favorites';
import { useLanguage } from '@/i18n';

export default function MediaGallery({
  photos,
  loading,
  emptyMessage,
  failed,
  onRetry,
}: {
  photos: Photo[];
  loading: boolean;
  // Optional text for the empty state (for example "No beach photos were found for Baguio.")
  emptyMessage?: string;
  // True when the search itself failed (no connection...): shows a Try again button
  failed?: boolean;
  onRetry?: () => void;
}) {
  const theme = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  // TODO 3.1 [Loading Skeletal Feedbacks]: If the 'loading' prop evaluates true, return a visual
  // waiting feedback layout instead of the gallery.
  // Pro Tip: render a Paper <ActivityIndicator /> (or loop mock placeholder Views) to show a
  // clean visual waiting state while photos are being fetched.
  if (loading) {
    // Placeholder cards show the layout straight away, so the page feels faster while photos load.
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.gridItem}>
            <View style={[styles.skeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          </View>
        ))}
      </View>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]: If the photos array contains no records, return a
  // fallback layout displaying a simple status message like:
  // "No tourist spots found for this area yet."
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          {failed ? t('loadError') : (emptyMessage ?? 'No tourist spots found for this area yet.')}
        </Text>
        {failed && onRetry && (
          <Button mode="contained" icon="refresh" onPress={onRetry} style={styles.retryButton}>
            {t('tryAgain')}
          </Button>
        )}
      </View>
    );
  }

  return (
    // TODO 3.3 [Fluid Layout Architecture]: Build a responsive wrapping grid using flexbox
    // (the RN substitute for MUI <Grid> breakpoints): a row container with flexWrap enabled,
    // then map across your structured 'photos' payload elements inside it.
    <View style={styles.grid}>
      {/* TODO 3.4 [Card Content Loop Mapping]: Loop across the photo elements with a unique key,
          wrapping each one in a grid cell View (styles.gridItem) containing the Card template below. */}
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
          {/* TODO 4.3 [Detail Navigation Trigger]: Make each grid cell (or its Card) pressable so a tap
              pushes the photo detail route (a DYNAMIC segment) with router.push:
                router.push({ pathname: '/photo/[id]', params: { id: String(photo.id), imageUrl: photo.imageUrl, photographer: photo.photographer, photographerUrl: photo.photographerUrl, altText: photo.altText } })
              Pass every field the detail screen needs — route params travel as strings, and the id
              becomes part of the URL path (/photo/12345?...). */}
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
                  place: photo.place ?? '',
                },
              })
            }
          >
            <Card style={styles.card} elevation={2}>
              {/* TODO 3.5 [Multimedia Presentation Layer]: Render a Paper <Card.Cover /> image block.
                  Set its source to {{ uri: photo.imageUrl }} and bind 'photo.altText' as the
                  accessibilityLabel for the image asset. */}
              <View>
                <Card.Cover source={{ uri: photo.thumbUrl ?? photo.imageUrl }} accessibilityLabel={photo.altText} />
                {/* Favorite toggle (saved on the phone, listed on the Favorites screen) */}
                <IconButton
                  icon={isFavorite(photo.id) ? 'heart' : 'heart-outline'}
                  iconColor="#e53935"
                  containerColor="rgba(255,255,255,0.85)"
                  size={20}
                  style={styles.heartButton}
                  onPress={() => toggleFavorite(photo)}
                  accessibilityLabel="Toggle favorite"
                />
              </View>

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  {t('capturedByColon')}
                </Text>
                {/* TODO 3.6 [Attribution Links]: Render the photographer credit as a Pressable Text.
                    Display 'photo.photographer' and, on press, open 'photo.photographerUrl' in the
                    device browser using WebBrowser.openBrowserAsync (RN has no <a> hyperlinks). */}
                <Pressable onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}>
                  <Text variant="bodyMedium" style={styles.creditLink}>
                    {photo.photographer}
                  </Text>
                </Pressable>
              </Card.Content>
            </Card>
          </Pressable>
        </View>
      ))}
      {/* End Loop */}
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
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    margin: 0,
  },
  creditLink: {
    textDecorationLine: 'underline',
  },
  skeleton: {
    height: 250,
    borderRadius: 12,
    opacity: 0.6,
  },
  centered: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  retryButton: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});