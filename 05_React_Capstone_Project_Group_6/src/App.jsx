import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, GlobalStyles,
  Typography, Box, IconButton, Button, Chip,
} from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import ThemeBackdrop from './components/ThemeBackdrop';
import { searchPhotosByLocation, PHOTOS_PER_PAGE } from './services/geoPhotoService';

const FAV_KEY = 'lakbay-ph-favorites';
const THEME_KEY = 'lakbay-ph-theme';
const RECENT_KEY = 'lakbay-ph-recent';
const MAX_RECENT = 5;

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

// 🌴 RESTORED ORIGINAL PHILIPPINE TOURIST PALETTE
const palettes = {
  dark: {
    '--page-bg': 'radial-gradient(ellipse at top, #0f4c5c 0%, #04161f 75%)',
    '--panel-bg': '#0a2a3a',
    '--card-bg': '#08202e',
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
    '--accent': '#0E9AA7',
    '--accent-strong': '#0B6F7A',
    '--accent-soft': 'rgba(14, 154, 167, 0.15)',
    '--border': 'rgba(14, 154, 167, 0.35)',
    '--border-strong': '#0E9AA7',
    '--glow': 'rgba(14, 154, 167, 0.35)',
    '--text': '#040707',
    '--text-muted': '#1a3134',
    '--title-gradient': 'linear-gradient(135deg, #041c51 0%, #207d86 60%, #063621 100%)',
    '--cta': 'linear-gradient(135deg, #402f09 0%, #61310d 50%, #F0503C 100%)',
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

  useEffect(() => writeStored(FAV_KEY, favorites), [favorites]);
  useEffect(() => writeStored(THEME_KEY, isDarkMode), [isDarkMode]);
  useEffect(() => writeStored(RECENT_KEY, recent), [recent]);

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
    setLoading(true);
    setSearchTerm(locationName);
    setPage(1);
    setHasMore(false);
    setRecent((prev) =>
      [locationName, ...prev.filter((n) => n !== locationName)].slice(0, MAX_RECENT)
    );

    try {
      const results = (await searchPhotosByLocation(locationName, 1)) || [];
      if (requestId !== requestRef.current) return;
      setPhotos(results);
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching photos by location:', error);
      if (requestId === requestRef.current) setPhotos([]);
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
        return [...prev, ...results.filter((p) => !seen.has(p.id))];
      });
      setPage(nextPage);
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } finally {
      setLoadingMore(false);
    }
  };

  const removeRecent = (name) => setRecent((prev) => prev.filter((n) => n !== name));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ ':root': colors }} />

      <Box sx={{ minHeight: '100vh', background: 'var(--page-bg)', color: 'var(--text)' }}>
        {/* Animated backdrop kept intact */}
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
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Logo Monogram */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1.5px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
                color: 'var(--accent)',
              }}
            >
              PH
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
        {/* 🖋️ 2. FULL-WIDTH HERO SECTION (Title: "Lakbay.")              */}
        {/* ============================================================ */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            pt: { xs: 6, sm: 8, md: 9 },
            pb: { xs: 5, md: 7 },
            overflow: 'hidden',
          }}
        >
          {/* Faint Background Watermark */}
          <Typography
            aria-hidden="true"
            sx={{
              position: 'absolute',
              right: { xs: -20, md: -40 },
              top: '5%',
              fontSize: { xs: '8rem', sm: '14rem', md: '20rem' },
              fontWeight: 900,
              color: 'var(--accent)',
              opacity: isDarkMode ? 0.04 : 0.05,
              letterSpacing: 15,
              userSelect: 'none',
              pointerEvents: 'none',
              lineHeight: 0.8,
              fontFamily: '"Playfair Display", "Georgia", serif',
              fontStyle: 'italic',
            }}
          >
            LAKBAY
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 4,
              mb: 5,
            }}
          >
            {/* Main Headline: "Lakbay." */}
            <Box sx={{ maxWidth: 720 }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: { xs: '3.2rem', sm: '5rem', md: '6.2rem' },
                  lineHeight: 1,
                  letterSpacing: -1,
                  mb: 2,
                  background: 'var(--title-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Lakbay.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  maxWidth: 520,
                  mb: 3,
                }}
              >
                Explore the Philippines like never before. Search any region or city to discover
              </Typography>
  
              
            </Box>

            {/* Right Circular Showcase Badge */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 2.5,
                alignSelf: 'center',
                pr: { md: 4, lg: 8 },
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'var(--accent)',
                    boxShadow: '0 0 20px var(--glow)',
                    transform: 'scale(1.06)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    borderLeft: '11px solid var(--accent)',
                    ml: 0.5,
                  }}
                />
              
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: 1 }}>
                  7,641 ISLANDS • 82 PROVINCES
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Integrated Location Search Form */}
          <Box sx={{ maxWidth: 860, mb: 3 }}>
            <LocationForm onSearch={handleSearchSubmit} />
          </Box>

          {/* Recent Searches Chips */}
          {recent.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 1.5 }}>
                RECENT:
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
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: 1,
                    fontSize: '0.72rem',
                    '&:hover': { borderColor: 'var(--accent)' },
                    '& .MuiChip-deleteIcon': { color: 'var(--text-muted)' },
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
            OUR ARCHIVE / DESTINATIONS
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
              ALL ({photos.length})
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
          </Box>
        </Box>

        {/* ============================================================ */}
        {/* 📸 4. FULL-WIDTH MEDIA GALLERY                               */}
        {/* ============================================================ */}
        <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 3, sm: 6, md: 8, lg: 10 }, pb: 8 }}>
          <MediaGallery
            photos={showFavorites ? favorites : photos}
            loading={showFavorites ? false : loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            emptyMessage={
              showFavorites
                ? 'No favorites saved yet. Tap the heart on any photo.'
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
                }}
              >
                {loadingMore ? 'LOADING…' : 'LOAD MORE PHOTOS ›'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}