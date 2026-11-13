import type { Photo } from '@/services/geoPhotoService';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Text, useTheme } from 'react-native-paper';

type Props = {
  photos: Photo[];
  loading: boolean;
  title?: string;
  emptyMessage?: string;
  favorites?: Photo[];
  onToggleFavorite?: (photo: Photo) => void;
};

// Fade + slide up entrance, staggered by index
function FadeInUp({ index, children }: { index: number; children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      delay: index * 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [progress, index]);

  return (
    <Animated.View
      style={[
        styles.gridItem,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function MediaGallery({
  photos,
  loading,
  title,
  emptyMessage = 'No tourist spots found for this area yet.',
  favorites = [],
  onToggleFavorite,
}: Props) {
  const theme = useTheme();
  const isFavorite = (photo: Photo) => favorites.some((f) => f.id === photo.id);

  // TODO 3.1 [Loading Skeletal Feedbacks]
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
          Finding tourist spots...
        </Text>
      </View>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="displaySmall">🧭</Text>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {title ? (
        <View style={styles.headingRow}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
            {title}
          </Text>
          <View style={[styles.countPill, { backgroundColor: theme.colors.primary }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onPrimary }}>
              {photos.length} photos
            </Text>
          </View>
        </View>
      ) : null}

      {/* TODO 3.3 [Fluid Layout Architecture] */}
      <View style={styles.grid}>
        {/* TODO 3.4 [Card Content Loop Mapping] */}
        {photos.map((photo, index) => (
          <FadeInUp key={photo.id} index={index}>
            {/* TODO 4.3 [Detail Navigation Trigger] */}
            <Pressable
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
              <Card style={styles.card} elevation={4}>
                {/* TODO 3.5 [Multimedia Presentation Layer] */}
                <View>
                  <Card.Cover source={{ uri: photo.imageUrl }} accessibilityLabel={photo.altText} />
                  {onToggleFavorite && (
                    <IconButton
                      icon={isFavorite(photo) ? 'heart' : 'heart-outline'}
                      iconColor={isFavorite(photo) ? '#ff4d6d' : '#fff'}
                      containerColor="rgba(0,0,0,0.45)"
                      size={22}
                      style={styles.heart}
                      onPress={() => onToggleFavorite(photo)}
                      accessibilityLabel={
                        isFavorite(photo) ? 'Remove from favorites' : 'Add to favorites'
                      }
                    />
                  )}
                </View>

                <Card.Content style={styles.cardContent}>
                  <Text variant="labelSmall" style={styles.creditLabel}>
                    📸 Captured by:
                  </Text>
                  {/* TODO 3.6 [Attribution Links] */}
                  <Pressable onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: theme.colors.primary,
                        textDecorationLine: 'underline',
                        fontWeight: '600',
                      }}
                    >
                      {photo.photographer}
                    </Text>
                  </Pressable>
                </Card.Content>
              </Card>
            </Pressable>
          </FadeInUp>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
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
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
  },
  heart: {
    position: 'absolute',
    top: 6,
    right: 6,
    margin: 0,
  },
  cardContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  creditLabel: {
    opacity: 0.7,
  },
});