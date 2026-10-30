import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LakbayHeader, { IslandGroup } from '@/components/LakbayHeader';
import {
  City,
  Region,
  getCitiesMunicipalitiesByRegion,
  getRegions,
  searchPhotosByLocation,
} from '@/services/geoPhotoService';
import { usePhotos } from '@/photos';
import { useSearchHistory } from '@/searchHistory';

type Photo = ReturnType<typeof usePhotos>['photos'][number];

const POPULAR = [
  'Boracay',
  'El Nido',
  'Siargao',
  'Banaue',
  'Vigan',
  'Cebu',
  'Bohol Chocolate Hills',
  'Baguio',
  'Mayon Volcano',
  'Coron',
  'Camiguin',
  'Sagada',
];

/** Horizontally scrollable row of tappable chips */
function ChipRow({
  label,
  icon,
  items,
  onPress,
}: {
  label: string;
  icon: string;
  items: string[];
  onPress: (term: string) => void;
}) {
  const theme = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.chipSection}>
      <View style={styles.chipLabelRow}>
        <MaterialCommunityIcons name={icon as any} size={16} color={theme.colors.onSurfaceVariant} />
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        {items.map((term) => (
          <TouchableRipple
            key={term}
            onPress={() => onPress(term)}
            borderless
            style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
          >
            <Text style={{ color: theme.colors.onSecondaryContainer, fontWeight: '600' }}>{term}</Text>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}

export default function SearchScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const columns = width >= 760 ? 3 : 2;

  const { q } = useLocalSearchParams<{ q?: string }>();

  const [group, setGroup] = useState<IslandGroup>('all');
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // What was last searched (used by pull-to-refresh and "Try again")
  const [lastTerm, setLastTerm] = useState('');

  // Favorites (kept for this session) + filter toggle
  const [favorites, setFavorites] = useState<Photo[]>([]);
  const [showFavs, setShowFavs] = useState(false);

  // Scroll state: back-to-top button
  const listRef = useRef<FlatList<Photo>>(null);
  const [showTop, setShowTop] = useState(false);

  // Photos for the two polaroids in the header (day + night versions)
  const [polaroids, setPolaroids] = useState<{
    left?: { uri: string };
    right?: { uri: string };
    leftDark?: { uri: string };
    rightDark?: { uri: string };
  }>({});

  const { photos, setPhotos } = usePhotos();
  const { recordSearch } = useSearchHistory();

  useEffect(() => {
    getRegions().then(setRegions);

    const first = async (term: string) => {
      try {
        const res = await searchPhotosByLocation(term);
        return res[0] ? { uri: res[0].imageUrl } : undefined;
      } catch {
        return undefined;
      }
    };

    Promise.all([
      first('El Nido Palawan'),
      first('Boracay'),
      first('Vigan night'), // night photo for the left polaroid
      first('Manila Bay night'), // night photo for the right polaroid
    ]).then(([left, right, leftDark, rightDark]) => {
      setPolaroids({ left, right, leftDark, rightDark });
    });
  }, []);

  const visibleRegions = useMemo(
    () => (group === 'all' ? regions : regions.filter((r) => r.islandGroupCode === group)),
    [regions, group]
  );

  const favoriteIds = useMemo(() => new Set(favorites.map((p) => String(p.id))), [favorites]);

  const handleChangeGroup = (next: IslandGroup) => {
    setGroup(next);
    if (selectedRegion && next !== 'all' && selectedRegion.islandGroupCode !== next) {
      setSelectedRegion(null);
      setSelectedCity(null);
      setCities([]);
    }
  };

  const handleSelectRegion = async (region: Region) => {
    setSelectedRegion(region);
    setSelectedCity(null);
    setCities([]);
    setCitiesLoading(true);
    try {
      const result = await getCitiesMunicipalitiesByRegion(region.code);
      setCities([...result].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setLastTerm(trimmed);
    setShowFavs(false);
    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const results = await searchPhotosByLocation(trimmed);
      setPhotos(results);
      if (results.length > 0) {
        recordSearch(trimmed);
      }
    } catch {
      setError('Could not load photos. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    runSearch(city.name);
  };

  const toggleFavorite = (photo: Photo) => {
    setFavorites((prev) =>
      prev.some((p) => String(p.id) === String(photo.id))
        ? prev.filter((p) => String(p.id) !== String(photo.id))
        : [photo, ...prev]
    );
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowTop(y > 800);
  };

  useEffect(() => {
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const gap = 12;
  const cardWidth = (Math.min(width, 960) - 32 - gap * (columns - 1)) / columns;
  const data: Photo[] = showFavs ? favorites : photos;

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={[styles.skeletonWrap, { gap, maxWidth: 960 }]}>
          {Array.from({ length: columns * 2 }).map((_, i) => (
            <View key={i} style={[styles.card, { width: cardWidth, backgroundColor: theme.colors.surface }]}>
              <View style={[styles.image, { backgroundColor: theme.colors.surfaceVariant }]} />
              <View style={[styles.skeletonLine, { backgroundColor: theme.colors.surfaceVariant }]} />
            </View>
          ))}
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="wifi-off" size={40} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={[styles.stateText, { color: theme.colors.onSurfaceVariant }]}>
            {error}
          </Text>
          <TouchableRipple
            onPress={() => runSearch(lastTerm)}
            borderless
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>Try again</Text>
          </TouchableRipple>
        </View>
      );
    }
    if (showFavs) {
      return (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="heart-outline" size={40} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={[styles.stateText, { color: theme.colors.onSurfaceVariant }]}>
            No favorites yet. Tap the heart on a photo to save it here.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <MaterialCommunityIcons name="compass-outline" size={40} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodyMedium" style={[styles.stateText, { color: theme.colors.onSurfaceVariant }]}>
          {searched
            ? 'No tourist spots found. Try another city or municipality.'
            : 'Pick a popular destination, or choose a region and city to see its tourist spots.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        ref={listRef}
        key={columns}
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={columns}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        columnWrapperStyle={{ gap, paddingHorizontal: 16, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading && photos.length > 0}
            onRefresh={() => (lastTerm ? runSearch(lastTerm) : undefined)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <LakbayHeader
              group={group}
              onChangeGroup={handleChangeGroup}
              regions={visibleRegions}
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              cities={cities}
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
              citiesLoading={citiesLoading}
              polaroidLeft={polaroids.left}
              polaroidRight={polaroids.right}
              polaroidLeftDark={polaroids.leftDark}
              polaroidRightDark={polaroids.rightDark}
            />

            <View style={styles.searchArea}>
              <ChipRow label="Popular destinations" icon="fire" items={POPULAR} onPress={runSearch} />

              {/* Results toolbar */}
              <View style={styles.toolbar}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
                  {showFavs
                    ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`
                    : lastTerm && !loading && !error
                      ? `${photos.length} photo${photos.length === 1 ? '' : 's'} for "${lastTerm}"`
                      : ''}
                </Text>
                <TouchableRipple
                  onPress={() => setShowFavs((v) => !v)}
                  borderless
                  accessibilityRole="button"
                  accessibilityState={{ selected: showFavs }}
                  style={[
                    styles.favToggle,
                    { backgroundColor: showFavs ? theme.colors.primary : theme.colors.secondaryContainer },
                  ]}
                >
                  <View style={styles.favToggleInner}>
                    <MaterialCommunityIcons
                      name={showFavs ? 'heart' : 'heart-outline'}
                      size={16}
                      color={showFavs ? theme.colors.onPrimary : theme.colors.onSecondaryContainer}
                    />
                    <Text
                      style={{
                        color: showFavs ? theme.colors.onPrimary : theme.colors.onSecondaryContainer,
                        fontWeight: '700',
                      }}
                    >
                      Favorites ({favorites.length})
                    </Text>
                  </View>
                </TouchableRipple>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const fav = favoriteIds.has(String(item.id));
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/photo/[id]', params: { id: String(item.id) } })}
              style={[styles.card, { width: cardWidth, backgroundColor: theme.colors.surface }]}
            >
              <View>
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" accessibilityLabel={item.altText} />
                <Pressable
                  onPress={() => toggleFavorite(item)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
                  style={styles.heartBtn}
                >
                  <MaterialCommunityIcons
                    name={fav ? 'heart' : 'heart-outline'}
                    size={20}
                    color={fav ? '#E5484D' : '#FFFFFF'}
                  />
                </Pressable>
              </View>
              <Text variant="labelSmall" numberOfLines={1} style={[styles.credit, { color: theme.colors.onSurfaceVariant }]}>
                Photo by {item.photographer}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={renderEmpty()}
      />

      {/* Back to top */}
      {showTop && (
        <TouchableRipple
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
          borderless
          accessibilityRole="button"
          accessibilityLabel="Back to top"
          style={[styles.topBtn, { backgroundColor: theme.colors.primary }]}
        >
          <MaterialCommunityIcons name="chevron-up" size={26} color={theme.colors.onPrimary} />
        </TouchableRipple>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 96, gap: 12 },
  header: { marginBottom: 8 },
  searchArea: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  chipSection: { marginTop: 14 },
  chipLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  chipScroll: { gap: 8, paddingRight: 16 },
  chip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  favToggle: { borderRadius: 999 },
  favToggleInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: '100%', aspectRatio: 4 / 3 },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credit: { padding: 8 },
  skeletonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  skeletonLine: { height: 10, borderRadius: 5, margin: 10, width: '60%' },
  stateBox: { alignItems: 'center', marginTop: 32, paddingHorizontal: 24, gap: 12 },
  stateText: { textAlign: 'center' },
  retryBtn: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 10 },
  topBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});