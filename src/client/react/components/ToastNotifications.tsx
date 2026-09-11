import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { GameBridge, ToastMessage } from '../../bridge/GameBridge';

export const ToastNotifications: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);
  const bridge = GameBridge.getInstance();

  useEffect(() => {
    return bridge.subscribeToasts((toast) => {
      setCurrentToast(toast);
      setOpen(true);
    });
  }, [bridge]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  if (!currentToast) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: { xs: 80, sm: 125 } }}
    >
      <Alert
        onClose={handleClose}
        severity={currentToast.severity}
        sx={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '16px',
          color: '#0f172a',
          fontWeight: 700,
          fontSize: '14px',
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}
      >
        {currentToast.message}
      </Alert>
    </Snackbar>
  );
};
