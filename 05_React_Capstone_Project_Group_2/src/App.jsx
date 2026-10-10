import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import PhotoLightbox from './components/PhotoLightbox';
import HeroCarousel from './components/HeroCarousel';
import FeaturedDestinations from './components/FeaturedDestinations';
import useFavorites from './hooks/useFavorites';
import { searchPhotos, getProvincesOrCities, getTownsOfProvince } from './services/geoPhotoService';
import { FEATURED, findCurated, cleanPlaceName } from './data/places';
import './App.css';

const ISLAND_CARDS = [
  { label: 'Luzon', query: 'Banaue rice terraces Philippines', match: 'rice', bg: 'linear-gradient(180deg,#8cc4ee,#5aa65a 45%,#1f5f8f)' },
  { label: 'Visayas', query: 'Chocolate Hills Bohol Philippines', match: 'chocolate', bg: 'linear-gradient(180deg,#d7eec0,#7fbf5a 45%,#3b7d3c)' },
  { label: 'Mindanao', query: 'Siargao island Philippines', match: 'siargao', bg: 'linear-gradient(180deg,#bfe3f5,#4fb3d9 40%,#2a8f6a)' },
];

const PAGE_SIZE = 80; // Pexels allows at most 80 photos per request

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [selection, setSelection] = useState(null); // { region: {code,name}, province: {code,name,kind} | null }
  const [places, setPlaces] = useState({ loading: false, provinces: [], towns: [] });
  const [photoTarget, setPhotoTarget] = useState(null); // { title, query }
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openIndex, setOpenIndex] = useState(-1);
  const { favs, isFav, toggle } = useFavorites();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: { main: isDarkMode ? '#14a3ad' : '#0e7c86' },
          background: isDarkMode ? { default: '#0a1624', paper: '#112236' } : { default: '#f4f7fa', paper: '#ffffff' },
          text: isDarkMode ? { primary: '#e8eef5', secondary: '#9fb0c3' } : { primary: '#0b2545', secondary: '#5b6b7f' },
        },
        shape: { borderRadius: 14 },
        typography: { fontFamily: "'Inter', system-ui, sans-serif" },
      }),
    [isDarkMode]
  );

  // Keep the CSS variables in App.css in sync with the theme toggle
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Load photos for a place (or a clicked tourist spot). Late replies from older searches are ignored.
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestRef = useRef(0);
  const loadPhotos = (target) => {
    const id = ++requestRef.current;
    setPhotoTarget(target);
    setLoading(true);
    setError('');
    setOpenIndex(-1);
    setPage(1);
    setHasMore(false);
    searchPhotos(target.query, PAGE_SIZE)
      .then((result) => {
        if (id !== requestRef.current) return;
        setHasMore(result.length === PAGE_SIZE);
        // Pictures whose description mentions the place come first, so captions match the place
        const key = cleanPlaceName(target.title).toLowerCase();
        const hit = (p) => (p.altText || '').toLowerCase().includes(key);
        setPhotos([...result.filter(hit), ...result.filter((p) => !hit(p))]);
      })
      .catch((err) => { if (id === requestRef.current) { setPhotos([]); setError(err.message); } })
      .finally(() => { if (id === requestRef.current) setLoading(false); });
  };

  // "Show more": next page of the same Pexels search, appended below (duplicates skipped)
  const loadMore = () => {
    const id = requestRef.current;
    setLoadingMore(true);
    searchPhotos(photoTarget.query, PAGE_SIZE, page + 1)
      .then((result) => {
        if (id !== requestRef.current) return;
        setPage((n) => n + 1);
        setHasMore(result.length === PAGE_SIZE);
        setPhotos((prev) => [...prev, ...result.filter((p) => !prev.some((q) => q.id === p.id))]);
      })
      .catch((err) => { if (id === requestRef.current) setError(err.message); })
      .finally(() => setLoadingMore(false));
  };

  const placesRef = useRef(0);
  const placeName = selection
    ? selection.municipality
      ? cleanPlaceName(selection.municipality.name)
      : selection.province?.name || selection.region.name
    : '';
  const baseTarget = (sel) => {
    const name = sel.municipality ? cleanPlaceName(sel.municipality.name) : sel.province?.name || sel.region.name;
    const where = sel.municipality ? ` ${sel.province.name}` : '';
    return { title: name, query: `${name}${where} Philippines tourist spots` };
  };

  const handleSearch = async ({ region, province, municipality }) => {
    const id = ++placesRef.current;
    const sel = { region, province, municipality };
    setSelection(sel);
    setPlaces({ loading: true, provinces: [], towns: [] });
    loadPhotos(baseTarget(sel));

    // PSGC: provinces of a region, or the cities/municipalities of a province
    const next = province
      ? { provinces: [], towns: province.kind === 'province' ? await getTownsOfProvince(province.code) : [] }
      : { provinces: await getProvincesOrCities(region.code), towns: [] };
    if (id === placesRef.current) setPlaces({ loading: false, ...next });
  };

  const curated = selection && !selection.municipality ? findCurated(selection.province) : null;
  const place = selection && photoTarget
    ? {
        title: photoTarget.title,
        province: selection.province?.name || '',
        region: selection.region.name,
        featured: curated && photoTarget.title === placeName ? FEATURED.find((f) => f.name === curated.featured) || null : null,
        spots: selection.municipality ? [] : (curated?.spots.length ? curated.spots : places.towns).slice(0, 8),
      }
    : undefined;

  // The three hero cards: one picture for each island group (Luzon, Visayas, Mindanao)
  const [islandPics, setIslandPics] = useState({});
  useEffect(() => {
    ISLAND_CARDS.forEach((c) => {
      searchPhotos(c.query, 10)
        .then((r) => {
          const pick = r.find((p) => p.altText.toLowerCase().includes(c.match)) || r[0];
          if (pick) setIslandPics((prev) => ({ ...prev, [c.label]: pick.imageUrl }));
        })
        .catch(() => {});
    });
  }, []);
  const stackCards = ISLAND_CARDS.map((c) => ({
    label: c.label,
    bg: islandPics[c.label] ? `url(${islandPics[c.label]}) center / cover` : c.bg,
  }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <header className="nav">
        <span className="logo"><i />Lakbay PH</span>
        <a href="#destinations">Destinations</a>
        <span className="sp" />
        <span className="ib" aria-label={`${favs.length} saved`}>♥ Saved <span className="cnt">{favs.length}</span></span>
        <button type="button" className="ib" aria-label="Toggle theme" onClick={() => setIsDarkMode((v) => !v)}>
          {isDarkMode ? '☀' : '◐'}
        </button>
      </header>

      <section className="hero">
        {selection && photos.length > 0 && (
          <HeroCarousel key={photoTarget?.query} photos={photos} title={photoTarget?.title || placeName} />
        )}
        <div className="hi">
          <div>
            <span className="pill">Travel Guide 2026</span>
            <h1>Find your next island in the Philippines</h1>
            <p className="lead">Explore tourist spots across regions, provinces, and cities, then save the places you love.</p>
            <LocationForm onSearch={handleSearch} />
          </div>
          <div className="stack" aria-hidden="true">
            {stackCards.map((c) => (
              <div className="pc" key={c.label + c.bg} style={{ background: c.bg }}><span>{c.label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="sg">
          <div><b>7,600+</b><span>Islands to explore</span></div>
          <div><b>17</b><span>Regions covered</span></div>
          <div><b>80+</b><span>Provinces</span></div>
          <div><b>{FEATURED.length}</b><span>Featured destinations</span></div>
        </div>
      </div>

      <main className="main" id="destinations">
        {selection ? (
          <>
            <MediaGallery
              title={photoTarget?.title || placeName}
              photos={photos}
              loading={loading}
              error={error}
              onOpen={setOpenIndex}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              isFav={isFav}
              onToggleFav={toggle}
              resetLabel={photoTarget && photoTarget.title !== placeName ? `Show all photos of ${placeName}` : ''}
              onReset={() => loadPhotos(baseTarget(selection))}
            />
            <PhotoLightbox
              photos={photos}
              index={openIndex}
              onClose={() => setOpenIndex(-1)}
              onChange={setOpenIndex}
              place={place}
              isFav={isFav}
              onToggleFav={toggle}
            />
          </>
        ) : (
          <FeaturedDestinations isFav={isFav} toggle={toggle} />
        )}
      </main>
    </ThemeProvider>
  );
}
