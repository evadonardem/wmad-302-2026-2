import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, Typography, Link, Skeleton, Chip,
  Grow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert,
} from '@mui/material';
import {
  CameraAlt, TravelExplore, Favorite, FavoriteBorder, AddLocationAlt, EmojiObjects,
} from '@mui/icons-material';

const TRIVIA = {
  baguio: "Baguio is nicknamed the 'City of Pines' and served as the Philippines' former summer capital.",
  vigan: 'Vigan is a UNESCO World Heritage Site, famous for its preserved Spanish colonial architecture.',
  davao: 'Davao City is home to Mount Apo, the highest mountain in the Philippines.',
  tadian: "Tadian is known as the 'Vegetable Bowl of Mountain Province.'",
  sagada: 'Sagada is famous for its hanging coffins, a centuries-old indigenous burial tradition.',
};

const GENERIC_TRIVIA = [
  'The Philippines is made up of over 7,000 islands.',
  'The Philippines has one of the longest discontinuous coastlines in the world.',
  'Filipino and English are both official languages of the Philippines.',
];

function getTrivia(locationName) {
  if (!locationName) return GENERIC_TRIVIA[0];
  const key = locationName.toLowerCase();
  const match = Object.keys(TRIVIA).find((k) => key.includes(k));
  if (match) return TRIVIA[match];
  return GENERIC_TRIVIA[Math.floor(Math.random() * GENERIC_TRIVIA.length)];
}

function createPlaceholderPhoto(label = 'Tourist Spot') {
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0038A8" />
          <stop offset="55%" stop-color="#0B57D0" />
          <stop offset="100%" stop-color="#FCD116" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)" />
      <circle cx="950" cy="220" r="140" fill="rgba(255,255,255,0.2)" />
      <circle cx="150" cy="1200" r="180" fill="rgba(255,255,255,0.12)" />
      <path d="M0 1120 C220 980, 440 990, 620 1090 S960 1210, 1200 1030 L1200 1500 L0 1500 Z" fill="rgba(255,255,255,0.18)"/>
      <text x="600" y="720" text-anchor="middle" fill="white" font-size="72" font-family="Arial, sans-serif" font-weight="700">${safeLabel}</text>
      <text x="600" y="830" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="28" font-family="Arial, sans-serif">Philippines</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function MediaGallery({ photos, loading, searchedLocation, favorites = [], onToggleFavorite, isFavorite = () => false }) {
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestNote, setSuggestNote] = useState('');
  const [thanksOpen, setThanksOpen] = useState(false);

  const toggleFavorite = (photo) => {
    onToggleFavorite(photo);
  };

  const handleSuggestSubmit = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('suggestedSpots') || '[]');
      existing.push({ name: suggestName, note: suggestNote, location: searchedLocation });
      localStorage.setItem('suggestedSpots', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setSuggestOpen(false);
    setSuggestName('');
    setSuggestNote('');
    setThanksOpen(true);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            <Skeleton sx={{ mt: 1 }} />
            <Skeleton width="60%" />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <TravelExplore sx={{ fontSize: 56, mb: 1, color: 'text.disabled' }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {searchedLocation
            ? `We haven't mapped ${searchedLocation} yet. Be the first to add a hidden gem!`
            : 'Search for a city or municipality to see tourist spots.'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
          <EmojiObjects fontSize="small" color="warning" />
          <Typography variant="body2">{getTrivia(searchedLocation)}</Typography>
        </Box>

        {searchedLocation && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddLocationAlt />}
            onClick={() => setSuggestOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Suggest a Spot
          </Button>
        )}

        <Dialog open={suggestOpen} onClose={() => setSuggestOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Suggest a Spot in {searchedLocation}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Place name"
              fullWidth
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Short description"
              fullWidth
              multiline
              rows={3}
              value={suggestNote}
              onChange={(e) => setSuggestNote(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuggestOpen(false)}>Cancel</Button>
            <Button variant="contained" disabled={!suggestName.trim()} onClick={handleSuggestSubmit}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={thanksOpen}
          autoHideDuration={3000}
          onClose={() => setThanksOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setThanksOpen(false)}>
            Thank you for your suggestion!
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
          Spots in {searchedLocation}
        </Typography>
        <Typography color="text.secondary">{photos.length} photos</Typography>
      </Box>

      <Grid container spacing={3}>
        {photos.map((photo, index) => (
          <Grow in key={photo.id} timeout={300 + index * 100}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,30,100,0.18)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 40px rgba(0,30,100,0.3)' },
                  '&:hover .gallery-img': { transform: 'scale(1.07)' },
                }}
              >
                <CardMedia
                  component="img"
                  className="gallery-img"
                  src={photo.imageUrl || createPlaceholderPhoto(photo.altText || searchedLocation || 'Tourist Spot')}
                  alt={photo.altText}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = createPlaceholderPhoto(photo.altText || searchedLocation || 'Tourist Spot');
                  }}
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                />

                <Box
                  aria-hidden
                  sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,10,50,0.85) 100%)' }}
                />

                <IconButton
                  onClick={() => toggleFavorite(photo)}
                  aria-label={isFavorite(photo.id) ? 'Remove from favorites' : 'Add to favorites'}
                  size="small"
                  sx={{
                    position: 'absolute', top: 12, right: 12, zIndex: 1,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    '&:hover': { bgcolor: '#fff' },
                  }}
                >
                  {isFavorite(photo.id)
                    ? <Favorite fontSize="small" color="secondary" />
                    : <FavoriteBorder fontSize="small" color="secondary" />}
                </IconButton>

                <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 2, color: '#fff' }}>
                  {photo.altText && (
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {photo.altText}
                    </Typography>
                  )}
                  <Chip
                    size="small"
                    icon={<CameraAlt sx={{ fontSize: '0.9rem !important', color: '#FCD116 !important' }} />}
                    label={
                      <Link href={photo.photographerUrl} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">
                        {photo.photographer}
                      </Link>
                    }
                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)' }}
                  />
                </Box>
              </Card>
            </Grid>
          </Grow>
        ))}
      </Grid>
    </>
  );
}