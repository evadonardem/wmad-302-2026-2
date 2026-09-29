import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Link, Skeleton } from '@mui/material';

const CARD_WIDTH = { xs: '100%', sm: 340 };
const IMAGE_HEIGHT = 240;

const cardSx = {
  width: CARD_WIDTH,
  flex: 'none',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 3,
  background: 'var(--card-bg)',
  overflow: 'hidden',
};

const rowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 3,
};

export default function MediaGallery({ photos, loading }) {
  if (loading) {
    return (
      <Box sx={rowSx}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} elevation={6} sx={{ ...cardSx, border: '1px solid var(--border)' }}>
            <Skeleton variant="rectangular" height={IMAGE_HEIGHT} sx={{ bgcolor: 'var(--accent-soft)' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width="40%" sx={{ mx: 'auto', bgcolor: 'var(--accent-soft)' }} />
              <Skeleton variant="text" width="70%" sx={{ mx: 'auto', bgcolor: 'var(--accent-soft)' }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No tourist spots found for this area yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={rowSx}>
      {photos.map((photo, index) => (
        <Card
          key={photo.id || index}
          elevation={6}
          sx={{
            ...cardSx,
            border: '1.5px solid var(--border)',
            transition: 'all 0.35s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              borderColor: 'var(--accent)',
              boxShadow: '0 0 25px var(--glow)',
            },
          }}
        >
          <CardMedia
            component="img"
            image={photo.imageUrl}
            alt={photo.altText || 'Tourist spot photo'}
            sx={{
              width: '100%',
              height: IMAGE_HEIGHT,
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />

          <CardContent sx={{ flexGrow: 1, p: 2.5, textAlign: 'center' }}>
            <Typography
              variant="caption"
              display="block"
              sx={{ color: 'var(--text-muted)', mb: 0.5, fontWeight: 'bold' }}
            >
              📸 Captured by:
            </Typography>
            <Link
              href={photo.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                color: 'var(--accent-strong)',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                '&:hover': { color: '#FF7A45' },
              }}
            >
              {photo.photographer}
            </Link>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}