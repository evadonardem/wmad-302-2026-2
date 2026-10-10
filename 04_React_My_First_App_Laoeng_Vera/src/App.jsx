import { Container, createTheme, CssBaseline, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, ThemeProvider } from '@mui/material'
import './App.css'
import QuoteOfTheDay from './components/QuoteOfTheDay'
import { DarkMode, LightMode, Palette, Print, Save, Settings, Share } from '@mui/icons-material';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';

// TODO 13 [Dynamic Themes]: Complete the theme creation arrow function.
// It should accept a 'mode' string parameter ('light' or 'dark') and generate an MUI theme object configuration mapping that mode.
const theme = (mode = 'light') => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#7c4dff',
            light: '#b388ff',
            dark: '#5117d6',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#b39ddb',
            light: '#d1c4e9',
            dark: '#836fa9',
            contrastText: '#2d1b4e',
          },
          background: {
            default: '#f7f4fc',
            paper: '#ffffff',
          },
          text: {
            primary: '#2d1b4e',
            secondary: '#6c5b7b',
          },
        }
      : {
          primary: {
            main: '#b388ff',
            light: '#d1b3ff',
            dark: '#7c4dff',
            contrastText: '#150d24',
          },
          secondary: {
            main: '#9575cd',
            light: '#b39ddb',
            dark: '#65499c',
            contrastText: '#ffffff',
          },
          background: {
            default: '#130d21',
            paper: '#1e1432',
          },
          text: {
            primary: '#f3edff',
            secondary: '#bfa9d6',
          },
        }),
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  // TODO 14 [State Management]: Initialize a boolean React state hook variable named 'isDarkMode' defaulting to false.
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TODO 15 [Data Actions Mapping]: Populate the 'actions' configuration array below.
  // Ensure the first action toggle object displays a <LightMode /> icon if 'isDarkMode' is true, or a <DarkMode /> icon if false.
  // The 'onClick' function must invert the current boolean state value of 'isDarkMode' upon execution.
  const actions = [
    {
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: () => setIsDarkMode((prevMode) => !prevMode),
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    // TODO 16 [Theme Binding Layout]: Wrap the children inside a dynamic ThemeProvider passing the calculated theme mode.
    // Configure the layout context matching: mode should resolve to 'dark' if 'isDarkMode' is true, otherwise 'light'.
    <ThemeProvider theme={theme(isDarkMode ? 'dark' : 'light')}>
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
  )
}

export default App
