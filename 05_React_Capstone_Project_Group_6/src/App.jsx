import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, CssBaseline, ThemeProvider, createTheme, GlobalStyles,
  Typography, Box, IconButton, Paper, Button, Chip,
} from '@mui/material';
import { LightMode, DarkMode, Favorite, FavoriteBorder } from '@mui/icons-material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation, PHOTOS_PER_PAGE } from './services/geoPhotoService';

/* ------------------------------------------------------------------ */
/*  Fish constellations (dark mode)                                    */
/*  pts: [x, y, radius?]  |  edges: pairs of indexes into pts          */
/*  A radius above 3 renders as a gold "eye" star.                     */
/* ------------------------------------------------------------------ */
const FISH = {
  // Milkfish: slender body, forked tail
  bangus: {
    pts: [
      [200, 40, 3], [170, 22], [110, 8], [60, 24], [10, 0], [35, 40],
      [10, 80], [60, 56], [120, 70], [170, 58], [172, 38, 3.8],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], [5, 10]],
  },
  // Whale shark: wide flat head, big dorsal fin, spotted back
  butanding: {
    pts: [
      [260, 36], [262, 56], [215, 26], [140, 0], [110, 26], [14, -6],
      [60, 40], [24, 70], [120, 58], [165, 95], [210, 60], [232, 38, 3.8],
      [185, 40, 1.6], [155, 42, 1.6], [128, 40, 1.6], [100, 38, 1.6], [80, 40, 1.6],
    ],
    edges: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 1], [1, 0], [6, 11]],
  },
  // Yellowfin tuna: torpedo body, finlets, crescent tail
  tambakol: {
    pts: [
      [180, 35, 3], [150, 18], [105, 2], [70, 16], [45, 22], [8, 0],
      [26, 36], [8, 72], [45, 50], [100, 64], [150, 56], [158, 34, 3.8],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 0], [6, 11]],
  },
};

// Seeded so the star field is identical on every render
const STARS = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 70 }, () => ({
    x: rand() * 1200,
    y: rand() * 800,
    r: 0.5 + rand() * 1.1,
    d: rand() * 4,
  }));
})();

function Constellation({ fish, x, y, scale = 1, flip = false, delay = 0, label }) {
  const { pts, edges } = fish;
  const maxX = Math.max(...pts.map((p) => p[0]));
  const maxY = Math.max(...pts.map((p) => p[1]));

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g className="lk-drift" style={{ animationDelay: `${-delay}s` }}>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]}
            stroke="#2DD4CF" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round"
          />
        ))}
        {pts.map(([px, py, r = 2.6], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={r * 3} fill="#7CF0EB" opacity="0.12" />
            <circle
              className="lk-star"
              cx={px} cy={py} r={r}
              fill={r > 3 ? '#FFE29A' : '#E6FFFD'}
              style={{ animationDelay: `${-((i * 0.9 + delay) % 4)}s` }}
            />
          </g>
        ))}
        {label && !flip && (
          <text
            x={maxX / 2} y={maxY + 30} textAnchor="middle"
            fill="#9FD8D6" fillOpacity="0.55" fontSize="13" letterSpacing="3" fontStyle="italic"
          >
            {label}
          </text>
        )}
      </g>
    </g>
  );
}

