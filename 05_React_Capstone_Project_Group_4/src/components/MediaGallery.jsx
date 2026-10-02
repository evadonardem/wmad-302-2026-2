import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton, Chip,
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

function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem('favoriteSpots') || '[]'));
  } catch {
    return new Set();
  }
}

function saveFavorites(set) {
  try {
    localStorage.setItem('favoriteSpots', JSON.stringify([...set]));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export default function MediaGallery({ photos, loading, searchedLocation }) {
  const [favorites, setFavorites] = useState(() => readFavorites());
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestNote, setSuggestNote] = useState('');
  const [thanksOpen, setThanksOpen] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          <Grid item xs={12} sm={6} md={4} key={i}>
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
    <Grid container spacing={3}>
      {photos.map((photo, index) => (
        <Grow in key={photo.id} timeout={300 + index * 100}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                '&:hover .gallery-img': { transform: 'scale(1.06)' },
              }}
            >
              <IconButton
                onClick={() => toggleFavorite(photo.id)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  bgcolor: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                }}
                size="small"
              >
                {favorites.has(photo.id)
                  ? <Favorite fontSize="small" color="secondary" />
                  : <FavoriteBorder fontSize="small" color="secondary" />}
              </IconButton>

              <Box sx={{ overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  className="gallery-img"
                  height="200"
                  image={photo.imageUrl}
                  alt={photo.altText}
                  sx={{ transition: 'transform 0.4s ease' }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Chip
                  size="small"
                  icon={<CameraAlt sx={{ fontSize: '0.9rem !important' }} />}
                  label={
                    <Link
                      href={photo.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit"
                      underline="hover"
                    >
                      {photo.photographer}
                    </Link>
                  }
                  variant="outlined"
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grow>
      ))}
    </Grid>
  );
}