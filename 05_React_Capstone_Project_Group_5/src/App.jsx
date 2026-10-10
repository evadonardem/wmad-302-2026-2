import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardMedia,
  Container,
  CssBaseline,
  Grid,
  Link,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { DarkMode, ImageNotSupportedOutlined, LightMode } from '@mui/icons-material';
import './App.css';
import Logo from '../assets/images/Logo.png';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import PhotoDetailDialog from './components/PhotoDetailDialog';
import { searchPhotosByLocation } from './services/geoPhotoService';

const featuredDestinations = [
  {
    name: 'El Nido',
    region: 'Palawan',
    islandGroup: 'Luzon',
    accent: '#176B78',
  },
  {
    name: 'Banaue Rice Terraces',
    region: 'Ifugao',
    islandGroup: 'Luzon',
    accent: '#4B7256',
  },
  {
    name: 'Mayon Volcano',
    region: 'Albay',
    islandGroup: 'Luzon',
    accent: '#8A5546',
  },
  {
    name: 'Intramuros',
    region: 'Manila',
    islandGroup: 'Luzon',
    accent: '#75634B',
  },
  {
    name: 'Boracay',
    region: 'Aklan',
    islandGroup: 'Visayas',
    accent: '#A75B3D',
  },
  {
    name: 'Chocolate Hills',
    region: 'Bohol',
    islandGroup: 'Visayas',
    accent: '#657444',
  },
  {
    name: 'Kawasan Falls',
    region: 'Cebu',
    islandGroup: 'Visayas',
    accent: '#287A78',
  },
  {
    name: 'Cambugahay Falls',
    region: 'Siquijor',
    islandGroup: 'Visayas',
    accent: '#4F8068',
  },
  {
    name: 'Siargao Island',
    region: 'Surigao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Siargao', 'General Luna', 'Cloud 9'],
    accent: '#38736E',
  },
  {
    name: 'Camiguin Island',
    region: 'Camiguin',
    islandGroup: 'Mindanao',
    photoKeywords: ['Camiguin'],
    accent: '#52704F',
  },
  {
    name: 'Mount Apo',
    region: 'Davao Region',
    islandGroup: 'Mindanao',
    photoKeywords: ['Mount Apo', 'Mt. Apo'],
    accent: '#5A6546',
  },
  {
    name: 'Tinago Falls',
    region: 'Lanao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Tinago Falls', 'Tinago', 'Iligan'],
    accent: '#286A7A',
  },
];

