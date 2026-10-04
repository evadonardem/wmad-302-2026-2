import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { CameraAlt, Favorite, TravelExplore } from '@mui/icons-material';

function createPlaceholderPhoto(label = 'Favorite Place') {
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#CE1126" />
          <stop offset="55%" stop-color="#FCD116" />
          <stop offset="100%" stop-color="#0038A8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)" />
      <circle cx="200" cy="250" r="140" fill="rgba(255,255,255,0.18)" />
      <path d="M0 1100 C280 900, 520 960, 700 1080 S1030 1205, 1200 1045 L1200 1500 L0 1500 Z" fill="rgba(255,255,255,0.2)"/>
      <text x="600" y="720" text-anchor="middle" fill="white" font-size="74" font-family="Arial, sans-serif" font-weight="700">${safeLabel}</text>
      <text x="600" y="820" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="30" font-family="Arial, sans-serif">Liked Place</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function FavoritePlacesPage({ favorites, onToggleFavorite, onBackToExplore }) {
  if (!favorites.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <TravelExplore sx={{ fontSize: 56, mb: 1, color: 'text.disabled' }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          You haven&apos;t liked any places yet.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tap the heart on a spot to save it here.
        </Typography>
        <Button variant="contained" color="primary" onClick={onBackToExplore}>
          Explore spots
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
          Favorite places
        </Typography>
        <Button variant="outlined" onClick={onBackToExplore}>
          Back to explore
        </Button>
      </Box>

      <Grid container spacing={3}>
        {favorites.map((photo) => (
          <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                position: 'relative',
                aspectRatio: '4 / 5',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,30,100,0.18)',
              }}
            >
              <CardMedia
                component="img"
                src={photo.imageUrl || createPlaceholderPhoto(photo.altText || photo.locationName || 'Favorite Place')}
                alt={photo.altText || photo.locationName || 'Favorite place'}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = createPlaceholderPhoto(photo.altText || photo.locationName || 'Favorite Place');
                }}
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <Box
                aria-hidden
                sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,10,50,0.85) 100%)' }}
              />

              <IconButton
                onClick={() => onToggleFavorite(photo)}
                aria-label="Remove from favorites"
                size="small"
                sx={{
                  position: 'absolute', top: 12, right: 12, zIndex: 1,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <Favorite fontSize="small" color="secondary" />
              </IconButton>

              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 2, color: '#fff' }}>
                <Typography sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {photo.altText || photo.locationName || 'Favorite place'}
                </Typography>

                {photo.locationName && (
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {photo.locationName}
                  </Typography>
                )}

                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 999,
                      bgcolor: 'rgba(255,255,255,0.16)',
                      backdropFilter: 'blur(6px)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <CameraAlt sx={{ fontSize: '0.9rem', color: '#FCD116' }} />
                    {photo.photographer || 'Unknown photographer'}
                  </Box>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
