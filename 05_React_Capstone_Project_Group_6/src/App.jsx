import React, { useMemo, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, GlobalStyles,
  Typography, Box, IconButton, Paper,
} from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

// 🌴 Philippine tourist palette: lagoon turquoise, deep sea navy, sunset orange, sand
const palettes = {
  dark: {
    '--page-bg': 'radial-gradient(ellipse at top, #0f4c5c 0%, #04161f 75%)',
    '--panel-bg': '#0a2a3a',
    '--card-bg': '#08202e',
    '--accent': '#2DD4CF',
    '--accent-strong': '#7CF0EB',
    '--accent-soft': 'rgba(45, 212, 207, 0.15)',
    '--border': 'rgba(45, 212, 207, 0.45)',
    '--border-strong': '#2DD4CF',
    '--glow': 'rgba(45, 212, 207, 0.55)',
    '--text': '#F3FBFA',
    '--text-muted': '#9FD8D6',
    '--title-gradient': 'linear-gradient(135deg, #FFE29A 0%, #FFC145 40%, #FF7A45 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.5)',
    '--panel-shadow': '0 0 35px rgba(45, 212, 207, 0.3), inset 0 0 15px rgba(45, 212, 207, 0.08)',
  },
  light: {
    '--page-bg': 'radial-gradient(ellipse at top, #CFF3EF 0%, #FFF8EC 75%)',
    '--panel-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--accent': '#0E9AA7',
    '--accent-strong': '#0B6F7A',
    '--accent-soft': 'rgba(14, 154, 167, 0.15)',
    '--border': 'rgba(14, 154, 167, 0.4)',
    '--border-strong': '#0E9AA7',
    '--glow': 'rgba(14, 154, 167, 0.35)',
    '--text': '#0B3C49',
    '--text-muted': '#3F7F88',
    '--title-gradient': 'linear-gradient(135deg, #0038A8 0%, #0E9AA7 60%, #2E9E6B 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.45)',
    '--panel-shadow': '0 8px 30px rgba(14, 154, 167, 0.2)',
  },
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const mode = isDarkMode ? 'dark' : 'light';
  const colors = palettes[mode];

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: isDarkMode ? '#2DD4CF' : '#0E9AA7' },
          secondary: { main: '#FF7A45' },
          background: {
            default: isDarkMode ? '#04161f' : '#FFF8EC',
            paper: isDarkMode ? '#0a2a3a' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#F3FBFA' : '#0B3C49',
            secondary: isDarkMode ? '#9FD8D6' : '#3F7F88',
          },
        },
      }),
    [isDarkMode]
  );

  const handleSearchSubmit = async (locationName) => {
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      setPhotos(results || []);
    } catch (error) {
      console.error('Error fetching photos by location:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Makes the color variables available everywhere, including dropdown menus */}
      <GlobalStyles styles={{ ':root': colors }} />

      <Box sx={{ minHeight: '100vh', background: 'var(--page-bg)', py: 5 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={10}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3, md: 5 },
              pt: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              mb: 4,
              background: 'var(--panel-bg)',
              border: '2px solid var(--border-strong)',
              boxShadow: 'var(--panel-shadow)',
            }}
          >
            {/* 🇵🇭 Flag stripe: blue, red, gold */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                background:
                  'linear-gradient(90deg, #0038A8 0%, #0038A8 33.3%, #CE1126 33.3%, #CE1126 66.6%, #FCD116 66.6%, #FCD116 100%)',
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle light/dark mode"
                sx={{
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 10px var(--glow)',
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>

            <Typography
              variant="h3"
              component="h1"
              fontWeight="900"
              gutterBottom
              sx={{
                background: 'var(--title-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 2.5,
                filter: 'drop-shadow(0 0 12px var(--glow))',
              }}
            >
              🌴 LAKBAY PH
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--text-muted)', mb: 4, fontWeight: 500, letterSpacing: 0.5 }}
            >
              🏝️ Explore tourist spots across regions, cities, and municipalities in the Philippines 🏝️
            </Typography>

            <LocationForm onSearch={handleSearchSubmit} />
          </Paper>

          <MediaGallery photos={photos} loading={loading} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}