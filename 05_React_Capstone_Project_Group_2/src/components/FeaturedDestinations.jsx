import React, { useEffect, useMemo, useState } from 'react';
import PhotoActions from './PhotoActions';
import { searchPhotos } from '../services/geoPhotoService';
import { FEATURED } from '../data/places';

// Gradient shown until (or instead of) a real photo
const TINTS = {
  Palawan: 'linear-gradient(180deg,#f3b9a8,#e8a2a0 22%,#1bbfa5 55%,#0b6e73)',
  Siargao: 'linear-gradient(180deg,#bfe3f5,#4fb3d9 40%,#2a8f6a 70%,#f1d9a7)',
  Boracay: 'linear-gradient(180deg,#9fd8ff,#e9f6ff 35%,#f4e2b8 55%,#2fc4c0)',
  Cebu: 'linear-gradient(180deg,#8cc4ee,#f1d6a4 55%,#c96f4a)',
  Bohol: 'linear-gradient(180deg,#d7eec0,#7fbf5a 45%,#3b7d3c)',
  Batanes: 'linear-gradient(180deg,#8cc4ee,#5aa65a 45%,#1f5f8f)',
  Zambales: 'linear-gradient(180deg,#7bb86b,#f1d9a7 55%,#2fb5a8)',
  Baguio: 'linear-gradient(180deg,#c9d8e6,#6b8f71 50%,#2f4a3a)',
  Davao: 'linear-gradient(180deg,#ffd9a0,#e9b44c 40%,#3f7d4e)',
};
const FALLBACK_TINT = 'linear-gradient(180deg,#8cc4ee,#5aa65a 45%,#1f5f8f)';

const ISLAND_GROUP = {
  NCR: 'Luzon', CAR: 'Luzon', I: 'Luzon', II: 'Luzon', III: 'Luzon', 'IV-A': 'Luzon', 'IV-B': 'Luzon', V: 'Luzon',
  VI: 'Visayas', VII: 'Visayas', VIII: 'Visayas',
};
const islandGroup = (code) => ISLAND_GROUP[code] || 'Mindanao';

export default function FeaturedDestinations({ isFav, toggle }) {
  const [images, setImages] = useState({});
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('top');

  // One Pexels photo per destination; the gradient stays if a request fails.
  useEffect(() => {
    FEATURED.forEach((d) => {
      searchPhotos(`${d.name} Philippines`, 10)
        .then((r) => {
          // prefer a photo whose description mentions the destination
          const pick = r.find((p) => p.altText.toLowerCase().includes(d.name.toLowerCase())) || r[0];
          if (pick) setImages((prev) => ({ ...prev, [d.name]: { src: pick.imageUrl, link: pick.pageUrl } }));
        })
        .catch(() => {});
    });
  }, []);

  const cats = useMemo(() => ['All', ...new Set(FEATURED.flatMap((d) => d.tags))], []);
  const list = useMemo(() => {
    const shown = FEATURED.filter((d) => cat === 'All' || d.tags.includes(cat));
    return [...shown].sort((a, b) => (sort === 'az' ? a.name.localeCompare(b.name) : b.rating - a.rating));
  }, [cat, sort]);

  return (
    <section>
      <div className="mh">
        <div>
          <h2>Featured destinations</h2>
          <p className="sub">{list.length} destination{list.length === 1 ? '' : 's'}</p>
        </div>
        <select className="ib sort" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="top">Sort: Top rated</option>
          <option value="az">Sort: A–Z</option>
        </select>
      </div>

      <div className="bar">
        {cats.map((c) => (
          <button key={c} type="button" className={`chip${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="grid">
        {list.map((d) => {
          const img = images[d.name]?.src;
          return (
            <article key={d.name} className="card">
              <div
                className="ph"
                style={{ backgroundImage: `${img ? `url(${img}), ` : ''}${TINTS[d.name] || FALLBACK_TINT}` }}
              >
                <PhotoActions title={d.name} url={images[d.name]?.link || ''} isFav={isFav(d.name)} onToggle={() => toggle(d.name)} />
                <span className="rg">{islandGroup(d.region)}</span>
                <div className="hv">
                  <ul>{d.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                  <p><b>Getting there:</b> {d.howToGetThere}</p>
                </div>
              </div>
              <div className="cb">
                <div className="ct">
                  <h3>{d.name}</h3>
                  <span className="rt"><i>★</i> {d.rating}</span>
                </div>
                <div className="tg">{d.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <p className="ds">{d.description}</p>
                <div className="mt">
                  <span>Best: <b>{d.best}</b></span>
                  <span>Budget: <b>{d.budget}</b></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
