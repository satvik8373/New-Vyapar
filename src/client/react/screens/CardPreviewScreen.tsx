import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PremiumCardShowcase } from '../components/common/PremiumCardShowcase';

interface CardPreviewScreenProps {
  onBack?: () => void;
}

/**
 * Development screen to preview all premium card variants
 * Use this to test and choose the right card style for your UI
 */
export const CardPreviewScreen: React.FC<CardPreviewScreenProps> = ({ onBack }) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f8fb 0%, #e8eef5 100%)',
        position: 'relative',
      }}
    >
      {/* Back Button */}
      {onBack && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={onBack}
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
              '&:hover': {
                background: '#ffffff',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>
      )}

      {/* Showcase Component */}
      <PremiumCardShowcase />
    </Box>
  );
};
