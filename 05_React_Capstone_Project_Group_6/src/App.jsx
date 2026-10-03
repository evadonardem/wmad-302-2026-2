import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, GlobalStyles,
  Typography, Box, IconButton, Button, Chip, Fab,
} from '@mui/material';
import { LightMode, DarkMode, Shuffle, KeyboardArrowUp } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import ThemeBackdrop from './components/ThemeBackdrop';
import { searchPhotosByLocation, PHOTOS_PER_PAGE } from './services/geoPhotoService';

const FAV_KEY = 'lakbay-ph-favorites';
const THEME_KEY = 'lakbay-ph-theme';
const RECENT_KEY = 'lakbay-ph-recent';
const MAX_RECENT = 5;

// ---- Strict municipality matching ----
const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // ñ -> n, etc.
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// "Baguio City, Cordillera ..." -> "baguio"; "City of Manila" -> "manila"
const placeKey = (place) =>
  normalize(String(place).split(',')[0])
    .replace(/^(city of|municipality of)\s+/, '')
    .replace(/\s+(city|municipality)$/, '')
    .trim();

// Keeps a photo only if its own text (caption, tags, location...) names the municipality
const matchesPlace = (photo, place) => {
  const key = placeKey(place);
  if (!key) return true;
  const text = Object.entries(photo)
    .filter(([k]) => !/url|place|photographer/i.test(k))
    .map(([, v]) => (Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : ''))
    .join(' ');
  return (' ' + normalize(text) + ' ').includes(' ' + key + ' ');
};

// "Surprise me" picks one of these (format: "City, Region")
const SURPRISE_SPOTS = [
  'Baguio City, Cordillera Administrative Region',
  'Vigan City, Ilocos Region',
  'Legazpi City, Bicol Region',
  'Puerto Princesa City, MIMAROPA Region',
  'El Nido, MIMAROPA Region',
  'Tagbilaran City, Central Visayas',
  'Cebu City, Central Visayas',
  'Dumaguete City, Central Visayas',
  'Davao City, Davao Region',
  'Banaue, Cordillera Administrative Region',
];

// 🌴 Flat 2D palm tree (inline SVG: solid colors, no gradients, no shadows).
// Size it with fontSize, same as before (the icon is 1em x 1em).
const PalmEmoji = ({ sx, ...props }) => (
  <Box
    component="svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Palm Tree"
    sx={{
      display: 'inline-block',
      width: '1em',
      height: '1em',
      flexShrink: 0,
      userSelect: 'none',
      ...sx,
    }}
    {...props}
  >
    {/* trunk */}
    <path
      d="M30 61 C30 46 34 34 36 23"
      fill="none"
      stroke="#8B5A2B"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* fronds */}
    <g fill="#2E9E5B">
      <path d="M36 22 C26 12 12 14 5 25 C16 18 26 20 36 22Z" />
      <path d="M36 22 C28 8 16 5 7 10 C18 10 28 14 36 22Z" />
      <path d="M36 22 C46 12 60 14 59 26 C50 18 42 20 36 22Z" />
      <path d="M36 22 C44 8 56 5 61 12 C50 10 42 14 36 22Z" />
      <path d="M36 22 C33 12 35 4 40 2 C41 10 39 16 36 22Z" />
    </g>
    {/* coconuts */}
    <circle cx="34.5" cy="25" r="2.6" fill="#6B4423" />
    <circle cx="39" cy="25.5" r="2.6" fill="#6B4423" />
  </Box>
);

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

