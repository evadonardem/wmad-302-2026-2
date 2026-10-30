import { useEffect } from 'react';
import { Platform, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import ZoomableImage from '@/components/ZoomableImage';
import { usePhotos } from '@/photos';

// Search params always arrive as strings (or string arrays) — normalise to a plain string
const asString = (value?: string | string[]): string =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '');

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();
  const { height: windowHeight } = useWindowDimensions();

  // TODO 4.4 [Route Param Extraction]
  const params = useLocalSearchParams<{
    id?: string;
    imageUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    altText?: string;
  }>();
  const id = asString(params.id);
  const imageUrl = asString(params.imageUrl);
  const photographer = asString(params.photographer);
  const photographerUrl = asString(params.photographerUrl);
  const altText = asString(params.altText);

  // Position of the current photo inside the shared result set (for prev/next)
  const currentIndex = photos.findIndex((p) => String(p.id) === id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const viewerHeight = Math.min(Math.max(windowHeight * 0.5, 280), 560);

  const goToAdjacentPhoto = (offset: number) => {
    // TODO 4.7 [Prev/Next Viewer]
    if (currentIndex < 0) return;
    const target = photos[currentIndex + offset];
    if (!target) return; // out of bounds — stay put

    // replace (not push) so Back still closes the modal in a single step
    router.replace({
      pathname: '/photo/[id]',
      params: {
        id: String(target.id),
        imageUrl: target.imageUrl,
        photographer: target.photographer,
        photographerUrl: target.photographerUrl,
        altText: target.altText,
      },
    });
  };

  // Web only: ← / → keys browse photos like a real gallery
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToAdjacentPhoto(-1);
      if (event.key === 'ArrowRight') goToAdjacentPhoto(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, photos]);

  const handleOpenPhotographer = () => {
    if (photographerUrl) {
      WebBrowser.openBrowserAsync(photographerUrl);
    }
  };

  const handleShare = async () => {
    // TODO 4.5 [Generic Share Sheet]
    try {
      await Share.share({
        title: 'Lakbay PH tourist spot',
        message: `Check out this tourist spot photo by ${photographer}${
          photographerUrl ? `: ${photographerUrl}` : ''
        }`,
        url: photographerUrl || imageUrl,
      });
    } catch (error) {
      // Unsupported platform/browser or the user cancelled — fail gracefully
      console.warn('Share unavailable or cancelled:', error);
    }
  };

  // TODO 4.8 [Route Guard] — runs before anything is rendered (all hooks are above)
  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic native header title */}
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          {/* Zoomable photo viewer (key resets zoom when the photo changes) */}
          <ZoomableImage key={imageUrl} uri={imageUrl} altText={altText} height={viewerHeight} />

          <Surface style={[styles.body, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.pagerRow}>
              <IconButton
                icon="chevron-left"
                mode="contained-tonal"
                size={26}
                disabled={!hasPrev}
                onPress={() => goToAdjacentPhoto(-1)}
                accessibilityLabel="Previous photo"
              />
              <View style={styles.pagerCenter}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  📸 Captured by
                </Text>
                <Text variant="titleMedium" numberOfLines={1} style={[styles.photographer, { color: theme.colors.onSurface }]}>
                  {photographer || '—'}
                </Text>
                {currentIndex >= 0 && (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Photo {currentIndex + 1} of {photos.length}
                  </Text>
                )}
              </View>
              <IconButton
                icon="chevron-right"
                mode="contained-tonal"
                size={26}
                disabled={!hasNext}
                onPress={() => goToAdjacentPhoto(1)}
                accessibilityLabel="Next photo"
              />
            </View>

            {altText ? (
              <Text variant="bodySmall" style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>
                {altText}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                icon="open-in-new"
                onPress={handleOpenPhotographer}
                disabled={!photographerUrl}
                style={styles.actionButton}
              >
                Visit photographer profile
              </Button>

              <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.actionButton}>
                Share this spot
              </Button>
            </View>

            {Platform.OS === 'web' && (
              <Text variant="labelSmall" style={[styles.tip, { color: theme.colors.onSurfaceVariant }]}>
                Tip: use the ← → arrow keys to browse photos
              </Text>
            )}
          </Surface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  page: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  body: {
    margin: 16,
    padding: 16,
    borderRadius: 24,
    gap: 12,
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pagerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  photographer: {
    fontWeight: '700',
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 16,
  },
  tip: {
    textAlign: 'center',
    opacity: 0.8,
  },
});