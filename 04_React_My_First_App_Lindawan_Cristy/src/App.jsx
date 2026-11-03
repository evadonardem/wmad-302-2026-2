import { Container, createTheme, CssBaseline, ThemeProvider } from '@mui/material' // FIX: removed unused imports
import './App.css'
import QuoteOfTheDay from './components/QuoteOfTheDay'
import { DarkMode, LightMode, Palette, Print, Share } from '@mui/icons-material'; // FIX: removed unused imports
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';

// TODO 13 [Dynamic Themes]: Complete the theme creation arrow function.
// It should accept a 'mode' string parameter ('light' or 'dark') and generate an MUI theme object configuration mapping that mode.
const theme = (mode = 'light') => createTheme({
  // [Your code here]
  palette: {
    mode,
    primary: { main: mode === 'dark' ? '#ff1744' : '#d32f2f' },
    secondary: { main: mode === 'dark' ? '#b71c1c' : '#111111' },
    background: {
      default: mode === 'dark' ? '#000000' : '#ffffff',
      paper: mode === 'dark' ? '#141414' : '#ffffff',
    },
  },
});

// EXTRA: accent colors for the Theme button (null = the default red)
const accents = [null, '#c2185b', '#ff6d00', '#e6a800', '#f06292'];

function App() {
  // TODO 14 [State Management]: Initialize a boolean React state hook variable named 'isDarkMode' defaulting to false.
  // [Your code here]
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accent, setAccent] = useState(null); // EXTRA

  // TODO 15 [Data Actions Mapping]: Populate the 'actions' configuration array below.
  // Ensure the first action toggle object displays a <LightMode /> icon if 'isDarkMode' is true, or a <DarkMode /> icon if false.
  // The 'onClick' function must invert the current boolean state value of 'isDarkMode' upon execution.
  const actions = [
    {
      name: isDarkMode ? 'Light Mode' : 'Dark Mode', // FIX: label now changes with the mode
      // [Your code here: Add dynamic icon and state-toggling onClick function]
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      onClick: () => setIsDarkMode((prev) => !prev),
    },
    {
      icon: <Palette />, name: 'Theme',
      onClick: () => setAccent(accents[(accents.indexOf(accent) + 1) % accents.length]), // EXTRA
    },
    { icon: <Print />, name: 'Print', onClick: () => window.print() }, // EXTRA
    {
      icon: <Share />, name: 'Share',
      onClick: () => { // EXTRA
        const text = `${document.getElementById('quote-text')?.innerText} ${document.getElementById('quote-author')?.innerText}`;
        if (navigator.share) navigator.share({ text });
        else navigator.clipboard.writeText(text);
      },
    },
  ];

  return (
    // TODO 16 [Theme Binding Layout]: Wrap the children inside a dynamic ThemeProvider passing the calculated theme mode.
    // Configure the layout context matching: mode should resolve to 'dark' if 'isDarkMode' is true, otherwise 'light'.
    <>
      {/* [Your ThemeProvider wrapper structure here] */}
      <ThemeProvider
        theme={
          accent
            ? createTheme(theme(isDarkMode ? 'dark' : 'light'), { palette: { primary: { main: accent } } })
            : theme(isDarkMode ? 'dark' : 'light')
        }
      >
        <CssBaseline />
        <Container sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '95vh',
          width: '100vw',
        }}>
          <QuoteOfTheDay />
          <GeneralSettings actions={actions} />
        </Container>
      </ThemeProvider>
    </>
  )
}

export default App