// 🌴 PHILIPPINE TOURIST PALETTE
const palettes = {
  dark: {
    '--page-bg': 'radial-gradient(ellipse at top, #0f4c5c 0%, #04161f 75%)',
    '--panel-bg': '#0a2a3a',
    '--card-bg': '#08202e',
    '--text-shadow': '0 0 6px rgba(4, 22, 31, 0.95), 0 1px 3px rgba(4, 22, 31, 0.9)',
    '--field-bg': 'transparent',
    '--chip-bg': 'rgba(10, 42, 58, 0.9)',
    '--accent': '#2DD4CF',
    '--accent-strong': '#7CF0EB',
    '--accent-soft': 'rgba(45, 212, 207, 0.15)',
    '--border': 'rgba(45, 212, 207, 0.35)',
    '--border-strong': '#2DD4CF',
    '--glow': 'rgba(45, 212, 207, 0.55)',
    '--text': '#F3FBFA',
    '--text-muted': '#9FD8D6',
    '--title-gradient': 'linear-gradient(135deg, #FFE29A 0%, #FFC145 40%, #FF7A45 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.5)',
  },
  light: {
    '--page-bg': 'radial-gradient(ellipse at top, #CFF3EF 0%, #FFF8EC 75%)',
    '--panel-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--text-shadow':
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 6px #fff, 0 0 12px rgba(255, 255, 255, 0.9)',
    '--field-bg': 'rgba(255, 255, 255, 0.92)',
    '--chip-bg': 'rgba(255, 255, 255, 0.95)',
    '--accent': '#066872',
    '--accent-strong': '#0B6F7A',
    '--accent-soft': 'rgba(14, 154, 167, 0.15)',
    '--border': 'rgba(14, 154, 167, 0.35)',
    '--border-strong': '#0E9AA7',
    '--glow': 'rgba(14, 154, 167, 0.35)',
    '--text': '#040707',
    '--text-muted': '#1a3134',
    '--title-gradient': 'linear-gradient(135deg, #041c51 0%, #207d86 60%, #063621 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.45)',
  },
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => readStored(THEME_KEY, true) !== false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = readStored(FAV_KEY, []);
    return Array.isArray(saved) ? saved : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const [recent, setRecent] = useState(() => {
    const saved = readStored(RECENT_KEY, []);
    return Array.isArray(saved) ? saved.slice(0, MAX_RECENT) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestRef = useRef(0);
  const resultsRef = useRef(null);
  const [sortAz, setSortAz] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => writeStored(FAV_KEY, favorites), [favorites]);
  useEffect(() => writeStored(THEME_KEY, isDarkMode), [isDarkMode]);
  useEffect(() => writeStored(RECENT_KEY, recent), [recent]);

  // Show the back-to-top button after scrolling down a bit
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleFavorite = (photo) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === photo.id)
        ? prev.filter((f) => f.id !== photo.id)
        : [photo, ...prev]
    );
  };

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
    const requestId = ++requestRef.current;
    setShowFavorites(false);
    setSearchError(false);
    setLoading(true);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSearchTerm(locationName);
    setPage(1);
    setHasMore(false);
    setRecent((prev) =>
      [locationName, ...prev.filter((n) => n !== locationName)].slice(0, MAX_RECENT)
    );

    try {
      const results = (await searchPhotosByLocation(locationName, 1)) || [];
      if (requestId !== requestRef.current) return;
      setPhotos(results.map((p) => ({ ...p, place: locationName })));
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching photos by location:', error);
      if (requestId === requestRef.current) {
        setPhotos([]);
        setSearchError(true);
      }
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !searchTerm) return;
    const requestId = requestRef.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const results = (await searchPhotosByLocation(searchTerm, nextPage)) || [];
      if (requestId !== requestRef.current) return;
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [
          ...prev,
          ...results.filter((p) => !seen.has(p.id)).map((p) => ({ ...p, place: searchTerm })),
        ];
      });
      setPage(nextPage);
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } finally {
      setLoadingMore(false);
    }
  };

  const removeRecent = (name) => setRecent((prev) => prev.filter((n) => n !== name));

  const handleSurprise = () => {
    const options = SURPRISE_SPOTS.filter((n) => n !== searchTerm);
    handleSearchSubmit(options[Math.floor(Math.random() * options.length)]);
  };

  const clearFavorites = () => {
    if (window.confirm('Remove all saved favorites?')) setFavorites([]);
  };

  // Photos on screen: current tab, optionally sorted by photographer A-Z
  const matched = useMemo(
    () => (searchTerm ? photos.filter((p) => matchesPlace(p, searchTerm)) : photos),
    [searchTerm, photos]
  );

  const displayed = useMemo(() => {
    const list = showFavorites ? favorites : matched;
    return sortAz
      ? [...list].sort((a, b) => (a.photographer || '').localeCompare(b.photographer || ''))
      : list;
  }, [showFavorites, favorites, matched, sortAz]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ ':root': colors, 'button, .MuiChip-root': { textShadow: 'none' } }} />

      <Box sx={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)', textShadow: 'var(--text-shadow)' }}>
        {/* Animated backdrop */}
        <ThemeBackdrop isDarkMode={isDarkMode} />

        {/* ============================================================ */}
        {/* 🔝 1. FULL-WIDTH CLEAN TOP NAVIGATION                         */}
        {/* ============================================================ */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            borderBottom: '1px solid var(--border)',
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            py: 2.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo with flat palm tree emoji */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1.5px solid var(--border-strong)',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PalmEmoji sx={{ fontSize: '1.25rem' }} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                color: 'var(--text)',
              }}
            >
              LAKBAY PH
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: 2,
              color: 'var(--accent-strong)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              px: 2,
              py: 0.5,
              background: 'var(--accent-soft)',
            }}
          >
            82 PROVINCES • ARCHIPELAGO
          </Typography>

          {/* Theme Toggle Button */}
          <IconButton
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle light/dark mode"
            size="small"
            sx={{
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              p: 0.8,
              '&:hover': { background: 'var(--accent-soft)' },
            }}
          >
            {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Box>

        {/* ============================================================ */}
        {/* 🖋️ 2. FULL-WIDTH HERO SECTION (Title: "🌴 Lakbay.")          */}
        {/* ============================================================ */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            pt: { xs: 4, sm: 5, md: 5 },
            pb: { xs: 4, md: 5 },
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 4,
              mb: 2,
            }}
          >
            {/* Main Headline: flat palm emoji placed right beside the "L" of Lakbay */}
            <Box
              sx={{
                maxWidth: 720,
                display: 'inline-flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <PalmEmoji
                sx={{
                  fontSize: { xs: '2.8rem', sm: '4.2rem', md: '5.2rem' },
                  transform: 'translateY(-6px)',
                  flexShrink: 0,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: { xs: '3.2rem', sm: '5rem', md: '6.2rem' },
                  display: 'inline-block',
                  lineHeight: 1.25,
                  pb: '0.12em',
                  pr: '0.15em',
                  letterSpacing: -1,
                  mb: 0,
                  background: 'var(--title-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                }}
              >
                Lakbay.
              </Typography>
            </Box>
          </Box>

          {/* Integrated Location Search Form */}
          <Box sx={{ maxWidth: 860, mb: 2 }}>
            <LocationForm onSearch={handleSearchSubmit} />
            <Button
              onClick={handleSurprise}
              startIcon={<Shuffle />}
              sx={{
                mt: 1.5,
                textTransform: 'none',
                px: 5,
                py: 1,
                fontWeight: '900',
                fontSize: '1rem',
                letterSpacing: 1,
                borderRadius: 2,
                background: 'var(--cta)',
                color: 'var(--cta-text)',
                boxShadow: '0 0 20px var(--cta-glow)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'var(--cta-hover)',
                  boxShadow: '0 0 30px var(--cta-glow)',
                  transform: 'scale(1.03)',
                },
              }}
            >
              Surprise me
            </Button>
          </Box>

          {/* Recent Searches Chips */}
          {recent.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--accent)',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textShadow: 'none',
                  background: 'var(--chip-bg)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 5,
                  px: 1.5,
                  py: 0.4,
                }}
              >
                RECENT
              </Typography>
              {recent.map((name) => (
                <Chip
                  key={name}
                  size="small"
                  label={name.split(',')[0]}
                  title={name}
                  onClick={() => handleSearchSubmit(name)}
                  onDelete={() => removeRecent(name)}
                  sx={{
                    color: 'var(--text)',
                    background: 'var(--chip-bg)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 1,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    '&:hover': { background: 'var(--chip-bg)', borderColor: 'var(--accent)', boxShadow: '0 0 10px var(--glow)' },
                    '& .MuiChip-deleteIcon': { color: 'var(--text)', opacity: 0.7, '&:hover': { opacity: 1 } },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* ============================================================ */}
        {/* 🖼️ 3. "OUR ARCHIVE" DIVIDER BAR                              */}
        {/* ============================================================ */}
        <Box
          ref={resultsRef}
          sx={{
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            py: 2.2,
            mb: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              color: 'var(--text)',
            }}
          >
            {showFavorites
              ? 'YOUR FAVORITES'
              : searchTerm
                ? `DESTINATIONS · ${searchTerm.toUpperCase()}`
                : 'DESTINATIONS'}
          </Typography>

          {/* Filter Categories / Favorites Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              onClick={() => setShowFavorites(false)}
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: 2,
                cursor: 'pointer',
                color: !showFavorites ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: !showFavorites ? '2px solid var(--accent)' : 'none',
                pb: 0.5,
              }}
            >
              ALL ({matched.length})
            </Typography>

            <Typography
              onClick={() => setShowFavorites(true)}
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: 2,
                cursor: 'pointer',
                color: showFavorites ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: showFavorites ? '2px solid var(--accent)' : 'none',
                pb: 0.5,
              }}
            >
              FAVORITES ({favorites.length})
            </Typography>

            <Typography
              onClick={() => setSortAz((v) => !v)}
              variant="caption"
              title="Sort by photographer name"
              sx={{
                fontWeight: 800,
                letterSpacing: 2,
                cursor: 'pointer',
                color: sortAz ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: sortAz ? '2px solid var(--accent)' : 'none',
                pb: 0.5,
              }}
            >
              SORT A–Z
            </Typography>

            {showFavorites && favorites.length > 0 && (
              <Typography
                onClick={clearFavorites}
                variant="caption"
                sx={{ fontWeight: 800, letterSpacing: 2, cursor: 'pointer', color: '#FF4D6D', pb: 0.5 }}
              >
                CLEAR ALL
              </Typography>
            )}
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* 📸 4. FULL-WIDTH MEDIA GALLERY                               */}
        {/* ============================================================ */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            pt: 4,
            pb: 8,
          }}
        >
          <MediaGallery
            photos={displayed}
            loading={showFavorites ? false : loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            emptyMessage={
              showFavorites
                ? 'No favorites saved yet. Tap the heart on any photo.'
                : photos.length > 0 && matched.length === 0
                ? `No photos are connected to ${searchTerm.split(',')[0]} yet. Try a nearby city or municipality.`
                : searchTerm && !loading && photos.length === 0
                ? searchError
                  ? 'Something went wrong while loading photos. Please check your connection and try again.'
                  : `No photos found for ${searchTerm.split(',')[0]} yet. Try a nearby city or municipality.`
                : 'Search any region or city above to populate the archive.'
            }
          />

          {/* Load More Button */}
          {!showFavorites && !loading && hasMore && photos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                sx={{
                  textTransform: 'none',
                  px: 5,
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: 2,
                  borderRadius: 1,
                  background: 'var(--cta)',
                  color: 'var(--cta-text)',
                  boxShadow: '0 0 20px var(--cta-glow)',
                  '&:hover': { background: 'var(--cta-hover)' },
                  '&.Mui-disabled': { background: 'var(--accent-soft)', color: 'var(--text-muted)' },
                }}
              >
                {loadingMore ? 'LOADING…' : 'LOAD MORE PHOTOS ›'}
              </Button>
            </Box>
          )}
        </Box>

        {/* Back to top */}
        {showTop && (
          <Fab
            size="small"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 5,
              background: 'var(--cta)',
              color: 'var(--cta-text)',
              '&:hover': { background: 'var(--cta-hover)' },
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  );
}