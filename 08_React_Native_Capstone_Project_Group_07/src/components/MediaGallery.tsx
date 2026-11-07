import type { Photo } from '@/services/geoPhotoService';
import { fontFamily, glass, radius, shadow } from '@/theme';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function MediaGallery({ photos, loading }: { photos: Photo[]; loading: boolean }) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium">Loading tourist spots…</Text>
      </View>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyState}>
          <Text variant="bodyMedium">No tourist spots found for this area yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        // Cards fade up one after another (the fadeUp stagger from the web version)
        <Animated.View
          key={photo.id}
          entering={FadeInUp.delay(index * 50).duration(600)}
          style={styles.gridItem}
        >
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
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
            <Card mode="elevated" style={[styles.card, shadow.soft]}>
              <Card.Cover
                source={{ uri: photo.imageUrl }}
                accessibilityLabel={photo.altText}
                style={styles.cover}
              />

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  📸 Captured by:
                </Text>
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}
                  style={styles.creditPill}
                >
                  <Text variant="bodyMedium" style={[styles.photographerName, { color: theme.colors.primary }]}>
                    {photo.photographer}
                  </Text>
                </Pressable>
              </Card.Content>
            </Card>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 240,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  card: {
    width: '100%',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
  },
  cover: {
    borderRadius: 0,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 6,
  },
  creditLabel: {
    opacity: 0.7,
  },
  // Photographer link as a small pill (same tint as the web .MuiLink-root pill)
  creditPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(47,107,255,0.4)',
    backgroundColor: 'rgba(47,107,255,0.1)',
  },
  photographerName: {
    fontFamily: fontFamily.semiBold,
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyWrap: {
    alignItems: 'center',
  },
  // Dashed glass box for the empty message (.MuiBox-root > h6 in the web version)
  emptyState: {
    paddingVertical: 22,
    paddingHorizontal: 34,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: glass.borderDashed,
    borderRadius: radius.card,
    backgroundColor: glass.fill,
  },
});
