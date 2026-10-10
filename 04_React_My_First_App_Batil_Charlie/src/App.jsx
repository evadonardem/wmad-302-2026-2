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
      main: '#4b3f7f',
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const actions = [
    {
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      name: isDarkMode ? 'Light mode' : 'Dark mode',
      onclick: () => setIsDarkMode((prevMode) => !prevMode),
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <Container sx={{
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
  )
}

export default App
