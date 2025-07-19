import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import App from './App';
import './index.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'light',
      },
    },
    Card: {
      styles: {
        root: {
          transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        },
      },
    },
    Button: {
      styles: {
        root: {
          transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
        },
      },
    },
  },
  primaryShade: { light: 6, dark: 7 },
  defaultRadius: 'md',
  colors: {
    // Custom colors for dark mode
    dark: [
      '#C1C2C5', // 0: Text
      '#A6A7AB', // 1: Dimmed text
      '#909296', // 2: More dimmed text
      '#5c5f66', // 3: Even more dimmed text
      '#373A40', // 4: Borders
      '#2C2E33', // 5: Buttons/UI elements
      '#25262b', // 6: Hover states
      '#1A1B1E', // 7: Background
      '#141517', // 8: Paper/Card background
      '#101113', // 9: Deeper backgrounds
    ],
    // Optimize light mode palette
    blue: [
      '#edf2ff', // 0
      '#dbe4ff', // 1
      '#bac8ff', // 2
      '#91a7ff', // 3
      '#748ffc', // 4
      '#5c7cfa', // 5
      '#4c6ef5', // 6
      '#4263eb', // 7
      '#3b5bdb', // 8
      '#364fc7', // 9
    ],
  },
  other: {
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
); 