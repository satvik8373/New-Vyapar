import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        overflow: 'hidden',
        px: 3,
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Game Hero Artwork */}
        <Box
          component="img"
          src="/assets/images/app_icon.jpg"
          alt="Navo Vyapar"
          sx={{
            width: { xs: 96, sm: 110 },
            height: { xs: 96, sm: 110 },
            mx: 'auto',
            mb: 2,
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
            objectFit: 'cover'
          }}
        />

        {/* English Brand Title */}
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: { xs: '28px', sm: '36px' },
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '0.4px',
            lineHeight: 1.1,
            mb: 0.5
          }}
        >
          NAVO VYAPAR
        </Typography>

        {/* Professional Subtitle */}
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: { xs: '13px', sm: '15px' },
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0.4px',
            mb: 0.5
          }}
        >
          The Gujarat Business Board Game
        </Typography>

        {/* Tagline */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#64748b',
            letterSpacing: '2px',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '11px',
            mb: 4
          }}
        >
          ACQUIRE • TRADE • EXPAND
        </Typography>
      </motion.div>

      {/* Cute Pastel Progress Bar */}
      <Box sx={{ width: '100%', maxWidth: 260 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 6,
            backgroundColor: '#eee7de',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              backgroundColor: '#10ac84'
            }
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#64748b',
            mt: 1.5,
            display: 'block',
            fontWeight: 700
          }}
        >
          Loading Board Game... {progress}%
        </Typography>
      </Box>
    </Box>
  );
};