const islandGroups = [
  { name: 'Luzon' },
  { name: 'Visayas' },
  { name: 'Mindanao' },
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSummary, setSearchSummary] = useState('');
  const [featuredItems, setFeaturedItems] = useState(featuredDestinations);
  const [selectedFeaturedPhoto, setSelectedFeaturedPhoto] = useState(null);

  useEffect(() => {
    if (!import.meta.env.VITE_PEXELS_API_KEY) return undefined;

    let isCurrent = true;

    const loadFeaturedPhotos = async () => {
      const destinationsWithPhotos = await Promise.all(
        featuredDestinations.map(async (destination) => {
          const results = await searchPhotosByLocation(destination.name, destination.region);
          const photoKeywords = destination.photoKeywords || [destination.name];
          const matchingPhoto = results.find((result) =>
            photoKeywords.some((keyword) => result.altText.toLowerCase().includes(keyword.toLowerCase()))
          );
          const photo = matchingPhoto || results[0] || null;

          return { ...destination, photo };
        })
      );

      if (isCurrent) setFeaturedItems(destinationsWithPhotos);
    };

    void loadFeaturedPhotos();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Dynamic Theme Creator configuration
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: '#28675a' },
      secondary: { main: '#a95f43' },
      background: {
        default: isDarkMode ? '#1a120d' : '#d9b08a',
        paper: isDarkMode ? '#261d1b' : '#c98d62',
      },
      text: {
        primary: isDarkMode ? '#f7efe8' : '#2a1d17',
        secondary: isDarkMode ? '#d7c0ab' : '#624f43',
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"DM Sans", sans-serif',
      h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
      h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    },
  });

  const handleSearchSubmit = async (locationName, provinceName) => {
    const resolvedLocation = locationName?.trim();
    const resolvedContext = provinceName?.trim();

    setHasSearched(true);
    setLoading(true);
    setSearchSummary(
      resolvedLocation && resolvedContext ? `${resolvedLocation}, ${resolvedContext}` : resolvedLocation || 'Selected location'
    );

    try {
      const photoResults = await searchPhotosByLocation(resolvedLocation, resolvedContext);
      setPhotos(photoResults);
    } catch (error) {
      console.error('Unable to complete photo search:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setHasSearched(false);
    setSearchSummary('');
    setPhotos([]);
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        className={isDarkMode ? 'app-shell dark' : 'app-shell light'}
        sx={{
          minHeight: '100vh',
          background: 'transparent',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg" sx={{ minHeight: '100vh', py: { xs: 2, md: 3 } }}>
          <Box
            component="header"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 2,
              mb: { xs: 3, md: 4 },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={Logo}
                alt="Lakbay PH logo"
                sx={{
                  width: 68,
                  height: 68,
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 10px 24px rgba(20, 39, 48, 0.12)',
                  background: 'rgba(255,255,255,0.18)',
                  p: 0.5,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>
                  Lakbay <Box component="span" sx={{ color: 'primary.main' }}>PH</Box>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Philippines travel finder
                </Typography>
              </Box>
            </Box>
            <button
              type="button"
              className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setIsDarkMode((darkMode) => !darkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle__label">{isDarkMode ? 'Light' : 'Dark'}</span>
              <span className="theme-toggle__icon">
                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </span>
            </button>
          </Box>

          <Box component="section" aria-labelledby="page-title" sx={{ mb: 3 }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
              EXPLORE THE PHILIPPINES
            </Typography>
            <Typography
              id="page-title"
              component="h1"
              variant="h1"
              className="hero-title"
              sx={{
                fontSize: { xs: '2.4rem', md: '3.6rem' },
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
                mb: 1,
                maxWidth: '620px',
              }}
            >
              Find a place to remember.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: '640px', fontSize: { xs: '1rem', md: '1.08rem' } }}>
              Choose a region and city or municipality to discover places across the islands.
            </Typography>

          </Box>

          <Paper
            component="section"
            aria-label="Choose a location to explore"
            elevation={0}
            className="search-panel"
            sx={{
              p: { xs: 2, md: 2.5 },
              mb: 4,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Search by location
            </Typography>
            <LocationForm onSearch={handleSearchSubmit} />
          </Paper>

          {hasSearched ? (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1.5 }}>
                    SEARCH RESULTS
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                    {searchSummary || 'Your selected location'}
                  </Typography>
                </Box>

                <Button
                  variant="text"
                  onClick={handleResetSearch}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  Back to featured places
                </Button>
              </Box>

              <MediaGallery photos={photos} loading={loading} locationName={searchSummary} />
            </Box>
          ) : (
            <Box component="section" aria-labelledby="featured-destinations-title" sx={{ pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography id="featured-destinations-title" variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.25rem' } }}>
                    FEATURED PLACES
                  </Typography>
                </Box>
              </Box>

              {islandGroups.map((group) => (
                <Box
                  key={group.name}
                  component="section"
                  aria-labelledby={`${group.name.toLowerCase()}-destinations-title`}
                  sx={{ mb: 4 }}
                >
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      id={`${group.name.toLowerCase()}-destinations-title`}
                      component="h3"
                      variant="h5"
                      className="region-title"
                      sx={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.02em' }}
                    >
                      {group.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {featuredItems.filter((destination) => destination.islandGroup === group.name).map((destination) => (
                      <Grid key={destination.name} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                          key={`${destination.name}-${destination.photo?.imageUrl ?? 'no-image'}`}
                          className="featured-card"
                          sx={{
                            height: { xs: 220, md: 240 },
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 1,
                            color: 'common.white',
                            bgcolor: destination.accent,
                            transition: 'transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease',
                            transformOrigin: 'center',
                            '&:hover': {
                              boxShadow: 6,
                              transform: 'translateY(-4px) scale(1.01)',
                              filter: 'saturate(1.06)',
                            },
                          }}
                        >
                          {destination.photo ? (
                            <ButtonBase
                              onClick={() =>
                                setSelectedFeaturedPhoto({
                                  photo: destination.photo,
                                  title: destination.name,
                                  subtitle: `${destination.region}, ${destination.islandGroup}`,
                                })
                              }
                              aria-label={`View photo details for ${destination.name}`}
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'block',
                                width: '100%',
                                height: '100%',
                              }}
                            >
                              <CardMedia
                                component="img"
                                className="featured-card__media"
                                image={destination.photo.imageUrl}
                                alt={destination.photo.altText}
                                sx={{ height: '100%', objectFit: 'cover' }}
                              />
                            </ButtonBase>
                          ) : (
                            <Box
                              role="img"
                              aria-label={`No matching photo found for ${destination.name}`}
                              sx={{
                                height: '100%',
                                px: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.75,
                                textAlign: 'center',
                                bgcolor: '#52675f',
                                color: 'common.white',
                              }}
                            >
                              <ImageNotSupportedOutlined aria-hidden="true" />
                              <Typography variant="body2" fontWeight={700}>
                                Photo unavailable
                              </Typography>
                              <Typography variant="caption">
                                No matching image was found.
                              </Typography>
                            </Box>
                          )}
                          <Box
                            className="featured-card__details"
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-end',
                              p: 2,
                              pointerEvents: 'none',
                              background: 'linear-gradient(180deg, transparent 10%, rgba(0, 0, 0, 0.78) 100%)',
                            }}
                          >
                            <Typography variant="overline" sx={{ lineHeight: 1.5, color: '#e8c99c' }}>
                              {destination.region}
                            </Typography>
                            <Typography variant="h6" component="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
                              {destination.name}
                            </Typography>
                            {destination.photo?.photographer && (
                              <Typography variant="caption" sx={{ mt: 0.75, color: 'common.white' }}>
                                Photo by{' '}
                                <Link
                                  href={destination.photo.photographerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="inherit"
                                  sx={{ color: 'common.white', textDecorationColor: 'currentColor', pointerEvents: 'auto' }}
                                >
                                  {destination.photo.photographer}
                                </Link>
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
            <PhotoDetailDialog
              open={Boolean(selectedFeaturedPhoto)}
              photo={selectedFeaturedPhoto?.photo}
              title={selectedFeaturedPhoto?.title}
              subtitle={selectedFeaturedPhoto?.subtitle}
              onClose={() => setSelectedFeaturedPhoto(null)}
            />
        </Container>
      </Box>
    </ThemeProvider>
  );
}