function DarkSky() {
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      {STARS.map((s, i) => (
        <circle
          key={i} className="lk-star" cx={s.x} cy={s.y} r={s.r} fill="#E6FFFD"
          style={{ animationDelay: `${-s.d}s` }}
        />
      ))}
      <Constellation fish={FISH.bangus} x={50} y={80} scale={1.1} label="BANGUS" delay={0} />
      <Constellation fish={FISH.bangus} x={1130} y={170} scale={0.75} flip delay={5} />
      <Constellation fish={FISH.butanding} x={860} y={540} scale={1.15} label="BUTANDING" delay={2} />
      <Constellation fish={FISH.tambakol} x={70} y={590} scale={1} label="TAMBAKOL" delay={7} />
      <Constellation fish={FISH.bangus} x={470} y={690} scale={0.55} delay={3} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Seascape (light mode)                                              */
/* ------------------------------------------------------------------ */

// Repeating sine-like wave that is wider than the screen so it can slide by one period
const wavePath = (y, amp, period, width = 1200, bottom = 820) => {
  const half = period / 2;
  const count = Math.ceil((width + period * 2) / half);
  let d = `M0 ${y} Q ${period / 4} ${y - amp} ${half} ${y}`;
  for (let i = 2; i <= count; i++) d += ` T ${i * half} ${y}`;
  return `${d} L ${count * half} ${bottom} L 0 ${bottom} Z`;
};

function Wave({ y, amp, p, dur, fill, rev = false, opacity = 1 }) {
  return (
    <path
      className={`lk-wave${rev ? ' lk-rev' : ''}`}
      d={wavePath(y, amp, p)}
      fill={fill}
      opacity={opacity}
      style={{ '--wave-shift': `-${p}px`, animationDuration: `${dur}s` }}
    />
  );
}

function Palm({ x, y, s = 1, flip = false, delay = 0 }) {
  const leaves = [-160, -125, -90, -55, -20, 20, 160];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 Q 10 -60 -4 -120" stroke="#7a5230" strokeWidth="7" strokeLinecap="round" fill="none" />
      <g transform="translate(-4 -120)">
        <g className="lk-sway" style={{ animationDelay: `${-delay}s` }}>
          {leaves.map((a, i) => (
            <path
              key={a}
              d="M0 0 Q 32 -30 78 -10 Q 38 -12 0 0 Z"
              fill={i % 2 ? '#2E9E6B' : '#3DB57C'}
              transform={`rotate(${a})`}
            />
          ))}
          <circle cx="-4" cy="6" r="5" fill="#5b3a1a" />
          <circle cx="5" cy="8" r="5" fill="#5b3a1a" />
        </g>
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-38" width="6" height="38" fill="#7a5230" />
      <circle cx="0" cy="-54" r="22" fill="#2E9E6B" />
      <circle cx="-15" cy="-42" r="16" fill="#278A5C" />
      <circle cx="15" cy="-42" r="16" fill="#3DB57C" />
    </g>
  );
}

