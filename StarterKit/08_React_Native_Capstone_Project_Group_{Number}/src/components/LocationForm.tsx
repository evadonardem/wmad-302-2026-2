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

const ISLAND_OPTIONS: { value: IslandFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' },
  { value: 'mindanao', label: 'Mindanao' },
];

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  // 2.1 State trackers
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  // 2.9 Island-group filter state
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');

  // Paper <Menu> visibility flags (scaffolded UI chrome)
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  // 2.2 Initial data populate
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getRegions();
        if (!cancelled) setRegions(result);
      } catch (err) {
        console.error('Failed to load regions', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2.3 Reactive cascading refresh
  useEffect(() => {
    let cancelled = false;

    const refreshCities = async () => {
      setSelectedCityName('');

      if (!selectedRegion) {
        if (!cancelled) setCities([]);
        return;
      }

      try {
        const result = await getCitiesMunicipalitiesByRegion(selectedRegion);
        if (!cancelled) setCities(result);
      } catch (err) {
        console.error('Failed to load cities', err);
        if (!cancelled) setCities([]);
      }
    };

    void refreshCities();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  // 2.9 Derived filtered region list
  const filteredRegions = useMemo(
    () =>
      islandFilter === 'all'
        ? regions
        : regions.filter((r) => r.islandGroupCode === islandFilter),
    [regions, islandFilter],
  );

  const handleIslandFilterChange = (next: IslandFilter) => {
    setIslandFilter(next);

    // SAFETY: drop a selection that would be hidden by the new filter
    if (selectedRegion) {
      const stillVisible = regions.some(
        (r) =>
          r.code === selectedRegion &&
          (next === 'all' || r.islandGroupCode === next),
      );
      if (!stillVisible) {
        setSelectedRegion('');
        setSelectedCityName('');
      }
    }
  };

  // 2.4 Form submit bubble
  const handleSubmit = () => {
    onSearch(selectedCityName);
  };

  // Display labels derived from the current selections (scaffolded)
  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';

  return (
    <View style={styles.form}>
      <View style={styles.filterRow}>
        {ISLAND_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={islandFilter === opt.value}
            showSelectedOverlay
            onPress={() => handleIslandFilterChange(opt.value)}
          >
            {opt.label}
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
            {/* 2.6 Region menu map (uses the filtered list) */}
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
            {/* 2.8 City menu map */}
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
