import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardMedia, CardContent, CardActionArea, Typography, Link, Skeleton,
  Dialog, IconButton, Menu, MenuItem, ListItemText,
} from '@mui/material';
import { Close, Download, Favorite, FavoriteBorder } from '@mui/icons-material';

const CARD_WIDTH = { xs: '100%', sm: 340 };
const IMAGE_HEIGHT = 240;

const cardSx = {
  position: 'relative',
  width: CARD_WIDTH,
  flex: 'none',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 3,
  background: 'var(--card-bg)',
  overflow: 'hidden',
};

const rowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 3,
};

const preloadImage = (url) => {
  const img = new Image();
  img.src = url;
};

// Download size choices (width in pixels; null = untouched original file)
const DOWNLOAD_SIZES = [
  { label: 'Small', note: '640 px wide', width: 640 },
  { label: 'Medium', note: '1280 px wide', width: 1280 },
  { label: 'Large', note: '1920 px wide', width: 1920 },
  { label: 'Original', note: 'Full size', width: null },
];

// Scales an image blob down to `width` (never enlarges) and returns a JPEG blob
const resizeBlob = (blob, width) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(src);
      const w = Math.min(width, img.naturalWidth);
      const h = Math.round(img.naturalHeight * (w / img.naturalWidth));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (out) => (out ? resolve(out) : reject(new Error('Resize failed'))),
        'image/jpeg',
        0.92
      );
    };
    img.onerror = reject;
    img.src = src;
  });

// Saves the photo at the chosen size; if the browser blocks it, opens the image in a new tab
const downloadPhoto = async (photo, size) => {
  const url = photo.fullImageUrl || photo.imageUrl;
  try {
    const res = await fetch(url);
    let blob = await res.blob();
    if (size.width) blob = await resizeBlob(blob, size.width);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `lakbay-ph-${photo.id}-${size.label.toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// ---- Place descriptions (from Wikipedia) ----
const placeCache = new Map();
const fetchPlaceInfo = async (place) => {
  if (placeCache.has(place)) return placeCache.get(place);
  const [city, region] = place.split(',').map((s) => s.trim());
  let info = null;
  try {
    const q = encodeURIComponent(`${city} ${region || ''} Philippines`);
    const found = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=1&format=json&origin=*`
    ).then((r) => r.json());
    const title = found?.query?.search?.[0]?.title;
    if (title) {
      const data = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      ).then((r) => r.json());
      if (data.extract && data.type !== 'disambiguation') {
        info = { title: data.title, text: data.extract, url: data.content_urls?.desktop?.page };
      }
    }
  } catch {
    /* offline or blocked: fall through to "no description" */
  }
  if (info) placeCache.set(place, info);
  return info;
};

// Round dark button that sits on top of a photo
const overlayButtonSx = {
  background: 'rgba(0,0,0,0.5)',
  '&:hover': { background: 'rgba(0,0,0,0.75)' },
};

