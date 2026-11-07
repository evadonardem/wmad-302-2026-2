import { TricolorBar } from '@/components/ui';
import { usePhotos } from '@/photos';
import { fontFamily, glass, radius } from '@/theme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';

const asString = (value?: string | string[]) => (Array.isArray(value) ? (value[0] ?? '') : (value ?? ''));

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();

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

  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  const currentIndex = photos.findIndex((p) => String(p.id) === id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const goToAdjacentPhoto = (offset: number) => {
    if (currentIndex < 0) return;
    const target = photos[currentIndex + offset];
    if (!target) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      void Haptics.selectionAsync();
      WebBrowser.openBrowserAsync(photographerUrl);
    }
  };

  const handleShare = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const text = `${altText || 'Tourist spot'} — 📸 by ${photographer}`;
    try {
      await Share.share({
        title: `Tourist spot by ${photographer}`,
        message: Platform.OS === 'android' && photographerUrl ? `${text}\n${photographerUrl}` : text,
        url: photographerUrl || undefined,
      });
    } catch (error) {
      console.warn('Share was not completed:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      <TricolorBar />

      {/* Hero container with image and overlaid navigation arrows */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.hero}
          contentFit="contain"
          transition={350} // Smooth image fade-in transition
          accessibilityLabel={altText}
        />

        {/* Left Arrow Button (Previous) */}
        {hasPrevious && (
          <IconButton
            icon="chevron-left"
            iconColor="#ffffff"
            containerColor="rgba(0, 0, 0, 0.45)"
            size={28}
            style={[styles.arrowButton, styles.leftArrow]}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          />
        )}

        {/* Right Arrow Button (Next) */}
        {hasNext && (
          <IconButton
            icon="chevron-right"
            iconColor="#ffffff"
            containerColor="rgba(0, 0, 0, 0.45)"
            size={28}
            style={[styles.arrowButton, styles.rightArrow]}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          />
        )}
      </View>

      <ScrollView
        style={[styles.body, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={styles.bodyContent}
      >
        {/* Displays the photo's description / alt text */}
        {altText ? (
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
            {altText}
          </Text>
        ) : null}

        <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
          📸 Captured by {photographer || '—'}
        </Text>

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
  heroContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    zIndex: 10,
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  body: {
    flex: 1,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: glass.border,
  },
  bodyContent: {
    padding: 20,
    gap: 14,
  },
  description: {
    fontFamily: fontFamily.medium,
    lineHeight: 22,
    marginBottom: 4,
  },
  photographer: {
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
    marginVertical: 4,
  },
  shareButton: {
    marginTop: 4,
  },
});