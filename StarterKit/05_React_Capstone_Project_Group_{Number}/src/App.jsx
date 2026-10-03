import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Typography, Box, IconButton, Paper } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';
import logo from './assets/lakbay-logo.png';


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


  const handleSearchSubmit = async (locationName, regionName) => {
  setLoading(true);
  try {
    const results = await searchPhotosByLocation(locationName, regionName);
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


          <Typography
  variant="h3"
  component="h1"
  fontWeight="bold"
  gutterBottom
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
  }}
>
  <Box
    component="img"
    src={logo}
    alt="Lakbay PH logo"
    sx={{ height: { xs: 48, sm: 64 }, width: 'auto', borderRadius: '50%' }}
  />
  Lakbay PH
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
