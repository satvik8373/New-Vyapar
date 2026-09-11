import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Chip, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { GameBridge } from '../../bridge/GameBridge';

interface HeaderBarProps {
  onOpenBankDrawer: () => void;
  onOpenHelp: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenBankDrawer, onOpenHelp }) => {
  const [isMuted, setIsMuted] = useState(false);
  const bridge = GameBridge.getInstance();

  useEffect(() => {
    return bridge.subscribeSound((muted) => setIsMuted(muted));
  }, [bridge]);

  const handleToggleMute = () => {
    bridge.toggleMute();
  };

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(7, 11, 20, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Left: Gujarat Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #fde047',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)'
            }}
          >
            <Typography sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
              NV
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontSize: { xs: '18px', sm: '22px' },
                color: '#fbbf24',
                fontWeight: 900,
                letterSpacing: '0.5px',
                lineHeight: 1.1
              }}
            >
              NAVO VYAPAR
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontSize: '10px',
                color: '#94a3b8',
                letterSpacing: '2px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              Gujarat Commerce Digital
            </Typography>
          </Box>
        </Box>

        {/* Center: Central Bank Treasury status badge */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<AccountBalanceIcon sx={{ color: '#fbbf24 !important' }} />}
            label="NAVO BANK : CENTRAL RESERVE"
            onClick={onOpenBankDrawer}
            clickable
            sx={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#fde047',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.5px',
              px: 1,
              '&:hover': {
                background: 'rgba(217, 119, 6, 0.25)',
                borderColor: '#fde047'
              }
            }}
          />
        </Box>

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="View Navo Bank Ledger">
            <IconButton
              onClick={onOpenBankDrawer}
              sx={{
                color: '#fbbf24',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                background: 'rgba(15, 23, 42, 0.6)',
                '&:hover': { background: 'rgba(217, 119, 6, 0.2)' }
              }}
            >
              <AccountBalanceIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isMuted ? 'Unmute Sound' : 'Mute Sound'}>
            <IconButton
              onClick={handleToggleMute}
              sx={{
                color: isMuted ? '#94a3b8' : '#38bdf8',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="How to Play">
            <IconButton
              onClick={onOpenHelp}
              sx={{
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
