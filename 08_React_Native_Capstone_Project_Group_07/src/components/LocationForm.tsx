import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, useTheme } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} 
from '@/services/geoPhotoService';
import { brand } from '@/theme';

type IslandFilter = 'all' | 'luzon' | 'visayas' | 'mindanao';

const islandOptions: { key: IslandFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'luzon', label: 'Luzon' },
  { key: 'visayas', label: 'Visayas' },
  { key: 'mindanao', label: 'Mindanao' },
];

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  const theme = useTheme();

  // TODO 2.1 [State Trackers]
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  // TODO 2.9 (a) [Island-Group Filter]: current filter, default 'all'
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');

  // Paper <Menu> visibility flags
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  // TODO 2.2 [Initial Data Populate]: load all regions once on mount
  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      const data = await getRegions();
      if (!cancelled) {
        setRegions(data);
      }
    };

    void loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  // TODO 2.3 [Reactive Cascading Refresh]: re-run whenever the selected region changes
  useEffect(() => {
    let cancelled = false;

    // b. Always clear the child selection (and the old list) so nothing stale leaks into the next search
    setSelectedCityName('');
    setCities([]);

    // a. Only fetch when a valid region code is selected
    if (!selectedRegion) {
      return;
    }

    const loadCities = async () => {
      const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
      // Ignore the response if the user already picked a different region (prevents race conditions)
      if (!cancelled) {
        setCities(data);
      }
    };

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  // TODO 2.9 (b) [Island-Group Filter]: derived list that the region menu maps over
  const filteredRegions = useMemo(() => {
    if (islandFilter === 'all') {
      return regions;
    }
    return regions.filter((region) => region.islandGroupCode === islandFilter);
  }, [regions, islandFilter]);

  // TODO 2.9 (d) SAFETY: if the selected region falls outside the filter, reset it so a hidden
  // selection can never trigger a search
  useEffect(() => {
    if (!selectedRegion) {
      return;
    }
    const stillVisible = filteredRegions.some((region) => region.code === selectedRegion);
    if (!stillVisible) {
      setSelectedRegion('');
      setSelectedCityName('');
    }
  }, [filteredRegions, selectedRegion]);

  // TODO 2.4 [Form Submit Bubble]: pass the selected city name up to the parent
  const handleSubmit = () => {
    const cityName = selectedCityName.trim();
    if (cityName) {
      onSearch(cityName);
    }
  };

  // Display labels derived from the current selections
  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';

  return (
    <View style={styles.form}>
      {/* Tricolor accent bar, like the header in the web version */}
      <View style={styles.tricolor}>
        <View style={[styles.stripe, { backgroundColor: brand.blue }]} />
        <View style={[styles.stripe, { backgroundColor: brand.yellow }]} />
        <View style={[styles.stripe, { backgroundColor: brand.red }]} />
      </View>

      {/* TODO 2.9 (c) [Island-Group Filter]: row of Paper <Chip> options */}
      <View style={styles.filterRow}>
        {islandOptions.map((option) => {
          const selected = islandFilter === option.key;
          return (
            <Chip
              key={option.key}
              selected={selected}
              style={[styles.chip, selected && { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => setIslandFilter(option.key)}
            >
              {option.label}
            </Chip>
          );
        })}
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
                style={styles.pill}
                onPress={() => setRegionMenuVisible(true)}
              >
                {selectedRegionLabel}
              </Button>
            }
          >
            {/* TODO 2.6 [Region Menu Map]: maps over the FILTERED list (TODO 2.9) */}
            {filteredRegions.map((region) => (
              <Menu.Item
                key={region.code}
                onPress={() => {
                  setSelectedRegion(region.code);
                  setRegionMenuVisible(false);
                }}
                title={region.name}
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
                style={styles.pill}
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
                onPress={() => {
                  setSelectedCityName(city.name);
                  setCityMenuVisible(false);
                }}
                title={city.name}
              />
            ))}
          </Menu>
        </View>

        <Button
          mode="contained"
          icon="magnify"
          disabled={!selectedCityName}
          contentStyle={styles.buttonContent}
          style={[styles.pill, styles.searchButton]}
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
  tricolor: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stripe: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
  },
  chip: {
    borderRadius: 999,
  },
  row: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  field: {
    width: '100%',
  },
  pill: {
    width: '100%',
    borderRadius: 999,
  },
  searchButton: {
    marginTop: 4,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
