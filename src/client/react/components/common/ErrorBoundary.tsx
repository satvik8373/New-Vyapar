import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  fallbackScreen?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.fallbackScreen) {
      this.props.fallbackScreen();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            p: 3,
            textAlign: 'center',
            zIndex: 9999
          }}
        >
          <Box
            sx={{
              maxWidth: 420,
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              p: 3.5,
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
              border: '1.5px solid #e2e8f0'
            }}
          >
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#0f172a',
                mb: 1,
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
              }}
            >
              Navo Vyapar
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 600, mb: 3 }}>
              An unexpected transition occurred. Click below to return to the Main Menu.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={this.handleReset}
              sx={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                py: 1.2,
                borderRadius: '14px',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(225, 29, 72, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)'
                }
              }}
            >
              Return to Main Menu
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
