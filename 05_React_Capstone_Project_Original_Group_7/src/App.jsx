import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Typography, Box, IconButton, Paper } from '@mui/material';
import './App.css';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation, getFeaturedPhotos } from './services/geoPhotoService';

const FAVORITES_KEY = 'lakbay-ph-favorites';

const loadFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchedLocation, setSearchedLocation] = useState('');
  const [favorites, setFavorites] = useState(loadFavorites);


  const latestRequest = useRef(0);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  const favoriteIds = useMemo(() => new Set(favorites.map((photo) => photo.id)), [favorites]);


  useEffect(() => {
    const requestId = ++latestRequest.current;

    const loadFeatured = async () => {
      setLoading(true);
      const results = await getFeaturedPhotos();
      if (requestId !== latestRequest.current) return;
      setPhotos(results);
      setLoading(false);
    };
    loadFeatured();
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Could not save favorites:', error);
    }
  }, [favorites]);

  const handleSearchSubmit = async (locationName) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const results = await searchPhotosByLocation(locationName);
      if (requestId !== latestRequest.current) return;
      setPhotos(results);
      setSearchedLocation(locationName);
    } catch (error) {
      console.error('Search failed:', error);
      if (requestId !== latestRequest.current) return;
      setPhotos([]);
      setSearchedLocation(locationName);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  };

  const handleToggleFavorite = (photo) => {
    setFavorites((current) =>
      current.some((item) => item.id === photo.id)
        ? current.filter((item) => item.id !== photo.id)
        : [photo, ...current]
    );
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
            Lakbay PH
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Explore tourist spots across regions, cities, and municipalities in the Philippines
          </Typography>
          <LocationForm onSearch={handleSearchSubmit} />
        </Paper>

        <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 3 }}>
          {searchedLocation ? `Spots in ${searchedLocation}` : 'Featured spots'}
        </Typography>

        <MediaGallery
          photos={photos}
          loading={loading}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />

        <Typography id="favorites" variant="h5" component="h2" sx={{ textAlign: 'center', mt: 8, mb: 3 }}>
          {`My favorites (${favorites.length})`}
        </Typography>

        <MediaGallery
          photos={favorites}
          loading={false}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          emptyMessage="No favorites yet. Tap the heart on any photo to save it here."
        />
      </Container>
    </ThemeProvider>
  );
}