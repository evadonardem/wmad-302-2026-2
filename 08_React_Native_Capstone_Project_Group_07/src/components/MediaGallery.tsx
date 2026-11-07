import type { Photo } from '@/services/geoPhotoService';
import { brand, fontFamily, glass, radius, shadow } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

function PhotoCard({ photo, index }: { photo: Photo; index: number }) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Active if hovered (web) or actively pressed/held (mobile)
  const isActive = isHovered || isPressed;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(600)}
      style={styles.gridItem}
    >
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[
          styles.pressableContainer,
          isActive && styles.hoveredScale,
        ]}
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
        <Card
          mode="elevated"
          style={[
            styles.card,
            isActive ? shadow.lift : shadow.soft,
            { borderColor: isActive ? theme.colors.primary : glass.border },
          ]}
        >
          <Card.Cover
            source={{ uri: photo.imageUrl }}
            accessibilityLabel={photo.altText}
            style={[styles.cover, isActive && styles.coverHovered]}
          />

          <Card.Content style={styles.cardContent}>
            <Text variant="labelSmall" style={styles.creditLabel}>
              📸 Captured by:
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation(); // Prevent opening card modal when clicking author pill
                WebBrowser.openBrowserAsync(photo.photographerUrl);
              }}
              style={styles.creditPill}
            >
              <Text variant="bodyMedium" style={[styles.photographerName, { color: theme.colors.primary }]}>
                {photo.photographer}
              </Text>
            </Pressable>
          </Card.Content>

          {/* Wider accent line featuring blue, red, and yellow colors on hover (web) or active touch (mobile) */}
          {isActive && (
            <LinearGradient
              colors={[brand.blue, brand.red, brand.yellow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.hoverBar}
            />
          )}
        </Card>
      </Pressable>
    </Animated.View>
  );
}

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
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  pressableContainer: {
    borderRadius: radius.card,
    transition: 'transform 0.4s ease-in-out',
  } as any,
  hoveredScale: {
    transform: [{ scale: 1.03 }],
  },
  card: {
    width: '100%',
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    transition: 'box-shadow 0.4s ease-in-out, border-color 0.4s ease-in-out',
  } as any,
  cover: {
    borderRadius: 0,
    height: 200,
  },
  coverHovered: {
    opacity: 0.95,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 6,
  },
  creditLabel: {
    opacity: 0.7,
  },
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
  hoverBar: {
    height: 5, // Increased height from 3 to 5 for a more noticeable accent line
    width: '100%',
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyWrap: {
    alignItems: 'center',
  },
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