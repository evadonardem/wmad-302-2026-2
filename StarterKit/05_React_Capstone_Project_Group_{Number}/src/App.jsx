import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Typography, Box, IconButton, Paper } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  // Dynamic Theme Creator configuration
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  const handleSearchSubmit = async (locationName) => {
    setLoading(true);
      try {
        const results = await searchPhotosByLocation(locationName);
        setPhotos(results);
      } finally {
        setLoading(false);
      }

  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>

          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            🇵🇭 Lakbay PH
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Explore tourist spots across regions, cities, and municipalities in the Philippines
          </Typography>

          {/* Connect the location selection input modules */}
          <LocationForm onSearch={handleSearchSubmit} />
        </Paper>

        {/* Connect presentation display layout nodes passing state parameters downstream */}
        <MediaGallery photos={photos} loading={loading} />
      </Container>
    </ThemeProvider>
  );
}
