import React, { memo } from 'react';

/* ------------------------------------------------------------------ */
/*  Palettes: same scene, day (light mode) and night (dark mode)       */
/* ------------------------------------------------------------------ */
const PALETTES = {
  light: {
    id: 'day',
    seaTop: '#8EE3DD',
    seaBottom: '#1C8AA0',
    mayonTop: '#7CC4B8',
    mayonBottom: '#3D9A8B',
    farMountain: '#9ED8D0',
    farMountainOpacity: 0.6,
    nearMountain: '#7CC4B8',
    nearMountainOpacity: 0.85,
    sand: '#F3D9A4',
    trunk: '#7a5230',
    leafA: '#3DB57C',
    leafB: '#2E9E6B',
    coconut: '#5b3a1a',
    treeTrunk: '#7a5230',
    treeA: '#2E9E6B',
    treeB: '#278A5C',
    treeC: '#3DB57C',
    wave1: '#6FD6D0',
    wave2: '#2FB3BD',
    wave3: '#1C95AA',
    sunCore: '#FFD36B',
    haloInner: '#FFE29A',
    haloMid: '#FFC145',
  },
  dark: {
    id: 'night',
    seaTop: '#0f5666',
    seaBottom: '#04161f',
    mayonTop: '#1d5a63',
    mayonBottom: '#0a2f3a',
    farMountain: '#14444f',
    farMountainOpacity: 0.7,
    nearMountain: '#0f3a46',
    nearMountainOpacity: 0.9,
    sand: '#4a4a3c',
    trunk: '#3b2a1a',
    leafA: '#14705a',
    leafB: '#0f5a49',
    coconut: '#2a1b0e',
    treeTrunk: '#3b2a1a',
    treeA: '#0f5a49',
    treeB: '#0c4a3c',
    treeC: '#14705a',
    wave1: '#14707c',
    wave2: '#0f5a6b',
    wave3: '#0c4658',
    sunCore: '#EAFBF9', // the moon
    haloInner: '#BFF7F3',
    haloMid: '#2DD4CF',
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
    y: rand() * 540,
    r: 0.5 + rand() * 1.1,
    d: rand() * 4,
  }));
})();

/* ------------------------------------------------------------------ */
/*  Shared scene pieces                                                */
/* ------------------------------------------------------------------ */
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

function Palm({ x, y, s = 1, flip = false, delay = 0, P }) {
  const leaves = [-160, -125, -90, -55, -20, 20, 160];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 Q 10 -60 -4 -120" stroke={P.trunk} strokeWidth="7" strokeLinecap="round" fill="none" />
      <g transform="translate(-4 -120)">
        <g className="lk-sway" style={{ animationDelay: `${-delay}s` }}>
          {leaves.map((a, i) => (
            <path
              key={a}
              d="M0 0 Q 32 -30 78 -10 Q 38 -12 0 0 Z"
              fill={i % 2 ? P.leafB : P.leafA}
              transform={`rotate(${a})`}
            />
          ))}
          <circle cx="-4" cy="6" r="5" fill={P.coconut} />
          <circle cx="5" cy="8" r="5" fill={P.coconut} />
        </g>
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1, P }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-38" width="6" height="38" fill={P.treeTrunk} />
      <circle cx="0" cy="-54" r="22" fill={P.treeA} />
      <circle cx="-15" cy="-42" r="16" fill={P.treeB} />
      <circle cx="15" cy="-42" r="16" fill={P.treeC} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Boats (light mode only)                                            */
