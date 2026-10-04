import { Container, createTheme, CssBaseline, prerelease, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, ThemeProvider } from '@mui/material'
import './App.css'
import QuoteOfTheDay from './components/QuoteOfTheDay'
import { DarkMode, LightMode, Palette, Print, Save, Settings, Share } from '@mui/icons-material';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';

// TODO 13 [Dynamic Themes]: Complete the theme creation arrow function.
  palette: {
    mode,
    primary: {
      main: '#87CEEB'
    }
  }
});

function App() {
  // TODO 14 [State Management]: Initialize a boolean React state hook variable named 'isDarkMode' defaulting to false.
  const [isDarkMode, setIsDarkMode] = useState(false);

  // TODO 15 [Data Actions Mapping]: Populate the 'actions' configuration array below.
  const actions = [
    {
      icon: isDarkMode ? <LightMode /> : <DarkMode />,
      name: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: () => setIsDarkMode(prevMode => !prevMode)
    },
    { icon: <Palette />, name: 'Theme' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
  ];

  return (
    // TODO 16 [Theme Binding Layout]: Wrap the children inside a dynamic ThemeProvider passing the calculated theme mode.
    <>
      {/* [Your ThemeProvider wrapper structure here] */}
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
     
    </>
  )
}

export default App