import { useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Button, Divider, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { usePhotos } from '@/photos';

// Pexels serves every size from the same base URL, only the query string changes.
const SIZE_QUERIES = {
  original: '',
  large2x: '?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  large: '?auto=compress&cs=tinysrgb&h=650&w=940',
  portrait: '?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
  landscape: '?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  medium: '?auto=compress&cs=tinysrgb&h=350',
  small: '?auto=compress&cs=tinysrgb&h=130',
} as const;

type SizeKey = keyof typeof SIZE_QUERIES;

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const { width: screenW } = useWindowDimensions();
  const wide = screenW >= 900;
  const { photos } = usePhotos();

  const params = useLocalSearchParams<{
    id?: string;
    imageUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    altText?: string;
    width?: string;
    height?: string;
  }>();
  const { id } = params;

  // Use the route params first, then fall back to the shared photo store
  const current = photos.find((p) => String(p.id) === id);
  const imageUrl = params.imageUrl ?? current?.imageUrl;
  const photographer = params.photographer ?? current?.photographer;
  const photographerUrl = params.photographerUrl ?? current?.photographerUrl;
  const altText = params.altText ?? current?.altText;
  const photoW = Number(params.width || current?.width) || 0;
  const photoH = Number(params.height || current?.height) || 0;

  const [viewerOpen, setViewerOpen] = useState(false);
  const [downloading, setDownloading] = useState<SizeKey | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

  const baseUrl = imageUrl.split('?')[0];
  const aspect = photoW && photoH ? photoW / photoH : 4 / 3;

  const sizes: { key: SizeKey; label: string; dims: string; hint: string }[] = [
    {
      key: 'original',
      label: 'Original',
      dims: photoW && photoH ? `${photoW} × ${photoH} px` : 'Full resolution',
      hint: 'Best quality, biggest file',
    },
    { key: 'large2x', label: 'Large 2x', dims: 'up to 1880 × 1300 px', hint: 'Sharp on high-density screens' },
    { key: 'large', label: 'Large', dims: 'up to 940 × 650 px', hint: 'Good for sharing' },
    { key: 'portrait', label: 'Portrait', dims: '800 × 1200 px', hint: 'Cropped for phone wallpapers' },
    { key: 'landscape', label: 'Landscape', dims: '1200 × 627 px', hint: 'Cropped for banners and covers' },
    { key: 'medium', label: 'Medium', dims: '350 px tall', hint: 'Small file' },
    { key: 'small', label: 'Small', dims: '130 px tall', hint: 'Thumbnail' },
  ];

  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  const goToAdjacentPhoto = (offset: number) => {
    const target = photos[currentIndex + offset];
    if (currentIndex === -1 || !target) return;

    router.replace({
      pathname: '/photo/[id]',
      params: {
        id: String(target.id),
        imageUrl: target.imageUrl,
        photographer: target.photographer,
        photographerUrl: target.photographerUrl,
        altText: target.altText,
        width: String(target.width ?? ''),
        height: String(target.height ?? ''),
      },
    });
  };

  const handleDownload = async (key: SizeKey, label: string) => {
    const url = baseUrl + SIZE_QUERIES[key];
    setDownloading(key);
    setStatus(null);

    try {
      if (Platform.OS === 'web') {
        // Real file download in the browser
        const res = await fetch(url);
        if (!res.ok) throw new Error('Bad response');
        const blob = await res.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = `lakbay-ph-${id}-${key}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
        setStatus(`Downloaded ${label}.`);
      } else {
        // On phones the image opens in the browser, where it can be saved
        await Linking.openURL(url);
        setStatus(`Opened ${label}. Press and hold the image to save it.`);
      }
    } catch {
      try {
        await Linking.openURL(url);
        setStatus(`Opened ${label} in your browser. Save it from there.`);
      } catch {
        setStatus('Could not download this size. Please try again.');
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenPhotographer = () => {
    if (photographerUrl) WebBrowser.openBrowserAsync(photographerUrl);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Tourist Spot',
        message: `Check out this tourist spot photo by ${photographer}! ${photographerUrl ?? ''}`,
        url: photographerUrl,
      });
    } catch (error) {
      console.warn('Share failed or was cancelled:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: `By ${photographer}` }} />

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.content, wide && styles.contentWide]}
      >
        {/* LEFT: the picture (tap to view full screen) */}
        <View style={wide ? styles.leftWide : undefined}>
          <Pressable
            onPress={() => setViewerOpen(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="View photo full screen"
            style={styles.hero}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', aspectRatio: aspect }}
              contentFit="cover"
              transition={200}
              accessibilityLabel={altText}
            />
            <View style={styles.expandBadge}>
              <MaterialCommunityIcons name="arrow-expand" size={18} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.pagerRow}>
            <IconButton
              icon="chevron-left"
              iconColor={theme.colors.onSurface}
              size={28}
              disabled={currentIndex <= 0}
              onPress={() => goToAdjacentPhoto(-1)}
              accessibilityLabel="Previous photo"
            />
            <Text variant="titleMedium" style={[styles.photographer, { color: theme.colors.onSurface }]}>
              📸 Captured by {photographer}
            </Text>
            <IconButton
              icon="chevron-right"
              iconColor={theme.colors.onSurface}
              size={28}
              disabled={currentIndex === -1 || currentIndex >= photos.length - 1}
              onPress={() => goToAdjacentPhoto(1)}
              accessibilityLabel="Next photo"
            />
          </View>
        </View>

        {/* RIGHT: download sizes */}
        <View style={[styles.panel, wide && styles.panelWide, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.panelHeader}>
            <MaterialCommunityIcons name="download" size={22} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              Download
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Choose a size. Larger sizes are sharper but make a bigger file.
          </Text>

          <View style={styles.sizeList}>
            {sizes.map((s, i) => (
              <View key={s.key}>
                {i > 0 && <Divider />}
                <TouchableRipple
                  onPress={() => handleDownload(s.key, s.label)}
                  disabled={downloading !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${s.label}, ${s.dims}`}
                  style={styles.sizeRow}
                >
                  <View style={styles.sizeRowInner}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.onSurface, fontWeight: '700' }}>{s.label}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                        {s.dims}
                      </Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {s.hint}
                      </Text>
                    </View>
                    {downloading === s.key ? (
                      <ActivityIndicator size={20} />
                    ) : (
                      <MaterialCommunityIcons name="download-outline" size={24} color={theme.colors.primary} />
                    )}
                  </View>
                </TouchableRipple>
              </View>
            ))}
          </View>

          {status && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {status}
            </Text>
          )}

          <Button mode="outlined" icon="open-in-new" onPress={handleOpenPhotographer} disabled={!photographerUrl}>
            Visit photographer profile
          </Button>
          <Button mode="contained" icon="share-variant" onPress={handleShare}>
            Share this spot
          </Button>

          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Photos provided by Pexels
          </Text>
        </View>
      </ScrollView>

      {/* Full-screen viewer */}
      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <View style={styles.viewer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewerOpen(false)} accessibilityLabel="Close" />
          <View style={styles.viewerBody} pointerEvents="none">
            <Image source={{ uri: baseUrl + SIZE_QUERIES.large2x }} style={styles.viewerImage} contentFit="contain" />
          </View>
          <IconButton
            icon="close"
            iconColor="#FFFFFF"
            size={28}
            onPress={() => setViewerOpen(false)}
            accessibilityLabel="Close"
            style={styles.viewerClose}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: 16,
    gap: 16,
  },
  contentWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    gap: 24,
  },
  leftWide: { flex: 3 },
  hero: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  expandBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  photographer: { flex: 1, fontWeight: '600', textAlign: 'center' },
  panel: { width: '100%', borderRadius: 16, padding: 16, gap: 12 },
  panelWide: { flex: 2 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeList: { borderRadius: 12, overflow: 'hidden' },
  sizeRow: { paddingVertical: 10, paddingHorizontal: 4 },
  sizeRowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' },
  viewerBody: { flex: 1, padding: 12 },
  viewerImage: { width: '100%', height: '100%' },
  viewerClose: { position: 'absolute', top: 24, right: 12 },
});