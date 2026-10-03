import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Grid, Card, CardMedia, CardContent, Typography,
  Skeleton, Dialog, DialogContent, IconButton, Link,
  TextField, InputAdornment, // NEW: search field
} from '@mui/material';
import {
  Close, Whatshot, Groups, AutoAwesome,
  Favorite, FavoriteBorder, Search, // NEW: heart icons + search icon
} from '@mui/icons-material';
import { FEATURED_CATEGORIES } from '../data/featuredSpots';
import { getFeaturedPhoto } from '../services/geoPhotoService';

const TAB_ICONS = {
  popular: <Whatshot />,
  visited: <Groups />,
  beautiful: <AutoAwesome />,
  favorites: <Favorite />, // NEW
};

const FAVORITES_KEY = 'lakbay-ph-favorites'; // NEW: localStorage key

// NEW: every spot from every category, without duplicates (e.g. Intramuros appears twice)
const ALL_SPOTS = FEATURED_CATEGORIES.flatMap((c) => c.spots).filter(
  (spot, index, list) => list.findIndex((s) => s.name === spot.name) === index
);

export default function FeaturedList() {
  const [activeKey, setActiveKey] = useState(FEATURED_CATEGORIES[0].key);
  // photos[query] -> undefined = loading, null = none found, object = photo
  const [photos, setPhotos] = useState({});
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // NEW: text typed in the search field

  // NEW: favorites are saved as an array of spot names and loaded from localStorage on first render
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  });

  // NEW: save favorites every time they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Could not save favorites:', error);
    }
  }, [favorites]);

  // NEW: add the spot if it is not saved yet, remove it if it is
  const toggleFavorite = (spotName) => {
    setFavorites((prev) =>
      prev.includes(spotName) ? prev.filter((n) => n !== spotName) : [...prev, spotName]
    );
  };

  // NEW: spots for the active tab (the favorites tab uses the saved names)
  const tabSpots =
    activeKey === 'favorites'
      ? ALL_SPOTS.filter((spot) => favorites.includes(spot.name))
      : FEATURED_CATEGORIES.find((c) => c.key === activeKey).spots;

  // NEW: filter the tab's spots by whatever the user typed (name, location, or description)
  const term = searchTerm.trim().toLowerCase();
  const visibleSpots = term
    ? tabSpots.filter((spot) =>
        `${spot.name} ${spot.location} ${spot.description}`.toLowerCase().includes(term)
      )
    : tabSpots;

  // Load photos only for the spots currently shown (cached in the service)
  const visibleKey = visibleSpots.map((s) => s.query).join('|');
  useEffect(() => {
    let cancelled = false;
    visibleSpots.forEach(async (spot) => {
      const photo = await getFeaturedPhoto(spot.query);
      if (!cancelled) {
        setPhotos((prev) => ({ ...prev, [spot.query]: photo }));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  // NEW: message shown when there is nothing to display
  const emptyMessage =
    activeKey === 'favorites' && favorites.length === 0
      ? 'No favorites yet. Tap the heart on a spot to save it here.'
      : 'No spots match your search.';

  return (
    <Box>
      <Typography className="location-title" variant="h5">
        Featured Tourist Spots
      </Typography>

      <Tabs
        className="featured-tabs"
        value={activeKey}
        onChange={(_, value) => setActiveKey(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, '& .MuiTabs-flexContainer': { justifyContent: { sm: 'center' } } }}
      >
        {FEATURED_CATEGORIES.map((c) => (
          <Tab
            key={c.key}
            value={c.key}
            label={c.label}
            icon={TAB_ICONS[c.key]}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
        {/* NEW: My Favorites tab with a live count */}
        <Tab
          value="favorites"
          label={`My Favorites (${favorites.length})`}
          icon={TAB_ICONS.favorites}
          iconPosition="start"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
      </Tabs>

      {/* NEW: search field that filters the cards as you type */}
      <Box className="featured-search">
        <TextField
          fullWidth
          size="small"
          placeholder="Search featured spots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {visibleSpots.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {visibleSpots.map((spot) => {
            const photo = photos[spot.query];
            const isFavorite = favorites.includes(spot.name);
            return (
              <Grid item xs={12} sm={6} md={4} key={`${activeKey}-${spot.name}`}>
                <Card
                  className="photo-card"
                  elevation={4}
                  onClick={() => setSelected({ spot, photo })}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {/* NEW: heart button (stopPropagation so it doesn't open the dialog) */}
                  <IconButton
                    className="favorite-btn"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(spot.name);
                    }}
                  >
                    {isFavorite ? <Favorite sx={{ color: '#ce1126' }} /> : <FavoriteBorder />}
                  </IconButton>

                  {photo === undefined ? (
                    <Skeleton variant="rectangular" height={220} />
                  ) : photo ? (
                    <CardMedia
                      component="img"
                      height="220"
                      image={photo.imageUrl}
                      alt={photo.altText || spot.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box className="featured-placeholder">🏝️</Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {spot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {spot.location}
                    </Typography>
                    <Typography variant="body2">{spot.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Enlarged view */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 1, bgcolor: 'background.default' }}>
          <IconButton
            onClick={() => setSelected(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 1 }}
          >
            <Close />
          </IconButton>

          {selected && (
            <>
              {selected.photo && (
                <img
                  src={selected.photo.imageUrl.replace('large', 'large2x')}
                  alt={selected.photo.altText || selected.spot.name}
                  style={{ width: '100%', borderRadius: 8, display: 'block' }}
                />
              )}
              <Box className="photo-info">
                <Typography className="photo-info-title" variant="h6">
                  📍 {selected.spot.name}, {selected.spot.location}
                </Typography>
                <Typography className="photo-info-text" variant="body2">
                  {selected.spot.description}
                </Typography>
                {selected.photo && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    📸 Captured by{' '}
                    <Link href={selected.photo.photographerUrl} target="_blank" rel="noopener noreferrer">
                      {selected.photo.photographer}
                    </Link>
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}