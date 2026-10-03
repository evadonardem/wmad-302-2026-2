import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Link,
  Skeleton, Dialog, DialogContent, IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { getPlaceDescription } from '../services/geoPhotoService';

export default function MediaGallery({ photos, loading, locationName }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [description, setDescription] = useState(undefined); // undefined = loading, null = not found

  // Fetch a short description of the searched place (once per search)
  useEffect(() => {
    let cancelled = false;
    setDescription(undefined);
    if (!locationName) return;

    getPlaceDescription(locationName).then((result) => {
      if (!cancelled) setDescription(result);
    });

    return () => {
      cancelled = true;
    };
  }, [locationName]);

  // TODO 3.1 [Loading Skeletal Feedbacks]: If 'loading' prop parameters evaluate true, return a visual helper feedback container.
  // Pro Tip: Loop a standard array wrapper or mock layout blocks to show a clean visual waiting feedback (e.g. Loading indicator or Skeletons).
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={220} />
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]: If photos state parameter arrays contain no records, return a fallback template.
  // Render a clean structural layout text header displaying a simple status report like: "No tourist spots found for this area yet."
  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          {locationName
            ? `There are no tourist spots in this area (${locationName}).`
            : 'Select a region and a city to explore tourist spots.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {locationName && (
        <Typography className="location-title" variant="h5">
          Tourist spots in {locationName}
        </Typography>
      )}
      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card
              className="photo-card"
              elevation={4}
              onClick={() => setSelectedPhoto(photo)}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                height="220"
                image={photo.imageUrl}
                alt={photo.altText}
                sx={{ objectFit: 'cover' }}
              />

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
                  onClick={(e) => e.stopPropagation()}
                >
                  {photo.photographer}
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enlarged Photo Modal */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 1, bgcolor: 'background.default' }}>
          <IconButton
            onClick={() => setSelectedPhoto(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 1 }}
          >
            <Close />
          </IconButton>

          {selectedPhoto && (
            <>
              <img
                src={selectedPhoto.imageUrl.replace('large', 'large2x') || selectedPhoto.imageUrl}
                alt={selectedPhoto.altText}
                style={{ width: '100%', borderRadius: 8, display: 'block' }}
              />

              <Box className="photo-info">
                <Typography className="photo-info-title" variant="h6">
                  📍 {locationName}
                </Typography>

                {description === undefined && (
                  <>
                    <Skeleton width="100%" />
                    <Skeleton width="90%" />
                    <Skeleton width="70%" />
                  </>
                )}

                {description === null && (
                  <Typography className="photo-info-text" variant="body2">
                    No description is available for this area yet.
                  </Typography>
                )}

                {description && (
                  <>
                    <Typography className="photo-info-text" variant="body2">
                      {description.text}
                    </Typography>
                    <Link
                      className="photo-info-source"
                      href={description.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read more on Wikipedia →
                    </Link>
                  </>
                )}

                {selectedPhoto.altText && (
                  <Typography className="photo-info-caption" variant="caption">
                    About this photo: {selectedPhoto.altText}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  📸 Captured by{' '}
                  <Link href={selectedPhoto.photographerUrl} target="_blank" rel="noopener noreferrer">
                    {selectedPhoto.photographer}
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}