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
            main: '#4f46e5', // Indigo 600
            light: '#6366f1',
            dark: '#3730a3',
          },
          secondary: {
            main: '#059669', // Emerald 600
          },
          background: {
            default: '#f8fafc', // Slate 50
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a', // Slate 900
            secondary: '#475569', // Slate 600
          },
        }
      : {
          // Palette for dark mode
          primary: {
            main: '#6366f1', // Indigo 500
            light: '#818cf8',
            dark: '#4f46e5',
          },
          secondary: {
            main: '#10b981', // Emerald 500
          },
          background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b',   // Slate 800
          },
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
        containedPrimary: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
            : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default getThemeOptions;
