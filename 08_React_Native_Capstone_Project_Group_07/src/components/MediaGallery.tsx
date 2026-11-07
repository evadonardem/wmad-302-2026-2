import type { Photo } from '@/services/geoPhotoService';
import { brand, fontFamily, glass, radius, shadow } from '@/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 750 }),
        withTiming(0.3, { duration: 750 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.gridItem}>
      <Card mode="elevated" style={[styles.card, { borderColor: glass.border }]}>
        <Animated.View style={[styles.skeletonCover, animatedStyle]} />
        <Card.Content style={styles.cardContent}>
          <Animated.View style={[styles.skeletonTextSmall, animatedStyle]} />
          <Animated.View style={[styles.skeletonPill, animatedStyle]} />
        </Card.Content>
      </Card>
    </View>
  );
}

function PhotoCard({
  photo,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  photo: Photo;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (photo: Photo) => void;
}) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isActive = isHovered || isPressed;

  const handlePressIn = () => {
    setIsPressed(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    void Haptics.notificationAsync(
      isFavorite
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    onToggleFavorite(photo);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(500)} style={styles.gridItem}>
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={() => setIsPressed(false)}
        style={[styles.pressableContainer, isActive && styles.hoveredScale]}
        onPress={() =>
          router.push({
            pathname: '/photo/[id]',
            params: {
              id: String(photo.id),
              imageUrl: photo.imageUrl,
              photographer: photo.photographer,
              photographerUrl: photo.photographerUrl,
              altText: photo.altText,
              locationName: photo.altText,
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
          <View style={styles.coverWrapper}>
            <Card.Cover
              source={{ uri: photo.imageUrl }}
              accessibilityLabel={photo.altText}
              style={[styles.cover, isActive && styles.coverHovered]}
            />

            {photo.altText ? (
              <View style={styles.locationTag}>
                <Text numberOfLines={1} style={styles.locationTagText}>
                  📍 {photo.altText}
                </Text>
              </View>
            ) : null}

            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              iconColor={isFavorite ? brand.red : '#ffffff'}
              containerColor="rgba(0, 0, 0, 0.45)"
              size={20}
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            />
          </View>

          <Card.Content style={styles.cardContent}>
            <Text variant="labelSmall" style={styles.creditLabel}>
              📸 Captured by:
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                void Haptics.selectionAsync();
                WebBrowser.openBrowserAsync(photo.photographerUrl);
              }}
              style={styles.creditPill}
            >
              <Text variant="bodyMedium" style={[styles.photographerName, { color: theme.colors.primary }]}>
                {photo.photographer}
              </Text>
            </Pressable>
          </Card.Content>

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
  const [favoriteIds, setFavoriteIds] = useState<Set<string | number>>(new Set());

  const handleToggleFavorite = (photo: Photo) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
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
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          isFavorite={favoriteIds.has(photo.id)}
          onToggleFavorite={handleToggleFavorite}
        />
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
  coverWrapper: {
    position: 'relative',
    width: '100%',
  },
  cover: {
    borderRadius: 0,
    height: 200,
  },
  coverHovered: {
    opacity: 0.95,
  },
  locationTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: '80%',
  },
  locationTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    margin: 0,
    zIndex: 10,
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
    height: 5,
    width: '100%',
  },
  emptyWrap: {
    alignItems: 'center',
    width: '100%',
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
  skeletonCover: {
    height: 200,
    backgroundColor: '#e1e9ee',
  },
  skeletonTextSmall: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e1e9ee',
  },
  skeletonPill: {
    width: '65%',
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1e9ee',
    marginTop: 4,
  },
});