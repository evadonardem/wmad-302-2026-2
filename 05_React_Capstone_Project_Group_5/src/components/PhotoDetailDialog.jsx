import { Box, Dialog, DialogContent, DialogTitle, IconButton, Link, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function PhotoDetailDialog({ open, photo, title, subtitle, onClose }) {
  if (!photo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="photo-detail-title"
    >
      <DialogTitle
        id="photo-detail-title"
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="span" variant="h6" sx={{ display: 'block', fontWeight: 700 }}>
            {title || photo.altText || 'Photo details'}
          </Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <IconButton aria-label="Close photo details" onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Box
          component="img"
          src={photo.imageUrl}
          alt={photo.altText || title || 'Selected photo'}
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: { xs: '55vh', sm: '68vh' },
            objectFit: 'contain',
            bgcolor: '#171717',
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', pt: 2 }}>
          {photo.altText && <Typography variant="body2">{photo.altText}</Typography>}
          {photo.photographer && (
            <Typography variant="body2" color="text.secondary">
              Photo by{' '}
              <Link href={photo.photographerUrl} target="_blank" rel="noopener noreferrer">
                {photo.photographer}
              </Link>
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}