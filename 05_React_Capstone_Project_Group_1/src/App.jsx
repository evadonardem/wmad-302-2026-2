import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  Box,
  IconButton,
  Paper,
  Button, // used for the "Back to featured" button
} from '@mui/material';
import { LightMode, DarkMode, ArrowBack } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import FeaturedList from './components/FeaturedList';
import { searchPhotosByLocation } from './services/geoPhotoService';
import './App.css';
import logo from './assets/crocodileauyda.png';

// localStorage keys for saved favorites
const FAVORITE_SPOTS_KEY = 'lakbay-ph-favorites'; // saved featured spots (array of names)
const FAVORITE_PHOTOS_KEY = 'lakbay-ph-favorite-photos'; // saved search photos (array of photo objects)

// Reads a saved array from localStorage (returns [] if nothing is saved or it is unreadable)
const loadList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  // false = show the featured list, true = show search results
  const [hasSearched, setHasSearched] = useState(false);
  // Counts the searches, so late results of an old search never replace the newest one
  const searchIdRef = useRef(0);

  // Favorites are kept here so both the featured list and the search gallery can use them
  const [favoriteSpots, setFavoriteSpots] = useState(() => loadList(FAVORITE_SPOTS_KEY));
  const [favoritePhotos, setFavoritePhotos] = useState(() => loadList(FAVORITE_PHOTOS_KEY));

  // Save favorites every time they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_SPOTS_KEY, JSON.stringify(favoriteSpots));
    } catch (error) {
      console.error('Could not save favorite spots:', error);
    }
  }, [favoriteSpots]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_PHOTOS_KEY, JSON.stringify(favoritePhotos));
    } catch (error) {
      console.error('Could not save favorite photos:', error);
    }
  }, [favoritePhotos]);

  // Add the spot if it is not saved yet, remove it if it is
  const toggleFavoriteSpot = (spotName) => {
    setFavoriteSpots((prev) =>
      prev.includes(spotName) ? prev.filter((n) => n !== spotName) : [...prev, spotName]
    );
  };

  // Same for a search photo (we also save the place name so it can be shown later)
  const toggleFavoritePhoto = (photo, place) => {
    setFavoritePhotos((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [...prev, { ...photo, locationName: place }]
    );
  };

  // Toggle the "dark" class on <body> so the CSS variables switch themes
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

  // Used by both the dropdown form and the featured search field
  const handleSearchSubmit = async (cityName) => {
    const searchId = ++searchIdRef.current;
    const isLatest = () => searchIdRef.current === searchId;

    setHasSearched(true); // switch from featured list to search results
    setLoading(true);
    setLocationName(cityName);
    try {
      // The first photos come back quickly, the rest of the pages are added when they finish loading
      const results = await searchPhotosByLocation(cityName, (allResults) => {
        if (isLatest()) setPhotos(allResults);
      });
      if (isLatest()) setPhotos(results);
    } catch (error) {
      console.error('Search failed:', error);
      if (isLatest()) setPhotos([]);
    } finally {
      if (isLatest()) setLoading(false);
    }
  };

  // Go back to the featured list and clear the previous search
  const handleBackToFeatured = () => {
    searchIdRef.current += 1; // ignore results of a search that is still loading
    setLoading(false);
    setHasSearched(false);
    setPhotos([]);
    setLocationName('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-wrapper">
        {/* Floating decorative circles */}
        <Box className="decor-circle decor-circle-1" />
        <Box className="decor-circle decor-circle-2" />

        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Header card: logo, title, and search form */}
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
              <Typography className="app-title" variant="h2" component="h1">
                Lakbay PH
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              Explore tourist spots across regions, cities, and municipalities in the Philippines
            </Typography>

            <LocationForm onSearch={handleSearchSubmit} loading={loading} />
          </Paper>

          {/* Featured list before any search, search results after */}
          <Box>
            {hasSearched ? (
              <>
                <Button
                  className="back-button"
                  startIcon={<ArrowBack />}
                  onClick={handleBackToFeatured}
                  sx={{ textTransform: 'none', mb: 2 }}
                >
                  Back to featured
                </Button>
                <MediaGallery
                  photos={photos}
                  loading={loading}
                  locationName={locationName}
                  favoritePhotos={favoritePhotos}
                  onToggleFavorite={toggleFavoritePhoto}
                />
              </>
            ) : (
              <FeaturedList
                onSearch={handleSearchSubmit}
                favoriteSpots={favoriteSpots}
                onToggleSpot={toggleFavoriteSpot}
                favoritePhotos={favoritePhotos}
                onTogglePhoto={toggleFavoritePhoto}
              />
            )}
          </Box>

          {/* Footer */}
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