import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Stack } from '@mui/material';
import { Search } from '@mui/icons-material';
import { getRegions, getCitiesMunicipalitiesByRegion } from '../services/geoPhotoService';

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        setRegions(data || []);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    setSelectedCityName('');

    if (selectedRegion) {
      const fetchCities = async () => {
        try {
          const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
          setCities(data || []);
        } catch (error) {
          console.error('Failed to fetch cities/municipalities:', error);
          setCities([]);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedRegion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && selectedCityName) {
      onSearch(selectedCityName);
    }
  };

  // Turquoise input styling (colors come from the variables set in App.jsx)
  const oceanInputStyle = {
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
    '& .MuiSelect-select': { color: 'var(--text)' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': { borderColor: 'var(--border)' },
      '&:hover fieldset': { borderColor: 'var(--accent)' },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--accent)',
        boxShadow: '0 0 10px var(--glow)',
      },
    },
    '& .MuiSelect-icon': { color: 'var(--accent)' },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">

        {/* Region Dropdown */}
        <FormControl fullWidth size="small" sx={oceanInputStyle}>
          <InputLabel id="region-label">Select Region</InputLabel>
          <Select
            labelId="region-label"
            label="Select Region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map((region) => (
              <MenuItem key={region.code} value={region.code}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City Dropdown */}
        <FormControl fullWidth size="small" disabled={!selectedRegion} sx={oceanInputStyle}>
          <InputLabel id="city-label">Select City / Municipality</InputLabel>
          <Select
            labelId="city-label"
            label="Select City / Municipality"
            value={selectedCityName}
            onChange={(e) => setSelectedCityName(e.target.value)}
          >
            {cities.map((city) => (
              <MenuItem key={city.code || city.id} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sunset Search Button */}
        <Button
          type="submit"
          variant="contained"
          startIcon={<Search />}
          disabled={!selectedCityName}
          sx={{
            textTransform: 'none',
            px: 5,
            py: 1,
            fontWeight: '900',
            fontSize: '1rem',
            letterSpacing: 1,
            borderRadius: 2,
            background: 'var(--cta)',
            color: 'var(--cta-text)',
            boxShadow: '0 0 20px var(--cta-glow)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'var(--cta-hover)',
              boxShadow: '0 0 30px var(--cta-glow)',
              transform: 'scale(1.03)',
            },
            '&.Mui-disabled': {
              background: 'var(--accent-soft)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
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