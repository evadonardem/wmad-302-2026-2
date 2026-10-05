import React, { useState } from 'react';
import { IconButton, Snackbar, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder, Share } from '@mui/icons-material';

// Heart (favorite) + share buttons that sit on top of a card image.
export default function PhotoActions({ title, url, isFav, onToggle }) {
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    const link = /^https?:/.test(url) ? url : window.location.origin + url;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setMessage('Link copied to clipboard');
    } catch (err) {
      if (err.name !== 'AbortError') setMessage('Could not share this link');
    }
  };

  return (
    <>
      <div className="photo-actions">
        <Tooltip title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            className="photo-btn"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFav}
            onClick={onToggle}
          >
            {isFav ? <Favorite sx={{ color: '#e11d48' }} /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Share link">
          <IconButton size="small" className="photo-btn" aria-label="Share link" onClick={handleShare}>
            <Share />
          </IconButton>
        </Tooltip>
      </div>
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2500}
        onClose={() => setMessage('')}
        message={message}
      />
    </>
  );
}
