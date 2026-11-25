import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Modal, Portal, Searchbar, TextInput } from 'react-native-paper';
import { psgcApi, PsgcLocation } from '@/services/psgcApi';

export interface PhilippineAddressValue {
  regionCode: string;
  region: string;
  provinceCode: string;
  province: string;
  cityCode: string;
  city: string;
  barangayCode: string;
  barangay: string;
}

type LocationField = 'region' | 'province' | 'city' | 'barangay';

interface PhilippineAddressFieldsProps {
  value: PhilippineAddressValue;
  onChange: (value: PhilippineAddressValue) => void;
  error?: boolean;
}

const emptyAddress: PhilippineAddressValue = {
  regionCode: '',
  region: '',
  provinceCode: '',
  province: '',
  cityCode: '',
  city: '',
  barangayCode: '',
  barangay: '',
};

const fieldLabels: Record<LocationField, string> = {
  region: 'Region',
  province: 'Province',
  city: 'City / Municipality',
  barangay: 'Barangay',
};

export default function PhilippineAddressFields({
  value,
  onChange,
  error = false,
}: PhilippineAddressFieldsProps) {
  const [regions, setRegions] = useState<PsgcLocation[]>([]);
  const [provinces, setProvinces] = useState<PsgcLocation[]>([]);
  const [provinceRegionCode, setProvinceRegionCode] = useState('');
  const [pickerField, setPickerField] = useState<LocationField | null>(null);
  const [options, setOptions] = useState<PsgcLocation[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    psgcApi.getRegions()
      .then((locations) => {
        if (active) {
          setRegions(locations);
          setLoadError('');
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setLoadError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load Philippine regions. Please try again.'
          );
        }
      });
    return () => { active = false; };
  }, []);

  const loadProvinceOptions = async (regionCode: string) => {
    setLoading(true);
    setLoadError('');
    try {
      const locations = await psgcApi.getProvinces(regionCode);
      setProvinces(locations);
      setProvinceRegionCode(regionCode);
    } catch (requestError) {
      setLoadError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load provinces. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openPicker = async (field: LocationField) => {
    setPickerField(field);
    setQuery('');
    setLoadError('');

    if (field === 'province' && !value.regionCode) return;
    if (field === 'city' && (!value.regionCode || (provinces.length > 0 && !value.provinceCode))) return;
    if (field === 'barangay' && !value.cityCode) return;

    setLoading(true);
    try {
      let locations: PsgcLocation[];
      switch (field) {
        case 'region':
          locations = regions.length > 0 ? regions : await psgcApi.getRegions();
          setRegions(locations);
          break;
        case 'province':
          locations = await psgcApi.getProvinces(value.regionCode);
          setProvinces(locations);
          setProvinceRegionCode(value.regionCode);
          break;
        case 'city':
          locations = await psgcApi.getCitiesAndMunicipalities(value.regionCode, value.provinceCode || undefined);
          break;
        case 'barangay':
          locations = await psgcApi.getBarangays(value.cityCode);
          break;
      }
      setOptions(locations);
    } catch (requestError) {
      setLoadError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load locations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery
      ? options.filter((location) => location.name.toLocaleLowerCase().includes(normalizedQuery))
      : options;
  }, [options, query]);

  const selectLocation = (location: PsgcLocation) => {
    if (!pickerField) return;
    switch (pickerField) {
      case 'region':
        onChange({
          ...emptyAddress,
          regionCode: location.code,
          region: location.name,
        });
        setProvinces([]);
        setProvinceRegionCode('');
        void loadProvinceOptions(location.code);
        break;
      case 'province':
        onChange({
          ...value,
          provinceCode: location.code,
          province: location.name,
          cityCode: '',
          city: '',
          barangayCode: '',
          barangay: '',
        });
        break;
      case 'city':
        onChange({
          ...value,
          cityCode: location.code,
          city: location.name,
          barangayCode: '',
          barangay: '',
        });
        break;
      case 'barangay':
        onChange({
          ...value,
          barangayCode: location.code,
          barangay: location.name,
        });
        break;
    }
    setPickerField(null);
  };

  const provinceOptionsLoaded = Boolean(value.regionCode) && provinceRegionCode === value.regionCode;
  const provinceNotApplicable = provinceOptionsLoaded && provinces.length === 0;
  const cityDisabled =
    !value.regionCode ||
    !provinceOptionsLoaded ||
    (provinces.length > 0 && !value.provinceCode);
  const barangayDisabled = !value.cityCode;

  return (
    <View>
      <Pressable onPress={() => void openPicker('region')} accessibilityRole="button">
        <TextInput
          label="Region"
          mode="outlined"
          value={value.region}
          editable={false}
          showSoftInputOnFocus={false}
          pointerEvents="none"
          right={<TextInput.Icon icon="menu-down" />}
          style={styles.input}
          accessibilityLabel="Select region"
        />
      </Pressable>
      <Pressable
        onPress={() => void openPicker('province')}
        disabled={!value.regionCode || provinceNotApplicable}
        accessibilityRole="button"
      >
        <TextInput
          label="Province"
          mode="outlined"
          value={provinceNotApplicable ? 'Not applicable' : value.province}
          editable={false}
          showSoftInputOnFocus={false}
          pointerEvents="none"
          right={!provinceNotApplicable && <TextInput.Icon icon="menu-down" />}
          style={styles.input}
          accessibilityLabel={provinceNotApplicable ? 'Province not applicable' : 'Select province'}
        />
      </Pressable>
      <Pressable
        onPress={() => void openPicker('city')}
        disabled={cityDisabled}
        accessibilityRole="button"
      >
        <TextInput
          label="City / Municipality"
          mode="outlined"
          value={value.city}
          editable={false}
          showSoftInputOnFocus={false}
          pointerEvents="none"
          right={<TextInput.Icon icon="menu-down" />}
          style={[styles.input, error && !value.city && styles.errorInput]}
          accessibilityLabel="Select city or municipality"
        />
      </Pressable>
      <Pressable
        onPress={() => void openPicker('barangay')}
        disabled={barangayDisabled}
        accessibilityRole="button"
      >
        <TextInput
          label="Barangay"
          mode="outlined"
          value={value.barangay}
          editable={false}
          showSoftInputOnFocus={false}
          pointerEvents="none"
          right={<TextInput.Icon icon="menu-down" />}
          style={[styles.input, error && !value.barangay && styles.errorInput]}
          accessibilityLabel="Select barangay"
        />
      </Pressable>
      {error && (!value.region || !value.city || !value.barangay) && (
        <Text style={styles.errorText}>Select a region, city / municipality, and barangay.</Text>
      )}
      {loadError && (
        <View style={styles.loadError}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Button
            compact
            onPress={() => void (value.regionCode
              ? loadProvinceOptions(value.regionCode)
              : openPicker('region'))}
          >
            Retry
          </Button>
        </View>
      )}
      <Portal>
        <Modal
          visible={pickerField !== null}
          onDismiss={() => setPickerField(null)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.heading}>{pickerField ? fieldLabels[pickerField] : 'Choose location'}</Text>
          <Searchbar
            placeholder={`Search ${pickerField ? fieldLabels[pickerField].toLowerCase() : 'locations'}`}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          {loading ? (
            <Text style={styles.status}>Loading locations...</Text>
          ) : loadError ? (
            <Text style={styles.errorText}>{loadError}</Text>
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.status}>No matching locations.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectLocation(item)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 10, backgroundColor: '#FFF' },
  errorInput: { borderColor: '#B4233C' },
  errorText: { color: '#B4233C', fontSize: 12, marginBottom: 8, marginLeft: 12 },
  loadError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modal: {
    backgroundColor: '#FFF',
    alignSelf: 'center',
    width: '90%',
    maxWidth: 480,
    maxHeight: '80%',
    padding: 18,
    borderRadius: 16,
  },
  heading: { color: '#30283A', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  search: { marginBottom: 8, backgroundColor: '#F7F4F9' },
  status: { color: '#746C7A', paddingVertical: 18, textAlign: 'center' },
  option: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 },
  optionText: { color: '#30283A', fontSize: 15 },
});
