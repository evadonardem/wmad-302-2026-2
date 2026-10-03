import React, { useMemo, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, Typography,
  Box, IconButton, Paper, Fade,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

// ---------- Animations ----------
const walk = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  25%  { transform: translate(4px, -5px) rotate(4deg); }
  50%  { transform: translate(8px, 0) rotate(0deg); }
  75%  { transform: translate(4px, -5px) rotate(-4deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

// Base gradient slowly slides across the screen
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Colors of the whole background slowly shift
const hueCycle = keyframes`
  0%   { filter: hue-rotate(0deg) saturate(1.1); }
  33%  { filter: hue-rotate(35deg) saturate(1.3); }
  66%  { filter: hue-rotate(-30deg) saturate(1.2); }
  100% { filter: hue-rotate(0deg) saturate(1.1); }
`;

// Each blob floats along a different path
const drift1 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(35vw, 15vh) scale(1.3); }
  66%  { transform: translate(10vw, 45vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;
const drift2 = keyframes`
  0%   { transform: translate(0, 0) scale(1.1); }
  33%  { transform: translate(-30vw, 20vh) scale(0.85); }
  66%  { transform: translate(-10vw, -20vh) scale(1.25); }
  100% { transform: translate(0, 0) scale(1.1); }
`;
const drift3 = keyframes`
  0%   { transform: translate(0, 0) scale(0.9); }
  50%  { transform: translate(25vw, -30vh) scale(1.35); }
  100% { transform: translate(0, 0) scale(0.9); }
`;
const drift4 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-35vw, -25vh) scale(1.2); }
  100% { transform: translate(0, 0) scale(1); }
`;

// Blob definitions: color, size, start position, animation, speed
const BLOBS = [
  { color: '#0038A8', size: '55vmax', top: '-15%', left: '-10%',  anim: drift1, dur: '22s' }, // PH blue
  { color: '#CE1126', size: '45vmax', top: '40%',  left: '55%',   anim: drift2, dur: '26s' }, // PH red
  { color: '#FCD116', size: '40vmax', top: '5%',   left: '60%',   anim: drift3, dur: '30s' }, // PH yellow
  { color: '#00C2B8', size: '38vmax', top: '55%',  left: '-10%',  anim: drift4, dur: '28s' }, // teal
];

function AuroraBackground({ isDarkMode }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Layer 1: moving gradient + hue cycle */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode
            ? 'linear-gradient(120deg, #070b1a, #14213d, #2a1245, #0b2a3a, #070b1a)'
            : 'linear-gradient(120deg, #dbe9ff, #fff3c9, #ffd9e0, #d4f5f0, #dbe9ff)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 18s ease infinite, ${hueCycle} 40s ease-in-out infinite`,
        }}
      />

      {/* Layer 2: floating glowing blobs */}
      {BLOBS.map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${b.color}, transparent 70%)`,
            filter: 'blur(70px)',
            opacity: isDarkMode ? 0.5 : 0.4,
            mixBlendMode: isDarkMode ? 'screen' : 'multiply',
            willChange: 'transform',
            animation: `${b.anim} ${b.dur} ease-in-out infinite`,
          }}
        />
      ))}
    </Box>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TODO 3.7 [Global Search Coordination]
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationName, setLocationName] = useState('');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: { main: isDarkMode ? '#7aa7ff' : '#0038A8' }, // PH blue
          secondary: { main: '#CE1126' },                        // PH red
        },
        shape: { borderRadius: 12 },
        typography: { fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif' },
      }),
    [isDarkMode]
  );

  const handleSearchSubmit = async (name) => {
    // TODO 3.8 [Operational Async Glue Engine]
    setLoading(true);
    setHasSearched(true);
    setLocationName(name);
    try {
      const results = await searchPhotosByLocation(name);
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
      <AuroraBackground isDarkMode={isDarkMode} />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          // Respect users who prefer less motion
          '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important' } },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Fade in timeout={900}>
            <Paper
              elevation={0}
              sx={(t) => ({
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                textAlign: 'center',
                mb: 4,
                border: `1px solid ${alpha(t.palette.common.white, isDarkMode ? 0.12 : 0.6)}`,
                backgroundColor: alpha(t.palette.background.paper, isDarkMode ? 0.55 : 0.6),
                backdropFilter: 'blur(18px) saturate(160%)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              })}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  color="inherit"
                  aria-label="Toggle light and dark mode"
                  sx={{
                    transition: 'transform 0.6s ease',
                    '&:hover': { transform: 'rotate(180deg)' },
                  }}
                >
                  {isDarkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Box>

              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                <Box
                  component="span"
                  sx={{ display: 'inline-block', mr: 1, animation: `${walk} 1.2s ease-in-out infinite` }}
                >
                  🚶
                </Box>
                <Box
                  component="span"
                  sx={(t) => ({
                    background: `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  })}
                >
                  Lakbay PH
                </Box>
              </Typography>

              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Explore tourist spots across regions, cities, and municipalities in the Philippines
              </Typography>

              <LocationForm onSearch={handleSearchSubmit} />
            </Paper>
          </Fade>

          {hasSearched && (
            <MediaGallery photos={photos} loading={loading} locationName={locationName} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}