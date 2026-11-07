import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [islandFilter, setIslandFilter] = useState<'all' | 'luzon' | 'visayas' | 'mindanao'>('all');

  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  const visibleRegions = useMemo(() => {
    if (islandFilter === 'all') return regions;
    return regions.filter((region) => region.islandGroupCode === islandFilter);
  }, [regions, islandFilter]);

  useEffect(() => {
    const loadRegions = async () => {
      const nextRegions = await getRegions();
      setRegions(nextRegions);
    };

    void loadRegions();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (!selectedRegion) {
        setCities([]);
        setSelectedCityName('');
        return;
      }

      const nextCities = await getCitiesMunicipalitiesByRegion(selectedRegion);
      setCities(nextCities);
      setSelectedCityName('');
    };

    void loadCities();
  }, [selectedRegion]);

  const handleSubmit = () => {
    if (selectedCityName.trim()) {
      onSearch(selectedCityName.trim());
    }
  };

  const handleFilterChange = (nextFilter: 'all' | 'luzon' | 'visayas' | 'mindanao') => {
    setIslandFilter(nextFilter);

    if (selectedRegion && !regions.some((region) => region.code === selectedRegion)) {
      setSelectedRegion('');
      setSelectedCityName('');
      return;
    }

    if (
      selectedRegion &&
      nextFilter !== 'all' &&
      !visibleRegions.some((region) => region.code === selectedRegion)
    ) {
      setSelectedRegion('');
      setSelectedCityName('');
    }
  };

  const selectedRegionLabel = regions.find((r) => r.code === selectedRegion)?.name ?? 'Select Region';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';

  return (
    <View style={styles.form}>
      <View style={styles.filterRow}>
        {(['all', 'luzon', 'visayas', 'mindanao'] as const).map((filter) => (
          <Chip
            key={filter}
            selected={islandFilter === filter}
            onPress={() => handleFilterChange(filter)}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
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
            {visibleRegions.map((region) => (
              <Menu.Item
                key={region.code}
                title={region.name}
                onPress={() => {
                  setSelectedRegion(region.code);
                  setSelectedCityName('');
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
