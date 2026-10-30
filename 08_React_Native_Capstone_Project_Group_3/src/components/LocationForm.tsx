import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Chip, Menu, Text, useTheme } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';

type IslandFilter = 'all' | 'luzon' | 'visayas' | 'mindanao';

const ISLAND_OPTIONS: { value: IslandFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' },
  { value: 'mindanao', label: 'Mindanao' },
];

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  // TODO 2.1 [State Trackers]
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  // TODO 2.9 (a) island-group filter state
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');

  // Paper <Menu> visibility flags (scaffolded UI chrome — no TODO required)
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  useEffect(() => {
    // TODO 2.2 [Initial Data Populate]
    let cancelled = false;
    (async () => {
      try {
        const data = await getRegions();
        if (!cancelled) setRegions(data);
      } catch (error) {
        console.warn('Failed to load regions:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // TODO 2.3 [Reactive Cascading Refresh]
    let cancelled = false;

    // b. Always clear the previous city so stale selections never leak into the next search
    setSelectedCityName('');
    setCities([]);

    if (!selectedRegion) return;

    // a. Load the cities/municipalities for the newly selected region
    (async () => {
      try {
        const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
        if (!cancelled) setCities(data);
      } catch (error) {
        console.warn('Failed to load cities:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  // TODO 2.9 (b) filtered region list derived from regions + islandFilter
  const filteredRegions = useMemo(
    () =>
      islandFilter === 'all'
        ? regions
        : regions.filter((r) => r.islandGroupCode === islandFilter),
    [regions, islandFilter],
  );

  // TODO 2.9 (d) change the filter and clear any selection the new filter would hide
  const handleIslandFilterChange = (next: IslandFilter) => {
    setIslandFilter(next);
    if (!selectedRegion) return;
    const selected = regions.find((r) => r.code === selectedRegion);
    const stillVisible = next === 'all' || selected?.islandGroupCode === next;
    if (!stillVisible) {
      setSelectedRegion('');
      setSelectedCityName('');
    }
  };

  const handleSubmit = () => {
    // TODO 2.4 [Form Submit Bubble]
    if (selectedCityName) {
      onSearch(selectedCityName);
    }
  };

  // Display labels derived from the current selections (scaffolded)
  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';

  const menuContentStyle = { backgroundColor: theme.colors.surface, borderRadius: 14 };

  return (
    <View style={styles.form}>
      <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.onSurface }]}>
        Where to next?
      </Text>
      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Choose an island group, then a region and a city to find tourist spots.
      </Text>

      {/* TODO 2.9 (c) [Island-Group Filter] chips */}
      <View style={styles.filterRow}>
        {ISLAND_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={islandFilter === option.value}
            showSelectedCheck
            style={styles.chip}
            onPress={() => handleIslandFilterChange(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </View>

      <View style={[styles.row, isWide && styles.rowWide]}>
        <View style={[styles.field, isWide && styles.fieldWide]}>
          <Menu
            visible={regionMenuVisible}
            onDismiss={() => setRegionMenuVisible(false)}
            anchorPosition="bottom"
            contentStyle={menuContentStyle}
            anchor={
              <Button
                mode="outlined"
                icon="map-marker-outline"
                contentStyle={styles.buttonContent}
                style={styles.button}
                onPress={() => setRegionMenuVisible(true)}
              >
                {selectedRegionLabel}
              </Button>
            }
          >
            {/* TODO 2.6 [Region Menu Map] — maps the filtered list (see TODO 2.9) */}
            {filteredRegions.map((region) => (
              <Menu.Item
                key={region.code}
                title={region.name}
                onPress={() => {
                  setSelectedRegion(region.code);
                  setRegionMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        <View style={[styles.field, isWide && styles.fieldWide]}>
          <Menu
            visible={cityMenuVisible}
            onDismiss={() => setCityMenuVisible(false)}
            anchorPosition="bottom"
            contentStyle={menuContentStyle}
            anchor={
              <Button
                mode="outlined"
                icon="city-variant-outline"
                disabled={!selectedRegion}
                contentStyle={styles.buttonContent}
                style={styles.button}
                onPress={() => setCityMenuVisible(true)}
              >
                {selectedCityLabel}
              </Button>
            }
          >
            {/* TODO 2.8 [City Menu Map] */}
            {cities.map((city) => (
              <Menu.Item
                key={city.code}
                title={city.name}
                onPress={() => {
                  setSelectedCityName(city.name);
                  setCityMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        <Button
          mode="contained"
          icon="magnify"
          disabled={!selectedCityName}
          contentStyle={styles.buttonContent}
          labelStyle={styles.searchLabel}
          style={[styles.searchButton, isWide && styles.searchButtonWide]}
          onPress={handleSubmit}
        >
          Search
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  heading: {
    fontWeight: '700',
  },
  hint: {
    marginTop: 2,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 20,
  },
  row: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  rowWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    width: '100%',
  },
  fieldWide: {
    flex: 1,
    width: 'auto',
  },
  button: {
    width: '100%',
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  searchButton: {
    width: '100%',
    borderRadius: 16,
  },
  searchButtonWide: {
    width: 'auto',
    minWidth: 150,
  },
  searchLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
});