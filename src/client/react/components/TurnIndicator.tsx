import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CasinoIcon from '@mui/icons-material/Casino';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { PlayerData, TurnPhase } from '@shared/types/player';
import { GameBridge } from '../../bridge/GameBridge';
import { PlayerAvatar } from './common/PlayerAvatar';
import { AppBadge, AppBadgeVariant } from './common/AppBadge';

export const TurnIndicator: React.FC = () => {
  const [activePlayer, setActivePlayer] = useState<PlayerData | null>(null);
  const [phase, setPhase] = useState<TurnPhase>('WAITING');
  const bridge = GameBridge.getInstance();

  useEffect(() => {
    return bridge.subscribeTurn(({ activePlayer, phase }) => {
      setActivePlayer(activePlayer);
      setPhase(phase);
    });
  }, [bridge]);

  if (!activePlayer) return null;

  const getPhaseDetails = (): { label: string; icon: React.ReactElement; variant: AppBadgeVariant } => {
    switch (phase) {
      case 'PLAYER_TURN':
        return { label: 'Ready to Roll', icon: <CasinoIcon />, variant: 'warning' };
      case 'ROLLING':
        return { label: 'Rolling Dice...', icon: <CasinoIcon />, variant: 'info' };
      case 'MOVING':
        return { label: 'Moving...', icon: <DirectionsWalkIcon />, variant: 'primary' };
      case 'TILE_ACTION':
        return { label: 'Tile Action', icon: <StorefrontIcon />, variant: 'success' };
      default:
        return { label: 'Waiting...', icon: <HourglassEmptyIcon />, variant: 'neutral' };
    }
  };

  const details = getPhaseDetails();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePlayer.id}-${phase}`}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              px: 1.5,
              py: 0.6,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)'
            }}
          >
            {/* Player Avatar */}
            <PlayerAvatar
              avatar={activePlayer.avatar}
              color={activePlayer.tokenColor}
              size={32}
            />

            {/* Player Name */}
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '13px', sm: '15px' },
                color: '#0f172a'
              }}
            >
              {activePlayer.name}'s Turn
            </Typography>

            {/* Phase Badge */}
            <AppBadge
              badgeVariant={details.variant}
              icon={details.icon}
              label={details.label}
              sx={{ height: 26 }}
            />
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};
