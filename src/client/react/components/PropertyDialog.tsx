import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
  Chip
} from '@mui/material';
import confetti from 'canvas-confetti';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { GAME_CONFIG } from '@shared/constants/config';
import { LandmarkIcon } from './common/LandmarkIcon';
import { GameBridge, PropertyModalState } from '../../bridge/GameBridge';

export const PropertyDialog: React.FC = () => {
  const [modalState, setModalState] = useState<PropertyModalState>({
    open: false,
    tile: null,
    player: null,
    canAfford: false
  });
  const bridge = GameBridge.getInstance();

  useEffect(() => {
    return bridge.subscribePropertyModal((state) => setModalState(state));
  }, [bridge]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalState.open) return;

      if ((e.key === 'b' || e.key === 'B') && modalState.canAfford) {
        handleBuy();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        handlePass();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  const { open, tile, player, canAfford } = modalState;
  if (!open || !tile || !player) return null;

  const handleBuy = () => {
    // Confetti celebration burst!
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    bridge.submitPropertyAction('BUY');
  };

  const handlePass = () => {
    bridge.submitPropertyAction('PASS');
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '20px'
        }
      }}
    >
      {/* Category Header Band */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${tile.color} 0%, ${tile.color}99 100%)`,
          p: 2.5,
          borderBottom: '2px solid rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Gloss sheen */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none'
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* 3D Landmark figurine */}
          <Box sx={{
            width: 80, height: 80,
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.22)',
            border: '1.5px solid rgba(255,255,255,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            <LandmarkIcon frame={tile.iconFrame ?? 0} size={64} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={`GUJARAT ${tile.category}`}
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.9)',
                color: tile.color,
                fontWeight: 800,
                fontSize: '10px',
                letterSpacing: '0.8px',
                mb: 0.6,
                height: 20
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '18px',
                lineHeight: 1.2,
                textShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }}
            >
              {tile.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              {tile.gujaratiName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#94a3b8',
            textAlign: 'center',
            mb: 3
          }}
        >
          {tile.description}
        </Typography>

        {/* Financial Details Box */}
        <Box
          sx={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            p: 2
          }}
        >
          {/* Purchase Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
              Purchase Price
            </Typography>
            <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 800 }}>
              {GAME_CONFIG.CURRENCY_SYMBOL}
              {tile.price.toLocaleString()}
            </Typography>
          </Box>

          {/* Base Rent */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Base Rent
            </Typography>
            <Typography variant="body1" sx={{ color: '#4ade80', fontWeight: 700 }}>
              {GAME_CONFIG.CURRENCY_SYMBOL}
              {tile.baseRent.toLocaleString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Buyer Balance Comparison */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
              <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                {player.name} Funds
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: canAfford ? '#38bdf8' : '#ef4444'
              }}
            >
              {GAME_CONFIG.CURRENCY_SYMBOL}
              {player.balance.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {!canAfford && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#ef4444',
              fontWeight: 700,
              mt: 2
            }}
          >
            Insufficient funds in Navo Bank account.
          </Typography>
        )}
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={handlePass}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            py: 1.2,
            '&:hover': {
              borderColor: '#ffffff',
              background: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          PASS (P)
        </Button>

        <Button
          fullWidth
          variant="contained"
          disabled={!canAfford}
          startIcon={<CheckCircleIcon />}
          onClick={handleBuy}
          sx={{
            background: canAfford
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'rgba(51, 65, 85, 0.5)',
            color: '#ffffff',
            py: 1.2,
            boxShadow: canAfford ? '0 6px 20px rgba(16, 185, 129, 0.4)' : 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #34d399 0%, #047857 100%)'
            }
          }}
        >
          BUY (B)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
