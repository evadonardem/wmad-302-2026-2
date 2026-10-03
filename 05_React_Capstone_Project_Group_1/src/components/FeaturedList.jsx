import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Tabs, Tab, Grid, Card, CardMedia, CardContent, Typography,
  Skeleton, Dialog, DialogContent, IconButton, Link,
  TextField, InputAdornment, Button, Pagination, // search field + page buttons
} from '@mui/material';
import {
  Close, Whatshot, Groups, AutoAwesome,
  Favorite, FavoriteBorder, Search, // heart icons + search icon
  Casino, // dice icon for the "Surprise me" button
} from '@mui/icons-material';
import { FEATURED_CATEGORIES } from '../data/featuredSpots';
import { getFeaturedPhoto, getSurprisePlace, getPlaceDescription } from '../services/geoPhotoService';
import PhotoActions from './PhotoActions'; // Download + Share buttons

const TAB_ICONS = {
  popular: <Whatshot />,
  visited: <Groups />,
  beautiful: <AutoAwesome />,
  favorites: <Favorite />,
};

const PAGE_SIZE = 6; // featured spots per page
const MAX_PAGES = 2; // featured pages per tab (6 x 2 = 12 spots)
const SURPRISE_FEATURED_CHANCE = 0.45; // "Surprise me": 45% featured spot, 55% normal place

// Every spot from every category, without duplicates (e.g. Intramuros appears twice)
const ALL_SPOTS = FEATURED_CATEGORIES.flatMap((c) => c.spots).filter(
  (spot, index, list) => list.findIndex((s) => s.name === spot.name) === index
);

