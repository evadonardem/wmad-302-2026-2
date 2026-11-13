import { usePhotos } from '@/photos';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Share, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';

// Search params can arrive as string | string[] | undefined
const asString = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();

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

  // TODO 4.8 [Route Guard]
  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  // Position of the current photo inside the shared result set (for prev/next)
  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  const goToAdjacentPhoto = (offset: number) => {
    // TODO 4.7 [Prev/Next Viewer]
    if (currentIndex === -1) return;
    const target = photos[currentIndex + offset];
    if (!target) return; // out of bounds: stay put

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
    try {
      await Share.share({
        title: `Tourist spot by ${photographer}`,
        message: `Check out this tourist spot photo by ${photographer}! ${photographerUrl}`,
        url: photographerUrl,
      });
    } catch (error) {
      // Unsupported platform or user cancelled: fail gracefully
      console.log('Share unavailable or cancelled:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      <Image
        source={{ uri: imageUrl }}
        style={styles.hero}
        contentFit="cover"
        transition={200}
        accessibilityLabel={altText}
      />

      <View style={[styles.body, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.pagerRow}>
          <IconButton
            icon="chevron-left"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          />
          <Text
            variant="titleMedium"
            style={[styles.photographer, { color: theme.colors.onSurface }]}
          >
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

        <Button
          mode="outlined"
          icon="open-in-new"
          onPress={handleOpenPhotographer}
          disabled={!photographerUrl}
        >
          Visit photographer profile
        </Button>

        <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.shareButton}>
          Share this spot
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
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