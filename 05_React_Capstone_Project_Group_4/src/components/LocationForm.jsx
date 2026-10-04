import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack, InputAdornment, Snackbar, Alert } from '@mui/material';
import { Search, Map, LocationCity } from '@mui/icons-material';
import { getRegions, getCitiesMunicipalitiesByRegion } from '../services/geoPhotoService';

const pillSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderRadius: 999 },
};

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    const loadRegions = async () => {
      const data = await getRegions();
      setRegions(data);
    };
    loadRegions();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      setSelectedCityName('');

      if (!selectedRegion) {
        setCities([]);
        return;
      }

      const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
      setCities(data);

      const regionName = regions.find((r) => r.code === selectedRegion)?.name;
      if (regionName) {
        setToast({ open: true, message: `Region updated to ${regionName}` });
      }
    };
    loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast({ open: true, message: `Searching for spots in ${selectedCityName}...` });
    onSearch(selectedCityName);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'stretch' }}
      >

        <FormControl fullWidth size="small" sx={pillSx}>
          <InputLabel id="region-label">Select Region</InputLabel>
          <Select
            labelId="region-label"
            label="Select Region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <Map fontSize="small" color="primary" />
              </InputAdornment>
            }
          >
            {regions.map((region) => (
              <MenuItem key={region.code} value={region.code}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedRegion} sx={pillSx}>
          <InputLabel id="city-label">Select City / Municipality</InputLabel>
          <Select
            labelId="city-label"
            label="Select City / Municipality"
            value={selectedCityName}
            onChange={(e) => setSelectedCityName(e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ ml: 1 }}>
                <LocationCity fontSize="small" color="primary" />
              </InputAdornment>
            }
          >
            {cities.map((city) => (
              <MenuItem key={city.code} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          startIcon={<Search />}
          disabled={!selectedCityName}
          sx={{ textTransform: 'none', px: 4, borderRadius: 999, whiteSpace: 'nowrap' }}
        >
          Search
        </Button>
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}