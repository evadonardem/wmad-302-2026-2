import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, Menu, Snackbar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import ZoomableImage from '@/components/ZoomableImage';
import { useLanguage } from '@/i18n';
import { downloadPhoto, type DownloadResult } from '@/services/downloadService';
import type { Photo } from '@/services/geoPhotoService';
import { useFavorites } from '@/favorites';
import { usePhotos } from '@/photos';

// Download sizes (keys match the sizes Pexels provides for every photo)
const SIZE_KEYS = ['small', 'medium', 'large', 'large2x', 'original'] as const;
type SizeKey = (typeof SIZE_KEYS)[number];

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // keeps the buttons above the phone's gesture bar
  const { t } = useLanguage();
  const { photos } = usePhotos();
  const { isFavorite, toggleFavorite } = useFavorites();

  // TODO 4.4 [Route Param Extraction]: Replace the placeholder values below with real route
  // parameters read from this screen's URL using useLocalSearchParams() ('expo-router'):
  // - 'id' arrives from the dynamic path segment (/photo/[id])
  // - the rest arrive as search params (?imageUrl=...&photographer=...)
  // Example: const { id, imageUrl, photographer, photographerUrl, altText } =
  //            useLocalSearchParams<{ id?: string; imageUrl?: string; photographer?: string; photographerUrl?: string; altText?: string }>();
  // NOTE: search params always arrive as strings (or string arrays) — coerce types as needed.
  const params = useLocalSearchParams<{
    id?: string;
    imageUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    altText?: string;
  }>();
  // A param can arrive as a string array when it is repeated in the URL, so take the first value.
  const asText = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';
  const id = asText(params.id);
  const imageUrl = asText(params.imageUrl);
  const photographer = asText(params.photographer);
  const photographerUrl = asText(params.photographerUrl);
  const altText = asText(params.altText);

  // State for the download menu and the message. These hooks stay above the route guard below,
  // because hooks must run on every render.
  const [sizeMenuVisible, setSizeMenuVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  // TODO 4.8 [Route Guard]: Before rendering anything, check the required params above.
  // If 'imageUrl' or 'photographer' is missing (someone opened the URL directly, or a stale
  // link was tapped), bounce safely back to the Search tab:
  //   return <Redirect href="/" />;
  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  // Position of the current photo inside the shared result set (for prev/next)
  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  // The full record (with the other sizes) when it is in the results; otherwise built from the params.
  const currentPhoto: Photo = photos[currentIndex] ?? {
    id: Number(id),
    imageUrl,
    photographer,
    photographerUrl,
    altText,
  };

  const goToAdjacentPhoto = (offset: number) => {
    // TODO 4.7 [Prev/Next Viewer]: Browse the shared result set without closing the modal:
    // a. Compute the target photo: photos[currentIndex + offset] — guard against out-of-bounds
    //    (stay put when there is nothing to move to).
    // b. Swap the CURRENT route for the target with router.replace:
    //    router.replace({ pathname: '/photo/[id]', params: { id: String(target.id), imageUrl: target.imageUrl, photographer: target.photographer, photographerUrl: target.photographerUrl, altText: target.altText } })
    // WHY replace instead of push? push would stack every photo on the history stack, so Back
    // would step through each one — replace keeps a single entry so Back closes the modal.
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
        place: target.place ?? '',
      },
    });
  };

  const handleOpenPhotographer = () => {
    if (photographerUrl) {
      WebBrowser.openBrowserAsync(photographerUrl);
    }
  };

  const handleShare = async () => {
    // TODO 4.5 [Generic Share Sheet]: Open the platform share sheet with React Native's Share API:
    // a. Call Share.share() with a { title, message, url } payload describing the photo and
    //    linking to the photographer's profile.
    // b. Wrap the call in try/catch: platforms/browsers without share support (and user
    //    cancellations) must fail gracefully without crashing the screen.
    // Hint: Messenger, WhatsApp, and every other installed app appear inside this sheet —
    // no per-app deep links required.
    const text = `Check out this tourist spot photo by ${photographer}${altText ? `: ${altText}` : ''}`;
    try {
      await Share.share({
        title: `Tourist Spot by ${photographer}`,
        // Android ignores 'url', so the link goes inside the message there.
        message: Platform.OS === 'ios' ? text : `${text}\n${photographerUrl}`,
        url: photographerUrl,
      });
    } catch {
      // Unsupported platform or the user cancelled: nothing to do.
    }
  };

  // Downloads the chosen size (falls back to the large image when the other sizes are unknown).
  const handleDownload = async (size: SizeKey) => {
    setSizeMenuVisible(false);
    setDownloading(true);
    try {
      const url = currentPhoto.sizes?.[size] ?? imageUrl;
      const result: DownloadResult = await downloadPhoto(url, id, size);
      const messageKey = {
        saved: Platform.OS === 'web' ? 'dl_started' : 'dl_saved',
        opened: 'dl_opened',
        denied: 'dl_denied',
        failed: 'dl_failed',
      } as const;
      setMessage(t(messageKey[result]));
    } finally {
      setDownloading(false);
    }
  };

  const favorite = isFavorite(currentPhoto.id);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic native header title — takes effect once TODO 4.4 wires the photographer param */}
      <Stack.Screen
        options={{ title: photographer ? t('photoTitle', { name: photographer }) : t('spotTitle') }}
      />

      {/* The photo takes all the free space and is shown whole (not cropped), so nothing scrolls.
          Pinch to zoom, double-tap to zoom, and swipe sideways to change the photo. */}
      <ZoomableImage
        key={imageUrl}
        uri={imageUrl}
        placeholderUri={currentPhoto.thumbUrl}
        altText={altText}
        onSwipe={(direction) => goToAdjacentPhoto(direction)}
      />

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.colors.surface, paddingBottom: 12 + insets.bottom },
        ]}
      >
        {/* Who took the photo, with prev/next */}
        <View style={styles.pagerRow}>
          <IconButton
            icon="chevron-left"
            iconColor={theme.colors.onSurface}
            size={26}
            onPress={() => goToAdjacentPhoto(-1)}
            accessibilityLabel="Previous photo"
          />
          <Pressable style={styles.photographerBox} onPress={handleOpenPhotographer} disabled={!photographerUrl}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              📸 {t('capturedBy')}
            </Text>
            <Text
              variant="titleMedium"
              numberOfLines={1}
              style={[styles.photographer, { color: theme.colors.primary }]}
            >
              {photographer || '—'}
            </Text>
          </Pressable>
          <IconButton
            icon="chevron-right"
            iconColor={theme.colors.onSurface}
            size={26}
            onPress={() => goToAdjacentPhoto(1)}
            accessibilityLabel="Next photo"
          />
        </View>

        {/* Download, favorite and share in one bordered bar */}
        <View style={[styles.actionBar, { borderColor: theme.colors.outline }]}>
          <View style={[styles.action, { borderColor: theme.colors.outline, borderRightWidth: 1 }]}>
            <Menu
              visible={sizeMenuVisible}
              onDismiss={() => setSizeMenuVisible(false)}
              anchor={
                <Button
                  mode="text"
                  icon="download"
                  loading={downloading}
                  disabled={downloading}
                  onPress={() => setSizeMenuVisible(true)}
                >
                  {t('download')}
                </Button>
              }
            >
              {SIZE_KEYS.map((key) => (
                <Menu.Item
                  key={key}
                  title={t(`size_${key}`)}
                  onPress={() => handleDownload(key)}
                />
              ))}
            </Menu>
          </View>
          <View style={[styles.action, { borderColor: theme.colors.outline, borderRightWidth: 1 }]}>
            <Button
              mode="text"
              icon={favorite ? 'heart' : 'heart-outline'}
              textColor="#e53935"
              onPress={() => toggleFavorite(currentPhoto)}
            >
              {favorite ? t('saved') : t('favorite')}
            </Button>
          </View>
          <View style={styles.action}>
            <Button mode="text" icon="share-variant" onPress={handleShare}>
              {t('share')}
            </Button>
          </View>
        </View>
      </View>

      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  panel: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photographerBox: {
    flex: 1,
    alignItems: 'center',
  },
  photographer: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'visible',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});