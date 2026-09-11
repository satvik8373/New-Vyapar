import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppButton } from '../components/common';
import { AIDifficulty } from '../../game-engine/GameEngine';

interface AIDifficultyModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (difficulty: AIDifficulty) => void;
}

interface DifficultyOption {
  id: AIDifficulty;
  name: string;
  color: string;
  bgActive: string;
  borderActive: string;
  icon: React.ReactNode;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'EASY',
    name: 'Easy',
    color: '#10b981',
    bgActive: '#f0fdf4',
    borderActive: '#10b981',
    icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 22, color: '#10b981' }} />
  },
  {
    id: 'MEDIUM',
    name: 'Medium',
    color: '#f59e0b',
    bgActive: '#fffbeb',
    borderActive: '#f59e0b',
    icon: <SmartToyIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
  },
  {
    id: 'HARD',
    name: 'Hard',
    color: '#ef4444',
    bgActive: '#fef2f2',
    borderActive: '#ef4444',
    icon: <WhatshotIcon sx={{ fontSize: 22, color: '#ef4444' }} />
  }
];

export const AIDifficultyModal: React.FC<AIDifficultyModalProps> = ({
  open,
  onClose,
  onStart
}) => {
  const [selected, setSelected] = useState<AIDifficulty>('MEDIUM');

  const handleLaunch = () => {
    onStart(selected);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          p: { xs: 2, sm: 2.5 },
          width: { xs: '100%', sm: 390 },
          maxWidth: 'min(400px, calc(100vw - 32px))',
          background: '#ffffff',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.16)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header — Clean & Simple without lengthy text */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
        <Typography
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 900,
            fontSize: { xs: '17px', sm: '18px' },
            color: '#0f172a',
            lineHeight: 1.2
          }}
        >
          Select Difficulty
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 3 Clean Options — Minimal, No Extra Detailed Text */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
        {DIFFICULTY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <Box
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              sx={{
                p: { xs: '10px 14px', sm: '12px 16px' },
                cursor: 'pointer',
                border: isSelected ? `2px solid ${opt.borderActive}` : '1.5px solid #e2e8f0',
                backgroundColor: isSelected ? opt.bgActive : '#ffffff',
                borderRadius: '12px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isSelected ? `0 3px 10px ${opt.color}20` : 'none',
                '&:hover': {
                  borderColor: opt.borderActive,
                  backgroundColor: opt.bgActive
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${isSelected ? opt.borderActive : '#e2e8f0'}`,
                    flexShrink: 0
                  }}
                >
                  {opt.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 850,
                    fontSize: '15px',
                    color: isSelected ? opt.color : '#0f172a'
                  }}
                >
                  {opt.name}
                </Typography>
              </Box>

              <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected ? (
                  <CheckCircleIcon sx={{ color: opt.color, fontSize: 20 }} />
                ) : (
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '1.5px solid #cbd5e1'
                    }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Start Match Button */}
      <AppButton
        fullWidth
        variant="primary"
        size="large"
        startIcon={<PlayArrowIcon sx={{ fontSize: 22 }} />}
        onClick={handleLaunch}
        sx={{ py: { xs: 1.3, sm: 1.5 }, fontSize: { xs: '15px', sm: '16px' }, fontWeight: 900 }}
      >
        PLAY GAME
      </AppButton>
    </Dialog>
  );
};
