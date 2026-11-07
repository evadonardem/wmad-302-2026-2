import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Chip, Menu, useTheme } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByProvince,
  getCitiesMunicipalitiesByRegion,
  getProvincesByRegion,
  getRegions,
  type City,
  type Province,
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

  // TODO 2.1 [State Trackers] (+ province step: Region > Province > City/Municipality)
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // TODO 2.9 (a) island-group filter state
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');

  // Paper <Menu> visibility flags (scaffolded UI chrome — no TODO required)
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [provinceMenuVisible, setProvinceMenuVisible] = useState(false);
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
    // TODO 2.3 [Reactive Cascading Refresh] — a new region loads its province list and city data
    if (!selectedRegion) return;

    let cancelled = false;

    const loadProvinces = async () => {
      setLoadingProvinces(true);

      try {
        const provinceList = await getProvincesByRegion(selectedRegion);
        if (cancelled) return;
        setProvinces(provinceList);

        if (provinceList.length === 0) {
          setLoadingCities(true);
          const cityList = await getCitiesMunicipalitiesByRegion(selectedRegion);
          if (!cancelled) setCities(cityList);
        }
      } catch (error) {
        console.warn('Failed to load provinces:', error);
      } finally {
        if (!cancelled) {
          setLoadingProvinces(false);
          setLoadingCities(false);
        }
      }
    };

    void loadProvinces();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  useEffect(() => {
    // A new province loads its cities/municipalities
    if (!selectedProvince) return;

    let cancelled = false;

    const loadCities = async () => {
      setLoadingCities(true);

      try {
        const cityList = await getCitiesMunicipalitiesByProvince(selectedProvince);
        if (!cancelled) setCities(cityList);
      } catch (error) {
        console.warn('Failed to load cities:', error);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    };

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [selectedProvince]);

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
      setSelectedProvince('');
      setSelectedCityName('');
    }
  };

  const selectedProvinceName = provinces.find((p) => p.code === selectedProvince)?.name;

  const handleSubmit = () => {
    // TODO 2.4 [Form Submit Bubble]
    // Adds the province ("La Trinidad, Benguet") so places that share a name are not mixed up.
    // To send the plain city name instead, change this to: onSearch(selectedCityName)
    if (!selectedCityName) return;
    onSearch(selectedProvinceName ? `${selectedCityName}, ${selectedProvinceName}` : selectedCityName);
  };

  const handleReset = () => {
    setIslandFilter('all');
    setSelectedRegion('');
    setSelectedProvince('');
    setSelectedCityName('');
  };

  // Which dropdowns can be used right now
  const regionHasProvinces = provinces.length > 0;
  const provinceEnabled = !!selectedRegion && !loadingProvinces && regionHasProvinces;
  const cityEnabled =
    !!selectedRegion &&
    !loadingProvinces &&
    !loadingCities &&
    (regionHasProvinces ? !!selectedProvince : true) &&
    cities.length > 0;

  // Display labels derived from the current selections (scaffolded)
  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';

  let provinceLabel = 'Select Province';
  if (selectedRegion && loadingProvinces) provinceLabel = 'Loading provinces…';
  else if (selectedRegion && !regionHasProvinces) provinceLabel = 'No provinces in this region';
  else if (selectedProvinceName) provinceLabel = selectedProvinceName;

  let cityLabel = 'Select City / Municipality';
  if (selectedCityName) cityLabel = selectedCityName;
  else if (loadingCities) cityLabel = 'Loading municipalities…';

  const hasSelection = !!selectedRegion || islandFilter !== 'all';
  const menuContentStyle = { backgroundColor: theme.colors.surface, borderRadius: 14 };

  return (
    <View style={styles.form}>
      {/* TODO 2.9 (c) [Island-Group Filter] chips */}
      <View style={styles.filterRow}>
        {ISLAND_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={islandFilter === option.value}
            showSelectedCheck={false}
            style={[
              styles.chip,
              {
                borderColor: theme.colors.outlineVariant,
                backgroundColor:
                  islandFilter === option.value ? theme.colors.primaryContainer : theme.colors.surface,
              },
            ]}
            onPress={() => handleIslandFilterChange(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </View>

      <View style={[styles.row, isWide && styles.rowWide]}>
        {/* 1. Region */}
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
                  setSelectedProvince('');
                  setSelectedCityName('');
                  setCities([]);
                  setRegionMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* 2. Province */}
        <View style={[styles.field, isWide && styles.fieldWide]}>
          <Menu
            visible={provinceMenuVisible}
            onDismiss={() => setProvinceMenuVisible(false)}
            anchorPosition="bottom"
            contentStyle={menuContentStyle}
            anchor={
              <Button
                mode="outlined"
                icon="map-outline"
                disabled={!provinceEnabled}
                contentStyle={styles.buttonContent}
                style={styles.button}
                onPress={() => setProvinceMenuVisible(true)}
              >
                {provinceLabel}
              </Button>
            }
          >
            {provinces.map((province) => (
              <Menu.Item
                key={province.code}
                title={province.name}
                onPress={() => {
                  setSelectedProvince(province.code);
                  setSelectedCityName('');
                  setProvinceMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* 3. City / Municipality */}
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
                disabled={!cityEnabled}
                contentStyle={styles.buttonContent}
                style={styles.button}
                onPress={() => setCityMenuVisible(true)}
              >
                {cityLabel}
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
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="magnify"
          disabled={!selectedCityName}
          contentStyle={styles.buttonContent}
          labelStyle={styles.searchLabel}
          style={styles.searchButton}
          onPress={handleSubmit}
        >
          Search this place
        </Button>

        {hasSelection && (
          <Button mode="text" icon="refresh" onPress={handleReset}>
            Reset
          </Button>
        )}
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
    gap: 6,
    marginBottom: 14,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
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
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  searchButton: {
    flex: 1,
    borderRadius: 8,
  },
  searchLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
});