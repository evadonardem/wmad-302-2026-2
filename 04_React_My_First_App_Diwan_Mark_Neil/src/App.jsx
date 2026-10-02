import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import './App.css'
import QuoteOfTheDay from './components/QuoteOfTheDay'
import { DarkMode, LightMode, Palette, Print, Share } from '@mui/icons-material';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';

// "Fiery Ocean" palette: maroon, red, cream, navy, blue
const theme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#14283C', // navy
      contrastText: '#F5EBD8',
    },
    secondary: {
      main: '#A6302E', // red
      contrastText: '#F5EBD8',
    },
    success: {
      main: '#7B9DBE', // blue
      contrastText: '#14283C',
    },
    error: {
      main: '#5C1211', // dark maroon
    },
    background: {
      default: mode === 'light' ? '#F5EBD8' : '#0B1A26',
      paper: mode === 'light' ? '#FFF9EF' : '#1D3B52',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mode = isDarkMode ? 'dark' : 'light';

  const actions = [
    {
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      onClick: () => setIsDarkMode(!isDarkMode),
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    <ThemeProvider theme={theme(mode)}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: mode === 'light'
          ? 'radial-gradient(circle at 18% 20%, #FFF9EF 0%, #F5EBD8 45%, #E7D3AE 100%)'
          : 'radial-gradient(circle at 18% 20%, #1D3B52 0%, #14283C 55%, #0B1A26 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 8,
        px: 2,
      }}>
        <QuoteOfTheDay />
        <GeneralSettings actions={actions} />
      </Box>
    </ThemeProvider>
  )
}

export default App