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
        const sortedRegions = (data || []).sort((a, b) => a.name.localeCompare(b.name));
        setRegions(sortedRegions);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, []);

  // 2. Fetch and sort Cities alphabetically (A-Z) on region change
  useEffect(() => {
    setSelectedCityName('');

    if (selectedRegion) {
      const fetchCities = async () => {
        try {
          const data = await getCitiesMunicipalitiesByRegion(selectedRegion);
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

  // Lagoon Turquoise styling for Autocomplete input and dropdown popup
  const oceanInputStyle = {
    '& .MuiInputLabel-root': { color: 'var(--text-muted)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--accent)' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      color: 'var(--text)',
      '& fieldset': { borderColor: 'var(--border)' },
      '&:hover fieldset': { borderColor: 'var(--accent)' },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--accent)',
        boxShadow: '0 0 10px var(--glow)',
      },
    },
    '& .MuiSvgIcon-root': { color: 'var(--accent)' },
  };

  const popupStyle = {
    sx: {
      background: 'var(--panel-bg)',
      color: 'var(--text)',
      border: '1.5px solid var(--border)',
      borderRadius: 2,
      mt: 1,
      boxShadow: 'var(--panel-shadow)',
      '& .MuiAutocomplete-option': {
        '&:hover': { background: 'var(--accent-soft)' },
        '&[aria-selected="true"]': { background: 'var(--accent-soft)', color: 'var(--accent-strong)' },
      },
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">

        {/* 🔍 SEARCHABLE REGION AUTOCOMPLETE */}
        <Autocomplete
          fullWidth
          size="small"
          options={regions}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          value={regions.find((r) => r.code === selectedRegion) || null}
          onChange={(event, newValue) => {
            setSelectedRegion(newValue ? newValue.code : '');
          }}
          slotProps={{ paper: popupStyle }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select / Type Region"
              placeholder="e.g. Ilocos, Bicol, Western Visayas..."
              sx={oceanInputStyle}
            />
          )}
        />

        {/* 🔍 SEARCHABLE CITY / MUNICIPALITY AUTOCOMPLETE */}
        <Autocomplete
          fullWidth
          size="small"
          disabled={!selectedRegion}
          options={cities}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          value={cities.find((c) => c.name === selectedCityName) || null}
          onChange={(event, newValue) => {
            setSelectedCityName(newValue ? newValue.name : '');
          }}
          slotProps={{ paper: popupStyle }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select / Type City / Municipality"
              placeholder={selectedRegion ? 'e.g. Baguio, Vigan, Iloilo...' : 'Select a region first'}
              sx={oceanInputStyle}
            />
          )}
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
            whiteSpace: 'nowrap',
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