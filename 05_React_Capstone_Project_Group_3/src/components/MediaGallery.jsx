import React, { useState } from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Link, Skeleton } from '@mui/material';
// ADDED: extra MUI components and icons for the like, share, download buttons and the expanded photo.
import { CardActions, IconButton, Tooltip, Dialog, DialogContent, Snackbar } from '@mui/material';
import { Favorite, FavoriteBorder, Download, Share, Close } from '@mui/icons-material';
// ADDED: location icon and a Button for the map popup.
import { LocationOn } from '@mui/icons-material';
import { Button } from '@mui/material';

// ORIGINAL (kept): export default function MediaGallery({ photos, loading }) {
// CHANGED: also receives 'place' (the searched province) from App.jsx, so the map knows where to look.
// CHANGED: also receives 'favorites' (saved photos), 'onToggleFavorite' (save/remove one) and 'emptyText' (message when the list is empty).
export default function MediaGallery({ photos, loading, place, favorites, onToggleFavorite, emptyText }) {
  // ADDED: 'liked' = ids of hearted photos, 'selected' = the photo opened big, 'message' = small popup text.
  const [liked, setLiked] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  // ADDED: 'showMap' opens the map popup, 'mapQuery' is the place text sent to Google Maps.
  const [showMap, setShowMap] = useState(false);
  // ADDED: 'mapPhoto' is the photo whose map is open. A saved favorite remembers the place it was found in ('savedPlace').
  const [mapPhoto, setMapPhoto] = useState(null);
  const mapPlace = (mapPhoto && mapPhoto.savedPlace) || place;
  const mapQuery = encodeURIComponent(`${mapPlace || 'Philippines'}, Philippines`);

  // ADDED: the short description phrase under each photo. It uses the photo's own description from Pexels (altText).
  // If there is none, it falls back to "Tourist spot in [place]". The first letter is made a capital.
  const describe = (photo) => {
    const text = (photo.altText || '').trim();
    if (!text) return `Tourist spot in ${photo.savedPlace || place || 'the Philippines'}`;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // ADDED: heart on/off for one photo.
  const toggleLike = (id) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // ADDED: downloads the photo file. If the browser blocks it, the photo opens in a new tab instead.
  const handleDownload = async (photo) => {
    try {
      const res = await fetch(photo.imageUrl);
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').split('+')[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lakbay-ph-${photo.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage('Download started');
    } catch {
      window.open(photo.imageUrl, '_blank', 'noopener,noreferrer');
      setMessage('Photo opened in a new tab. Right-click it to save.');
    }
  };

  // ADDED: opens the phone/computer share menu, or copies the photo link if sharing is not available.
  const handleShare = async (photo) => {
    const link = new URL(photo.imageUrl, window.location.href).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lakbay PH', text: photo.altText, url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setMessage('Photo link copied');
      }
    } catch {
      /* the person closed the share menu, nothing to do */
    }
  };

  // ADDED: the three icon buttons (heart, share, download). Hidden for the "Photo unavailable" backup card.
  const renderActions = (photo) => {
    if (photo.id === 'fallback-1') return null;
    // ORIGINAL (kept): const isLiked = liked.includes(photo.id);
    // CHANGED: when the page gives a favorites list, the heart is red if the photo is saved in My Favorites.
    const isLiked = favorites ? favorites.some((f) => f.id === photo.id) : liked.includes(photo.id);
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {/* ADDED: location icon, opens the map of the searched place. */}
        <Tooltip title="View on map">
          <IconButton onClick={() => { setMapPhoto(photo); setShowMap(true); }} aria-label="View location on map">
            <LocationOn />
          </IconButton>
        </Tooltip>
        <Tooltip title={isLiked ? 'Remove from liked' : 'Like'}>
          <IconButton onClick={() => (onToggleFavorite ? onToggleFavorite(photo) : toggleLike(photo.id))} color={isLiked ? 'error' : 'default'} aria-label="Like photo" aria-pressed={isLiked}>
            {isLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton onClick={() => handleShare(photo)} aria-label="Share photo">
            <Share />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton onClick={() => handleDownload(photo)} aria-label="Download photo">
            <Download />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  // TODO 3.1 [Loading Skeletal Feedbacks]: If 'loading' prop parameters evaluate true, return a visual helper feedback container.
  // Pro Tip: Loop a standard array wrapper or mock layout blocks to show a clean visual waiting feedback (e.g. Loading indicator or Skeletons).
  if (loading) {
    return (
      <Grid container spacing={3} aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 3.6', height: 'auto' }} />
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
          {/* ORIGINAL (kept): No tourist spots found for this area yet. */}
          {emptyText || 'No tourist spots found for this area yet.'}
        </Typography>
      </Box>
    );
  }

  return (
    // TODO 3.3 [Fluid Layout Architecture]: Implement a highly responsive grid container layout matching flexible sizing constraints.
    // Map across your structured 'photos' payload elements inside the grid layout logic.
    <>
    <Grid container spacing={3}>
      {/* TODO 3.4 [Card Content Loop Mapping]: Loop across the photo elements.
          Configure grid cell sizes dynamically matching view constraints: xs=12, sm=6, md=4 columns */}
      {photos.map((photo) => (
        <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            
            {/* TODO 3.5 [Multimedia Presentation Layer]: Render an MUI <CardMedia /> item block targeting photo image pointers.
                Incorporate 'photo.imageUrl' into the media src layer and bind your 'photo.altText' to native asset labels. */}
            {/* ADDED to the CardMedia below: onClick opens the big photo, plus a pointer cursor and a hover tip. */}
            <CardMedia
              component="img"
              image={photo.imageUrl}
              alt={photo.altText}
              loading="lazy"
              onClick={() => setSelected(photo)}
              title="Click to enlarge"
              sx={{ height: 220, objectFit: 'cover', cursor: 'zoom-in' }}
            />

            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              {/* ADDED: description phrase of the photo (max 2 lines, hover to read all). */}
              <Typography
                variant="body2"
                title={describe(photo)}
                sx={{ mb: 1.5, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                “{describe(photo)}”
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                📸 Captured by:
              </Typography>
              {/* TODO 3.6 [Attribution Links]: Add an MUI external <Link> layout pointer.
                  Configure href='photo.photographerUrl' and populate item typography displaying 'photo.photographer'. */}
              {photo.photographerUrl ? (
                <Link
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="always"
                  fontWeight={700}
                >
                  {photo.photographer}
                </Link>
              ) : (
                <Typography component="span" fontWeight={700}>
                  {photo.photographer}
                </Typography>
              )}
            </CardContent>

            {/* ADDED: heart, share and download icons under each photo. */}
            <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0, justifyContent: 'flex-end' }}>
              {renderActions(photo)}
            </CardActions>

          </Card>
        </Grid>
      ))}
      {/* End Loop */}
    </Grid>

    {/* ADDED: the expanded photo. It opens when a photo is clicked and closes with the X, Esc, or a click outside. */}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="lg" fullWidth>
      {selected && (
        <>
          <Box sx={{ position: 'relative', bgcolor: '#000' }}>
            <IconButton
              onClick={() => setSelected(null)}
              aria-label="Close photo"
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
            >
              <Close />
            </IconButton>
            <Box
              component="img"
              src={selected.imageUrl}
              alt={selected.altText}
              sx={{ display: 'block', width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          </Box>
          <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              {/* ADDED: full description phrase in the expanded photo. */}
              <Typography variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                “{describe(selected)}”
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                📸 Captured by:
              </Typography>
              {selected.photographerUrl ? (
                <Link href={selected.photographerUrl} target="_blank" rel="noopener noreferrer" underline="always" fontWeight={700}>
                  {selected.photographer}
                </Link>
              ) : (
                <Typography component="span" fontWeight={700}>
                  {selected.photographer}
                </Typography>
              )}
            </Box>
            {renderActions(selected)}
          </DialogContent>
        </>
      )}
    </Dialog>

    {/* ADDED: map popup. It shows the searched place on Google Maps, with a button to open the full map. */}
    <Dialog open={showMap} onClose={() => setShowMap(false)} maxWidth="md" fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>📍 {mapPlace || 'Philippines'}</Typography>
        <IconButton onClick={() => setShowMap(false)} aria-label="Close map">
          <Close />
        </IconButton>
      </Box>
      <Box
        component="iframe"
        title={`Map of ${mapPlace || 'Philippines'}`}
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ border: 0, width: '100%', height: { xs: 320, sm: 460 } }}
      />
      <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          The map shows the place you searched. Pexels does not give the exact spot of each photo.
        </Typography>
        <Button
          variant="contained"
          startIcon={<LocationOn />}
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`tourist spots in ${mapPlace || 'Philippines'}, Philippines`)}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Open in Google Maps
        </Button>
      </DialogContent>
    </Dialog>

    {/* ADDED: small popup message for "Download started" and "Photo link copied". */}
    <Snackbar open={Boolean(message)} autoHideDuration={2500} onClose={() => setMessage('')} message={message} />
    </>
  );
}