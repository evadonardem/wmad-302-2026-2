import React from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton } from '@mui/material';

export default function MediaGallery({ photos, loading }) {
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
          No tourist spots found for this area yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {photos.map((photo) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo.id}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>

            <CardMedia
              component="img"
              height="220"
              image={photo.imageUrl}
              alt={photo.altText}
              loading="lazy"
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
                fontWeight="bold"
              >
                {photo.photographer}
              </Link>
            </CardContent>

          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
