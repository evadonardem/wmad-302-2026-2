import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Link,
  Skeleton, Dialog, DialogContent, IconButton, Pagination
} from '@mui/material';
import { Close, Favorite, FavoriteBorder } from '@mui/icons-material'; // heart icons
import { getPlaceDescription } from '../services/geoPhotoService';
import PhotoActions from './PhotoActions'; // Download + Share buttons

const PAGE_SIZE = 50; // photos per page

export default function MediaGallery({ photos, loading, locationName, favoritePhotos = [], onToggleFavorite }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [description, setDescription] = useState(undefined); // undefined = loading, null = not found
  const [page, setPage] = useState(1); // current page of results
  const topRef = useRef(null); // used to scroll back to the top of the gallery when the page changes

  // A new place needs a new description
  useEffect(() => {
    setDescription(undefined);
  }, [locationName]);

  // Fetch the short description of the place only when a photo is opened
  // (it is cached, so opening more photos of the same place is instant)
  useEffect(() => {
    if (!selectedPhoto || !locationName || description !== undefined) return;

    let cancelled = false;
    getPlaceDescription(locationName).then((result) => {
      if (!cancelled) setDescription(result);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedPhoto, locationName, description]);

  // Go back to page 1 for a new place (more photos arriving for the same place keep the current page)
  useEffect(() => {
    setPage(1);
  }, [locationName]);

  // TODO 3.1 [Loading Skeletal Feedbacks]: If 'loading' prop parameters evaluate true, return a visual helper feedback container.
  // Pro Tip: Loop a standard array wrapper or mock layout blocks to show a clean visual waiting feedback (e.g. Loading indicator or Skeletons).
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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

  // Pagination: only the photos of the current page are shown
  const pageCount = Math.ceil(photos.length / PAGE_SIZE);
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagePhotos = photos.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (_, value) => {
    setPage(value);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box ref={topRef} sx={{ scrollMarginTop: 16 }}>
      {locationName && (
        <Typography className="location-title" variant="h5">
          Tourist spots in {locationName}
        </Typography>
      )}

      {/* Which photos are being shown, e.g. "Showing 1-50 of 123 photos" */}
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3, mt: -2 }}>
        Showing {startIndex + 1}-{startIndex + pagePhotos.length} of {photos.length} photos
      </Typography>

      <Grid container spacing={3}>
        {pagePhotos.map((photo) => {
          const isFavorite = favoritePhotos.some((p) => p.id === photo.id);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo.id}>
              <Card
                className="photo-card"
                elevation={4}
                onClick={() => setSelectedPhoto(photo)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {/* Heart button (stopPropagation so it doesn't open the dialog) */}
                <IconButton
                  className="favorite-btn"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(photo, locationName);
                  }}
                >
                  {isFavorite ? <Favorite sx={{ color: '#ce1126' }} /> : <FavoriteBorder />}
                </IconButton>

                {/* Download + Share icon buttons on the top-right of the card */}
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                  <PhotoActions compact photo={photo} title={locationName} />
                </Box>

                {/* Small thumbnail, loaded only when the card is near the screen */}
                <CardMedia
                  component="img"
                  height="220"
                  image={photo.thumbUrl || photo.imageUrl}
                  alt={photo.altText}
                  loading="lazy"
                  decoding="async"
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
          );
        })}
      </Grid>

      {/* Page buttons (only shown when there is more than one page) */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.altText}
                decoding="async"
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
                    {description.url && (
                      <Link
                        className="photo-info-source"
                        href={description.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read more on Wikipedia →
                      </Link>
                    )}
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

                {/* Download (with size options) + Share buttons */}
                <PhotoActions photo={selectedPhoto} title={locationName} />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}