// Philippine outrigger sailboat (paraw), origin = centre of the waterline
function Paraw({ scale = 1, flip = false, sail = '#CE1126', sail2 = '#FCD116', flag = '#0038A8' }) {
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale})`}>
      {/* outrigger poles + float */}
      <path d="M-26 -4 L-30 21 M26 -4 L30 21" stroke="#6B4423" strokeWidth="3" />
      <path d="M-64 22 Q0 36 64 22 Q0 25 -64 22 Z" fill="#8B5A2B" />
      {/* hull */}
      <path d="M-58 -2 Q-30 16 0 16 Q30 16 58 -2 L52 -8 L-52 -8 Z" fill="#B5651D" />
      <path d="M-54 -4 L54 -4" stroke="#FCD116" strokeWidth="2" />
      {/* mast + sails */}
      <line x1="0" y1="-8" x2="0" y2="-98" stroke="#5b3a1a" strokeWidth="3" />
      <path d="M-3 -92 L-3 -12 L-44 -12 Z" fill={sail2} />
      <path d="M3 -96 L3 -12 L56 -12 Z" fill={sail} />
      <path d="M0 -98 L11 -94 L0 -90 Z" fill={flag} />
    </g>
  );
}

function LightScene() {
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="lk-sun">
          <stop offset="0%" stopColor="#FFE29A" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFC145" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFC145" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lk-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8EE3DD" />
          <stop offset="100%" stopColor="#1C8AA0" />
        </linearGradient>
        <linearGradient id="lk-mayon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CC4B8" />
          <stop offset="100%" stopColor="#3D9A8B" />
        </linearGradient>
      </defs>

      {/* low sun */}
      <circle className="lk-sun-halo" cx="1010" cy="330" r="150" fill="url(#lk-sun)" />
      <circle cx="1010" cy="330" r="46" fill="#FFD36B" />

      {/* mountains: far ridge, side ranges, Mayon-style cone */}
      <path d="M250 600 L380 450 L500 520 L640 420 L760 600 Z" fill="#9ED8D0" opacity="0.6" />
      <path d="M0 600 L0 430 L120 350 L230 440 L340 380 L420 600 Z" fill="#7CC4B8" opacity="0.85" />
      <path d="M1040 600 L1100 470 L1160 420 L1200 450 L1200 600 Z" fill="#7CC4B8" opacity="0.85" />
      <path
        d="M390 600 C 560 520, 714 380, 766 252 L 794 252 C 846 380, 1000 520, 1170 600 Z"
        fill="url(#lk-mayon)"
      />

      {/* shorelines */}
      <path d="M0 570 Q 120 556 260 574 Q 300 582 330 592 L0 600 Z" fill="#F3D9A4" />
      <path d="M1200 572 Q 1090 556 960 576 Q 925 584 900 592 L1200 600 Z" fill="#F3D9A4" />

      {/* trees */}
      <Palm x={70} y={575} s={1.2} delay={0} />
      <Palm x={150} y={580} s={0.9} flip delay={2} />
      <Palm x={230} y={584} s={0.7} delay={4} />
      <Tree x={290} y={586} s={0.8} />
      <Palm x={1130} y={576} s={1.2} flip delay={1} />
      <Palm x={1050} y={580} s={0.85} delay={3} />
      <Palm x={975} y={586} s={0.6} flip delay={5} />
      <Tree x={930} y={588} s={0.8} />

      {/* sea */}
      <rect x="0" y="590" width="1200" height="210" fill="url(#lk-sea)" />
      <Wave y={598} amp={7} p={240} dur={20} fill="#6FD6D0" opacity={0.9} />

      {/* distant boat + main boat */}
      <g transform="translate(0 606)">
        <g className="lk-sail" style={{ animationDuration: '130s', animationDelay: '-80s' }}>
          <g className="lk-bob" style={{ animationDelay: '-2s' }}>
            <Paraw scale={0.45} sail="#0038A8" sail2="#FFFFFF" flag="#CE1126" />
          </g>
        </g>
      </g>
      <g transform="translate(0 612)">
        <g className="lk-sail" style={{ animationDuration: '90s', animationDelay: '-25s' }}>
          <g className="lk-bob">
            <Paraw scale={1} />
          </g>
        </g>
      </g>

      <Wave y={640} amp={10} p={300} dur={16} fill="#2FB3BD" opacity={0.9} rev />

      {/* sailing the other way, in front */}
      <g transform="translate(0 656)">
        <g className="lk-sail" style={{ animationDuration: '75s', animationDelay: '-10s', animationDirection: 'reverse' }}>
          <g className="lk-bob" style={{ animationDelay: '-1.5s' }}>
            <Paraw scale={0.75} flip sail="#FCD116" sail2="#CE1126" flag="#0038A8" />
          </g>
        </g>
      </g>

      <Wave y={690} amp={12} p={360} dur={12} fill="#1C95AA" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const CSS = `
.lk-layer{position:absolute;inset:0;transition:opacity .8s ease}
.lk-layer svg{display:block;width:100%;height:100%}
.lk-off{opacity:0}
.lk-off *{animation-play-state:paused !important}

@keyframes lk-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
.lk-star{animation:lk-twinkle 4s ease-in-out infinite}

@keyframes lk-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-10px)}}
.lk-drift{animation:lk-drift 16s ease-in-out infinite}

@keyframes lk-wave{to{transform:translateX(var(--wave-shift))}}
.lk-wave{animation:lk-wave 14s linear infinite}
.lk-rev{animation-direction:reverse}

@keyframes lk-sail{from{transform:translateX(-260px)}to{transform:translateX(1460px)}}
.lk-sail{animation:lk-sail 70s linear infinite}

@keyframes lk-bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
.lk-bob{animation:lk-bob 4s ease-in-out infinite}

@keyframes lk-sway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
.lk-sway{animation:lk-sway 6s ease-in-out infinite}

@keyframes lk-pulse{0%,100%{opacity:.55}50%{opacity:.85}}
.lk-sun-halo{animation:lk-pulse 6s ease-in-out infinite}

