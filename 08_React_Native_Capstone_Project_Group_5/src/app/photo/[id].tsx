import {
  Platform,
  Share,
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useCallback, useEffect } from 'react';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { usePhotos } from '@/photos';

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { photos } = usePhotos();
  const { id, imageUrl, photographer, photographerUrl, altText, title, subtitle } =
    useLocalSearchParams<{
      id?: string;
      imageUrl?: string;
      photographer?: string;
      photographerUrl?: string;
      altText?: string;
      title?: string;
      subtitle?: string;
    }>();

  const routeId = Array.isArray(id) ? id[0] : id ?? '';
  const routeImageUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl ?? '';
  const routePhotographer = Array.isArray(photographer) ? photographer[0] : photographer ?? '';
  const routePhotographerUrl = Array.isArray(photographerUrl) ? photographerUrl[0] : photographerUrl ?? '';
  const routeAltText = Array.isArray(altText) ? altText[0] : altText ?? '';
  const routeTitle = Array.isArray(title) ? title[0] : title ?? '';
  const routeSubtitle = Array.isArray(subtitle) ? subtitle[0] : subtitle ?? '';

  const currentIndex = photos.findIndex((p) => String(p.id) === routeId);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < photos.length - 1;

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  const goToAdjacentPhoto = useCallback((offset: number) => {
    if (currentIndex < 0) return;

    const target = photos[currentIndex + offset];
    if (!target) return;

    router.replace({
      pathname: '/photo/[id]',
      params: {
        id: String(target.id),
        imageUrl: target.imageUrl,
        photographer: target.photographer,
        photographerUrl: target.photographerUrl,
        altText: target.altText,
        title: routeTitle,
        subtitle: routeSubtitle,
      },
    });
  }, [currentIndex, photos, routeSubtitle, routeTitle]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !routeImageUrl || !routePhotographer) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditingText =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (isEditingText) return;

      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault();
        goToAdjacentPhoto(-1);
      } else if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault();
        goToAdjacentPhoto(1);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, goToAdjacentPhoto, handleClose, routeImageUrl, routePhotographer]);

  if (!routeImageUrl || !routePhotographer) {
    return <Redirect href="/" />;
  }

  const handleOpenPhotographer = () => {
    if (routePhotographerUrl) {
      WebBrowser.openBrowserAsync(routePhotographerUrl);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Tourist spot by ${routePhotographer}`,
        message: `Explore this photo by ${routePhotographer}.`,
        url: routePhotographerUrl || routeImageUrl,
      });
    } catch {
      // Fail gracefully when share is unavailable or dismissed.
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen
        options={{
          title: routeTitle || (routePhotographer ? `By ${routePhotographer}` : 'Tourist Spot'),
          headerShown: true,
          headerLeft: () => (
            <IconButton
              icon="close"
              style={styles.desktopButton}
              onPress={handleClose}
              accessibilityLabel="Close photo"
            />
          ),
        }}
      />

      <View style={[styles.heroContainer, { height: Math.min(width * 0.78, 360) }]}>
        <Image
          source={{ uri: routeImageUrl }}
          style={styles.hero}
          contentFit="cover"
          transition={200}
          accessibilityLabel={routeAltText}
        />
        <IconButton
          icon="close"
          mode="contained"
          containerColor="rgba(0, 0, 0, 0.72)"
          iconColor="#fff"
          size={22}
          style={styles.closeImageButton}
          accessibilityRole="button"
          onPress={handleClose}
          accessibilityLabel="Close photo"
        />
        <IconButton
          icon="chevron-left"
          mode="contained"
          containerColor="rgba(0, 0, 0, 0.62)"
          iconColor="#fff"
          size={30}
          style={[styles.imageNavigationButton, styles.previousButton]}
          disabled={!canGoPrevious}
          onPress={() => goToAdjacentPhoto(-1)}
          accessibilityLabel="Previous photo"
          accessibilityHint={canGoPrevious ? 'Show the previous photo' : 'This is the first photo'}
        />
        <IconButton
          icon="chevron-right"
          mode="contained"
          containerColor="rgba(0, 0, 0, 0.62)"
          iconColor="#fff"
          size={30}
          style={[styles.imageNavigationButton, styles.nextButton]}
          disabled={!canGoNext}
          onPress={() => goToAdjacentPhoto(1)}
          accessibilityLabel="Next photo"
          accessibilityHint={canGoNext ? 'Show the next photo' : 'This is the last photo'}
        />
      </View>

      <View style={[styles.body, { backgroundColor: theme.colors.surface }]}>
        {routeTitle ? (
          <View>
            <Text variant="titleLarge" style={[styles.photoTitle, { color: theme.colors.onSurface }]}>
              {routeTitle}
            </Text>
            {routeSubtitle ? (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {routeSubtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.pagerRow}>
          <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
            📸 Captured by {routePhotographer || '—'}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {currentIndex >= 0 ? `${currentIndex + 1} / ${photos.length}` : ''}
          </Text>
        </View>
        <View style={styles.navigationRow}>
          <Button
            mode="outlined"
            icon="chevron-left"
            style={[styles.navigationButton, styles.desktopButton]}
            contentStyle={styles.navigationButtonContent}
            disabled={!canGoPrevious}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          >
            Previous
          </Button>
          <Button
            mode="contained"
            icon="chevron-right"
            contentStyle={[styles.navigationButtonContent, styles.nextButtonContent]}
            style={[styles.navigationButton, styles.desktopButton]}
            disabled={!canGoNext}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          >
            Next
          </Button>
        </View>

        <Button
          mode="outlined"
          icon="open-in-new"
          onPress={handleOpenPhotographer}
          disabled={!routePhotographerUrl}
          style={styles.desktopButton}
        >
          Visit photographer profile
        </Button>

        <Button
          mode="contained"
          icon="share-variant"
          onPress={handleShare}
          style={[styles.shareButton, styles.desktopButton]}
        >
          Share this spot
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroContainer: {
    width: '100%',
    position: 'relative',
  },
  closeImageButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    elevation: 8,
  },
  imageNavigationButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    zIndex: 2,
    elevation: 8,
  },
  previousButton: {
    left: 12,
  },
  nextButton: {
    right: 12,
  },
  body: {
    minHeight: 230,
    padding: 20,
    gap: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  photoTitle: {
    fontWeight: '700',
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navigationButton: {
    flex: 1,
  },
  desktopButton: {
    cursor: 'pointer',
  },
  navigationButtonContent: {
    minHeight: 48,
    flexDirection: 'row-reverse',
  },
  nextButtonContent: {
    flexDirection: 'row',
  },
  photographer: {

    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 4,
  },
});
