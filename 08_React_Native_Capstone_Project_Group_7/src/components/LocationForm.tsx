import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, useTheme } from 'react-native-paper';
import {
  getCitiesMunicipalitiesByRegion,
  getRegions,
  type City,
  type Region,
} from '@/services/geoPhotoService';
import { brand } from '@/theme';

const islandOptions = [
  { key: 'all', label: 'All' },
  { key: 'luzon', label: 'Luzon' },
  { key: 'visayas', label: 'Visayas' },
  { key: 'mindanao', label: 'Mindanao' },
] as const;

export default function LocationForm({ onSearch }: { onSearch: (cityName: string) => void }) {
  const theme = useTheme();
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [islandFilter, setIslandFilter] = useState<'all' | 'luzon' | 'visayas' | 'mindanao'>('all');

  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  useEffect(() => {
    const loadRegions = async () => {
      const data = await getRegions();
      setRegions(data);
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

      const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
      setCities(data);
      setSelectedCityName('');
    };

    void loadCities();
  }, [selectedRegion]);

  const filteredRegions = useMemo(() => {
    if (islandFilter === 'all') {
      return regions;
    }
    return regions.filter((region) => region.islandGroupCode === islandFilter);
  }, [regions, islandFilter]);

  useEffect(() => {
    const currentRegionIsVisible = filteredRegions.some((region) => region.code === selectedRegion);
    if (!currentRegionIsVisible && selectedRegion) {
      setSelectedRegion('');
      setSelectedCityName('');
    }
  }, [filteredRegions, selectedRegion]);

  const handleSubmit = () => {
    const cityName = selectedCityName.trim();
    if (cityName) {
      onSearch(cityName);
    }
  };

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

      <View style={styles.filterRow}>
        {islandOptions.map((option) => {
          const selected = islandFilter === option.key;
          return (
            <Chip
              key={option.key}
              selected={selected}
              style={[styles.chip, selected && { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => {
                setIslandFilter(option.key);
                if (selectedRegion) {
                  const isVisible =
                    option.key === 'all' ||
                    regions.find((region) => region.code === selectedRegion)?.islandGroupCode === option.key;
                  if (!isVisible) {
                    setSelectedRegion('');
                    setSelectedCityName('');
                  }
                }
              }}
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
            {filteredRegions.map((region) => (
              <Menu.Item
                key={region.code}
                onPress={() => {
                  setSelectedRegion(region.code);
                  setSelectedCityName('');
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