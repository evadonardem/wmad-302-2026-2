import React, { useState } from 'react';
import {
  Box, Card, CardMedia, CardContent, CardActionArea, Typography, Link, Skeleton,
  Dialog, IconButton,
} from '@mui/material';
import { Close, Download, Favorite, FavoriteBorder } from '@mui/icons-material';

const CARD_WIDTH = { xs: '100%', sm: 340 };
const IMAGE_HEIGHT = 240;

const cardSx = {
  position: 'relative',
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

const preloadImage = (url) => {
  const img = new Image();
  img.src = url;
};

// Saves the full-size photo; if the browser blocks that, opens it in a new tab instead
const downloadPhoto = async (photo) => {
  const url = photo.fullImageUrl || photo.imageUrl;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `lakbay-ph-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Round dark button that sits on top of a photo
const overlayButtonSx = {
  background: 'rgba(0,0,0,0.5)',
  '&:hover': { background: 'rgba(0,0,0,0.75)' },
};

export default function MediaGallery({
  photos,
  loading,
  favorites = [],
  onToggleFavorite,
  emptyMessage = 'No tourist spots found for this area yet.',
}) {
  // Must stay above the early returns (hooks can't be called conditionally)
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const isFavorite = (photo) => favorites.some((f) => f.id === photo.id);

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
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={rowSx}>
        {photos.map((photo, index) => {
          const fav = isFavorite(photo);
          return (
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
              {/* Heart: saves / removes this photo from Favorites */}
              {onToggleFavorite && (
                <IconButton
                  onClick={() => onToggleFavorite(photo)}
                  aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                  sx={{
                    ...overlayButtonSx,
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    color: fav ? '#FF4D6D' : '#fff',
                  }}
                >
                  {fav ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}

              {/* Only the image is clickable; the photographer link below stays separate */}
              <CardActionArea
                onClick={() => setSelectedPhoto(photo)}
                onMouseEnter={() => preloadImage(photo.fullImageUrl || photo.imageUrl)}
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
              </CardActionArea>

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
          );
        })}
      </Box>

      {/* Lightbox: open whenever a photo is selected */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 3,
            overflow: 'hidden',
            m: 2,
          },
        }}
      >
        <IconButton
          onClick={() => setSelectedPhoto(null)}
          aria-label="Close"
          sx={{ ...overlayButtonSx, position: 'absolute', top: 8, right: 8, zIndex: 2, color: '#fff' }}
        >
          <Close />
        </IconButton>

        {selectedPhoto && (
          <IconButton
            onClick={() => downloadPhoto(selectedPhoto)}
            aria-label="Download photo"
            sx={{
              ...overlayButtonSx,
              position: 'absolute',
              top: 8,
              right: onToggleFavorite ? 104 : 56,
              zIndex: 2,
              color: '#fff',
            }}
          >
            <Download />
          </IconButton>
        )}

        {selectedPhoto && onToggleFavorite && (
          <IconButton
            onClick={() => onToggleFavorite(selectedPhoto)}
            aria-label={isFavorite(selectedPhoto) ? 'Remove from favorites' : 'Add to favorites'}
            sx={{
              ...overlayButtonSx,
              position: 'absolute',
              top: 8,
              right: 56,
              zIndex: 2,
              color: isFavorite(selectedPhoto) ? '#FF4D6D' : '#fff',
            }}
          >
            {isFavorite(selectedPhoto) ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        )}

        {selectedPhoto && (
          <>
            <Box
              component="img"
              src={selectedPhoto.fullImageUrl || selectedPhoto.imageUrl}
              alt={selectedPhoto.altText}
              sx={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '80vh', // keeps tall photos from overflowing the screen
                objectFit: 'contain',
                mx: 'auto',
              }}
            />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>
                📸 Captured by:{' '}
              </Typography>
              <Link
                href={selectedPhoto.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ color: 'var(--accent-strong)', fontWeight: 'bold' }}
              >
                {selectedPhoto.photographer}
              </Link>
            </Box>
          </>
        )}
      </Dialog>
    </>
  );
}