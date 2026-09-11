import React, { useState } from 'react';
import { Box, Typography, Divider, TextField, CircularProgress, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';
import { AppCard, AppButton } from '../components/common';
import { AuthService } from '../../firebase/authService';

interface LoginScreenProps {
  onLogin: (userName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [guestName, setGuestName] = useState('Trader');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await AuthService.getInstance().signInWithGoogle();
      onLogin(profile.name);
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      setError(err.message || 'Google Sign-in failed. You can continue as Guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (!guestName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const profile = await AuthService.getInstance().signInGuest(guestName.trim(), 'crown');
      onLogin(profile.name);
    } catch (err: any) {
      console.error('Guest Sign-in Error:', err);
      setError(err.message || 'Guest Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        p: { xs: 2.5, sm: 3 },
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <AppCard sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Hero Artwork Header */}
          <Box
            component="img"
            src="/assets/images/app_icon.jpg"
            alt="Navo Vyapar"
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              borderRadius: '20px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.03)',
              objectFit: 'cover'
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 900,
              color: '#1e293b',
              letterSpacing: '0.5px',
              fontSize: '22px',
              mb: 0.5
            }}
          >
            NAVO VYAPAR
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#64748b',
              fontWeight: 600,
              mb: 2.5
            }}
          >
            Official Firebase Real-Time Multiplayer
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 2, textAlign: 'left', borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          {/* Guest Name Input */}
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 800,
                color: '#64748b',
                mb: 0.6,
                display: 'block'
              }}
            >
              Your Trader Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Gujarat Trader"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  fontWeight: 700
                }
              }}
            />
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AppButton
              fullWidth
              variant="primary"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <PersonIcon />}
              onClick={handleGuestLogin}
            >
              PLAY AS GUEST
            </AppButton>

            <Divider sx={{ my: 0.5, borderColor: '#e2e8f0' }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  color: '#94a3b8',
                  fontWeight: 800
                }}
              >
                OR
              </Typography>
            </Divider>

            <AppButton
              fullWidth
              variant="outlined"
              size="medium"
              disabled={loading}
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </AppButton>
          </Box>
        </AppCard>
      </motion.div>
    </Box>
  );
};
