import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

const useNativeDriver = Platform.OS !== 'web';

// Pulsing placeholder cards shown while photos load (TODO 3.1)
function SkeletonGrid() {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View accessibilityLabel="Loading tourist spots">
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" animating />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Finding tourist spots…
        </Text>
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Animated.View key={index} style={[styles.gridItem, { opacity: pulse }]}>
            <View style={[styles.skeletonCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.skeletonImage, { backgroundColor: theme.colors.outlineVariant }]} />
              <View style={styles.skeletonLines}>
                <View style={[styles.skeletonLine, { width: '35%', backgroundColor: theme.colors.outlineVariant }]} />
                <View style={[styles.skeletonLine, { width: '60%', backgroundColor: theme.colors.outlineVariant }]} />
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// One photo card: on hover the card lifts, the photo zooms in and a "View & zoom" badge fades in
function PhotoCard({ photo }: { photo: Photo }) {
  const theme = useTheme();
  const hover = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) =>
    Animated.spring(hover, { toValue, useNativeDriver, friction: 8, tension: 70 }).start();

  const imageScale = hover.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const lift = hover.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.View style={{ transform: [{ translateY: lift }] }}>
      {/* TODO 4.3 [Detail Navigation Trigger] */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photo.altText || 'Open tourist spot photo'}
        onHoverIn={() => animateTo(1)}
        onHoverOut={() => animateTo(0)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        onPress={() =>
          router.push({
            pathname: '/photo/[id]',
            params: {
              id: String(photo.id),
              imageUrl: photo.imageUrl,
              photographer: photo.photographer,
              photographerUrl: photo.photographerUrl,
              altText: photo.altText,
            },
          })
        }
      >
        <Card style={styles.card} elevation={3}>
          <View style={styles.coverWrap}>
            <Animated.View style={{ transform: [{ scale: imageScale }] }}>
              {/* TODO 3.5 [Multimedia Presentation Layer] */}
              <Card.Cover
                source={{ uri: photo.imageUrl }}
                style={styles.cover}
                accessibilityLabel={photo.altText}
              />
            </Animated.View>

            <Animated.View style={[styles.hoverOverlay, { opacity: hover }]} pointerEvents="none">
              <View style={styles.hoverPill}>
                <Text style={styles.hoverPillText}>🔍 View & zoom</Text>
              </View>
            </Animated.View>
          </View>

          <Card.Content style={styles.cardContent}>
            <View style={styles.creditRow}>
              <View style={styles.creditText}>
                <Text variant="labelSmall" style={[styles.creditLabel, { color: theme.colors.onSurfaceVariant }]}>
                  📸 Captured by:
                </Text>
                {/* TODO 3.6 [Attribution Links] */}
                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    if (photo.photographerUrl) {
                      WebBrowser.openBrowserAsync(photo.photographerUrl);
                    }
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={[styles.link, { color: theme.colors.primary }]}
                  >
                    {photo.photographer}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.chevron, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.chevronText, { color: theme.colors.onPrimaryContainer }]}>›</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  const theme = useTheme();

  // TODO 3.1 [Loading Skeletal Feedbacks]
  if (loading) {
    return <SkeletonGrid />;
  }

  // TODO 3.2 [Boundary Validation Checks]
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏝️</Text>
        <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
          No tourist spots found for this area yet.
        </Text>
        <Text variant="bodyMedium" style={[styles.emptyHint, { color: theme.colors.onSurfaceVariant }]}>
          Pick a region and a city above, or tap a popular destination to see photos.
        </Text>
      </View>
    );
  }

  return (
    // TODO 3.3 [Fluid Layout Architecture]
    <View style={styles.grid}>
      {/* TODO 3.4 [Card Content Loop Mapping] */}
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
          <PhotoCard photo={photo} />
        </View>
      ))}
      {/* End Loop */}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  empty: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 6,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyHint: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 240,
  },
  pressable: {
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
  },
  coverWrap: {
    height: 200,
    overflow: 'hidden',
  },
  cover: {
    height: 200,
    borderRadius: 0,
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  hoverPill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hoverPillText: {
    color: '#0F2326',
    fontWeight: '700',
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditText: {
    flex: 1,
  },
  creditLabel: {
    opacity: 0.8,
  },
  link: {
    fontWeight: '700',
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  skeletonCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 200,
  },
  skeletonLines: {
    padding: 14,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
});