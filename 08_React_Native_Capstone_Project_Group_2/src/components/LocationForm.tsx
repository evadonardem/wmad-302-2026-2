import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';

type IslandFilter = 'all' | 'luzon' | 'visayas' | 'mindanao';

const ISLAND_FILTERS: { value: IslandFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' },
  { value: 'mindanao', label: 'Mindanao' },
];

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  // TODO 2.1 [State Trackers]
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  // TODO 2.9 [Island-Group Filter]: current chip selection
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');

  // Paper <Menu> visibility flags (scaffolded UI chrome — no TODO required)
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  useEffect(() => {
    // TODO 2.2 [Initial Data Populate]
    let cancelled = false;

    const loadRegions = async () => {
      const data = await getRegions();
      if (!cancelled) setRegions(data);
    };
    loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // TODO 2.3 [Reactive Cascading Refresh]
    // The `cancelled` flag stops a slow response for a previous region from overwriting the
    // cities of the region the user picked afterwards (no race conditions / state pollution).
    let cancelled = false;

    const loadCities = async () => {
      // b. Always clear the child selection (and stale list) when the parent region changes
      setSelectedCityName('');
      setCities([]);

      // a. Only fetch when a valid region code is selected
      if (!selectedRegion) return;

      const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
      if (!cancelled) {
        setCities([...data].sort((a, b) => a.name.localeCompare(b.name)));
      }
    };
    loadCities();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  // TODO 2.9 b: filtered region list (the region menu maps over THIS, not the raw array)
  const filteredRegions = useMemo(
    () => (islandFilter === 'all' ? regions : regions.filter((r) => r.islandGroupCode === islandFilter)),
    [regions, islandFilter],
  );

  const handleFilterChange = (next: IslandFilter) => {
    setIslandFilter(next);

    // TODO 2.9 d [Safety]: if the selected region falls outside the new filter, reset both
    // selections so a hidden region can never trigger a search.
    if (selectedRegion && next !== 'all') {
      const current = regions.find((r) => r.code === selectedRegion);
      if (current?.islandGroupCode !== next) {
        setSelectedRegion('');
        setSelectedCityName('');
      }
    }
  };

  const handleSubmit = () => {
    // TODO 2.4 [Form Submit Bubble]
    if (selectedCityName) onSearch(selectedCityName);
  };

  // Display labels derived from the current selections (scaffolded)
  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';

  return (
    <View style={styles.form}>
      {/* TODO 2.9 c: island-group chips */}
      <View style={styles.filterRow}>
        {ISLAND_FILTERS.map((filter) => (
          <Chip
            key={filter.value}
            selected={islandFilter === filter.value}
            showSelectedOverlay
            onPress={() => handleFilterChange(filter.value)}
          >
            {filter.label}
          </Chip>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <Menu
            visible={regionMenuVisible}
            onDismiss={() => setRegionMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="menu-down"
                contentStyle={styles.buttonContent}
                style={styles.button}
                onPress={() => setRegionMenuVisible(true)}
              >
                {selectedRegionLabel}
              </Button>
            }
          >
            {/* TODO 2.6 [Region Menu Map] */}
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

        <View style={styles.field}>
          <Menu
            visible={cityMenuVisible}
            onDismiss={() => setCityMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="menu-down"
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
          style={styles.searchButton}
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
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  field: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 6,
  },
  searchButton: {
    width: '100%',
  },
});
