import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack } from '@mui/material';
import { ClearRounded, Search } from '@mui/icons-material';
import { getRegions, getCitiesMunicipalitiesByRegion } from '../services/geoPhotoService';

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
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

    if (!selectedRegion) {
      setCities([]);
      setSelectedCityName('');
      return undefined;
    }

    const loadCities = async () => {
      const cityResults = await getCitiesMunicipalitiesByRegion(selectedRegion);
      if (isCurrent) {
        setCities(cityResults);
        setSelectedCityName('');
      }
    };

    void loadCities();

    return () => {
      isCurrent = false;
    };
  }, [selectedRegion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCityName) return;

    const selectedRegionName = regions.find((region) => region.code === selectedRegion)?.name;
    onSearch(selectedCityName, selectedRegionName);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setCities([]);
    setSelectedCityName('');
  };

  const handleClearSelection = () => {
    setSelectedRegion('');
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
            {regions.map((region) => (
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
          <InputLabel id="city-label">Select City / Municipality</InputLabel>
          <Select
            labelId="city-label"
            label="Select City / Municipality"
            value={selectedCityName}
            onChange={(event) => setSelectedCityName(event.target.value)}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(89, 50, 30, 0.28)' } }}
          >
            <MenuItem value="">Clear selection</MenuItem>
            {cities.map((city) => (
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