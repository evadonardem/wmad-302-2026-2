// ORIGINAL (kept): import React, { useEffect, useRef, useState } from 'react';
// CHANGED: also imports useMemo for the page slide direction.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar, Toolbar, Container, CssBaseline, GlobalStyles, ThemeProvider, createTheme, Typography, Box,
  IconButton, Button, Card, CardActionArea, CardMedia, CardContent, TextField, Link, Fab, Chip, Paper,
} from '@mui/material';
import {
  LightMode, DarkMode, Public, PhotoCamera, Verified, Brightness4, Star, Place, Send, ArrowUpward,
  Facebook, Instagram, YouTube, LinkedIn, Email, MarkEmailRead,
} from '@mui/icons-material';
// ADDED: Dialog and Tooltip for the map popup, LocationOn and Close icons.
import { Dialog, Tooltip } from '@mui/material';
import { LocationOn, Close } from '@mui/icons-material';
// ADDED: back arrow icon.
import { ArrowBack } from '@mui/icons-material';
// ADDED: heart icon and Badge for the My Favorites button in the navbar.
import { Favorite } from '@mui/icons-material';
import { Badge } from '@mui/material';
import LocationForm from './components/LocationForm';
import MediaGallery from './components/MediaGallery';
import { searchPhotosByLocation } from './services/geoPhotoService';

const TEAL = '#0AA2C0';
const NAVY = '#2B2F4A';
const serif = '"Playfair Display", Georgia, serif';

// Featured cards use your Benguet pictures (public/images/benguet/). Clicking one searches that province.
// ADDED: each card now has a 'region' text, so the card caption can change per place.
const featured = [
  { badge: 'Popular', title: 'Baguio City', text: 'Pine forests, Mines View Park and the Botanical Garden.', img: '/images/benguet/mines-view-park.jpg', search: 'Benguet', region: 'Benguet, Luzon' },
  // ORIGINAL (kept): { badge: 'Scenic', title: 'Atok', text: 'Flower farms above rolling mountain ridges.', img: '/images/benguet/atok-flower-farm.jpg', search: 'Benguet' },
  // ADDED: Visayas card (picture is public/images/bohol/pexels-snapswithluc-37819348.jpg)
  { badge: 'Scenic', title: 'Chocolate Hills', text: 'Rolling grass-covered hills, tarsiers and white-sand beaches.', img: '/images/bohol/pexels-snapswithluc-37819348.jpg', search: 'Bohol', region: 'Bohol, Visayas' },
  // ORIGINAL (kept): { badge: 'Colorful', title: 'La Trinidad', text: 'Hillside houses painted in every color.', img: '/images/benguet/colorful-hillside-houses.jpg', search: 'Benguet' },
  // ADDED: Mindanao card (picture is public/images/siargao/pexels-kat-carabio-2160013554-38265496.jpg)
  { badge: 'Adventure', title: 'Siargao', text: 'Surf breaks, island hopping and the famous Cloud 9 boardwalk.', img: '/images/siargao/pexels-kat-carabio-2160013554-38265496.jpg', search: 'Surigao del Norte', region: 'Surigao del Norte, Mindanao' },
];

const reasons = [
  { icon: <Public />, title: 'Every Region & Province', text: 'Pick from all 18 regions and their provinces across the Philippines.' },
  { icon: <PhotoCamera />, title: 'Real Photos', text: 'Tourist spot photos are fetched live from Pexels for each search.' },
  { icon: <Verified />, title: 'Photographer Credits', text: 'Every photo links back to the person who captured it.' },
  { icon: <Brightness4 />, title: 'Light & Dark Mode', text: 'Switch the whole theme with one click in the top bar.' },
];

// Sample text only: replace with real feedback before presenting.
const stories = [
  { quote: 'Picking a region and a province was quick, and the photos made me want to pack right away.', name: 'Sample Traveler A', place: 'Luzon' },
  { quote: 'I found great ideas for our family trip, and I liked that every photographer is credited.', name: 'Sample Traveler B', place: 'Visayas' },
  { quote: 'Clean design, fast results, and it works great on my phone too.', name: 'Sample Traveler C', place: 'Mindanao' },
];

