import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { Share } from 'react-native';
import { usePhotos } from '@/photos';

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();
  const { id, imageUrl, photographer, photographerUrl, altText } = useLocalSearchParams<{
    id?: string;
    imageUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    altText?: string;
  }>();

  const normalizedId = Array.isArray(id) ? id[0] : id;
  const normalizedImageUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  const normalizedPhotographer = Array.isArray(photographer) ? photographer[0] : photographer;
  const normalizedPhotographerUrl = Array.isArray(photographerUrl) ? photographerUrl[0] : photographerUrl;
  const normalizedAltText = Array.isArray(altText) ? altText[0] : altText;

  if (!normalizedImageUrl || !normalizedPhotographer) {
    return <Redirect href="/" />;
  }

  const currentIndex = photos.findIndex((p) => String(p.id) === normalizedId);

  const goToAdjacentPhoto = (offset: number) => {
    const target = photos[currentIndex + offset];
    if (!target) {
      return;
    }

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
    if (normalizedPhotographerUrl) {
      WebBrowser.openBrowserAsync(normalizedPhotographerUrl);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Tourist spot by ${normalizedPhotographer}`,
        message: `Check out this photo by ${normalizedPhotographer}.`,
        url: normalizedPhotographerUrl || normalizedImageUrl,
      });
    } catch (error) {
      // Ignore share errors so the screen remains usable.
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: normalizedPhotographer ? `By ${normalizedPhotographer}` : 'Tourist Spot' }} />

      <Image
        source={{ uri: normalizedImageUrl }}
        style={styles.hero}
        contentFit="cover"
        transition={200}
        accessibilityLabel={normalizedAltText}
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
          <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
            📸 Captured by {normalizedPhotographer || '—'}
          </Text>
          <IconButton
            icon="chevron-right"
            iconColor={theme.colors.onSurface}
            size={28}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          />
        </View>

        <Button mode="outlined" icon="open-in-new" onPress={handleOpenPhotographer} disabled={!normalizedPhotographerUrl}>
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
