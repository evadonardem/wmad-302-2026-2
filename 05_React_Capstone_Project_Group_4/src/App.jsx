import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Typography, Box, IconButton, Paper } from '@mui/material';
import { LightMode, DarkMode, TravelExplore } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

// Philippine flag palette, used as accents only (Option B: light & minimalist)
const PH_BLUE = '#0038A8';
const PH_RED = '#CE1126';
const PH_GOLD = '#FCD116';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState('');
  const mode = isDarkMode ? 'dark' : 'light';

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: PH_BLUE },
      secondary: { main: PH_RED },
      warning: { main: PH_GOLD },
      background: {
        default: mode === 'light' ? '#F4F7FC' : '#0A1430',
        paper: mode === 'light' ? '#FFFFFF' : '#101B3D',
      },
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 800 },
    },
    shape: { borderRadius: 14 },
  });

  const handleSearchSubmit = async (locationName) => {
    setSearchedLocation(locationName);
    setLoading(true);
    try {
      const data = await searchPhotosByLocation(locationName);
      setPhotos(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: mode === 'light'
          ? `linear-gradient(180deg, ${PH_BLUE}14 0%, #F4F7FC 320px)`
          : `linear-gradient(180deg, ${PH_BLUE}33 0%, #0A1430 320px)`,
      }}>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              textAlign: 'center',
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: mode === 'light' ? 'rgba(0,56,168,0.12)' : 'rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${PH_GOLD}55 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${PH_BLUE} 33%, ${PH_RED} 33% 66%, ${PH_GOLD} 66%)`,
            }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>

            {/* Logo badge: sun-ring behind the compass, instead of a bare icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `conic-gradient(${PH_GOLD}, ${PH_BLUE}, ${PH_RED}, ${PH_GOLD})`,
                p: '3px',
              }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TravelExplore sx={{ fontSize: 32, color: 'secondary.main' }} />
                </Box>
              </Box>
            </Box>

            <Typography variant="h3" component="h1" color="primary.main" sx={{ mb: 1 }}>
              Lakbay PH
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: 'auto' }}>
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Typography>

            <LocationForm onSearch={handleSearchSubmit} />
          </Paper>

          <MediaGallery photos={photos} loading={loading} searchedLocation={searchedLocation} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}