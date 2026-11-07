import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, Text } from 'react-native-paper';
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
const ISLAND_GROUP_CODES: Record<Exclude<IslandFilter, 'all'>, string> = {
  luzon: 'luzon',
  visayas: 'visayas',
  mindanao: 'mindanao',
};

export default function LocationForm({
  onSearch,
}: {
  onSearch: (cityName: string, contextName?: string) => void;
}) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [islandFilter, setIslandFilter] = useState<IslandFilter>('all');
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [regionMenuVisible, setRegionMenuVisible] = useState(false);
  const [provinceMenuVisible, setProvinceMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  const visibleRegions = useMemo(() => {
    if (islandFilter === 'all') return regions;
    return regions.filter((region) => region.islandGroupCode === ISLAND_GROUP_CODES[islandFilter]);
  }, [regions, islandFilter]);

  useEffect(() => {
    let isCurrent = true;

    const loadRegions = async () => {
      try {
        const nextRegions = await getRegions();
        if (isCurrent) setRegions(nextRegions);
      } catch (error) {
        if (isCurrent) {
          setLocationError(error instanceof Error ? error.message : 'Unable to load regions.');
        }
      } finally {
        if (isCurrent) setLoadingRegions(false);
      }
    };

    void loadRegions();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadLocations = async () => {
      if (!selectedRegion) {
        setProvinces([]);
        setCities([]);
        setSelectedProvince('');
        setSelectedCityName('');
        setLoadingLocations(false);
        return;
      }

      setLoadingLocations(true);
      setLocationError('');
      setProvinces([]);
      setCities([]);
      setSelectedProvince('');
      setSelectedCityName('');

      try {
        const nextProvinces = await getProvincesByRegion(selectedRegion);
        if (!isCurrent) return;

        setProvinces(nextProvinces);
        if (nextProvinces.length === 0) {
          setCities(await getCitiesMunicipalitiesByRegion(selectedRegion));
        }
      } catch (error) {
        if (isCurrent) {
          setLocationError(error instanceof Error ? error.message : 'Unable to load locations.');
        }
      } finally {
        if (isCurrent) setLoadingLocations(false);
      }
    };

    void loadLocations();
    return () => {
      isCurrent = false;
    };
  }, [selectedRegion]);

  useEffect(() => {
    let isCurrent = true;

    const loadCities = async () => {
      if (!selectedProvince) {
        if (provinces.length > 0) setCities([]);
        setSelectedCityName('');
        return;
      }

      setLoadingLocations(true);
      setLocationError('');
      setCities([]);

      try {
        const nextCities = await getCitiesMunicipalitiesByProvince(selectedProvince);
        if (isCurrent) setCities(nextCities);
      } catch (error) {
        if (isCurrent) {
          setLocationError(error instanceof Error ? error.message : 'Unable to load cities.');
        }
      } finally {
        if (isCurrent) setLoadingLocations(false);
      }
    };

    void loadCities();
    return () => {
      isCurrent = false;
    };
  }, [selectedProvince, provinces.length]);

  const handleFilterChange = (nextFilter: IslandFilter) => {
    setIslandFilter(nextFilter);
    if (
      selectedRegion &&
      nextFilter !== 'all' &&
      !regions.some(
        (region) =>
          region.code === selectedRegion &&
          region.islandGroupCode === ISLAND_GROUP_CODES[nextFilter],
      )
    ) {
      setSelectedRegion('');
    }
  };

  const handleSubmit = () => {
    if (!selectedCityName.trim()) return;

    const regionName = regions.find((region) => region.code === selectedRegion)?.name;
    const provinceName = provinces.find((province) => province.code === selectedProvince)?.name;
    onSearch(selectedCityName.trim(), provinceName || regionName);
  };

  const selectedRegionLabel =
    regions.find((region) => region.code === selectedRegion)?.name ?? 'Select Region';
  const selectedProvinceLabel =
    provinces.find((province) => province.code === selectedProvince)?.name ?? 'Select Province';
  const selectedCityLabel = selectedCityName || 'Select City / Municipality';
  const cityPickerEnabled = Boolean(selectedRegion && (selectedProvince || provinces.length === 0));

  return (
    <View style={styles.form}>
      <View style={styles.filterRow}>
        {(['all', 'luzon', 'visayas', 'mindanao'] as const).map((filter) => (
          <Chip
            key={filter}
            selected={islandFilter === filter}
            onPress={() => handleFilterChange(filter)}
            accessibilityRole="button"
          >
            {filter === 'all' ? 'All islands' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Chip>
        ))}
      </View>

      <View style={styles.fields}>
        <Menu
          visible={regionMenuVisible}
          onDismiss={() => setRegionMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="menu-down"
              contentStyle={styles.buttonContent}
              style={styles.button}
              loading={loadingRegions}
              onPress={() => setRegionMenuVisible(true)}
            >
              {selectedRegionLabel}
            </Button>
          }
        >
          <Menu.Item
            title="Clear selection"
            onPress={() => {
              setSelectedRegion('');
              setRegionMenuVisible(false);
            }}
          />
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

        <Menu
          visible={provinceMenuVisible}
          onDismiss={() => setProvinceMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="menu-down"
              disabled={!selectedRegion || provinces.length === 0 || loadingLocations}
              contentStyle={styles.buttonContent}
              style={styles.button}
              onPress={() => setProvinceMenuVisible(true)}
            >
              {loadingLocations && selectedRegion ? 'Loading provinces...' : selectedProvinceLabel}
            </Button>
          }
        >
          <Menu.Item
            title="Clear selection"
            onPress={() => {
              setSelectedProvince('');
              setSelectedCityName('');
              setProvinceMenuVisible(false);
            }}
          />
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

        <Menu
          visible={cityMenuVisible}
          onDismiss={() => setCityMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="menu-down"
              disabled={!cityPickerEnabled || loadingLocations}
              contentStyle={styles.buttonContent}
              style={styles.button}
              onPress={() => setCityMenuVisible(true)}
            >
              {loadingLocations && cityPickerEnabled ? 'Loading cities...' : selectedCityLabel}
            </Button>
          }
        >
          {cities.length === 0 ? (
            <Menu.Item title="No cities or municipalities available" disabled />
          ) : (
            cities.map((city) => (
              <Menu.Item
                key={city.code}
                title={city.name}
                onPress={() => {
                  setSelectedCityName(city.name);
                  setCityMenuVisible(false);
                }}
              />
            ))
          )}
        </Menu>

        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            icon="close"
            disabled={!selectedRegion && !selectedProvince && !selectedCityName}
            contentStyle={styles.buttonContent}
            onPress={() => {
              setSelectedRegion('');
              setSelectedProvince('');
              setSelectedCityName('');
              setLocationError('');
            }}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            icon="magnify"
            disabled={!selectedCityName}
            contentStyle={styles.buttonContent}
            onPress={handleSubmit}
          >
            Search
          </Button>
        </View>
      </View>

      {locationError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {locationError}
        </Text>
      ) : null}
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
    justifyContent: 'center',
  },
  fields: {
    gap: 12,
    alignItems: 'stretch',
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  error: {
    marginTop: 10,
    textAlign: 'center',
    color: '#b3261e',
  },
});