/* ------------------------------------------------------------------ */
// Philippine outrigger sailboat (paraw)
function Paraw({ scale = 1, flip = false, sail = '#CE1126', sail2 = '#FCD116', flag = '#0038A8' }) {
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale})`}>
      <path d="M-26 -4 L-30 21 M26 -4 L30 21" stroke="#6B4423" strokeWidth="3" />
      <path d="M-64 22 Q0 36 64 22 Q0 25 -64 22 Z" fill="#8B5A2B" />
      <path d="M-58 -2 Q-30 16 0 16 Q30 16 58 -2 L52 -8 L-52 -8 Z" fill="#B5651D" />
      <path d="M-54 -4 L54 -4" stroke="#FCD116" strokeWidth="2" />
      <line x1="0" y1="-8" x2="0" y2="-98" stroke="#5b3a1a" strokeWidth="3" />
      <path d="M-3 -92 L-3 -12 L-44 -12 Z" fill={sail2} />
      <path d="M3 -96 L3 -12 L56 -12 Z" fill={sail} />
      <path d="M0 -98 L11 -94 L0 -90 Z" fill={flag} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Fish (dark mode only): flat, facing right, tail wags               */
/* ------------------------------------------------------------------ */
const FISH_STYLES = {
  bangus: { body: '#C9E4E8', belly: '#EAF7F8', fin: '#8FB9C2', spots: false, girth: 1 },
  tambakol: { body: '#2F7FA8', belly: '#CFE9F2', fin: '#FFC145', spots: false, girth: 1.1 },
  butanding: { body: '#3D6F8F', belly: '#BFD7E3', fin: '#2F5873', spots: true, girth: 1.15 },
};

function Fish({ kind = 'bangus', scale = 1, flip = false }) {
  const f = FISH_STYLES[kind];
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale * f.girth})`}>
      <g className="lk-tail">
        <path d="M-30 0 L-54 -14 Q-45 0 -54 14 Z" fill={f.fin} />
      </g>
      <path d="M-6 -12 L5 -23 L16 -9 Z" fill={f.fin} />
      <path d="M-34 0 Q-10 -17 18 -9 Q34 -3 40 0 Q34 4 18 9 Q-10 17 -34 0 Z" fill={f.body} />
      <path d="M-30 2 Q-8 14 18 8 Q30 4 38 1 Q8 9 -30 2 Z" fill={f.belly} />
      {f.spots &&
        [[-18, -3], [-6, -6], [6, -5], [-12, 3], [0, 2], [12, 0]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.6" fill="#EAFBF9" opacity="0.85" />
        ))}
      <circle cx="27" cy="-2" r="2" fill="#04161f" />
    </g>
  );
}

