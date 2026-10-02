import { Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton } from '@mui/material';

export default function MediaGallery({ photos, loading }) {
  if (loading) {
    return (
      <Grid container spacing={3} aria-label="Loading photos" aria-busy="true">
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
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box role="status" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No tourist spots found for this area yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {photos.map((photo) => (
        <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1 }}>
            
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