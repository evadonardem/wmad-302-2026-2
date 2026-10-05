import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@mui/material';

// Crossfading background slideshow for the hero, built from the searched place's photos.
export default function HeroCarousel({ photos, title = 'the searched place' }) {
  const slides = useMemo(() => photos.slice(0, 6), [photos]);
  const [active, setActive] = useState(0);

  // New place -> start from the first photo
  useEffect(() => setActive(0), [slides]);

  // Auto-advance every 5s (skipped when the user prefers reduced motion).
  // Depends on `active` so clicking a dot restarts the timer.
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setTimeout(() => setActive((n) => (n + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [slides, active]);

  if (slides.length === 0) return null;
  const current = slides[active] || slides[0];

  return (
    <div className="hero-carousel" role="group" aria-label={`Background photos of ${title}`}>
      {slides.map((photo, i) => (
        <div
          key={photo.id}
          className={`hero-slide${i === active ? ' on' : ''}`}
          style={{ backgroundImage: `url(${photo.fullUrl || photo.imageUrl})`, backgroundColor: photo.color }}
          aria-hidden="true"
        />
      ))}
      <div className="hero-shade" />

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              className={`hero-dot${i === active ? ' on' : ''}`}
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}

      <Link className="hero-credit" href={current.pageUrl} target="_blank" rel="noopener noreferrer">
        📸 {current.photographer} / Pexels
      </Link>
    </div>
  );
}