export default function MediaGallery({
  photos,
  loading,
  favorites = [],
  onToggleFavorite,
  emptyMessage = 'No tourist spots found for this area yet.',
}) {
  // Must stay above the early returns (hooks can't be called conditionally)
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [sizeAnchor, setSizeAnchor] = useState(null);
  const [dims, setDims] = useState(null); // real pixel size of the open photo
  const [origBytes, setOrigBytes] = useState(null); // real file size, when the host reports it
  const [placeInfo, setPlaceInfo] = useState(null); // undefined = loading, null = none

  // New photo opened: reset sizes and load the place description
  useEffect(() => {
    setDims(null);
    setOrigBytes(null);
    if (!selectedPhoto?.place) {
      setPlaceInfo(null);
      return undefined;
    }
    setPlaceInfo(undefined);
    let cancelled = false;
    fetchPlaceInfo(selectedPhoto.place).then((info) => {
      if (!cancelled) setPlaceInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPhoto]);

  // Size menu opened: ask the host for the real file size (header only, no download)
  useEffect(() => {
    if (!sizeAnchor || !selectedPhoto) return;
    const url = selectedPhoto.fullImageUrl || selectedPhoto.imageUrl;
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        const n = Number(r.headers.get('content-length'));
        if (n > 0) setOrigBytes(n);
      })
      .catch(() => {});
  }, [sizeAnchor, selectedPhoto]);

  // What each size will be, shown BEFORE anything is downloaded
  const sizeInfo = (size) => {
    if (!dims) return size.note;
    const w = size.width ? Math.min(size.width, dims.w) : dims.w;
    const h = Math.round(dims.h * (w / dims.w));
    const exact = !size.width && origBytes;
    const bytes = exact ? origBytes : w * h * 0.3;
    return `${w} × ${h} px · ${exact ? '' : '~'}${formatBytes(bytes)}`;
  };

  const isFavorite = (photo) => favorites.some((f) => f.id === photo.id);

  if (loading) {
    return (
      <Box sx={rowSx}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} elevation={6} sx={{ ...cardSx, border: '1px solid var(--border)' }}>
            <Skeleton variant="rectangular" height={IMAGE_HEIGHT} sx={{ bgcolor: 'var(--accent-soft)' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width="40%" sx={{ mx: 'auto', bgcolor: 'var(--accent-soft)' }} />
              <Skeleton variant="text" width="70%" sx={{ mx: 'auto', bgcolor: 'var(--accent-soft)' }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={rowSx}>
        {photos.map((photo, index) => {
          const fav = isFavorite(photo);
          return (
            <Card
              key={photo.id || index}
              elevation={6}
              sx={{
                ...cardSx,
                border: '1.5px solid var(--border)',
                transition: 'all 0.35s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: 'var(--accent)',
                  boxShadow: '0 0 25px var(--glow)',
                },
              }}
            >
              {/* Heart: saves / removes this photo from Favorites */}
              {onToggleFavorite && (
                <IconButton
                  onClick={() => onToggleFavorite(photo)}
                  aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                  sx={{
                    ...overlayButtonSx,
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    color: fav ? '#FF4D6D' : '#fff',
                  }}
                >
                  {fav ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}

              {/* Only the image is clickable; the photographer link below stays separate */}
              <CardActionArea
                onClick={() => setSelectedPhoto(photo)}
                onMouseEnter={() => preloadImage(photo.fullImageUrl || photo.imageUrl)}
              >
                <CardMedia
                  component="img"
                  image={photo.imageUrl}
                  alt={photo.altText || 'Tourist spot photo'}
                  sx={{
                    width: '100%',
                    height: IMAGE_HEIGHT,
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </CardActionArea>

              <CardContent sx={{ flexGrow: 1, p: 2.5, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: 'var(--text-muted)', mb: 0.5, fontWeight: 'bold' }}
                >
                  📸 Captured by:
                </Typography>
                <Link
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    color: 'var(--accent-strong)',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    '&:hover': { color: '#FF7A45' },
                  }}
                >
                  {photo.photographer}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Lightbox: open whenever a photo is selected */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 3,
            overflowY: 'auto',
            m: 2,
          },
        }}
      >
        <IconButton
          onClick={() => setSelectedPhoto(null)}
          aria-label="Close"
          sx={{ ...overlayButtonSx, position: 'absolute', top: 8, right: 8, zIndex: 2, color: '#fff' }}
        >
          <Close />
        </IconButton>

        {/* Download: opens a menu to pick the size */}
        {selectedPhoto && (
          <>
            <IconButton
              onClick={(e) => setSizeAnchor(e.currentTarget)}
              aria-label="Download photo"
              aria-haspopup="true"
              sx={{
                ...overlayButtonSx,
                position: 'absolute',
                top: 8,
                right: onToggleFavorite ? 104 : 56,
                zIndex: 2,
                color: '#fff',
              }}
            >
              <Download />
            </IconButton>

            <Menu
              anchorEl={sizeAnchor}
              open={Boolean(sizeAnchor)}
              onClose={() => setSizeAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  },
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{ display: 'block', px: 2, py: 0.5, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-muted)' }}
              >
                CHOOSE SIZE · NOTHING DOWNLOADS UNTIL YOU PICK
              </Typography>
              {DOWNLOAD_SIZES.filter((s) => !s.width || !dims || s.width < dims.w).map((size) => (
                <MenuItem
                  key={size.label}
                  onClick={() => {
                    setSizeAnchor(null);
                    downloadPhoto(selectedPhoto, size);
                  }}
                >
                  <ListItemText
                    primary={size.label}
                    secondary={sizeInfo(size)}
                    primaryTypographyProps={{ fontWeight: 700, sx: { color: 'var(--text)' } }}
                    secondaryTypographyProps={{ sx: { color: 'var(--text-muted)' } }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {selectedPhoto && onToggleFavorite && (
          <IconButton
            onClick={() => onToggleFavorite(selectedPhoto)}
            aria-label={isFavorite(selectedPhoto) ? 'Remove from favorites' : 'Add to favorites'}
            sx={{
              ...overlayButtonSx,
              position: 'absolute',
              top: 8,
              right: 56,
              zIndex: 2,
              color: isFavorite(selectedPhoto) ? '#FF4D6D' : '#fff',
            }}
          >
            {isFavorite(selectedPhoto) ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        )}

        {selectedPhoto && (
          <>
            <Box
              component="img"
              src={selectedPhoto.fullImageUrl || selectedPhoto.imageUrl}
              alt={selectedPhoto.altText}
              onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              sx={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '60vh', // leaves room for the description below
                objectFit: 'contain',
                mx: 'auto',
              }}
            />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>
                📸 Captured by:{' '}
              </Typography>
              <Link
                href={selectedPhoto.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ color: 'var(--accent-strong)', fontWeight: 'bold' }}
              >
                {selectedPhoto.photographer}
              </Link>
            </Box>

            {/* About this place */}
            {selectedPhoto.place && (
              <Box sx={{ px: { xs: 2.5, sm: 4 }, pb: 3, maxWidth: 760, mx: 'auto', textAlign: 'left' }}>
                <Typography
                  sx={{ fontWeight: 800, letterSpacing: 2, fontSize: '0.75rem', color: 'var(--accent)', mb: 1 }}
                >
                  ABOUT {selectedPhoto.place.split(',')[0].toUpperCase()}
                </Typography>
                {placeInfo === undefined ? (
                  <>
                    <Skeleton variant="text" sx={{ bgcolor: 'var(--accent-soft)' }} />
                    <Skeleton variant="text" sx={{ bgcolor: 'var(--accent-soft)' }} />
                    <Skeleton variant="text" width="60%" sx={{ bgcolor: 'var(--accent-soft)' }} />
                  </>
                ) : placeInfo ? (
                  <>
                    <Typography sx={{ color: 'var(--text)', fontSize: '1.02rem', lineHeight: 1.8 }}>
                      {placeInfo.text}
                    </Typography>
                    {placeInfo.url && (
                      <Link
                        href={placeInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{ display: 'inline-block', mt: 1.5, color: 'var(--accent-strong)', fontWeight: 'bold' }}
                      >
                        Read more on Wikipedia ›
                      </Link>
                    )}
                  </>
                ) : (
                  <Typography sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No description available for this place yet.
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}