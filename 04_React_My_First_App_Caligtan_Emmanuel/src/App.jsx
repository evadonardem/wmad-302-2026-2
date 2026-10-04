import { useState } from 'react';
import {
  DarkMode,
  LightMode,
  Palette,
  Print,
  Share,
} from '@mui/icons-material';
import { Container, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import './App.css';
import GeneralSettings from './components/GeneralSettings';
import QuoteOfTheDay from './components/QuoteOfTheDay';

const primaryColors = ['#6750a4', '#006c5b', '#9c4146', '#315e91'];

const theme = (mode, primaryColor) => createTheme({
  palette: {
    mode,
    primary: { main: primaryColor },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColorIndex, setPrimaryColorIndex] = useState(0);
  const mode = isDarkMode ? 'dark' : 'light';

  const actions = [
    {
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: () => setIsDarkMode((currentMode) => !currentMode),
    },
    {
      icon: <Palette />,
      name: 'Change accent color',
      onClick: () => setPrimaryColorIndex((index) => (index + 1) % primaryColors.length),
    },
    {
      icon: <Print />,
      name: 'Print',
      onClick: () => window.print(),
    },
    {
      icon: <Share />,
      name: 'Share',
      onClick: async () => {
        const shareData = {
          title: 'Quote of the Day',
          text: 'Check out this quote of the day.',
          url: window.location.href,
        };

        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareData.url);
          } else {
            throw new Error('Sharing and clipboard access are not available in this browser.');
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Unable to share the quote generator.', error);
            window.alert('Unable to share from this browser. Please copy the page URL to share it.');
          }
        }
      },
    },
  ];

  return (
    <ThemeProvider theme={theme(mode, primaryColors[primaryColorIndex])}>
      <CssBaseline />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          py: 4,
        }}
      >
        <QuoteOfTheDay />
        <GeneralSettings actions={actions} />
      </Container>
    </ThemeProvider>
  );
}

export default App;