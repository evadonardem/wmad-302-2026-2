import React, { useState, useEffect } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  Box,
  IconButton,
  Paper,
} from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';
import './App.css';
import logo from './assets/logo.png';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#f2c94c' : '#0038a8',
      },
      secondary: {
        main: '#ce1126',
      },
    },
  });

  const handleSearchSubmit = async (cityName) => {
    setLoading(true);
    setLocationName(cityName);
    try {
      const results = await searchPhotosByLocation(cityName);
      setPhotos(results);
    } catch (error) {
      console.error('Search failed:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-wrapper">
        <Box className="decor-circle decor-circle-1" />
        <Box className="decor-circle decor-circle-2" />

        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Paper
            className="header-paper"
            elevation={0}
            sx={{ p: 4, textAlign: 'center', mb: 3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>

            <Box className="brand">
              <img src={logo} alt="Lakbay PH logo" className="flag-logo" />
              <Typography className="app-title" variant="h3" component="h1">
                Lakbay PH
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Typography>

            <LocationForm onSearch={handleSearchSubmit} loading={loading} />
          </Paper>

          <Box>
            <MediaGallery photos={photos} loading={loading} locationName={locationName} />
          </Box>

          <Box className="app-footer">
            <Typography variant="caption" color="text.secondary">
              Photos provided by Pexels · Built for educational purposes
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}