import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f172a', // Slate Velvet
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#3b82f6', // Candy Azure Sky
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981', // Mint Emerald
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b', // Honey Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    error: {
      main: '#f43f5e', // Berry Rose
      light: '#fb7185',
      dark: '#e11d48',
      contrastText: '#ffffff'
    },
    info: {
      main: '#8b5cf6', // Grape Violet
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f6f8fb', // Soft milk-canvas
      paper: '#ffffff'    // Pure cream cardstock
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    },
    divider: 'rgba(226, 232, 240, 0.85)'
  },
  spacing: 8,
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 800,
      fontSize: '28px',
      letterSpacing: '-0.03em',
      color: '#0f172a'
    },
    h2: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 800,
      fontSize: '22px',
      letterSpacing: '-0.025em',
      color: '#0f172a'
    },
    h3: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '18px',
      letterSpacing: '-0.02em',
      color: '#0f172a'
    },
    h4: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '16px',
      letterSpacing: '-0.015em',
      color: '#0f172a'
    },
    h5: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '14px',
      color: '#0f172a'
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '13px',
      color: '#0f172a'
    },
    subtitle1: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '13px',
      color: '#64748b'
    },
    subtitle2: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '11px',
      color: '#64748b'
    },
    body1: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontSize: '13px',
      lineHeight: 1.45,
      color: '#0f172a'
    },
    body2: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontSize: '12px',
      lineHeight: 1.4,
      color: '#475569'
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '-0.01em',
      fontSize: '13px'
    }
  },
  shape: {
    borderRadius: 14
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          backgroundColor: '#f6f8fb',
          color: '#0f172a'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 36,
          padding: '7px 16px',
          fontWeight: 700,
          boxShadow: '0 2px 0 rgba(0,0,0,0.06), 0 3px 8px rgba(0,0,0,0.04)',
          textTransform: 'none',
          transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.08), 0 6px 14px rgba(0,0,0,0.06)'
          },
          '&:active': {
            transform: 'translateY(1px)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(226, 232, 240, 0.85)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 20px 48px -10px rgba(15, 23, 42, 0.18), 0 10px 20px -5px rgba(15, 23, 42, 0.08)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 700,
          fontSize: '11px',
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: '#0f172a',
          fontSize: '11px',
          fontWeight: 600,
          padding: '6px 12px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
        },
        arrow: {
          color: '#0f172a'
        }
      }
    }
  }
});