function Swimmer({ y, dur, delay, reverse = false, bobDelay = 0, children }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g
        className="lk-sail"
        style={{
          animationDuration: `${dur}s`,
          animationDelay: `${-delay}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <g className="lk-bob" style={{ animationDelay: `${-bobDelay}s` }}>
          {children}
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Seascape (same scene for both modes)                               */
/* ------------------------------------------------------------------ */
function Seascape({ dark = false }) {
  const P = dark ? PALETTES.dark : PALETTES.light;
  const id = P.id;

  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id={`lk-sun-${id}`}>
          <stop offset="0%" stopColor={P.haloInner} stopOpacity="0.95" />
          <stop offset="55%" stopColor={P.haloMid} stopOpacity={dark ? 0.25 : 0.35} />
          <stop offset="100%" stopColor={P.haloMid} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`lk-sea-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.seaTop} />
          <stop offset="100%" stopColor={P.seaBottom} />
        </linearGradient>
        <linearGradient id={`lk-mayon-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.mayonTop} />
          <stop offset="100%" stopColor={P.mayonBottom} />
        </linearGradient>
      </defs>

      {/* Night sky stars */}
      {dark &&
        STARS.map((s, i) => (
          <circle
            key={i} className="lk-star" cx={s.x} cy={s.y} r={s.r} fill="#E6FFFD"
            style={{ animationDelay: `${-s.d}s` }}
          />
        ))}

      {/* Sun (day) / moon (night) */}
      <circle className="lk-sun-halo" cx="1010" cy="330" r="150" fill={`url(#lk-sun-${id})`} />
      <circle cx="1010" cy="330" r="46" fill={P.sunCore} />

      {/* Mayon volcano and mountains */}
      <path d="M250 600 L380 450 L500 520 L640 420 L760 600 Z" fill={P.farMountain} opacity={P.farMountainOpacity} />
      <path
        d="M0 600 L0 430 L120 350 L230 440 L340 380 L420 600 Z"
        fill={P.nearMountain} opacity={P.nearMountainOpacity}
      />
      <path
        d="M1040 600 L1100 470 L1160 420 L1200 450 L1200 600 Z"
        fill={P.nearMountain} opacity={P.nearMountainOpacity}
      />
      <path
        d="M390 600 C 560 520, 714 380, 766 252 L 794 252 C 846 380, 1000 520, 1170 600 Z"
        fill={`url(#lk-mayon-${id})`}
      />

      <path d="M0 570 Q 120 556 260 574 Q 300 582 330 592 L0 600 Z" fill={P.sand} />
      <path d="M1200 572 Q 1090 556 960 576 Q 925 584 900 592 L1200 600 Z" fill={P.sand} />

      {/* Palms */}
      <Palm P={P} x={70} y={575} s={1.2} delay={0} />
      <Palm P={P} x={150} y={580} s={0.9} flip delay={2} />
      <Palm P={P} x={230} y={584} s={0.7} delay={4} />
      <Tree P={P} x={290} y={586} s={0.8} />
      <Palm P={P} x={1130} y={576} s={1.2} flip delay={1} />
      <Palm P={P} x={1050} y={580} s={0.85} delay={3} />
      <Palm P={P} x={975} y={586} s={0.6} flip delay={5} />
      <Tree P={P} x={930} y={588} s={0.8} />

      <rect x="0" y="590" width="1200" height="210" fill={`url(#lk-sea-${id})`} />
      <Wave y={598} amp={7} p={240} dur={20} fill={P.wave1} opacity={0.9} />

      {dark ? (
        <>
          {/* Fish swimming just under the surface */}
          <Swimmer y={620} dur={80} delay={30} bobDelay={1}>
            <Fish kind="bangus" scale={0.6} />
          </Swimmer>
        </>
      ) : (
        <>
          {/* Paraw boats */}
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
        </>
      )}

      <Wave y={640} amp={10} p={300} dur={16} fill={P.wave2} opacity={0.9} rev />

      {dark ? (
        <Swimmer y={666} dur={65} delay={20} reverse bobDelay={2}>
          <Fish kind="tambakol" scale={0.9} flip />
        </Swimmer>
      ) : (
        <g transform="translate(0 656)">
          <g className="lk-sail" style={{ animationDuration: '75s', animationDelay: '-10s', animationDirection: 'reverse' }}>
            <g className="lk-bob" style={{ animationDelay: '-1.5s' }}>
              <Paraw scale={0.75} flip sail="#FCD116" sail2="#CE1126" flag="#0038A8" />
            </g>
          </g>
        </g>
      )}

      <Wave y={690} amp={12} p={360} dur={12} fill={P.wave3} />

      {dark && (
        <>
          {/* Deeper water */}
          <Swimmer y={722} dur={120} delay={50} bobDelay={0.5}>
            <Fish kind="butanding" scale={2.2} />
          </Swimmer>
          <Swimmer y={748} dur={55} delay={40} bobDelay={3}>
            <Fish kind="tambakol" scale={0.55} />
          </Swimmer>
          <Swimmer y={774} dur={85} delay={10} reverse bobDelay={1.5}>
            <Fish kind="bangus" scale={0.8} flip />
          </Swimmer>
        </>
      )}
    </svg>
  );
}

const CSS = `
.lk-layer{position:absolute;inset:0;transition:opacity .8s ease}
.lk-layer svg{display:block;width:100%;height:100%}
.lk-off{opacity:0}
.lk-off *{animation-play-state:paused !important}

@keyframes lk-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
.lk-star{animation:lk-twinkle 4s ease-in-out infinite}

@keyframes lk-wave{to{transform:translateX(var(--wave-shift))}}
.lk-wave{animation:lk-wave 14s linear infinite}
.lk-rev{animation-direction:reverse}

@keyframes lk-sail{from{transform:translateX(-260px)}to{transform:translateX(1460px)}}
.lk-sail{animation:lk-sail 70s linear infinite}

@keyframes lk-bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
.lk-bob{animation:lk-bob 4s ease-in-out infinite}

@keyframes lk-wag{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}
.lk-tail{transform-box:fill-box;transform-origin:100% 50%;animation:lk-wag .7s ease-in-out infinite}

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
        <Seascape dark />
      </div>
      <div className={`lk-layer${isDarkMode ? ' lk-off' : ''}`}>
        <Seascape />
      </div>
    </div>
  );
}

export default memo(ThemeBackdrop);