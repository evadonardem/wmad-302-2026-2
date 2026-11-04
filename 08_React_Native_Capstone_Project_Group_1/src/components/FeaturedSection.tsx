import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Text, useTheme } from 'react-native-paper';
import { FEATURED_CATEGORIES, type FeaturedPlace } from '@/data/featuredPlaces';
import { getPlaceCoverPhoto, type Photo } from '@/services/geoPhotoService';

// One card of the start screen. It loads its own cover photo. If Pexels has no photo that
// mentions the place, the card shows no picture instead of a photo of another place.
function PlaceCard({ place, onPick }: { place: FeaturedPlace; onPick: (name: string) => void }) {
  const theme = useTheme();
  const [state, setState] = useState<{ name: string; photo: Photo | null } | null>(null);

  useEffect(() => {
    let active = true;
    getPlaceCoverPhoto(place.name).then((photo) => {
      if (active) setState({ name: place.name, photo });
    });
    return () => {
      active = false;
    };
  }, [place.name]);

  const loaded = state?.name === place.name;
  const photo = loaded ? state.photo : null;

  return (
    <Pressable style={styles.cell} onPress={() => onPick(place.name)}>
      <Card elevation={2} style={styles.card}>
        {photo ? (
          <Card.Cover source={{ uri: photo.thumbUrl ?? photo.imageUrl }} accessibilityLabel={photo.altText} />
        ) : (
          <View style={[styles.noPhoto, { backgroundColor: theme.colors.surfaceVariant }]}>
            {loaded ? (
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No photo yet
              </Text>
            ) : (
              <ActivityIndicator animating />
            )}
          </View>
        )}
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {place.name}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            📍 {place.location}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {place.description}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

// Start screen: Featured / Most Beautiful / Most Visited places. Tapping a card searches that place.
export default function FeaturedSection({ onPick }: { onPick: (name: string) => void }) {
  const theme = useTheme();
  const [activeKey, setActiveKey] = useState(FEATURED_CATEGORIES[0].key);
  const active = FEATURED_CATEGORIES.find((c) => c.key === activeKey) ?? FEATURED_CATEGORIES[0];

  // Speed: a moment after the start screen opens, the pictures of the other tabs are loaded quietly
  // one by one, so switching tabs is instant. They are saved on the device, so this happens once.
  useEffect(() => {
    let cancelled = false;
    const warmUp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      for (const category of FEATURED_CATEGORIES) {
        for (const place of category.places) {
          if (cancelled) return;
          await getPlaceCoverPhoto(place.name);
        }
      }
    };
    warmUp();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View>
      <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.secondary }]}>
        🕯️ Places to explore this Undas
      </Text>
      <View style={styles.tabRow}>
        {FEATURED_CATEGORIES.map((category) => (
          <Chip
            key={category.key}
            selected={activeKey === category.key}
            showSelectedOverlay
            onPress={() => setActiveKey(category.key)}
          >
            {category.label}
          </Chip>
        ))}
      </View>

      <View style={styles.grid}>
        {active.places.map((place) => (
          <PlaceCard key={place.name} place={place} onPick={onPick} />
        ))}
      </View>

      <Text variant="labelSmall" style={[styles.source, { color: theme.colors.outline }]}>
        Source: {active.source}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  cell: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 240,
  },
  card: {
    width: '100%',
    overflow: 'hidden',
  },
  noPhoto: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingVertical: 12,
    gap: 4,
  },
  source: {
    marginTop: 16,
    textAlign: 'center',
  },
});