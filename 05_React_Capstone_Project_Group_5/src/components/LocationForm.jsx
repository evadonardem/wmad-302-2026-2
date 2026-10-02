import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack } from '@mui/material';
import { Search } from '@mui/icons-material';
import {
  getRegions,
  getProvincesByRegion,
  getCitiesMunicipalitiesByProvince,
} from '../services/geoPhotoService';

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const loadRegions = async () => {
      const regionResults = await getRegions();
      if (isCurrent) setRegions(regionResults);
    };

    void loadRegions();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (selectedRegion) {
      const loadProvinces = async () => {
        const provinceResults = await getProvincesByRegion(selectedRegion);
        if (isCurrent) setProvinces(provinceResults);
      };

      void loadProvinces();
    }

    return () => {
      isCurrent = false;
    };
  }, [selectedRegion]);

  useEffect(() => {
    let isCurrent = true;

    if (selectedProvince) {
      const loadCities = async () => {
        const cityResults = await getCitiesMunicipalitiesByProvince(selectedProvince);
        if (isCurrent) setCities(cityResults);
      };

      void loadCities();
    }

    return () => {
      isCurrent = false;
    };
  }, [selectedProvince]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCityName) {
      const selectedProvinceName = provinces.find((province) => province.code === selectedProvince)?.name;
      onSearch(selectedCityName, selectedProvinceName);
    }
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setProvinces([]);
    setSelectedProvince('');
    setCities([]);
    setSelectedCityName('');
  };

  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
    setCities([]);
    setSelectedCityName('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
        
        <FormControl fullWidth size="small">
          <InputLabel id="region-label">Select Region</InputLabel>
          <Select
            labelId="region-label"
            label="Select Region"
            value={selectedRegion}
            onChange={handleRegionChange}
          >
            {regions.map((region) => (
              <MenuItem key={region.code} value={region.code}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedRegion}>
          <InputLabel id="province-label">Select Province</InputLabel>
          <Select
            labelId="province-label"
            label="Select Province"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            {provinces.map((province) => (
              <MenuItem key={province.code} value={province.code}>
                {province.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedProvince}>
          <InputLabel id="city-label">Select City / Municipality</InputLabel>
          <Select
            labelId="city-label"
            label="Select City / Municipality"
            value={selectedCityName}
            onChange={(event) => setSelectedCityName(event.target.value)}
          >
            {cities.map((city) => (
              <MenuItem key={city.code || city.id} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          startIcon={<Search />}
          disabled={!selectedCityName}
          sx={{ textTransform: 'none', px: 4 }}
        >
          Search
        </Button>
      </Stack>
    </Box>
  );
}