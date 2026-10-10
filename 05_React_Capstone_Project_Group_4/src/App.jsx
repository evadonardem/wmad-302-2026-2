import React, { useEffect, useState } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
} from '@mui/material';
import { LightMode, DarkMode, TravelExplore, Favorite } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import FavoritePlacesPage from './components/FavoritePlacesPage';
import { searchPhotosByLocation } from './services/geoPhotoService';
import { readFavorites, saveFavorites } from './utils/favorites';

const PH_BLUE = '#0038A8';
const PH_RED = '#CE1126';
const PH_GOLD = '#FCD116';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState('');
  const [currentView, setCurrentView] = useState('explore');
  const [favoritePhotos, setFavoritePhotos] = useState(() => readFavorites());
  const mode = isDarkMode ? 'dark' : 'light';

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: isDarkMode ? '#7FA3FF' : PH_BLUE },
      secondary: { main: PH_RED },
      warning: { main: PH_GOLD },
      background: {
        default: isDarkMode ? '#070E26' : '#F5F8FF',
        paper: isDarkMode ? '#0F1A3D' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      h1: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' },
    },
    shape: { borderRadius: 16 },
  });

  useEffect(() => {
    saveFavorites(favoritePhotos);
  }, [favoritePhotos]);

  const handleSearchSubmit = async (locationName) => {
    setSearchedLocation(locationName);
    setCurrentView('explore');
    setLoading(true);
    try {
      setPhotos(await searchPhotosByLocation(locationName));
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (photo) => {
    const toSave = photo && typeof photo === 'object' ? { ...photo, id: String(photo.id) } : null;
    if (!toSave) return;

    setFavoritePhotos((prev) => {
      const exists = prev.some((item) => String(item.id) === String(toSave.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(toSave.id));
      }

      return [...prev, toSave];
    });
  };

  const isFavorite = (id) => favoritePhotos.some((favorite) => String(favorite.id) === String(id));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          component="header"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            pt: { xs: 3, md: 4 },
            pb: { xs: 14, md: 18 },
            background: isDarkMode
              ? 'linear-gradient(160deg, #0A1A5C 0%, #050C26 100%)'
              : `linear-gradient(160deg, ${PH_BLUE} 0%, #001A66 100%)`,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: { xs: -260, md: -300 },
              right: { xs: -260, md: -180 },
              width: { xs: 560, md: 760 },
              height: { xs: 560, md: 760 },
              borderRadius: '50%',
              background: `repeating-conic-gradient(from 0deg, ${PH_GOLD} 0deg 9deg, transparent 9deg 45deg)`,
              WebkitMaskImage: 'radial-gradient(circle, #000 18%, transparent 68%)',
              maskImage: 'radial-gradient(circle, #000 18%, transparent 68%)',
              opacity: 0.55,
              animation: 'sunTurn 160s linear infinite',
              '@keyframes sunTurn': { to: { transform: 'rotate(360deg)' } },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: { xs: -60, md: -90 },
              right: { xs: -60, md: 20 },
              width: { xs: 180, md: 260 },
              height: { xs: 180, md: 260 },
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, #FFE680, ${PH_GOLD} 60%, #F5A800)`,
              boxShadow: `0 0 120px 20px ${PH_GOLD}66`,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: { xs: 6, md: 10 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <IconButton
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle dark mode"
                  sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}
                >
                  {isDarkMode ? <LightMode /> : <DarkMode />}
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TravelExplore sx={{ color: PH_GOLD }} />
                  <Typography sx={{ fontWeight: 700 }}>Lakbay PH</Typography>
                </Box>

                <Button
                  variant={currentView === 'explore' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => setCurrentView('explore')}
                  sx={{
                    color: currentView === 'explore' ? '#0B1D52' : '#fff',
                    borderColor: 'rgba(255,255,255,0.35)',
                    textTransform: 'none',
                    ml: 0.5,
                  }}
                >
                  Explore
                </Button>

                <Button
                  variant={currentView === 'favorites' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => setCurrentView('favorites')}
                  startIcon={<Favorite />}
                  sx={{
                    color: currentView === 'favorites' ? '#0B1D52' : '#fff',
                    borderColor: 'rgba(255,255,255,0.35)',
                    textTransform: 'none',
                  }}
                >
                  Favorites
                  {favoritePhotos.length > 0 && (
                    <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.15, borderRadius: 999, bgcolor: 'rgba(11,29,82,0.15)', fontSize: '0.75rem' }}>
                      {favoritePhotos.length}
                    </Box>
                  )}
                </Button>
              </Box>
            </Box>

            <Typography
              variant="h1"
              sx={{ fontSize: { xs: '3.2rem', sm: '5rem', md: '7rem' }, lineHeight: 0.95, maxWidth: 760 }}
            >
              Wander all
              <br />
              7,641 islands.
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: 480, fontSize: { xs: '1rem', md: '1.2rem' }, color: 'rgba(255,255,255,0.85)' }}>
              Find tourist spots in any region, city, or municipality!
            </Typography>
          </Container>

          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              height: 8,
              background: `linear-gradient(90deg, ${PH_BLUE} 33.3%, ${PH_RED} 33.3% 66.6%, ${PH_GOLD} 66.6%)`,
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ pb: 8 }}>
          {currentView === 'favorites' ? (
            <FavoritePlacesPage
              favorites={favoritePhotos}
              onToggleFavorite={toggleFavorite}
              onBackToExplore={() => setCurrentView('explore')}
            />
          ) : (
            <>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  mt: { xs: -9, md: -11 },
                  mb: 6,
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 5,
                  boxShadow: isDarkMode ? '0 24px 60px rgba(0,0,0,0.5)' : '0 24px 60px rgba(0,56,168,0.22)',
                }}
              >
                <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, mb: 0.5 }}>
                  Where to?
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                  Choose a region, then a city or municipality.
                </Typography>
                <LocationForm onSearch={handleSearchSubmit} />
              </Paper>

              <MediaGallery
                photos={photos}
                loading={loading}
                searchedLocation={searchedLocation}
                favorites={favoritePhotos}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
              />
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}