import { useEffect, useState } from 'react';
import {
  Linking,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
type Sheet = 'none' | 'sizes' | 'confirm';

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
  const baseUrl = imageUrl ? imageUrl.split('?')[0] : '';

  const [viewerOpen, setViewerOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [selected, setSelected] = useState<SizeKey | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; busy?: boolean } | null>(null);

  // Auto-hide the notification (but not while a download is running)
  useEffect(() => {
    if (!toast || toast.busy) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Best-effort: ask the server how big the chosen file is (silently skipped if unavailable)
  useEffect(() => {
    setFileSize(null);
    if (sheet !== 'confirm' || !selected || !baseUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(baseUrl + SIZE_QUERIES[selected], { method: 'HEAD' });
        const len = Number(res.headers.get('content-length'));
        if (!cancelled && len > 0) setFileSize(formatBytes(len));
      } catch {
        // size unknown, that's fine
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sheet, selected, baseUrl]);

  if (!imageUrl || !photographer) {
    return <Redirect href="/" />;
  }

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

  const selectedSize = sizes.find((s) => s.key === selected) ?? null;
  const currentIndex = photos.findIndex((p) => String(p.id) === id);

  const openSizes = () => {
    setSelected(null);
    setSheet('sizes');
  };

  const pickSize = (key: SizeKey) => {
    setSelected(key);
    setSheet('confirm');
  };

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

  /** Runs after the user taps "Yes" */
  const confirmDownload = async () => {
    if (!selected || !selectedSize) return;

    const key = selected;
    const label = selectedSize.label;
    const url = baseUrl + SIZE_QUERIES[key];

    setSheet('none');
    setToast({ text: `Downloading ${label}…`, busy: true });

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
        setToast({ text: `Downloaded ${label} ✓` });
      } else {
        // On phones the image opens in the browser, where it can be saved
        await Linking.openURL(url);
        setToast({ text: `Opened ${label}. Press and hold the image to save it.` });
      }
    } catch {
      try {
        await Linking.openURL(url);
        setToast({ text: `Opened ${label} in your browser. Save it from there.` });
      } catch {
        setToast({ text: 'Could not download this size. Please try again.' });
      }
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
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: `By ${photographer}`,
          headerShown: !viewerOpen,
          // Download icon in the top-right corner
          headerRight: () => (
            <IconButton
              icon="download"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={openSizes}
              accessibilityLabel="Download photo"
            />
          ),
        }}
      />

      {/* THE PICTURE */}
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => setViewerOpen(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel="View photo full screen"
          style={[styles.hero, wide && styles.heroWide]}
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

        <View style={[styles.below, wide && styles.heroWide]}>
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

      {/* FULL-SCREEN VIEWER */}
      {viewerOpen && (
        <View style={styles.viewer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewerOpen(false)} accessibilityLabel="Close" />
          <View style={styles.viewerBody} pointerEvents="none">
            <Image source={{ uri: baseUrl + SIZE_QUERIES.large2x }} style={styles.viewerImage} contentFit="contain" />
          </View>

          <View style={[styles.viewerBar, { paddingTop: insets.top + 8 }]}>
            <IconButton
              icon="download"
              iconColor="#FFFFFF"
              size={26}
              onPress={openSizes}
              accessibilityLabel="Download photo"
            />
            <IconButton
              icon="close"
              iconColor="#FFFFFF"
              size={26}
              onPress={() => setViewerOpen(false)}
              accessibilityLabel="Close"
            />
          </View>
        </View>
      )}

      {/* SIZE LIST + CONFIRMATION */}
      {sheet !== 'none' && (
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet('none')} accessibilityLabel="Close" />

          {sheet === 'sizes' && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    Download photo
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Choose a size
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor={theme.colors.onSurface}
                  size={22}
                  onPress={() => setSheet('none')}
                  accessibilityLabel="Close"
                />
              </View>

              <ScrollView style={styles.sizeScroll}>
                {sizes.map((s, i) => (
                  <View key={s.key}>
                    {i > 0 && <Divider />}
                    <TouchableRipple
                      onPress={() => pickSize(s.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`${s.label}, ${s.dims}`}
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
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                      </View>
                    </TouchableRipple>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {sheet === 'confirm' && selectedSize && (
            <View style={[styles.card, styles.confirmCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.confirmIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialCommunityIcons name="download" size={30} color={theme.colors.primary} />
              </View>

              <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700', textAlign: 'center' }}>
                Download this photo?
              </Text>

              <View style={[styles.detailBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Size
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    {selectedSize.label}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Dimensions
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    {selectedSize.dims}
                  </Text>
                </View>
                {fileSize && (
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      File size
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                      {fileSize}
                    </Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Photo by
                  </Text>
                  <Text
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={{ color: theme.colors.onSurface, fontWeight: '700', flexShrink: 1, textAlign: 'right' }}
                  >
                    {photographer}
                  </Text>
                </View>
              </View>

              <View style={styles.confirmButtons}>
                <Button mode="outlined" onPress={() => setSheet('sizes')} style={styles.confirmBtn}>
                  No
                </Button>
                <Button mode="contained" icon="download" onPress={confirmDownload} style={styles.confirmBtn}>
                  Yes
                </Button>
              </View>
            </View>
          )}
        </View>
      )}

      {/* NOTIFICATION */}
      {toast && (
        <View style={[styles.toastWrap, { bottom: insets.bottom + 24 }]} pointerEvents="none">
          <View style={[styles.toast, { backgroundColor: theme.colors.inverseSurface }]}>
            {toast.busy && <ActivityIndicator size={16} color={theme.colors.inverseOnSurface} />}
            <Text style={{ color: theme.colors.inverseOnSurface, flexShrink: 1 }}>{toast.text}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 32 },

  hero: { width: '100%', overflow: 'hidden' },
  heroWide: { maxWidth: 900, alignSelf: 'center', borderRadius: 16 },
  expandBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  below: { width: '100%', padding: 16, gap: 12 },
  pagerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photographer: { flex: 1, fontWeight: '600', textAlign: 'center' },

  viewer: { ...StyleSheet.absoluteFill, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  viewerBody: { flex: 1, padding: 12 },
  viewerImage: { width: '100%', height: '100%' },
  viewerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 20,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sizeScroll: { flexGrow: 0 },
  sizeRow: { paddingVertical: 12, paddingHorizontal: 4 },
  sizeRowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  confirmCard: { alignItems: 'stretch', gap: 14, padding: 20 },
  confirmIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  detailBox: { borderRadius: 12, padding: 14, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  confirmButtons: { flexDirection: 'row', gap: 12 },
  confirmBtn: { flex: 1 },

  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 40, alignItems: 'center', paddingHorizontal: 20 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 480,
  },
});