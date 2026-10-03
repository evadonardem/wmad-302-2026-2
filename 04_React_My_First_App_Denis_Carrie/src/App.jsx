import { useState } from 'react';
import { Container, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { DarkMode, LightMode, Palette, Print, Share } from '@mui/icons-material';
import './App.css';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import GeneralSettings from './components/GeneralSettings';

// TODO 13 [Dynamic Themes]
const theme = (mode = 'light') => createTheme({ palette: { mode } });

function App() {
  // TODO 14 [State Management]
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TODO 15 [Data Actions Mapping]
  const actions = [
    {
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      name: isDarkMode ? 'LightMode' : 'DarkMode',
      onClick: () => setIsDarkMode(!isDarkMode),
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print', onClick: () => window.print() },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    // TODO 16 [Theme Binding Layout]
    <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '95vh',
          width: '100vw',
        }}
      >
        <QuoteOfTheDay />
        <GeneralSettings actions={actions} />
      </Container>
    </ThemeProvider>
  );
}

export default App; 