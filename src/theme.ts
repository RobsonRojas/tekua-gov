import type { ThemeOptions, PaletteMode } from '@mui/material';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 80;
export const MOBILE_HEADER_HEIGHT = 64;

export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Palette for light mode
          primary: {
            main: '#467048', // Verde floresta
            light: '#659367',
            dark: '#2c492d',
          },
          secondary: {
            main: '#da8923', // Laranja mostarda
            light: '#f5a43d',
            dark: '#b36d16',
          },
          error: {
            main: '#8d0c09', // Vermelho carmesim
          },
          background: {
            default: '#f4f5f0', // Tom claro neutro/esverdeado
            paper: '#ffffff',
          },
          text: {
            primary: '#262a18', // Verde muito escuro (substitui preto)
            secondary: '#5f5142', // Marrom escuro / Taupe
          },
        }
      : {
          // Palette for dark mode
          primary: {
            main: '#467048', // Verde floresta
            light: '#659367',
            dark: '#2c492d',
          },
          secondary: {
            main: '#da8923', // Laranja mostarda
            light: '#f5a43d',
            dark: '#b36d16',
          },
          error: {
            main: '#8d0c09', // Vermelho carmesim
          },
          background: {
            default: '#1c1f12', // Fundo principal ainda mais escuro que paper
            paper: '#262a18',   // Verde muito escuro
          },
          text: {
            primary: '#f8fafc',
            secondary: '#a2a45e', // Verde oliva claro
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 800,
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      }
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 800,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      }
    },
    h3: { fontSize: '1.5rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px',
          borderRadius: '12px',
        },
        containedPrimary: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #659367 0%, #467048 100%)'
            : 'linear-gradient(135deg, #467048 0%, #2c492d 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #a2a45e 0%, #659367 100%)'
              : 'linear-gradient(135deg, #659367 0%, #467048 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '16px',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: '12px',
          paddingBottom: '12px',
        },
      },
    },
  },
});

export default getThemeOptions;
