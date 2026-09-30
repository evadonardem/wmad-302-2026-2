import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  Link,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

const featuredDestinations = [
  {
    name: 'El Nido',
    region: 'Palawan',
    islandGroup: 'Luzon',
    description: 'Limestone cliffs and hidden lagoons',
    accent: '#176B78',
  },
  {
    name: 'Banaue Rice Terraces',
    region: 'Ifugao',
    islandGroup: 'Luzon',
    description: 'Mountain terraces shaped over generations',
    accent: '#4B7256',
  },
  {
    name: 'Mayon Volcano',
    region: 'Albay',
    islandGroup: 'Luzon',
    description: 'A striking, near-symmetrical volcano',
    accent: '#8A5546',
  },
  {
    name: 'Intramuros',
    region: 'Manila',
    islandGroup: 'Luzon',
    description: 'Historic streets inside the old walled city',
    accent: '#75634B',
  },
  {
    name: 'Boracay',
    region: 'Aklan',
    islandGroup: 'Visayas',
    description: 'White Beach and island sunsets',
    accent: '#A75B3D',
  },
  {
    name: 'Chocolate Hills',
    region: 'Bohol',
    islandGroup: 'Visayas',
    description: 'A landscape of more than a thousand hills',
    accent: '#657444',
  },
  {
    name: 'Kawasan Falls',
    region: 'Cebu',
    islandGroup: 'Visayas',
    description: 'Turquoise cascades in the mountains of Badian',
    accent: '#287A78',
  },
  {
    name: 'Cambugahay Falls',
    region: 'Siquijor',
    islandGroup: 'Visayas',
    description: 'Tiered pools tucked into a tropical forest',
    accent: '#4F8068',
  },
  {
    name: 'Siargao Island',
    region: 'Surigao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Siargao', 'General Luna', 'Cloud 9'],
    description: 'Surf breaks, lagoons, and palm-lined roads',
    accent: '#38736E',
  },
  {
    name: 'Camiguin Island',
    region: 'Camiguin',
    islandGroup: 'Mindanao',
    photoKeywords: ['Camiguin'],
    description: 'Volcanic peaks, hot springs, and White Island',
    accent: '#52704F',
  },
  {
    name: 'Mount Apo',
    region: 'Davao Region',
    islandGroup: 'Mindanao',
    photoKeywords: ['Mount Apo', 'Mt. Apo'],
    description: 'The country’s highest peak and surrounding forests',
    accent: '#5A6546',
  },
  {
    name: 'Tinago Falls',
    region: 'Lanao del Norte',
    islandGroup: 'Mindanao',
    photoKeywords: ['Tinago Falls', 'Tinago', 'Iligan'],
    description: 'A hidden waterfall flowing into a blue lagoon',
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
  const [featuredItems, setFeaturedItems] = useState(featuredDestinations);

  useEffect(() => {
    if (!import.meta.env.VITE_PEXELS_API_KEY) return undefined;

    let isCurrent = true;

    const loadFeaturedPhotos = async () => {
      const destinationsWithPhotos = await Promise.all(
        featuredDestinations.map(async (destination) => {
          const results = await searchPhotosByLocation(destination.name, destination.region);
          const photoKeywords = destination.photoKeywords || [destination.name];
          const photo = results.find((result) =>
            photoKeywords.some((keyword) => result.altText.toLowerCase().includes(keyword.toLowerCase()))
          );

          return { ...destination, photo: photo || null };
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
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"DM Sans", sans-serif',
      h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
      h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    },
  });

  const handleSearchSubmit = async (locationName) => {
    setHasSearched(true);
    setLoading(true);
    try {
      const photoResults = await searchPhotosByLocation(locationName);
      setPhotos(photoResults);
    } catch (error) {
      console.error('Unable to complete photo search:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          backgroundColor: isDarkMode ? '#172321' : '#f6f8f5',
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
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>
                Lakbay <Box component="span" sx={{ color: 'primary.main' }}>PH</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Philippines travel finder
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              color="inherit"
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>

          <Box component="section" aria-labelledby="page-title" sx={{ mb: 3 }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
              EXPLORE THE PHILIPPINES
            </Typography>
            <Typography
              id="page-title"
              component="h1"
              variant="h1"
              sx={{ fontSize: { xs: '2.1rem', md: '2.8rem' }, lineHeight: 1.15, mb: 0.75 }}
            >
              Find a place to remember.
            </Typography>
            <Typography color="text.secondary">
              Choose a region and city to discover places across the islands.
            </Typography>
          </Box>

          <Paper
            component="section"
            aria-label="Choose a location to explore"
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              mb: 4,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
              Search by location
            </Typography>
            <LocationForm onSearch={handleSearchSubmit} />
          </Paper>

          {hasSearched ? (
            <MediaGallery photos={photos} loading={loading} />
          ) : (
            <Box component="section" aria-labelledby="featured-destinations-title" sx={{ pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                    FEATURED PLACES
                  </Typography>
                  <Typography id="featured-destinations-title" variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.25rem' } }}>
                    Famous destinations
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
                      sx={{ fontSize: '1.35rem' }}
                    >
                      {group.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {featuredItems.filter((destination) => destination.islandGroup === group.name).map((destination) => (
                      <Grid key={destination.name} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                          sx={{
                            height: { xs: 220, md: 240 },
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 1,
                            color: 'common.white',
                            bgcolor: destination.accent,
                            transition: 'box-shadow 180ms ease',
                            '&:hover': { boxShadow: 5 },
                          }}
                        >
                          {destination.photo ? (
                            <CardMedia
                              component="img"
                              image={destination.photo.imageUrl}
                              alt={destination.photo.altText}
                              sx={{ height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box aria-hidden="true" sx={{ height: '100%', bgcolor: destination.accent }} />
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-end',
                              p: 2,
                              background: 'linear-gradient(180deg, transparent 10%, rgba(0, 0, 0, 0.78) 100%)',
                            }}
                          >
                            <Typography variant="overline" sx={{ lineHeight: 1.5, color: '#e8c99c' }}>
                              {destination.region}
                            </Typography>
                            <Typography variant="h6" component="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
                              {destination.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {destination.description}
                            </Typography>
                            {destination.photo?.photographer && (
                              <Typography variant="caption" sx={{ mt: 0.75 }}>
                                Photo by{' '}
                                <Link
                                  href={destination.photo.photographerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="inherit"
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
        </Container>
      </Box>
    </ThemeProvider>
  );
}