import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { usePhotos } from '@/photos';

// Search params always arrive as string | string[] | undefined — normalise to a plain string
const asString = (value?: string | string[]) => (Array.isArray(value) ? (value[0] ?? '') : (value ?? ''));

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();

  // TODO 4.4 [Route Param Extraction]: 'id' comes from the dynamic path segment (/photo/[id]),
  // the rest from search params (?imageUrl=...&photographer=...)
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

  // TODO 4.8 [Route Guard]: opened directly or via a stale link -> bounce back to the Search tab
  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  // Position of the current photo inside the shared result set (for prev/next)
  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  const goToAdjacentPhoto = (offset: number) => {
    // TODO 4.7 [Prev/Next Viewer]
    // a. Target photo, guarding against "not in the result set" and out-of-bounds
    if (currentIndex < 0) return;
    const target = photos[currentIndex + offset];
    if (!target) return;

    // b. replace (not push) so Back closes the modal instead of stepping through every photo
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

  const handleOpenPhotographer = () => {
    if (photographerUrl) {
      WebBrowser.openBrowserAsync(photographerUrl);
    }
  };

  const handleShare = async () => {
    // TODO 4.5 [Generic Share Sheet]
    const text = `${altText || 'Tourist spot'} — 📸 by ${photographer}`;
    try {
      await Share.share({
        title: `Tourist spot by ${photographer}`,
        // Android ignores `url`, so the profile link goes inside the message there
        message: Platform.OS === 'android' && photographerUrl ? `${text}\n${photographerUrl}` : text,
        url: photographerUrl || undefined,
      });
    } catch (error) {
      // No share support (some browsers) or the user cancelled — fail gracefully
      console.warn('Share was not completed:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic native header title from the photographer param */}
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      {/* Hero: capped at half the screen and shown in full ("contain") so it is never cropped
          and the info panel below always stays visible */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.hero}
        contentFit="contain"
        transition={200}
        accessibilityLabel={altText}
      />

      {/* Info panel scrolls if the screen is too short to show everything */}
      <ScrollView
        style={[styles.body, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={styles.bodyContent}
      >
        <View style={styles.pagerRow}>
          <IconButton
            icon="chevron-left"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          />
          <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
            📸 Captured by {photographer || '—'}
          </Text>
          <IconButton
            icon="chevron-right"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          />
        </View>

        <Button mode="outlined" icon="open-in-new" onPress={handleOpenPhotographer} disabled={!photographerUrl}>
          Visit photographer profile
        </Button>

        <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.shareButton}>
          Share this spot
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
  },
  body: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bodyContent: {
    padding: 20,
    gap: 14,
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photographer: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 4,
  },
});
