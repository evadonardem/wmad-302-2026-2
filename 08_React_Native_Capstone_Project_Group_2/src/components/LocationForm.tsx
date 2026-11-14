import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';
import { useBreakpoint } from '@/useBreakpoint';

type IslandFilter = 'all' | 'luzon' | 'visayas' | 'mindanao';

const ISLAND_FILTERS: { value: IslandFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' },
  { value: 'mindanao', label: 'Mindanao' },
];

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  // Phones stack the search bar; tablets and up lay it out in a single row.
  const { isPhone } = useBreakpoint();
  const wide = !isPhone;

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
  // Sorted A–Z so the region names appear in alphabetical order.
  const filteredRegions = useMemo(
    () =>
      [...(islandFilter === 'all' ? regions : regions.filter((r) => r.islandGroupCode === islandFilter))].sort(
        (a, b) => a.name.localeCompare(b.name),
      ),
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
        {ISLAND_FILTERS.map((filter) => {
          const active = islandFilter === filter.value;
          return (
            <Chip
              key={filter.value}
              selected={active}
              showSelectedOverlay
              onPress={() => handleFilterChange(filter.value)}
              style={[styles.chip, active && styles.chipActive]}
              textStyle={[styles.chipText, active && styles.chipTextActive]}
              selectedColor={active ? '#0b2545' : '#ffffff'}
            >
              {filter.label}
            </Chip>
          );
        })}
      </View>

      {/* White search bar floating on the hero */}
      <View style={[styles.row, wide && styles.rowWide]}>
        <View style={[styles.field, wide && styles.fieldWide]}>
          <Menu
            visible={regionMenuVisible}
            onDismiss={() => setRegionMenuVisible(false)}
            contentStyle={styles.menu}
            anchor={
              <Button
                mode="outlined"
                icon="menu-down"
                textColor="#0b2545"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
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

        <View style={[styles.divider, wide && styles.dividerWide]} />

        <View style={[styles.field, wide && styles.fieldWide]}>
          <Menu
            visible={cityMenuVisible}
            onDismiss={() => setCityMenuVisible(false)}
            contentStyle={styles.menu}
            anchor={
              <Button
                mode="outlined"
                icon="menu-down"
                disabled={!selectedRegion}
                textColor="#0b2545"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
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
          buttonColor="#0e7c86"
          textColor="#ffffff"
          contentStyle={styles.buttonContent}
          labelStyle={styles.searchLabel}
          style={[styles.searchButton, wide && styles.searchButtonWide]}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'flex-start',
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 99,
    borderWidth: 0,
  },
  chipActive: {
    backgroundColor: '#ffffff',
  },
  chipText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#0b2545',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'stretch',
    maxWidth: 640,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  rowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 920,
  },
  field: {
    width: '100%',
  },
  fieldWide: {
    flex: 1,
    width: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e3e8ee',
    marginHorizontal: 12,
  },
  dividerWide: {
    width: 1,
    height: 28,
    marginHorizontal: 0,
  },
  menu: {
    borderRadius: 12,
  },
  button: {
    width: '100%',
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  buttonContent: {
    height: 44,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  searchButton: {
    width: '100%',
    borderRadius: 10,
  },
  searchButtonWide: {
    width: 'auto',
    paddingHorizontal: 12,
  },
  searchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});