@media (prefers-reduced-motion: reduce){.lk-layer *{animation:none !important}}
`;

function ThemeBackdrop({ isDarkMode }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      <style>{CSS}</style>
      <div className={`lk-layer${isDarkMode ? '' : ' lk-off'}`}>
        <DarkSky />
      </div>
      <div className={`lk-layer${isDarkMode ? ' lk-off' : ''}`}>
        <LightScene />
      </div>
    </div>
  );
}

const MemoBackdrop = memo(ThemeBackdrop);

// 💾 Saved in the browser so they survive a refresh
const FAV_KEY = 'lakbay-ph-favorites';
const THEME_KEY = 'lakbay-ph-theme';
const RECENT_KEY = 'lakbay-ph-recent';
const MAX_RECENT = 5;

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / full): it just won't persist */
  }
};

// 🌴 Philippine tourist palette: lagoon turquoise, deep sea navy, sunset orange, sand
const palettes = {
  dark: {
    '--page-bg': 'radial-gradient(ellipse at top, #0f4c5c 0%, #04161f 75%)',
    '--panel-bg': '#0a2a3a',
    '--card-bg': '#08202e',
    '--accent': '#2DD4CF',
    '--accent-strong': '#7CF0EB',
    '--accent-soft': 'rgba(45, 212, 207, 0.15)',
    '--border': 'rgba(45, 212, 207, 0.45)',
    '--border-strong': '#2DD4CF',
    '--glow': 'rgba(45, 212, 207, 0.55)',
    '--text': '#F3FBFA',
    '--text-muted': '#9FD8D6',
    '--title-gradient': 'linear-gradient(135deg, #FFE29A 0%, #FFC145 40%, #FF7A45 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.5)',
    '--panel-shadow': '0 0 35px rgba(45, 212, 207, 0.3), inset 0 0 15px rgba(45, 212, 207, 0.08)',
  },
  light: {
    '--page-bg': 'radial-gradient(ellipse at top, #CFF3EF 0%, #FFF8EC 75%)',
    '--panel-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--accent': '#0E9AA7',
    '--accent-strong': '#0B6F7A',
    '--accent-soft': 'rgba(14, 154, 167, 0.15)',
    '--border': 'rgba(14, 154, 167, 0.4)',
    '--border-strong': '#0E9AA7',
    '--glow': 'rgba(14, 154, 167, 0.35)',
    '--text': '#0B3C49',
    '--text-muted': '#3F7F88',
    '--title-gradient': 'linear-gradient(135deg, #0038A8 0%, #0E9AA7 60%, #2E9E6B 100%)',
    '--cta': 'linear-gradient(135deg, #FFD36B 0%, #FF9A4D 50%, #F0503C 100%)',
    '--cta-hover': 'linear-gradient(135deg, #FFE29A 0%, #FFB066 50%, #FF6A55 100%)',
    '--cta-text': '#2b0f00',
    '--cta-glow': 'rgba(255, 122, 69, 0.45)',
    '--panel-shadow': '0 8px 30px rgba(14, 154, 167, 0.2)',
  },
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => readStored(THEME_KEY, true) !== false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = readStored(FAV_KEY, []);
    return Array.isArray(saved) ? saved : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  // Recent searches + "Load more" tracking
  const [recent, setRecent] = useState(() => {
    const saved = readStored(RECENT_KEY, []);
    return Array.isArray(saved) ? saved.slice(0, MAX_RECENT) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestRef = useRef(0); // lets us ignore answers from outdated searches

  useEffect(() => writeStored(FAV_KEY, favorites), [favorites]);
  useEffect(() => writeStored(THEME_KEY, isDarkMode), [isDarkMode]);
  useEffect(() => writeStored(RECENT_KEY, recent), [recent]);

  const toggleFavorite = (photo) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === photo.id)
        ? prev.filter((f) => f.id !== photo.id)
        : [photo, ...prev]
    );
  };

  const mode = isDarkMode ? 'dark' : 'light';
  const colors = palettes[mode];

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: isDarkMode ? '#2DD4CF' : '#0E9AA7' },
          secondary: { main: '#FF7A45' },
          background: {
            default: isDarkMode ? '#04161f' : '#FFF8EC',
            paper: isDarkMode ? '#0a2a3a' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#F3FBFA' : '#0B3C49',
            secondary: isDarkMode ? '#9FD8D6' : '#3F7F88',
          },
        },
      }),
    [isDarkMode]
  );

  const handleSearchSubmit = async (locationName) => {
    const requestId = ++requestRef.current;
    setShowFavorites(false); // a new search always goes back to results
    setLoading(true);
    setSearchTerm(locationName);
    setPage(1);
    setHasMore(false);
    setRecent((prev) =>
      [locationName, ...prev.filter((n) => n !== locationName)].slice(0, MAX_RECENT)
    );

    try {
      const results = (await searchPhotosByLocation(locationName, 1)) || [];
      if (requestId !== requestRef.current) return; // a newer search took over
      setPhotos(results);
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching photos by location:', error);
      if (requestId === requestRef.current) setPhotos([]);
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !searchTerm) return;
    const requestId = requestRef.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const results = (await searchPhotosByLocation(searchTerm, nextPage)) || [];
      if (requestId !== requestRef.current) return; // user searched something else meanwhile
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...results.filter((p) => !seen.has(p.id))];
      });
      setPage(nextPage);
      setHasMore(results.length >= PHOTOS_PER_PAGE);
    } finally {
      setLoadingMore(false);
    }
  };

  const removeRecent = (name) => setRecent((prev) => prev.filter((n) => n !== name));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Makes the color variables available everywhere, including dropdown menus */}
      <GlobalStyles styles={{ ':root': colors }} />

      <Box sx={{ minHeight: '100vh', background: 'var(--page-bg)', py: 5 }}>
        {/* Fish constellations (dark) / waves, mountains, trees and boats (light) */}
        <MemoBackdrop isDarkMode={isDarkMode} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={10}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3, md: 5 },
              pt: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              mb: 4,
              background: 'var(--panel-bg)',
              border: '2px solid var(--border-strong)',
              boxShadow: 'var(--panel-shadow)',
            }}
          >
            {/* 🇵🇭 Flag stripe: blue, red, gold */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                background:
                  'linear-gradient(90deg, #0038A8 0%, #0038A8 33.3%, #CE1126 33.3%, #CE1126 66.6%, #FCD116 66.6%, #FCD116 100%)',
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle light/dark mode"
                sx={{
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 10px var(--glow)',
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>

            <Typography
              variant="h3"
              component="h1"
              fontWeight="900"
              gutterBottom
              sx={{
                background: 'var(--title-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 2.5,
                filter: 'drop-shadow(0 0 12px var(--glow))',
              }}
            >
              🌴 LAKBAY PH
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--text-muted)', mb: 4, fontWeight: 500, letterSpacing: 0.5 }}
            >
              🏝️ Explore tourist spots across regions, cities, and municipalities in the Philippines 🏝️
            </Typography>

            <LocationForm onSearch={handleSearchSubmit} />

            {/* Quick re-search: click a chip to search again, x to forget it */}
            {recent.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                  🕘 Recent:
                </Typography>
                {recent.map((name) => (
                  <Chip
                    key={name}
                    size="small"
                    label={name.split(',')[0]}
                    title={name}
                    onClick={() => handleSearchSubmit(name)}
                    onDelete={() => removeRecent(name)}
                    sx={{
                      color: 'var(--text)',
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      '&:hover': { background: 'var(--glow)' },
                      '& .MuiChip-deleteIcon': { color: 'var(--text-muted)' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Switch between search results and saved favorites */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              onClick={() => setShowFavorites((v) => !v)}
              startIcon={showFavorites ? <Favorite /> : <FavoriteBorder />}
              variant={showFavorites ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                color: showFavorites ? 'var(--cta-text)' : 'var(--accent-strong)',
                borderColor: 'var(--border-strong)',
                background: showFavorites ? 'var(--cta)' : 'var(--panel-bg)',
                '&:hover': {
                  background: showFavorites ? 'var(--cta-hover)' : 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                },
              }}
            >
              {showFavorites ? 'Back to search results' : `My Favorites (${favorites.length})`}
            </Button>
          </Box>

          <MediaGallery
            photos={showFavorites ? favorites : photos}
            loading={showFavorites ? false : loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            emptyMessage={
              showFavorites
                ? 'No favorites yet. Tap the heart on a photo to save it here.'
                : 'No tourist spots found for this area yet.'
            }
          />

          {/* Fetch the next page of results for the same search */}
          {!showFavorites && !loading && hasMore && photos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                sx={{
                  textTransform: 'none',
                  px: 5,
                  py: 1,
                  fontWeight: 900,
                  fontSize: '1rem',
                  borderRadius: 2,
                  background: 'var(--cta)',
                  color: 'var(--cta-text)',
                  boxShadow: '0 0 20px var(--cta-glow)',
                  '&:hover': { background: 'var(--cta-hover)' },
                  '&.Mui-disabled': { background: 'var(--accent-soft)', color: 'var(--text-muted)' },
                }}
              >
                {loadingMore ? 'Loading…' : 'Load more photos'}
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}