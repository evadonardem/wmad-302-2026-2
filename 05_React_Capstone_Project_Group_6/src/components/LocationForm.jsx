import React, { useEffect, useState } from 'react';
import { Box, Autocomplete, TextField, Button, Stack } from '@mui/material';
import { Search } from '@mui/icons-material';
import { getRegions, getCitiesMunicipalitiesByRegion } from '../services/geoPhotoService';

export default function LocationForm({ onSearch }) {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');

  // 1. Fetch and sort Regions alphabetically (A-Z)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        // 🔤 Sort regions from A to Z
        const sortedRegions = (data || []).sort((a, b) => a.name.localeCompare(b.name));
        setRegions(sortedRegions);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, []);

  // 2. Fetch and sort Cities alphabetically (A-Z)
  useEffect(() => {
    setSelectedCityName('');

    if (selectedRegion) {
      const fetchCities = async () => {
        try {
          const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
          // 🔤 Sort cities/municipalities from A to Z
          const sortedCities = (data || []).sort((a, b) => a.name.localeCompare(b.name));
          setCities(sortedCities);
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
      const regionName = regions.find((r) => r.code === selectedRegion)?.name;
      onSearch(regionName ? `${selectedCityName}, ${regionName}` : selectedCityName);
    }
  };

  // Turquoise input styling (colors come from the variables set in App.jsx)
  const oceanInputStyle = {
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
    // the City box is greyed out until a region is picked; keep its label readable
    '& .MuiInputLabel-root.Mui-disabled': { color: 'var(--text-muted)', opacity: 0.8 },
    '& .MuiInputBase-input': { color: 'var(--text)' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      // fills only the box (not the page) so its text stays readable over the scene
      background: 'var(--field-bg)',
      '& fieldset': { borderColor: 'var(--border)' },
      '&:hover fieldset': { borderColor: 'var(--accent)' },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--accent)',
        boxShadow: '0 0 10px var(--glow)',
      },
    },
    '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
      color: 'var(--accent)',
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">

        {/* Region: click to open the list, or just start typing to filter it */}
        <Autocomplete
          fullWidth
          size="small"
          autoHighlight
          openOnFocus
          options={regions}
          value={regions.find((r) => r.code === selectedRegion) || null}
          onChange={(e, region) => setSelectedRegion(region ? region.code : '')}
          getOptionLabel={(region) => region.name}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          noOptionsText="No region found"
          renderInput={(params) => <TextField {...params} label="Select Region" />}
          sx={oceanInputStyle}
        />

        {/* City / Municipality: type a few letters (e.g. "bag") instead of scrolling */}
        <Autocomplete
          fullWidth
          size="small"
          autoHighlight
          openOnFocus
          disabled={!selectedRegion}
          options={cities}
          value={cities.find((c) => c.name === selectedCityName) || null}
          onChange={(e, city) => setSelectedCityName(city ? city.name : '')}
          getOptionLabel={(city) => city.name}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          noOptionsText="No city or municipality found"
          renderOption={(props, city) => (
            <li {...props} key={city.code || city.id || city.name}>
              {city.name}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="Select City / Municipality" />}
          sx={oceanInputStyle}
        />

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