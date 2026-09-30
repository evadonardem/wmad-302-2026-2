import { Container, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './App.css'
import QuoteOfTheDay from './components/QuoteOfTheDay'
import { DarkMode, LightMode, Palette, Print, Share } from '@mui/icons-material';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';

const theme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#d26c19',
    },
    secondary: {
      main: '#7c4dff',
    },
    background: {
      default: mode === 'dark' ? '#101827' : '#f8f5f2',
      paper: mode === 'dark' ? '#1f2937' : '#ffffff',
    },
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const activeMode = isDarkMode ? 'dark' : 'light';

  const actions = [
    {
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      onClick: () => setIsDarkMode(provided => !provided),
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    <ThemeProvider theme={theme(activeMode)}>
      <CssBaseline />
      <Container className="app-shell" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        py: 4,
        position: 'relative',
        background: activeMode === 'dark'
          ? 'radial-gradient(circle at top, rgba(125, 92, 255, 0.25), transparent 38%), #101827'
          : 'radial-gradient(circle at top, rgba(210, 108, 25, 0.18), transparent 38%), #f8f5f2',
        transition: 'background 0.3s ease',
      }}>
        <QuoteOfTheDay />
        <GeneralSettings actions={actions} />
      </Container>
    </ThemeProvider>
  )
}

export default App
