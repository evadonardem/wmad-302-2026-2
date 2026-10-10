import React, { useState } from 'react';
import { Alert, Skeleton } from '@mui/material';
import PhotoActions from './PhotoActions';

function KeyPrompt() {
  const [key, setKey] = useState('');
  const save = (e) => {
    e.preventDefault();
    try { localStorage.setItem('pexels-key', key.trim()); } catch { /* storage unavailable */ }
    window.location.reload();
  };
  return (
    <form onSubmit={save} className="keyform">
      <p className="ds">Photos come from Pexels. Paste your free Pexels API key once and it is remembered in this browser.</p>
      <div className="row">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Pexels API key" aria-label="Pexels API key" />
        <button type="submit" className="btn p" disabled={!key.trim()}>Save key</button>
      </div>
    </form>
  );
}

export default function MediaGallery({ title, photos, loading, error, onOpen, hasMore, loadingMore, onLoadMore, isFav, onToggleFav, resetLabel, onReset }) {
  return (
    <section id="photos">
      <div className="mh">
        <div>
          <h2>Photos of {title}</h2>
          {!loading && !error && photos.length > 0 && <p className="sub">{photos.length} photos found on Pexels</p>}
        </div>
        {resetLabel && <button type="button" className="btn" onClick={onReset}>{resetLabel}</button>}
      </div>

      {loading ? (
        <div className="spg pg">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="rectangular" height={160} />
              <Skeleton width="60%" sx={{ mt: 1 }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <>
          <Alert severity="error">{error}</Alert>
          {error.startsWith('Missing') && <KeyPrompt />}
        </>
      ) : photos.length === 0 ? (
        <div className="empty">No photos found for this place yet.</div>
      ) : (
        <div className="spg pg">
          {photos.map((photo, i) => (
            <div className="pcard" key={photo.id}>
              <div
                className="pcard-top"
                role="button"
                tabIndex={0}
                aria-label={`Open photo: ${photo.altText}`}
                onClick={() => onOpen(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(i);
                  }
                }}
              >
                <img className="pimg" src={photo.imageUrl} alt={photo.altText} loading="lazy" style={{ backgroundColor: photo.color }} />
                <span className="zoom-hint">🔍 Click to enlarge</span>
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <PhotoActions
                    title={photo.altText}
                    url={photo.pageUrl}
                    isFav={isFav(photo.id)}
                    onToggle={() => onToggleFav(photo.id)}
                  />
                </div>
              </div>
              <div className="pcap">
                <p className="pdesc">{photo.altText}</p>
                <span className="pmeta">
                  📍 {title} · 📸 <a href={photo.photographerUrl} target="_blank" rel="noopener noreferrer">{photo.photographer}</a>
                  {' / '}
                  <a href={photo.pageUrl} target="_blank" rel="noopener noreferrer">Pexels</a>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && hasMore && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button type="button" className="btn p" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore ? 'Loading…' : 'Show more photos'}
          </button>
        </div>
      )}
    </section>
  );
}
