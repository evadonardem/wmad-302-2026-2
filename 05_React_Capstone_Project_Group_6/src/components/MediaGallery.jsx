import React from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton } from '@mui/material';

export default function MediaGallery({ photos, loading }) {
  // 1. Loading State (Shows skeleton placeholders while searching)
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="70%" height={24} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // 2. Empty State (Before searching or if no photos found)
  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No tourist spots found for this area yet.
        </Typography>
      </Box>
    );
  }

  // 3. Photos Result Grid (Loops photos properly)
  return (
    <Grid container spacing={3}>
      {photos.map((photo, index) => (
        <Grid item xs={12} sm={6} md={4} key={photo.id || index}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            
            <CardMedia
              component="img"
              height="200"
              image={photo.imageUrl}
              alt={photo.altText || 'Tourist spot photo'}
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