import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
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
    const result = await getCitiesMunicipalitiesByRegion(region.code);
    setCities([...result].sort((a, b) => a.name.localeCompare(b.name)));
    setCitiesLoading(false);
  };

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    const results = await searchPhotosByLocation(trimmed);
    setPhotos(results);
    setLoading(false);

    if (results.length > 0) recordSearch(trimmed);
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    runSearch(city.name);
  };

  useEffect(() => {
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const gap = 12;
  const cardWidth = (Math.min(width, 960) - 32 - gap * (columns - 1)) / columns;

  return (
    <FlatList
      key={columns}
      data={photos}
      keyExtractor={(item) => String(item.id)}
      numColumns={columns}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      columnWrapperStyle={{ gap, paddingHorizontal: 16, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
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
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/photo/[id]', params: { id: String(item.id) } })}
          style={[styles.card, { width: cardWidth, backgroundColor: theme.colors.surface }]}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" accessibilityLabel={item.altText} />
          <Text variant="labelSmall" numberOfLines={1} style={[styles.credit, { color: theme.colors.onSurfaceVariant }]}>
            Photo by {item.photographer}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.state} />
        ) : (
          <Text variant="bodyMedium" style={[styles.state, { color: theme.colors.onSurfaceVariant }]}>
            {searched
              ? 'No tourist spots found. Try another city or municipality.'
              : 'Search a region, then a city or municipality, to see its tourist spots.'}
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, gap: 12 },
  header: { marginBottom: 8 },
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
  credit: { padding: 8 },
  state: { textAlign: 'center', marginTop: 32, paddingHorizontal: 24 },
});