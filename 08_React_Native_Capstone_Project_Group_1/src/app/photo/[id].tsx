import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { getPlaceDescription } from '@/services/geoPhotoService';
import { downloadPhoto, type DownloadResult } from '@/services/downloadService';
import { useFavorites } from '@/favorites';
import { usePhotos } from '@/photos';

// Download sizes (keys match the sizes Pexels provides for every photo)
const SIZE_OPTIONS = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
  { key: 'large2x', label: 'HD' },
  { key: 'original', label: 'Original' },
] as const;
type SizeKey = (typeof SIZE_OPTIONS)[number]['key'];

const DOWNLOAD_MESSAGES: Record<DownloadResult, string> = {
  saved: Platform.OS === 'web' ? 'Download started.' : 'Saved to your gallery.',
  opened: 'Opened the image so you can save it from there.',
  denied: 'Allow photo access to save images to your gallery.',
  failed: 'Could not download this photo. Please try again.',
};

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { photos } = usePhotos();
  const { favorites } = useFavorites();

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
    place?: string;
  }>();
  // A param can arrive as a string array when it is repeated in the URL, so take the first value.
  const asText = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';
  const id = asText(params.id);
  const imageUrl = asText(params.imageUrl);
  const photographer = asText(params.photographer);
  const photographerUrl = asText(params.photographerUrl);
  const altText = asText(params.altText);

  // The full photo record (other sizes, small preview) comes from the shared results or the favorites.
  const fullPhoto =
    photos.find((p) => String(p.id) === id) ?? favorites.find((p) => String(p.id) === id);
  const place = asText(params.place) || fullPhoto?.place || '';

  // Extra state for the place description and the download. These hooks stay above the route
  // guard below, because hooks must run on every render.
  const [description, setDescription] = useState<{ text: string; url: string } | null>(null);
  const [size, setSize] = useState<SizeKey>('large');
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!place) return;
    getPlaceDescription(place).then((result) => {
      if (active) setDescription(result);
    });
    return () => {
      active = false;
    };
  }, [place]);

  // TODO 4.8 [Route Guard]: Before rendering anything, check the required params above.
  // If 'imageUrl' or 'photographer' is missing (someone opened the URL directly, or a stale
  // link was tapped), bounce safely back to the Search tab:
  //   return <Redirect href="/" />;
  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  // Position of the current photo inside the shared result set (for prev/next)
  const currentIndex = photos.findIndex((p) => String(p.id) === id);

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

  // Downloads the selected size (falls back to the large image when the other sizes are unknown).
  const handleDownload = async () => {
    setDownloading(true);
    setDownloadMessage('');
    try {
      const url = fullPhoto?.sizes?.[size] ?? imageUrl;
      const result = await downloadPhoto(url, id, size);
      setDownloadMessage(DOWNLOAD_MESSAGES[result]);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Dynamic native header title — takes effect once TODO 4.4 wires the photographer param */}
      <Stack.Screen options={{ title: photographer ? `By ${photographer}` : 'Tourist Spot' }} />

      {/* The hero below renders the imageUrl param once TODO 4.4 is wired. */}
      <Image
        source={{ uri: imageUrl }}
        placeholder={fullPhoto?.thumbUrl ? { uri: fullPhoto.thumbUrl } : undefined}
        cachePolicy="memory-disk"
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

        {/* About the place: short Wikipedia description (where it is, a bit of history) */}
        {description && (
          <View style={styles.about}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
              About {place.replace(/^(City of|Municipality of)\s+/i, '')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {description.text}
            </Text>
            {!!description.url && (
              <Pressable onPress={() => WebBrowser.openBrowserAsync(description.url)}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                  Read more on Wikipedia
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <Button mode="outlined" icon="open-in-new" onPress={handleOpenPhotographer} disabled={!photographerUrl}>
          Visit photographer profile
        </Button>

        {/* Download with a size option */}
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
          Download size
        </Text>
        <View style={styles.sizeRow}>
          {SIZE_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              selected={size === option.key}
              showSelectedOverlay
              onPress={() => setSize(option.key)}
            >
              {option.label}
            </Chip>
          ))}
        </View>
        <Button
          mode="contained-tonal"
          icon="download"
          loading={downloading}
          disabled={downloading}
          onPress={handleDownload}
        >
          Download photo
        </Button>
        {!!downloadMessage && (
          <Text variant="bodySmall" style={[styles.downloadMessage, { color: theme.colors.onSurfaceVariant }]}>
            {downloadMessage}
          </Text>
        )}

        <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.shareButton}>
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
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  body: {
    minHeight: 360,
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
  about: {
    gap: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  downloadMessage: {
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 4,
  },
});