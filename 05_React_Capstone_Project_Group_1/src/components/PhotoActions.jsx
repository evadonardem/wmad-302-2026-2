import React, { useState } from 'react';
import { Box, Button, IconButton, ListItemText, Menu, MenuItem, Snackbar, Stack } from '@mui/material';
import { Download, Share, ArrowDropDown } from '@mui/icons-material';

// Sizes offered in the Download menu. The links come from photo.sources (the sizes Pexels provides).
const SIZE_OPTIONS = [
  { key: 'small', label: 'Small', hint: 'Thumbnail, smallest file' },
  { key: 'medium', label: 'Medium', hint: 'Good for chat and social media' },
  { key: 'large', label: 'Large', hint: 'Standard quality' },
  { key: 'hd', label: 'HD', hint: 'High quality, bigger file' },
  { key: 'original', label: 'Original', hint: 'Full resolution, very large file' },
];

// Download + Share buttons.
// photo = a photo object from the service (imageUrl, sources, width, height, photographer)
// compact = small round icon buttons (used on cards), otherwise text buttons (used in the dialog)
export default function PhotoActions({ photo, title, compact = false }) {
  const [message, setMessage] = useState(''); // text of the small popup message
  const [downloading, setDownloading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null); // the button the size menu opens from

  if (!photo) return null;

  // Build the size choices from the photo. Photos saved before this feature only have one size.
  const sources = photo.sources || {};
  let options = SIZE_OPTIONS.filter((option) => sources[option.key]).map((option) => ({
    ...option,
    url: sources[option.key],
    hint:
      option.key === 'original' && photo.width && photo.height
        ? `Full resolution (${photo.width} × ${photo.height}), very large file`
        : option.hint,
  }));
  if (options.length === 0) {
    options = [{ key: 'large', label: 'Standard', hint: 'Standard quality', url: photo.imageUrl }];
  }
  const hasChoices = options.length > 1;

  // "Baguio City" -> "baguio-city"
  const baseName = (title || 'lakbay-ph')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // "baguio-city-large.jpg" (the extension comes from the image link)
  const getFileName = (option) => {
    const extension = (option.url.split('?')[0].split('.').pop() || '').toLowerCase();
    const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
    return `${baseName}-${option.key}.${safeExtension}`;
  };

  // Download: fetch the image as a file and save it. If the browser blocks it, open it in a new tab.
  const downloadFile = async (option) => {
    setDownloading(true);
    try {
      const response = await fetch(option.url);
      if (!response.ok) throw new Error(`Image request failed (${response.status})`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getFileName(option);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(option.url, '_blank', 'noopener,noreferrer');
      setMessage('Could not download directly, so the photo was opened in a new tab.');
    } finally {
      setDownloading(false);
    }
  };

  // Several sizes: open the menu. Only one size: download it right away.
  const handleDownloadClick = (e) => {
    if (hasChoices) {
      setMenuAnchor(e.currentTarget);
    } else {
      downloadFile(options[0]);
    }
  };

  const handleSelectSize = (option) => {
    setMenuAnchor(null);
    downloadFile(option);
  };

  // Share: use the phone's share sheet if available, otherwise copy the details to the clipboard
  const handleShare = async () => {
    const text = `${title} - photo by ${photo.photographer} on Pexels (via Lakbay PH)`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} | Lakbay PH`, text, url: photo.imageUrl });
      } catch {
        // The user closed the share sheet, so there is nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${photo.imageUrl}`);
      setMessage('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      setMessage('Could not copy the link.');
    }
  };

  // Round white icon style, same look as the heart button
  const iconSx = {
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    color: '#555',
    '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)' },
    transition: 'transform 0.2s ease',
  };

  return (
    // stopPropagation so clicking a button (or the menu) on a card doesn't also open the card's dialog
    <Box onClick={(e) => e.stopPropagation()}>
      {compact ? (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            aria-label="Download photo"
            title="Download"
            onClick={handleDownloadClick}
            disabled={downloading}
            sx={iconSx}
          >
            <Download fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Share photo"
            title="Share"
            onClick={handleShare}
            sx={iconSx}
          >
            <Share fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download />}
            endIcon={hasChoices ? <ArrowDropDown /> : undefined}
            onClick={handleDownloadClick}
            disabled={downloading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Share />}
            onClick={handleShare}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Share
          </Button>
        </Stack>
      )}

      {/* Download size menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {options.map((option) => (
          <MenuItem key={option.key} onClick={() => handleSelectSize(option)}>
            <ListItemText primary={option.label} secondary={option.hint} />
          </MenuItem>
        ))}
      </Menu>

      {/* Small popup message */}
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        onClose={() => setMessage('')}
        message={message}
      />
    </Box>
  );
}