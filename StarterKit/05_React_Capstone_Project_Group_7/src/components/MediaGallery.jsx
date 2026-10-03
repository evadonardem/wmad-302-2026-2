import React, { useState } from 'react';
import {
  Box, Card, CardMedia, Typography, Link, Skeleton, Dialog, IconButton, Grow, Chip,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(8px); }
  to   { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); }
`;

const masonrySx = {
  columnCount: { xs: 1, sm: 2, md: 3 },
  columnGap: '20px',
};

export default function MediaGallery({ photos, loading, locationName }) {
  const [selected, setSelected] = useState(null);

  // TODO 3.1 [Loading Skeletal Feedbacks]
  if (loading) {
    const heights = [260, 340, 220, 300, 380, 240];
    return (
      <Box sx={masonrySx}>
        {heights.map((h, i) => (
          <Box key={i} sx={{ breakInside: 'avoid', mb: 2.5 }}>
            <Skeleton variant="rectangular" animation="wave" height={h} sx={{ borderRadius: 3 }} />
          </Box>
        ))}
      </Box>
    );
  }

  // TODO 3.2 [Boundary Validation Checks]
  if (!photos || photos.length === 0) {
    return (
      <Grow in timeout={600}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" component="div" sx={{ mb: 1 }}>🧭</Typography>
          <Typography variant="h6" color="text.secondary">
            No tourist spots found for this area yet.
          </Typography>
        </Box>
      </Grow>
    );
  }

  return (
    <Box>
      {/* Heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>
          Tourist spots{locationName ? ` in ${locationName}` : ''}
        </Typography>
        <Chip label={`${photos.length} photos`} color="primary" size="small" />
      </Box>

      {/* TODO 3.3 [Fluid Layout Architecture] - masonry columns */}
      <Box sx={masonrySx}>
        {/* TODO 3.4 [Card Content Loop Mapping] */}
        {photos.map((photo, index) => (
          <Card
            key={photo.id}
            elevation={4}
            onClick={() => setSelected(photo)}
            sx={{
              position: 'relative',
              breakInside: 'avoid',
              mb: 2.5,
              borderRadius: 3,
              overflow: 'hidden',
              cursor: 'zoom-in',
              animation: `${fadeUp} 0.8s cubic-bezier(0.22, 1, 0.36, 1) both`,
              animationDelay: `${index * 100}ms`,
              transition: 'box-shadow 0.4s ease, transform 0.4s ease',
              '&:hover': { boxShadow: 12, transform: 'translateY(-6px)' },
              '&:hover .photo': { transform: 'scale(1.1)' },
              '&:hover .overlay': { opacity: 1, transform: 'translateY(0)' },
            }}
          >
            {/* TODO 3.5 [Multimedia Presentation Layer] */}
            <CardMedia
              className="photo"
              component="img"
              image={photo.imageUrl}
              alt={photo.altText}
              loading="lazy"
              sx={{ display: 'block', width: '100%', transition: 'transform 0.7s ease' }}
            />

            {/* Hover overlay with attribution */}
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                left: 0, right: 0, bottom: 0,
                p: 2,
                pt: 6,
                color: '#fff',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                📸 Captured by
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {photo.photographer}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Lightbox popup */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        maxWidth="lg"
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
      >
        {selected && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setSelected(null)}
              aria-label="Close"
              sx={{
                position: 'absolute', top: 8, right: 8, zIndex: 1,
                color: '#fff', bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <Close />
            </IconButton>
            <Box
              component="img"
              src={selected.imageUrl}
              alt={selected.altText}
              sx={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', mx: 'auto', objectFit: 'contain' }}
            />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                📸 Captured by:
              </Typography>
              {/* TODO 3.6 [Attribution Links] */}
              <Link
                href={selected.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                fontWeight={600}
              >
                {selected.photographer}
              </Link>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}