// ORIGINAL (kept): const heroBg = (alpha) => `linear-gradient(rgba(0,20,40,${alpha}), rgba(0,20,40,${alpha + 0.2})), url(/images/hero.png)`;
// CHANGED: your hero picture is a JPG, so it points to /images/hero.jpg.
const heroBg = (alpha) => `linear-gradient(rgba(0,20,40,${alpha}), rgba(0,20,40,${alpha + 0.2})), url(/images/hero.jpg)`;
// ADDED: same style as heroBg, but with the sunset photo (public/images/profile-bg.png).
const sunsetBg = (alpha) => `linear-gradient(rgba(0,20,40,${alpha}), rgba(0,20,40,${alpha + 0.2})), url(/images/profile-bg.png)`;
const glass = { bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', borderRadius: 3, color: '#fff' };
const eyebrow = { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: TEAL, textTransform: 'uppercase', textAlign: 'center' };

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // TODO 3.7 [Global Search Coordination]: Instantiate matching dynamic local state trackers here:
  // - 'photos': Tracks array results fetched from the Pexels service handler (default: empty array)
  // - 'loading': Toggles boolean state workflows during operations (default: false)
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  // Extra: stays false until the first search, so the "No tourist spots found" message doesn't show on page load.
  const [searched, setSearched] = useState(false);
  // Extra: the searched place name, used for the results heading.
  const [place, setPlace] = useState('');
  // Extra: counts searches, so a slow older search can't overwrite a newer one.
  const latestSearch = useRef(0);
  // Extra: newsletter box (demo only, nothing is sent anywhere).
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  // ADDED: the Featured Destinations card whose map is open (null = map closed).
  const [mapFor, setMapFor] = useState(null);
  // ADDED: which "page" is showing: 'home', 'results', 'destinations', 'why', 'stories' or 'contact'.
  // Only one page is visible at a time, so the site does not scroll through all sections.
  const [page, setPage] = useState('home');
  // ADDED: photos the person hearted. They are saved in the browser (localStorage), so they stay after a refresh.
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lakbay-favorites') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('lakbay-favorites', JSON.stringify(favorites));
    } catch {
      /* storage is not available, favorites just last until refresh */
    }
  }, [favorites]);
  // ADDED: heart pressed: save the photo (with the place it was found in), or remove it if it is already saved.
  const toggleFavorite = (photo) =>
    setFavorites((prev) =>
      prev.some((f) => f.id === photo.id)
        ? prev.filter((f) => f.id !== photo.id)
        : [...prev, { ...photo, savedPlace: photo.savedPlace || place }]
    );
  // ADDED: style for a page wrapper. It is hidden unless it is the current page, and it fills the screen height.
  const pageBox = (p) => ({
    display: page === p ? 'flex' : 'none',
    // ADDED: the page slides in from the right (or from the left when you press the back arrow).
    animation: page === p ? `${slideDir === 'back' ? 'pageSlideBack' : 'pageSlideIn'} 0.45s ease` : 'none',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 64px)',
    '& > section, & > footer': { flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    '& > footer': { flexGrow: 0 },
  });
  // ADDED: remembers the pages you visited, so the back icon goes to the page before.
  const pageHistory = useRef([]);
  const lastPage = useRef('home');
  const skipPush = useRef(false);
  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
    } else if (lastPage.current !== page) {
      pageHistory.current.push(lastPage.current);
    }
    lastPage.current = page;
    window.scrollTo({ top: 0 }); // ADDED: every new page starts from the top.
  }, [page]);
  // ADDED: direction of the slide. 'back' only when the page changed because of the back arrow.
  const slideDir = useMemo(() => (skipPush.current ? 'back' : 'forward'), [page]); // eslint-disable-line react-hooks/exhaustive-deps
  const goBack = () => {
    const previous = pageHistory.current.pop() ?? 'home';
    if (previous !== page) skipPush.current = true;
    setPage(previous);
    window.scrollTo({ top: 0 });
  };

  // Load the fonts here so index.html stays exactly as uploaded.
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  // Dynamic Theme Creator configuration
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: isDarkMode ? '#2BC0DD' : TEAL, contrastText: '#fff' },
      secondary: { main: '#FF6B6B', contrastText: '#fff' },
      // ORIGINAL (kept):
      // background: {
      //   default: isDarkMode ? '#0E1A26' : '#F7FAFC',
      //   paper: isDarkMode ? '#16263A' : '#FFFFFF',
      // },
      // PREVIOUS (kept): default: isDarkMode ? '#1A0509' : '#FFFFFF',  paper: isDarkMode ? '#2B0A12' : '#FFFFFF',
      // CHANGED: light mode is white, dark mode is black (page) and maroon (cards, navbar, popups).
      background: {
        default: isDarkMode ? '#0B0B0B' : '#FFFFFF',
        paper: isDarkMode ? '#4A0A12' : '#FFFFFF',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Poppins", system-ui, sans-serif',
      h2: { fontFamily: serif }, h3: { fontFamily: serif }, h4: { fontFamily: serif },
    },
  });

  const handleSearchSubmit = async (locationName) => {
    // TODO 3.8 [Operational Async Glue Engine]: 
    // a. Shift local state property configuration 'loading' to true.
    // b. Fire the async handler function 'searchPhotosByLocation(locationName)' inside an await statement.
    // c. Capture resulting photo dataset arrays inside the local state 'photos'.
    // d. Toggle the operation state status trackers 'loading' back to false inside an executive safety wrapper execution tier.
    const searchId = ++latestSearch.current;
    setSearched(true);
    setPlace(locationName);
    setLoading(true);
    setPage('results'); // ADDED: show the results page after a search.
    setTimeout(() => document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const results = await searchPhotosByLocation(locationName);
      if (searchId === latestSearch.current) setPhotos(results);
    } finally {
      if (searchId === latestSearch.current) setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Neutralizes Vite's default index.css/App.css layout rules without editing those files. */}
      <GlobalStyles styles={{
        html: { scrollBehavior: 'smooth' },
        // ORIGINAL (kept): body: { display: 'block', placeItems: 'initial', minWidth: 0 },
        // CHANGED: overflowX hidden, so the slide animation does not show a sideways scrollbar.
        body: { display: 'block', placeItems: 'initial', minWidth: 0, overflowX: 'hidden' },
        // ADDED: slide animations used when you change pages.
        '@keyframes pageSlideIn': { from: { opacity: 0, transform: 'translateX(80px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '@keyframes pageSlideBack': { from: { opacity: 0, transform: 'translateX(-80px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        '#root': { width: '100%', maxWidth: 'none', margin: 0, padding: 0, border: 0, textAlign: 'initial', display: 'block', minHeight: 0 },
        'section[id]': { scrollMarginTop: '72px' },
      }} />

      {/* ---------- Navbar ---------- */}
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', gap: 3 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, fontSize: 20, mr: 'auto' }}>
            <Public color="primary" /> Lakbay<Box component="span" sx={{ color: 'primary.main' }}>PH</Box>
          </Typography>
          {[['Home', '#home'], ['Destinations', '#destinations'], ['Why Us', '#why'], ['Stories', '#stories'], ['Contact', '#contact']].map(([label, href]) => (
            /* ORIGINAL (kept): <Link key={label} href={href} underline="none" color="text.primary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: 13, fontWeight: 600, '&:hover': { color: 'primary.main' } }}> */
            /* ADDED: clicking switches the page instead of scrolling, and the current page link is highlighted. */
            <Link key={label} href={href} onClick={(e) => { e.preventDefault(); setPage(href.slice(1)); }} underline="none" color="text.primary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: page === href.slice(1) ? 'primary.main' : 'text.primary', '&:hover': { color: 'primary.main' } }}>
              {label}
            </Link>
          ))}
          {/* ADDED: My Favorites button with the number of saved photos. */}
          <Tooltip title="My Favorites">
            <IconButton onClick={() => setPage('favorites')} color={page === 'favorites' ? 'primary' : 'inherit'} aria-label="My Favorites">
              <Badge badgeContent={favorites.length} color="secondary" max={99}>
                <Favorite />
              </Badge>
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit" aria-label="Toggle light and dark mode">
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Button href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }} variant="contained" sx={{ borderRadius: 99, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none' }}>
            Search Now
          </Button>
        </Toolbar>
      </AppBar>

      {/* ADDED: back icon. It shows on every page except Home and goes to the previous page. */}
      {page !== 'home' && (
        <Tooltip title="Back">
          <IconButton
            onClick={goBack}
            aria-label="Go back"
            sx={{ position: 'fixed', top: 80, left: 16, zIndex: 1000, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3, '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
      )}

      {/* ADDED: PAGE 'home' (the hero) */}
      <Box sx={pageBox('home')}>
      {/* ---------- Hero ---------- */}
      {/* ORIGINAL (kept): <Box component="section" id="home" sx={{ backgroundImage: heroBg(0.3), backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', py: { xs: 8, md: 12 } }}> */}
      {/* ADDED: same section, but the background uses the sunset photo through sunsetBg. */}
      <Box component="section" id="home" sx={{ backgroundImage: sunsetBg(0.4), backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, letterSpacing: 3, fontSize: 13, mb: 1 }}>🇵🇭 LAKBAY PH</Typography>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.8rem' }, fontWeight: 700, lineHeight: 1.15 }}>
            Discover Your Next <Box component="span" sx={{ color: '#FFC83D' }}>Adventure</Box>
          </Typography>
          <Typography sx={{ mt: 2, mb: 4, color: 'rgba(255,255,255,0.9)' }}>
            Explore tourist spots across regions, cities, and municipalities in the Philippines
          </Typography>

          <Paper elevation={6} sx={{ p: 2, borderRadius: 3, textAlign: 'left' }}>
            {/* Connect the location selection input modules */}
            <LocationForm onSearch={handleSearchSubmit} />
          </Paper>

          <Box sx={{ mt: 5, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
            {[['18', 'Regions'], ['85', 'Provinces'], ['12', 'Photos per search'], ['2', 'Live APIs']].map(([n, label]) => (
              <Box key={label}>
                <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700 }}>{n}</Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.85 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      </Box>
      {/* ADDED: PAGE 'results' (search results) */}
      <Box sx={pageBox('results')}>
      {/* ---------- Search results ---------- */}
      {/* Connect presentation display layout nodes passing state parameters downstream */}
      {searched && (
        /* ORIGINAL (kept): <Box component="section" id="photos" sx={{ py: 8, bgcolor: 'background.default' }}> */
        /* ADDED: same section with a soft sunset gradient (peach to orange in light mode, dusk purple to red in dark mode). */
        /* PREVIOUS (kept): <Box component="section" id="photos" sx={{ py: 8, background: isDarkMode ? 'linear-gradient(180deg, #2B1B33 0%, #4A2438 55%, #6B2D2D 100%)' : 'linear-gradient(180deg, #FFF1E0 0%, #FFD8B0 55%, #FFBE8A 100%)' }}> */
        /* CHANGED: white in light mode, black to maroon gradient in dark mode. */
        <Box component="section" id="photos" sx={{ py: 8, background: isDarkMode ? 'linear-gradient(180deg, #0B0B0B 0%, #3A0710 55%, #6B0F1A 100%)' : '#FFFFFF' }}>
          <Container maxWidth="lg">
            {/* ORIGINAL (kept): <Typography sx={eyebrow}>Search results</Typography> */}
            <Typography sx={{ ...eyebrow, color: isDarkMode ? '#FF8A80' : '#B93C0B' }}>Search results</Typography>
            <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, mt: 1 }}>Tourist spots in {place}</Typography>
            {/* ORIGINAL (kept): <MediaGallery photos={photos} loading={loading} /> */}
            {/* ADDED: also passes 'place' so the location icon can open the map. */}
            {/* CHANGED: also passes the favorites list and the heart action, so hearted photos go to My Favorites. */}
            <MediaGallery photos={photos} loading={loading} place={place} favorites={favorites} onToggleFavorite={toggleFavorite} />
          </Container>
        </Box>
      )}

      </Box>
      {/* ADDED: PAGE 'favorites' (photos you hearted) */}
      <Box sx={pageBox('favorites')}>
        <Box component="section" id="favorites" sx={{ py: 8, background: isDarkMode ? 'linear-gradient(180deg, #0B0B0B 0%, #3A0710 55%, #6B0F1A 100%)' : '#FFFFFF' }}>
          <Container maxWidth="lg">
            <Typography sx={{ ...eyebrow, color: isDarkMode ? '#FF8A80' : '#B93C0B' }}>Saved photos</Typography>
            <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, mt: 1 }}>My Favorites ({favorites.length})</Typography>
            <MediaGallery
              photos={favorites}
              loading={false}
              place={place}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              emptyText="No favorites yet. Tap the heart on a photo to save it here."
            />
          </Container>
        </Box>
      </Box>
      {/* ADDED: PAGE 'destinations' */}
      <Box sx={pageBox('destinations')}>
      {/* ---------- Featured destinations ---------- */}
      {/* ORIGINAL (kept): <Box component="section" id="destinations" sx={{ py: 9, bgcolor: 'background.paper' }}> */}
      {/* ADDED: same section with the sunset photo (public/images/hero.png) as the background, and white heading text. */}
      <Box component="section" id="destinations" sx={{ backgroundImage: heroBg(0.45), backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', py: 9 }}>
        <Container maxWidth="lg">
          {/* ORIGINAL (kept): <Typography sx={eyebrow}>Explore the Philippines</Typography> */}
          <Typography sx={{ ...eyebrow, color: '#fff' }}>Explore the Philippines</Typography>
          {/* ORIGINAL (kept): <Typography variant="h3" component="h2" align="center" sx={{ mt: 1, fontSize: { xs: '2rem', md: '2.6rem' } }}>Featured Destinations</Typography> */}
          <Typography variant="h3" component="h2" align="center" sx={{ mt: 1, fontSize: { xs: '2rem', md: '2.6rem' }, color: '#fff' }}>Featured Destinations</Typography>
          {/* ORIGINAL (kept): <Typography align="center" color="text.secondary" sx={{ mb: 5 }}>Tap a card to see its photos</Typography> */}
          <Typography align="center" sx={{ mb: 5, color: 'rgba(255,255,255,0.9)' }}>Tap a card to see its photos</Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {featured.map((f) => (
              /* ORIGINAL (kept): <Card key={f.title} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}> */
              /* ADDED: same card with position: 'relative', so the location icon can sit on top of the picture. */
              <Card key={f.title} elevation={3} sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleSearchSubmit(f.search)}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" image={f.img} alt={f.title} sx={{ height: 220, objectFit: 'cover' }} />
                    <Chip label={f.badge} size="small" color="secondary" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }} />
                  </Box>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {/* ORIGINAL (kept): <Place sx={{ fontSize: 14 }} /> Benguet, Luzon */}
                      <Place sx={{ fontSize: 14 }} /> {f.region}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>{f.text}</Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, borderTop: 1, borderColor: 'divider', pt: 1.5 }}>View photos →</Typography>
                  </CardContent>
                </CardActionArea>
                {/* ADDED: location icon on the top right of the picture. It opens the map of this place. */}
                <Tooltip title="View on map">
                  <IconButton
                    onClick={() => setMapFor(f)}
                    aria-label={`View ${f.title} on map`}
                    sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.45)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                  >
                    <LocationOn />
                  </IconButton>
                </Tooltip>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      </Box>
      {/* ADDED: PAGE 'why' */}
      <Box sx={pageBox('why')}>
      {/* ---------- Why us ---------- */}
      <Box component="section" id="why" sx={{ backgroundImage: heroBg(0.55), backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', py: 9 }}>
        <Container maxWidth="lg">
          <Typography sx={{ ...eyebrow, color: '#fff' }}>Why use Lakbay PH</Typography>
          <Typography variant="h3" component="h2" align="center" sx={{ mt: 1, mb: 5, fontSize: { xs: '2rem', md: '2.6rem' } }}>Your Journey, Our Passion</Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
            {reasons.map((r) => (
              <Box key={r.title} sx={{ ...glass, p: 3, textAlign: 'center' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: TEAL, display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>{r.icon}</Box>
                <Typography fontWeight={700} sx={{ color: '#4FD8EE', mb: 1 }}>{r.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{r.text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      </Box>
      {/* ADDED: PAGE 'stories' */}
      <Box sx={pageBox('stories')}>
      {/* ---------- Traveler stories ---------- */}
      <Box component="section" id="stories" sx={{ backgroundImage: heroBg(0.55), backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', py: 9 }}>
        <Container maxWidth="lg">
          <Typography sx={{ ...eyebrow, color: '#fff' }}>What travelers say</Typography>
          <Typography variant="h3" component="h2" align="center" sx={{ mt: 1, mb: 5, fontSize: { xs: '2rem', md: '2.6rem' } }}>Traveler Stories</Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {stories.map((s) => (
              <Box key={s.name} sx={{ ...glass, p: 3, textAlign: 'center' }}>
                <Box sx={{ color: '#FFC83D', mb: 1 }}>{Array.from({ length: 5 }, (_, i) => <Star key={i} fontSize="small" />)}</Box>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>“{s.quote}”</Typography>
                <Typography fontWeight={700} variant="body2">{s.name}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{s.place} · sample text</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      </Box>
      {/* ADDED: PAGE 'contact' (newsletter and footer) */}
      <Box sx={pageBox('contact')}>
      {/* ---------- Newsletter ---------- */}
      <Box component="section" id="newsletter" sx={{ py: 8, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Email color="primary" sx={{ fontSize: 44 }} />
          <Typography variant="h4" component="h2" sx={{ mt: 1 }}>Subscribe to Our Newsletter</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, mt: 1 }}>Get travel tips and destination inspiration delivered to your inbox</Typography>
          {subscribed ? (
            <Typography color="primary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <MarkEmailRead /> Thank you! (Demo only: nothing was sent.)
            </Typography>
          ) : (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }} sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField fullWidth size="small" type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: 'background.paper' } }} />
              <Button type="submit" variant="contained" endIcon={<Send />} sx={{ borderRadius: 99, textTransform: 'none', fontWeight: 600, px: 3 }}>Subscribe</Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* ---------- Footer ---------- */}
      <Box component="footer" id="contact" sx={{ bgcolor: NAVY, color: '#fff', pt: 7, pb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '1.4fr 1fr 1fr 1.4fr' } }}>
            <Box>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, fontSize: 20, mb: 1.5 }}>
                <Public sx={{ color: '#4FD8EE' }} /> Lakbay<Box component="span" sx={{ color: '#4FD8EE' }}>PH</Box>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>Your guide to tourist spots across every region and province of the Philippines.</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[Facebook, Instagram, YouTube, LinkedIn].map((Icon, i) => (
                  <IconButton key={i} size="small" aria-label="social link" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}><Icon fontSize="small" /></IconButton>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1.5 }}>Quick Links</Typography>
              {[['Home', '#home'], ['Destinations', '#destinations'], ['Why Us', '#why'], ['Stories', '#stories']].map(([l, h]) => (
                <Link key={l} href={h} onClick={(e) => { e.preventDefault(); setPage(h.slice(1)); window.scrollTo({ top: 0 }); }} underline="hover" color="inherit" variant="body2" sx={{ display: 'block', opacity: 0.8, mb: 1, cursor: 'pointer' }}>{l}</Link>
              ))}
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1.5 }}>Support</Typography>
              {[['PSGC API', 'https://psgc.gitlab.io/api/'], ['Pexels', 'https://www.pexels.com'], ['Pexels API', 'https://www.pexels.com/api/']].map(([l, h]) => (
                <Link key={l} href={h} target="_blank" rel="noopener noreferrer" underline="hover" color="inherit" variant="body2" sx={{ display: 'block', opacity: 0.8, mb: 1 }}>{l}</Link>
              ))}
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1.5 }}>Contact Info</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, display: 'flex', gap: 1, alignItems: 'center' }}><Place fontSize="small" sx={{ color: '#4FD8EE' }} /> React Capstone Project, Group 3</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, display: 'flex', gap: 1, alignItems: 'center' }}><Email fontSize="small" sx={{ color: '#4FD8EE' }} /> hello@lakbayph.example</Typography>
            </Box>
          </Box>
          <Typography variant="caption" align="center" sx={{ display: 'block', mt: 5, pt: 3, borderTop: '1px solid rgba(255,255,255,0.12)', opacity: 0.7 }}>
            © 2026 Lakbay PH. Built with the PSGC API and Pexels.
          </Typography>
        </Container>
      </Box>

      </Box>

      {/* ADDED: map popup for the Featured Destinations cards (Google Maps, no API key needed). */}
      <Dialog open={Boolean(mapFor)} onClose={() => setMapFor(null)} maxWidth="md" fullWidth>
        {mapFor && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
              <Typography variant="h6" fontWeight={700}>📍 {mapFor.title}, {mapFor.region}</Typography>
              <IconButton onClick={() => setMapFor(null)} aria-label="Close map"><Close /></IconButton>
            </Box>
            <Box
              component="iframe"
              title={`Map of ${mapFor.title}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${mapFor.title}, ${mapFor.search}, Philippines`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{ border: 0, width: '100%', height: { xs: 320, sm: 460 } }}
            />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<LocationOn />}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mapFor.title}, ${mapFor.search}, Philippines`)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Open in Google Maps
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Back to top */}
      <Fab href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} color="primary" size="small" aria-label="Back to top" sx={{ position: 'fixed', right: 24, bottom: 24 }}>
        <ArrowUpward />
      </Fab>
    </ThemeProvider>
  );
}