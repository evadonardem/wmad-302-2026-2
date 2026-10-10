import React, { useRef, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Link,
  Skeleton,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Button,
  Stack,
} from '@mui/material';
import { Favorite, FavoriteBorder, Close, LocationOn } from '@mui/icons-material';

const NO_FAVORITES = new Set();


function PhotoDialog({ photo, onClose, isFavorite, onToggleFavorite }) {

  const lastPhoto = useRef(null);
  if (photo) lastPhoto.current = photo;
  const shown = photo ?? lastPhoto.current;

  return (
    <Dialog
      open={Boolean(photo)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      slotProps={{ paper: { className: 'photo-dialog' } }}
      aria-labelledby="photo-dialog-location"
    >
      {shown && (
        <>
          <IconButton className="dialog-close" aria-label="Close enlarged photo" onClick={onClose}>
            <Close />
          </IconButton>

          <Box className="dialog-image-wrap">
            <img src={shown.imageUrlLarge} alt={shown.altText} className="dialog-image" />
          </Box>

          <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <LocationOn color="error" />
              <Typography id="photo-dialog-location" variant="h5" component="h2" fontWeight="bold">
                {shown.location}
              </Typography>
            </Stack>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.75 }}>
              {shown.description || 'No description was provided for this photo on Pexels.'}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="caption" display="block" color="text.secondary">
                  📸 Captured by:
                </Typography>
                <Link
                  className="dialog-link"
                  href={shown.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                >
                  {shown.photographer}
                </Link>
                <Link
                  className="dialog-link"
                  href={shown.pexelsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  variant="body2"
                  sx={{ ml: 1 }}
                >
                  View on Pexels
                </Link>
              </Box>

              <Button
                className={`fav-toggle${isFavorite ? ' is-active' : ''}`}
                variant="contained"
                aria-pressed={isFavorite}
                startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
                onClick={() => onToggleFavorite?.(shown)}
                sx={{ textTransform: 'none', px: 4 }}
              >
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </Button>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default function MediaGallery({
  photos,
  loading,
  favoriteIds = NO_FAVORITES,
  onToggleFavorite,
  emptyMessage = 'No tourist spots found for this area yet.',
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={220} animation="wave" />
              <CardContent>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="70%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {photos.map((photo) => {
          const isFavorite = favoriteIds.has(photo.id);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo.id}>
              <Card
                elevation={3}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}
              >
                {/* Clicking the photo opens the enlarged view */}
                <CardActionArea
                  onClick={() => setSelectedPhoto(photo)}
                  aria-label={`Enlarge photo: ${photo.altText}`}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={photo.imageUrl}
                    alt={photo.altText}
                    loading="lazy"
                    sx={{ objectFit: 'cover' }}
                  />
                </CardActionArea>

                {/* Sits outside the action area so the two buttons are not nested */}
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton
                    className={`fav-btn${isFavorite ? ' is-active' : ''}`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFavorite}
                    onClick={() => onToggleFavorite?.(photo)}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    📸 Captured by:
                  </Typography>
                  <Link
                    href={photo.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {photo.photographer}
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <PhotoDialog
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        isFavorite={selectedPhoto ? favoriteIds.has(selectedPhoto.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
}