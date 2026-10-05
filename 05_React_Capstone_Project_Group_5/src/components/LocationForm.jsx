import { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack } from '@mui/material';
import { ClearRounded, Search } from '@mui/icons-material';
import {
  getRegions,
  getProvincesByRegion,
  getCitiesMunicipalitiesByProvince,
  getCitiesMunicipalitiesByRegion,
} from '../services/geoPhotoService';

const sortByName = (items = []) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  const sortedRegions = useMemo(() => sortByName(regions), [regions]);
  const sortedProvinces = useMemo(() => sortByName(provinces), [provinces]);
  const sortedCities = useMemo(() => sortByName(cities), [cities]);

  useEffect(() => {
    let isCurrent = true;

    const loadRegions = async () => {
      const regionResults = await getRegions();
      if (isCurrent) setRegions(sortByName(regionResults));
    };

    void loadRegions();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (!selectedRegion) {
      setProvinces([]);
      setSelectedProvince('');
      setCities([]);
      setSelectedCityName('');
      return undefined;
    }

    const loadProvinces = async () => {
      const provinceResults = await getProvincesByRegion(selectedRegion);
      const sortedProvinceResults = sortByName(provinceResults);

      if (!isCurrent) return;

      setProvinces(sortedProvinceResults);
      setSelectedProvince('');
      setSelectedCityName('');

      if (sortedProvinceResults.length === 0) {
        const regionCities = await getCitiesMunicipalitiesByRegion(selectedRegion);
        if (isCurrent) {
          setCities(sortByName(regionCities));
        }
        return;
      }

      setCities([]);
    };

    void loadProvinces();

    return () => {
      isCurrent = false;
    };
  }, [selectedRegion]);

  useEffect(() => {
    let isCurrent = true;

    if (!selectedProvince) {
      setCities([]);
      setSelectedCityName('');
      return undefined;
    }

    const loadCities = async () => {
      const cityResults = await getCitiesMunicipalitiesByProvince(selectedProvince);
      if (isCurrent) {
        setCities(sortByName(cityResults));
        setSelectedCityName('');
      }
    };

    void loadCities();

    return () => {
      isCurrent = false;
    };
  }, [selectedProvince]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCityName) return;

    const selectedRegionName = regions.find((region) => region.code === selectedRegion)?.name;
    const selectedProvinceName = provinces.find((province) => province.code === selectedProvince)?.name;
    onSearch(selectedCityName, selectedProvinceName || selectedRegionName);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setSelectedProvince('');
    setCities([]);
    setSelectedCityName('');
  };

  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
    setCities([]);
    setSelectedCityName('');
  };

  const handleClearSelection = () => {
    setSelectedRegion('');
    setSelectedProvince('');
    setProvinces([]);
    setCities([]);
    setSelectedCityName('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', alignItems: 'stretch' }}>
        <FormControl
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <InputLabel id="region-label">Select Region</InputLabel>
          <Select
            labelId="region-label"
            label="Select Region"
            value={selectedRegion}
            onChange={handleRegionChange}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(89, 50, 30, 0.28)' } }}
          >
            <MenuItem value="">Clear selection</MenuItem>
            {sortedRegions.map((region) => (
              <MenuItem key={region.code} value={region.code}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          size="small"
          disabled={!selectedRegion}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <InputLabel id="province-label">Select Province</InputLabel>
          <Select
            labelId="province-label"
            label="Select Province"
            value={selectedProvince}
            onChange={handleProvinceChange}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(89, 50, 30, 0.28)' } }}
          >
            <MenuItem value="">Clear selection</MenuItem>
            {sortedProvinces.map((province) => (
              <MenuItem key={province.code || province.id} value={province.code}>
                {province.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          size="small"
          disabled={!(selectedRegion && (selectedProvince || provinces.length === 0))}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <InputLabel id="city-label">Select City / Municipality</InputLabel>
          <Select
            labelId="city-label"
            label="Select City / Municipality"
            value={selectedCityName}
            onChange={(event) => setSelectedCityName(event.target.value)}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(89, 50, 30, 0.28)' } }}
          >
            <MenuItem value="">Clear selection</MenuItem>
            {sortedCities.map((city) => (
              <MenuItem key={city.code || city.id} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="button"
          variant="outlined"
          startIcon={<ClearRounded fontSize="small" />}
          onClick={handleClearSelection}
          sx={{
            minWidth: { xs: '100%', sm: 120 },
            color: 'text.primary',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            fontSize: '0.72rem',
            borderRadius: 999,
            borderColor: 'rgba(89, 50, 30, 0.28)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderColor: 'rgba(89, 50, 30, 0.45)',
            },
          }}
        >
          Clear
        </Button>

        <Button
          type="submit"
          variant="contained"
          startIcon={<Search />}
          disabled={!selectedCityName}
          sx={{
            textTransform: 'none',
            px: 4,
            minWidth: { xs: '100%', sm: 160 },
            borderRadius: 2,
            boxShadow: '0 10px 20px rgba(86, 42, 19, 0.18)',
            background: 'linear-gradient(135deg, #915f39 0%, #5c3825 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a26941 0%, #693f2a 100%)',
              boxShadow: '0 12px 22px rgba(86, 42, 19, 0.22)',
            },
            '&:disabled': {
              background: 'rgba(108, 100, 93, 0.32)',
              boxShadow: 'none',
            },
          }}
        >
          Search
        </Button>
      </Stack>
    </Box>
  );
}