// Favorites are stored in App.jsx and passed in as props:
// - favoriteSpots: array of saved spot names
// - favoritePhotos: array of saved search photos
export default function FeaturedList({
  onSearch,
  favoriteSpots = [],
  onToggleSpot,
  favoritePhotos = [],
  onTogglePhoto,
}) {
  const [activeKey, setActiveKey] = useState(FEATURED_CATEGORIES[0].key);
  // photos[query] -> undefined = loading, null = none found, object = photo
  const [photos, setPhotos] = useState({});
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // text typed in the search field
  const [page, setPage] = useState(1); // current page of the active tab
  const [surpriseLoading, setSurpriseLoading] = useState(false); // true while a random spot is loading
  const topRef = useRef(null); // used to scroll back to the top of the list when the page changes
  const lastSurpriseRef = useRef(null); // name of the last random featured spot, so it is not picked twice in a row

  const isFavoritesTab = activeKey === 'favorites';
  const totalFavorites = favoriteSpots.length + favoritePhotos.length;

  // Spots for the active tab (the favorites tab uses the saved names)
  const tabSpots = isFavoritesTab
    ? ALL_SPOTS.filter((spot) => favoriteSpots.includes(spot.name))
    : FEATURED_CATEGORIES.find((c) => c.key === activeKey).spots;

  // Filter the tab's spots by whatever the user typed (name, location, or description)
  const term = searchTerm.trim().toLowerCase();
  const visibleSpots = term
    ? tabSpots.filter((spot) =>
        `${spot.name} ${spot.location} ${spot.description}`.toLowerCase().includes(term)
      )
    : tabSpots;

  // Pagination: 6 spots per page, max 2 pages on the category tabs.
  // The favorites tab is not paged, it shows everything that was saved.
  const pageCount = isFavoritesTab
    ? 1
    : Math.min(MAX_PAGES, Math.ceil(visibleSpots.length / PAGE_SIZE));
  const pageSpots = isFavoritesTab
    ? visibleSpots
    : visibleSpots.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Saved search photos only show on the favorites tab (also filtered by the typed text)
  const visibleFavoritePhotos = isFavoritesTab
    ? favoritePhotos.filter(
        (photo) =>
          !term || `${photo.locationName} ${photo.altText}`.toLowerCase().includes(term)
      )
    : [];

  // Load photos only for the spots on the current page (cached in the service)
  const pageKey = pageSpots.map((s) => s.query).join('|');
  useEffect(() => {
    let cancelled = false;
    pageSpots.forEach(async (spot) => {
      const photo = await getFeaturedPhoto(spot.query, spot.fallbackQuery);
      if (!cancelled) {
        setPhotos((prev) => ({ ...prev, [spot.query]: photo }));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  const handleTabChange = (_, value) => {
    setActiveKey(value);
    setPage(1); // start on page 1 of the new tab
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // the filtered list is shorter, so start on page 1
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Search photos of the typed place (e.g. "Baguio City") on Enter or the button
  const handlePlaceSearch = (e) => {
    e.preventDefault();
    const place = searchTerm.trim();
    if (place && onSearch) onSearch(place);
  };

  // Opens a random normal place (city or municipality) in the enlarged view.
  // The photo is already known, the description is loaded after the view opens.
  const openSurprisePlace = ({ place, location, photo }) => {
    setSelected({
      spot: { name: place.name, location: location || 'Philippines' },
      place, // marks this as a normal place (not a featured spot)
      photo,
      description: undefined, // undefined = loading, null = not found
      fromSurprise: true,
    });

    getPlaceDescription(place.name, place).then((description) => {
      // Only update if the same place is still open (the user may have rolled again)
      setSelected((current) =>
        current && current.place && current.place.code === place.code
          ? { ...current, description }
          : current
      );
    });
  };

  // "Surprise me": 45% a featured spot, 55% a normal place. Never the same featured spot twice in a row.
  // If no normal place with photos can be found, a featured spot is shown instead.
  const handleSurprise = async () => {
    setSurpriseLoading(true);
    try {
      if (Math.random() >= SURPRISE_FEATURED_CHANCE) {
        const result = await getSurprisePlace();
        if (result) {
          openSurprisePlace(result);
          return;
        }
      }

      const choices = ALL_SPOTS.filter((spot) => spot.name !== lastSurpriseRef.current);
      const spot = choices[Math.floor(Math.random() * choices.length)];
      lastSurpriseRef.current = spot.name;

      const photo = await getFeaturedPhoto(spot.query, spot.fallbackQuery);
      setPhotos((prev) => ({ ...prev, [spot.query]: photo })); // so the card already has its photo later
      setSelected({ spot, photo, fromSurprise: true });
    } finally {
      setSurpriseLoading(false);
    }
  };

  // Is the opened item saved as a favorite?
  // Featured spots are saved by name, photos (normal places and saved photos) are saved by photo id.
  const isSelectedFavorite = selected
    ? selected.place || selected.isSavedPhoto
      ? favoritePhotos.some((p) => p.id === selected.photo?.id)
      : favoriteSpots.includes(selected.spot.name)
    : false;

  const handleToggleSelectedFavorite = () => {
    if (!selected) return;

    if (selected.place || selected.isSavedPhoto) {
      if (!selected.photo) return;
      // Saved photos show their place name, e.g. "Sablan, Benguet"
      const label = selected.place
        ? `${selected.spot.name}, ${selected.spot.location}`
        : selected.spot.name;
      onTogglePhoto?.(selected.photo, label);
    } else {
      onToggleSpot?.(selected.spot.name);
    }
  };

  // Message shown when there is nothing to display
  const emptyMessage =
    isFavoritesTab && totalFavorites === 0
      ? 'No favorites yet. Tap the heart on a spot or photo to save it here.'
      : 'No featured spots match. Press Enter to search photos of this place.';

  const nothingToShow = visibleSpots.length === 0 && visibleFavoritePhotos.length === 0;

  return (
    <Box ref={topRef} sx={{ scrollMarginTop: 16 }}>
      <Typography className="location-title" variant="h5">
        Featured Tourist Spots
      </Typography>

      <Tabs
        className="featured-tabs"
        value={activeKey}
        onChange={handleTabChange}
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
        {/* My Favorites tab with a live count (saved spots + saved photos) */}
        <Tab
          value="favorites"
          label={`My Favorites (${totalFavorites})`}
          icon={TAB_ICONS.favorites}
          iconPosition="start"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
      </Tabs>

      {/* Surprise me: opens a random featured spot (45%) or a random normal place (55%) */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Button
          className="surprise-btn"
          variant="contained"
          startIcon={<Casino />}
          onClick={handleSurprise}
          disabled={surpriseLoading}
          sx={{ textTransform: 'none', px: 3 }}
        >
          {surpriseLoading ? 'Picking a spot...' : 'Surprise me'}
        </Button>
      </Box>

      {/* Search field: filters the cards as you type, and searches photos of the place on Enter */}
      <Box className="featured-search" component="form" onSubmit={handlePlaceSearch}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter spots, or type a place (e.g. Baguio City) and press Enter"
          value={searchTerm}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm.trim() && (
                <InputAdornment position="end">
                  <Button type="submit" size="small" sx={{ textTransform: 'none' }}>
                    Search photos
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {nothingToShow ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* Featured spot cards (current page) */}
            {pageSpots.map((spot) => {
              const photo = photos[spot.query];
              const isFavorite = favoriteSpots.includes(spot.name);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${activeKey}-${spot.name}`}>
                  <Card
                    className="photo-card"
                    elevation={4}
                    onClick={() => setSelected({ spot, photo })}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Heart button (stopPropagation so it doesn't open the dialog) */}
                    <IconButton
                      className="favorite-btn"
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSpot?.(spot.name);
                      }}
                    >
                      {isFavorite ? <Favorite sx={{ color: '#ce1126' }} /> : <FavoriteBorder />}
                    </IconButton>

                    {/* Download + Share icon buttons on the top-right (only once the photo has loaded) */}
                    {photo && (
                      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                        <PhotoActions compact photo={photo} title={spot.name} />
                      </Box>
                    )}

                    {photo === undefined ? (
                      <Skeleton variant="rectangular" height={220} />
                    ) : photo ? (
                      <CardMedia
                        component="img"
                        height="220"
                        image={photo.thumbUrl || photo.imageUrl}
                        alt={photo.altText || spot.name}
                        loading="lazy"
                        decoding="async"
                        sx={{ objectFit: 'cover', objectPosition: 'center 35%' }}
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

            {/* Saved search photos (favorites tab only) */}
            {visibleFavoritePhotos.map((photo) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`saved-photo-${photo.id}`}>
                <Card
                  className="photo-card"
                  elevation={4}
                  onClick={() =>
                    setSelected({
                      spot: {
                        name: photo.locationName,
                        location: 'Saved photo',
                        description: photo.altText || '',
                      },
                      photo,
                      isSavedPhoto: true,
                    })
                  }
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Filled heart: tapping it removes the photo from favorites */}
                  <IconButton
                    className="favorite-btn"
                    aria-label="Remove from favorites"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePhoto?.(photo, photo.locationName);
                    }}
                  >
                    <Favorite sx={{ color: '#ce1126' }} />
                  </IconButton>

                  <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                    <PhotoActions compact photo={photo} title={photo.locationName} />
                  </Box>

                  <CardMedia
                    component="img"
                    height="220"
                    image={photo.thumbUrl || photo.imageUrl}
                    alt={photo.altText}
                    loading="lazy"
                    decoding="async"
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {photo.locationName}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      📸 Captured by:
                    </Typography>
                    <Link
                      href={photo.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      variant="body2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {photo.photographer}
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Page buttons (only on the category tabs, and only when there is more than one page) */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
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
                  src={selected.photo.imageUrl}
                  alt={selected.photo.altText || selected.spot.name}
                  decoding="async"
                  style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8, display: 'block' }}
                />
              )}
              <Box className="photo-info">
                <Typography className="photo-info-title" variant="h6">
                  📍 {selected.spot.name}, {selected.spot.location}
                </Typography>

                {/* A normal place from "Surprise me" gets a description from Wikipedia (or PSGC data),
                    featured spots and saved photos use their own text */}
                {selected.place ? (
                  <>
                    {selected.description === undefined && (
                      <>
                        <Skeleton width="100%" />
                        <Skeleton width="90%" />
                        <Skeleton width="70%" />
                      </>
                    )}

                    {selected.description === null && (
                      <Typography className="photo-info-text" variant="body2">
                        No description is available for this place yet.
                      </Typography>
                    )}

                    {selected.description && (
                      <>
                        <Typography className="photo-info-text" variant="body2">
                          {selected.description.text}
                        </Typography>
                        {selected.description.url && (
                          <Link
                            className="photo-info-source"
                            href={selected.description.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read more on Wikipedia →
                          </Link>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <Typography className="photo-info-text" variant="body2">
                    {selected.spot.description}
                  </Typography>
                )}

                {selected.photo && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    📸 Captured by{' '}
                    <Link href={selected.photo.photographerUrl} target="_blank" rel="noopener noreferrer">
                      {selected.photo.photographer}
                    </Link>
                  </Typography>
                )}

                {/* Favorite + Download (with size options) + Share */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 1.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      isSelectedFavorite ? <Favorite sx={{ color: '#ce1126' }} /> : <FavoriteBorder />
                    }
                    onClick={handleToggleSelectedFavorite}
                    sx={{ textTransform: 'none', borderRadius: 2, mt: 2 }}
                  >
                    {isSelectedFavorite ? 'Saved to favorites' : 'Add to favorites'}
                  </Button>

                  {selected.photo && <PhotoActions photo={selected.photo} title={selected.spot.name} />}
                </Box>

                {/* Only when this came from "Surprise me": roll again without closing the view */}
                {selected.fromSurprise && (
                  <Button
                    className="surprise-btn"
                    variant="contained"
                    size="small"
                    startIcon={<Casino />}
                    onClick={handleSurprise}
                    disabled={surpriseLoading}
                    sx={{ textTransform: 'none', mt: 2 }}
                  >
                    {surpriseLoading ? 'Picking a spot...' : 'Another one'}
                  </Button>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}