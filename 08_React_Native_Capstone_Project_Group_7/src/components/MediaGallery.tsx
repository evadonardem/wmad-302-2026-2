import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { Photo } from '@/services/geoPhotoService';

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
      <View style={[styles.emptyState, { borderColor: theme.colors.outline }]}>
        <Text variant="bodyMedium">No tourist spots found for this area yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.id} style={styles.gridItem}>
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
            <Card mode="elevated" style={styles.card}>
              <Card.Cover source={{ uri: photo.imageUrl }} accessibilityLabel={photo.altText} />

              <Card.Content style={styles.cardContent}>
                <Text variant="labelSmall" style={styles.creditLabel}>
                  📸 Captured by:
                </Text>
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(photo.photographerUrl)}
                  style={[styles.creditPill, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Text
                    variant="bodyMedium"
                    style={[styles.photographerName, { color: theme.colors.onPrimaryContainer }]}
                  >
                    {photo.photographer}
                  </Text>
                </Pressable>
              </Card.Content>
            </Card>
          </Pressable>
        </View>
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
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  photographerName: {
    fontWeight: '600',
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyState: {
    paddingVertical: 22,
    paddingHorizontal: 34,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
  },
});