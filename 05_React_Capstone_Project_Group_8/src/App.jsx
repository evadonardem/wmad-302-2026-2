import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, Typography,
  Box, IconButton, Paper, Fade, Tabs, Tab, Badge,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { LightMode, DarkMode, Search, Favorite } from '@mui/icons-material';
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
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const hueCycle = keyframes`
  0%   { filter: hue-rotate(0deg) saturate(1.1); }
  33%  { filter: hue-rotate(35deg) saturate(1.3); }
  66%  { filter: hue-rotate(-30deg) saturate(1.2); }
  100% { filter: hue-rotate(0deg) saturate(1.1); }
`;
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

const BLOBS = [
  { color: '#0038A8', size: '55vmax', top: '-15%', left: '-10%', anim: drift1, dur: '22s' },
  { color: '#CE1126', size: '45vmax', top: '40%',  left: '55%',  anim: drift2, dur: '26s' },
  { color: '#FCD116', size: '40vmax', top: '5%',   left: '60%',  anim: drift3, dur: '30s' },
  { color: '#00C2B8', size: '38vmax', top: '55%',  left: '-10%', anim: drift4, dur: '28s' },
];

function AuroraBackground({ isDarkMode }) {
  return (
    <Box
      aria-hidden
      sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
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

// ---------- Favorites storage ----------
const FAVORITES_KEY = 'lakbay-ph-favorites';

const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TODO 3.7 [Global Search Coordination]
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationName, setLocationName] = useState('');

  // Favorites + which tab is showing
  const [favorites, setFavorites] = useState(loadFavorites);
  const [tab, setTab] = useState('search');

  // Save favorites every time they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Could not save favorites:', error);
    }
  }, [favorites]);

  const handleToggleFavorite = (photo) => {
    setFavorites((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [{ ...photo, locationName: photo.locationName || locationName }, ...prev]
    );
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: { main: isDarkMode ? '#7aa7ff' : '#0038A8' },
          secondary: { main: '#CE1126' },
        },
        shape: { borderRadius: 12 },
        typography: { fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif' },
      }),
    [isDarkMode]
  );

  const handleSearchSubmit = async (name) => {
    // TODO 3.8 [Operational Async Glue Engine]
    setTab('search');
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
                mb: 3,
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
                  sx={{ transition: 'transform 0.6s ease', '&:hover': { transform: 'rotate(180deg)' } }}
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

          {/* Tabs: Search results / Favorites */}
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab value="search" icon={<Search />} iconPosition="start" label="Search results" />
            <Tab
              value="favorites"
              iconPosition="start"
              icon={
                <Badge badgeContent={favorites.length} color="secondary" max={99}>
                  <Favorite />
                </Badge>
              }
              label="Favorites"
              sx={{ '& .MuiBadge-root': { mr: 1 } }}
            />
          </Tabs>

          {tab === 'search' && hasSearched && (
            <MediaGallery
              photos={photos}
              loading={loading}
              locationName={locationName}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {tab === 'search' && !hasSearched && (
            <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
              Choose a region and city, then press Search to see photos.
            </Typography>
          )}

          {tab === 'favorites' && (
            <MediaGallery
              photos={favorites}
              loading={false}
              title="Your favorite spots"
              emptyEmoji="💔"
              emptyMessage="No favorites yet. Tap the heart on a photo to save it here."
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}