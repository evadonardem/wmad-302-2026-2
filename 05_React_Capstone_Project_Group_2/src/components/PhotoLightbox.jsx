import React, { useEffect, useState } from 'react';
import { Dialog, IconButton, Snackbar } from '@mui/material';
import {
  ChevronLeft, ChevronRight, Close, Directions, Favorite, FavoriteBorder, OpenInNew, Place, Share,
} from '@mui/icons-material';
import { shareLink, mapSearchUrl, mapDirectionsUrl } from '../utils/links';

const EMPTY_PLACE = { title: '', province: '', region: '', featured: null, spots: [] };

export default function PhotoLightbox({ photos, index, onClose, onChange, place = EMPTY_PLACE, isFav, onToggleFav }) {
  const [message, setMessage] = useState('');
  const photo = index >= 0 ? photos[index] : null;
  const count = photos.length;

  // ← / → keys switch photos (Esc is handled by the Dialog)
  useEffect(() => {
    if (!photo) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onChange((index + 1) % count);
      if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photo, index, count, onChange]);

  if (!photo) return null;

  const f = place.featured;
  const where = [place.province, place.region].filter(Boolean);
  const mapQuery = `${place.title}, ${place.province || place.region}, Philippines`;

  const handleShare = async () => {
    const msg = await shareLink(photo.altText, photo.pageUrl);
    if (msg) setMessage(msg);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg" slotProps={{ paper: { className: 'lightbox-paper' } }}>
      <div className="lightbox">
        <div className="lightbox-stage" style={{ backgroundColor: photo.color || '#111' }}>
          <img src={photo.fullUrl || photo.imageUrl} alt={photo.altText} />
          {count > 1 && (
            <>
              <IconButton className="lb-nav lb-prev" aria-label="Previous photo" onClick={() => onChange((index - 1 + count) % count)}>
                <ChevronLeft />
              </IconButton>
              <IconButton className="lb-nav lb-next" aria-label="Next photo" onClick={() => onChange((index + 1) % count)}>
                <ChevronRight />
              </IconButton>
            </>
          )}
          <span className="lb-count">{index + 1} / {count}</span>
        </div>

        <aside className="lightbox-info">
          <IconButton className="lb-close" aria-label="Close" onClick={onClose}><Close /></IconButton>

          <span className="lb-kicker">Photo of</span>
          <h2>{place.title}</h2>
          <div className="tg">
            {where.map((t) => <span key={t}>{t}</span>)}
          </div>
          <p className="ds" style={{ marginTop: 8 }}>{photo.altText}</p>

          <div className="lb-actions">
            <button type="button" className={`btn${isFav(photo.id) ? ' p' : ''}`} onClick={() => onToggleFav(photo.id)}>
              {isFav(photo.id) ? <Favorite /> : <FavoriteBorder />} {isFav(photo.id) ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="btn" onClick={handleShare}><Share /> Share link</button>
            <a className="btn" href={mapSearchUrl(mapQuery)} target="_blank" rel="noopener noreferrer"><Place /> View on map</a>
            <a className="btn" href={mapDirectionsUrl(mapQuery)} target="_blank" rel="noopener noreferrer"><Directions /> Directions</a>
          </div>

          {f && (
            <>
              <hr className="lb-hr" />
              <h4>About {f.name}</h4>
              <p className="ds">{f.description}</p>
              <div className="lb-row"><span>Best months</span><b>{f.best}</b></div>
              <div className="lb-row"><span>Budget</span><b>{f.budget}</b></div>
              <div className="lb-row"><span>Rating</span><b>★ {f.rating}</b></div>
              <p className="ds"><b>Getting there:</b> {f.howToGetThere}</p>
              <ul className="lb-list">
                {f.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </>
          )}

          {place.spots.length > 0 && (
            <>
              <hr className="lb-hr" />
              <h4>Places to explore here</h4>
              <div className="lb-chips">
                {place.spots.map((sp) => <span key={sp.name}>{sp.name}</span>)}
              </div>
            </>
          )}

          <hr className="lb-hr" />
          <h4>Photo details</h4>
          <div className="lb-row">
            <span>Photographer</span>
            <a href={photo.photographerUrl} target="_blank" rel="noopener noreferrer">{photo.photographer}</a>
          </div>
          <div className="lb-row"><span>Size</span><b>{photo.width} × {photo.height} px</b></div>
          <div className="lb-row">
            <span>Main color</span>
            <b><span className="lb-swatch" style={{ background: photo.color }} />{photo.color}</b>
          </div>
          <div className="lb-row">
            <span>Photo link</span>
            <a href={photo.pageUrl} target="_blank" rel="noopener noreferrer">View on Pexels <OpenInNew sx={{ fontSize: 12 }} /></a>
          </div>
        </aside>
      </div>
      <Snackbar open={Boolean(message)} autoHideDuration={2500} onClose={() => setMessage('')} message={message} />
    </Dialog>
  );
}
