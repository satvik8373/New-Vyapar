import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import CasinoIcon from '@mui/icons-material/Casino';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { TurnPhase } from '@shared/types/player';
import { GameBridge } from '../../bridge/GameBridge';
import { AppButton } from './common/AppButton';
import { Realistic3DDice } from './common/Realistic3DDice';

interface ActionControlDockProps {
  variant?: 'floating' | 'inline';
}

export const ActionControlDock: React.FC<ActionControlDockProps> = ({ variant = 'floating' }) => {
  const [phase, setPhase] = useState<TurnPhase>('WAITING');
  const [isRolling, setIsRolling] = useState(false);
  const [lastDiceValue, setLastDiceValue] = useState<number | null>(null);
  const bridge = GameBridge.getInstance();

  useEffect(() => {
    const unsubTurn = bridge.subscribeTurn(({ phase }) => setPhase(phase));
    const unsubDice = bridge.subscribeDice(({ rolling, value }) => {
      setIsRolling(rolling);
      if (value !== null) setLastDiceValue(value);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !bridge.propertyModal.open) {
        if (bridge.phase === 'PLAYER_TURN' && !bridge.isRolling) {
          e.preventDefault();
          handleRoll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unsubTurn();
      unsubDice();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bridge]);

  const canRoll = phase === 'PLAYER_TURN' && !isRolling;

  const handleRoll = () => {
    if (canRoll) {
      bridge.requestRoll();
    }
  };

  const isInline = variant === 'inline';

  return (
    <Box
      sx={{
        ...(isInline
          ? {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }
          : {
              position: 'absolute',
              bottom: { xs: 80, sm: 95 },
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1050,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            })
      }}
    >
      {/* Single 3D Dice */}
      <Realistic3DDice
        size={44}
        value={lastDiceValue}
        isRolling={isRolling}
        canRoll={canRoll}
        onClick={handleRoll}
      />

      {/* Clean Roll Button */}
      <Box style={{ flex: isInline ? 1 : 'none' }}>
        <AppButton
          fullWidth={isInline}
          variant="primary"
          size="medium"
          disabled={!canRoll}
          loading={isRolling}
          onClick={handleRoll}
          startIcon={<CasinoIcon />}
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 1.2,
            fontSize: { xs: '13px', sm: '14px' }
          }}
        >
          {canRoll ? 'Roll Dice' : 'Wait Turn'}
        </AppButton>
      </Box>

      {/* Keyboard Hint Pill */}
      {canRoll && (
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: '#ffffff',
            px: 1.2,
            py: 0.6,
            borderRadius: '10px',
            border: '2px solid #eee7de',
            boxShadow: '0 2px 0 #eee7de'
          }}
        >
          <KeyboardReturnIcon sx={{ fontSize: 13, color: '#64748b' }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>
            SPACE
          </Typography>
        </Box>
      )}
    </Box>
  );
};
