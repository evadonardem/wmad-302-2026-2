import { useState } from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton, ButtonBase } from '@mui/material';
import PhotoDetailDialog from './PhotoDetailDialog';

export default function MediaGallery({ photos, loading, locationName }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (loading) {
    return (
      <Box aria-label="Loading photos" aria-busy="true">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          Searching for places in {locationName || 'your selected area'}...
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 1 }}>
                <Skeleton variant="rectangular" height={220} />
                <CardContent>
                  <Skeleton width="45%" />
                  <Skeleton width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box role="status" sx={{ py: 6, textAlign: 'center', px: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          No tourist spots found yet
        </Typography>
        <Typography color="text.secondary">
          {locationName
            ? `We couldn’t find matching photos for ${locationName}. Try another city or municipality.`
            : 'No tourist spots found for this area yet.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
        {photos.length} photo{photos.length === 1 ? '' : 's'} found for {locationName || 'this location'}
      </Typography>

      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1,
                transition: 'transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease',
                transformOrigin: 'center',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px) scale(1.01)',
                  filter: 'saturate(1.06)',
                },
              }}
            >
              <ButtonBase
                onClick={() => setSelectedPhoto(photo)}
                aria-label={`View details for ${photo.altText || 'photo'}`}
                sx={{ display: 'block', width: '100%', textAlign: 'left' }}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={photo.imageUrl}
                  alt={photo.altText}
                  sx={{ objectFit: 'cover' }}
                />
              </ButtonBase>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  📸 Captured by:
                </Typography>
                <Link
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  {photo.photographer}
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <PhotoDetailDialog
        open={Boolean(selectedPhoto)}
        photo={selectedPhoto}
        title={selectedPhoto?.altText}
        subtitle={locationName}
        onClose={() => setSelectedPhoto(null)}
      />
    </Box>
  );
}