import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import { motion, AnimatePresence } from 'framer-motion';
import { AppButton } from '../components/common/AppButton';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: <CasinoIcon sx={{ fontSize: 56, color: '#ffa502' }} />,
    title: 'ROLL THE DICE',
    category: 'CLASSIC GAMEPLAY',
    subtitle: 'Roll the 3D dice on your turn and move your token step-by-step across Gujarat commercial hubs.',
    color: '#ffa502',
    shadowColor: '#e67e22'
  },
  {
    icon: <StorefrontIcon sx={{ fontSize: 56, color: '#10ac84' }} />,
    title: 'BUY & TRADE',
    category: 'COMMERCE STRATEGY',
    subtitle: 'Acquire historic textile mills, diamond exchanges, and maritime ports to build your empire.',
    color: '#10ac84',
    shadowColor: '#0e8869'
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 56, color: '#54a0ff' }} />,
    title: 'PLAY TOGETHER',
    category: 'ONLINE MULTIPLAYER',
    subtitle: 'Compete in real-time online rooms with friends, colleagues, and players worldwide.',
    color: '#54a0ff',
    shadowColor: '#2e86de'
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fbf8f2',
        p: { xs: 3, sm: 5 },
        textAlign: 'center'
      }}
    >
      {/* Top Skip */}
      <Box sx={{ width: '100%', maxWidth: 420, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={onComplete}
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#64748b',
            fontWeight: 800,
            fontSize: '14px',
            minHeight: 40,
            boxShadow: 'none'
          }}
        >
          SKIP
        </Button>
      </Box>

      {/* Center Slide Card */}
      <Box sx={{ maxWidth: 420, width: '100%', py: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cute Icon Badge */}
            <Box
              sx={{
                width: 110,
                height: 110,
                mx: 'auto',
                mb: 3,
                borderRadius: '28px',
                backgroundColor: '#ffffff',
                border: `3px solid ${slide.color}`,
                boxShadow: `0 6px 0 ${slide.shadowColor}, 0 12px 24px rgba(0,0,0,0.06)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {slide.icon}
            </Box>

            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: slide.color,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                mb: 0.8
              }}
            >
              {slide.category}
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 900,
                color: '#1e293b',
                fontSize: { xs: '24px', sm: '28px' },
                letterSpacing: '0.2px',
                mb: 1.5
              }}
            >
              {slide.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: '#64748b',
                lineHeight: 1.6,
                fontSize: '15px'
              }}
            >
              {slide.subtitle}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Bottom Controls */}
      <Box sx={{ width: '100%', maxWidth: 420, pb: 2 }}>
        {/* Pagination Dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.2, mb: 3 }}>
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              sx={{
                width: currentSlide === idx ? 28 : 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: currentSlide === idx ? '#ffa502' : '#e2d9cc',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>

        {/* Reusable Chunky Next Button */}
        <AppButton
          fullWidth
          variant="primary"
          size="large"
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
        </AppButton>
      </Box>
    </Box>
  );
};
