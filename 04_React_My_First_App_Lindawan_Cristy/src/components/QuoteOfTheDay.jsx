import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Stack, Chip, Box, Select, MenuItem, IconButton, LinearProgress, Slider } from '@mui/material';
import { FastForward, FastRewind, Pause, PlayArrow } from '@mui/icons-material';
import { getRandomQuote, getTags, topicIcons } from '../services/quoteService';

// EXTRA: your collage photo. Save it as public/images/bg1.jpg
const pageBg = 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.8)), url(/images/bg1.jpg) center / cover no-repeat #1a0505';
const coverBg = 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.75)), url(/images/bg1.jpg) center / cover #1a0505';

// EXTRA: seconds before the next quote plays by itself
const DURATION = 12;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// EXTRA: roll-in animation for each new quote
const rollIn = {
  '@keyframes rollIn': {
    from: { opacity: 0, transform: 'perspective(700px) rotateX(-90deg) translateY(24px)' },
    to: { opacity: 1, transform: 'perspective(700px) rotateX(0deg)' },
  },
  animation: 'rollIn 0.45s ease-out',
};

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]: Define local state variables for:
  // - 'quote': Stores the current quote object (default: empty object)
  // - 'tags': Stores an array of all available category tags (default: empty array)
  // - 'selectedTag': Tracks the string name of the active filter tag (default: null)
  // [Your code here]
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // TODO 2 [Reference Hook]: Create a React mutable reference named 'selectTagRef' to capture the Select element value
  // [Your code here]
  const selectTagRef = useRef();

  // EXTRA: card reference, swipe tracking, music-player state
  const cardRef = useRef();
  const touchX = useRef(null);
  const history = useRef([]);
  const index = useRef(-1);
  const didInit = useRef(false); // FIX: stops the double load in React StrictMode
  const [pos, setPos] = useState(0);
  const [total, setTotal] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [textScale, setTextScale] = useState(1);

  // EXTRA: music notes floating over the quote card
  const burst = () => {
    const box = cardRef.current?.getBoundingClientRect();
    if (!box) return;
    const notes = ['🎵', '🎶', '🎼', '🎶'];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('span');
      el.textContent = notes[i % 4];
      el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
        left:${box.left + 10 + Math.random() * (box.width - 40)}px;top:${box.top + 40 + Math.random() * (box.height - 70)}px;
        font-size:${20 + Math.random() * 18}px;transition:all 1.1s ease-out;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translateY(${-60 - Math.random() * 80}px) scale(1.4)`;
        el.style.opacity = 0;
      });
      setTimeout(() => el.remove(), 1200);
    }
  };

  const loadRandomQuote = async (tagOverride) => { // EXTRA: tagOverride lets the select load a quote right away
    // TODO 3 [Async Request Handler]: 
    // a. Retrieve the current value from 'selectTagRef' (fallback to empty string if undefined)
    // b. Call 'getRandomQuote(tag)' asynchronously with that tag value
    // c. Update both your 'quote' state and 'selectedTag' state with the returned values
    // [Your code here]
    try {
      const tag = (typeof tagOverride === 'string' ? tagOverride : selectTagRef.current?.value) || '';
      const data = await getRandomQuote(tag);
      setQuote(data);
      setSelectedTag(tag || null);
      // EXTRA: remember quotes so the Previous button can go back
      history.current = [...history.current.slice(0, index.current + 1), data];
      index.current = history.current.length - 1;
      setPos(index.current);
      setTotal(history.current.length);
      setElapsed(0);
    } catch (error) {
      console.error('Failed to load quote:', error);
    }
  };

  // EXTRA: Previous button goes back to the last quote you saw
  const loadPrevious = () => {
    if (index.current <= 0) return;
    index.current -= 1;
    setQuote(history.current[index.current]);
    setPos(index.current);
    setElapsed(0);
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]: Fetch tags asynchronously using 'getTags()' and store them into your tags state array
    // [Your code here]
    try {
      const data = await getTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]: Execute both 'loadRandomQuote' and 'loadTags' when the component mounts
    // [Your code here]
    if (didInit.current) return; // FIX
    didInit.current = true; // FIX
    loadRandomQuote();
    loadTags();
  }, []);

  // EXTRA: play = the next quote loads by itself every DURATION seconds
  const loadRef = useRef(loadRandomQuote);
  loadRef.current = loadRandomQuote;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (elapsed >= DURATION) {
      setElapsed(0);
      loadRef.current();
      burst();
    }
  }, [elapsed]);

  return (
    // EXTRA: full-screen background + swipe left/right for the next quote
    <Box
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current !== null && Math.abs(e.changedTouches[0].clientX - touchX.current) > 60) {
          loadRandomQuote();
          burst();
        }
        touchX.current = null;
      }}
      sx={{
        position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: pageBg, p: 2,
      }}
    >
      <Card
        ref={cardRef}
        variant="elevation"
        elevation={5}
        sx={{
          maxWidth: 420,
          width: '100%',
          maxHeight: '100%',
          overflow: 'auto',
          borderRadius: 4,
          backdropFilter: 'blur(14px)', // EXTRA
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(18,12,12,0.78)' : 'rgba(255,255,255,0.78)'), // EXTRA
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* EXTRA: the "order" values keep the TODO comments in order (6 to 11) while the player layout on screen stays the same */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <Box key={quote.text} sx={{ ...rollIn, order: 3, mt: -1 }}>
              {/* TODO 6 [Conditional Chip List]: Map through 'quote.tags'. For each tag 't':
                  - Render an MUI <Chip /> with a unique key
                  - Apply color="success" if 'selectedTag' matches 't', otherwise color="secondary"
                  - Bind label={t} and set custom style margins sx={{ mr: 0.25 }} */}
              {/* [Your code here] */}
              {quote.tags?.map((t) => (
                <Chip
                  key={t}
                  size="small"
                  color={selectedTag === t ? 'success' : 'secondary'}
                  label={t}
                  sx={{ mr: 0.25 }}
                />
              ))}
            </Box>

            {/* EXTRA: the quote sits on a square "album cover" */}
            <Box
              sx={{
                order: 1,
                aspectRatio: '1 / 1', width: 'min(100%, 46vh)', mx: 'auto', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', p: '7%',
                background: coverBg, boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
              }}
            >
              {/* TODO 7 [Text Content Mapping]: Bind 'quote.text' directly inside the quotation marks below */}
              <Typography
                key={quote.text}
                id="quote-text"
                variant="h5"
                component="p"
                fontStyle="italic"
                textAlign="center"
                sx={{
                  ...rollIn,
                  fontWeight: '400', lineHeight: 1.35,
                  fontStyle: 'normal', fontFamily: "'Shadows Into Light', cursive",
                  fontSize: `calc(clamp(1.1rem, 4.4vw, 1.9rem) * ${textScale})`, color: '#fff', // EXTRA
                  textShadow: '0 2px 8px #000',
                }}
              >
                "{quote.text}"
              </Typography>
            </Box>

            <Box key={`author-${quote.text}`} sx={{ ...rollIn, order: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Quote of the Day · {pos + 1} / {total}
              </Typography>

              {/* TODO 8 [Author Content Mapping]: Bind 'quote.author' after the long dash separator symbol */}
              <Typography
                id="quote-author"
                variant="subtitle1"
                color="text.primary"
                sx={{ fontFamily: "'Shadows Into Light', cursive", fontSize: '1.8rem', lineHeight: 1.15 }} // EXTRA
              >
                — {quote.author}
              </Typography>
            </Box>

            {/* EXTRA: progress bar = time left before the next quote */}
            <Box sx={{ order: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{fmt(elapsed)}</Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (elapsed / DURATION) * 100)}
                sx={{ flex: 1, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { transition: 'none' } }}
              />
              <Typography variant="caption" color="text.secondary">-{fmt(Math.ceil(DURATION - elapsed))}</Typography>
            </Box>

            {/* EXTRA: music player controls. On screen the "any" select sits beside the Next icon */}
            <Box sx={{ order: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
              <IconButton sx={{ order: 1 }} onClick={loadPrevious} disabled={pos <= 0} aria-label="Previous quote">
                <FastRewind sx={{ fontSize: 40 }} />
              </IconButton>

              <IconButton sx={{ order: 2 }} onClick={() => setPlaying((p) => !p)} aria-label="Play or pause">
                {playing ? <Pause sx={{ fontSize: 56 }} /> : <PlayArrow sx={{ fontSize: 56 }} />}
              </IconButton>

              {/* EXTRA: the "any" select is a round icon button with its topic name under it, like a music player's output button */}
              <Box sx={{ order: 4, ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                {/* TODO 9 [Controlled Input Integration]: Attach your input reference 'selectTagRef' to this select component */}
                <Select
                  displayEmpty
                  size="small"
                  defaultValue=""
                  inputRef={selectTagRef}
                  IconComponent={() => null} // EXTRA: hides the dropdown arrow so it looks like an icon button
                  renderValue={(v) => (v ? (topicIcons[v] ?? '🏷️') : '✨')} // EXTRA: shows the topic icon, or ✨ when "any"
                  onChange={(e) => { loadRandomQuote(e.target.value); burst(); }} // EXTRA: picking a topic plays a quote from it
                  MenuProps={{
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    transformOrigin: { vertical: 'bottom', horizontal: 'right' },
                    PaperProps: { sx: { width: 290, maxHeight: 340, borderRadius: 3 } },
                    MenuListProps: { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.25, p: 1 } },
                  }} // EXTRA: the menu opens above as a two-column grid
                  sx={{
                    borderRadius: '50%',
                    '& fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
                    '& .MuiSelect-select': {
                      p: '0 !important', width: '44px', height: '44px', minHeight: '0 !important', boxSizing: 'border-box',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    },
                  }} // EXTRA
                >
                  <MenuItem value=""><em>✨ any</em></MenuItem>
                  {/* TODO 10 [Select Option Generation]: Map through your 'tags' state array to render a <MenuItem> element for each tag 't' */}
                  {/* [Your code here] */}
                  {tags.map((t) => (
                    <MenuItem key={t} value={t}>{topicIcons[t] ?? '🏷️'} {t}</MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedTag || 'any'}
                </Typography>
              </Box>

              {/* TODO 11 [Action Trigger Binding]: Attach an interaction listener to trigger 'loadRandomQuote' upon click events */}
              <IconButton sx={{ order: 3 }} onClick={() => { loadRandomQuote(); burst(); }} aria-label="Next quote">
                <FastForward sx={{ fontSize: 40 }} />
              </IconButton>
            </Box>

            {/* EXTRA: text size slider */}
            <Stack sx={{ order: 6 }} direction="row" spacing={1.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">A</Typography>
              <Slider size="small" min={0.8} max={1.5} step={0.05} value={textScale} onChange={(_, v) => setTextScale(v)} aria-label="Text size" />
              <Typography variant="h6" color="text.secondary">A</Typography>
            </Stack>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
