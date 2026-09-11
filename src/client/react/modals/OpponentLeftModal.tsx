import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Divider,
  Stack
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { CandyButton } from '../components/common/CandyButton';
import { AuthService } from '../../firebase/authService';
import { UserService } from '../../firebase/userService';
import { SoundEffects } from '../../audio/SoundEffects';

interface OpponentLeftModalProps {
  open: boolean;
  opponentName: string;
  isGameOver?: boolean;
  finalBalance?: number;
  propertiesCount?: number;
  onClaimVictory: () => void;
  onContinueWithAI: () => void;
}

export const OpponentLeftModal: React.FC<OpponentLeftModalProps> = ({
  open,
  opponentName,
  isGameOver = true,
  finalBalance = 5000,
  propertiesCount = 0,
  onClaimVictory,
  onContinueWithAI
}) => {
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (open) {
      SoundEffects.getInstance().playPlayerLeft();

      // Automatically record match win by forfeit for the remaining player
      if (!hasRecordedRef.current) {
        hasRecordedRef.current = true;
        const profile = AuthService.getInstance().getCurrentProfile();
        if (profile?.uid) {
          UserService.getInstance().recordGameFinished(profile.uid, {
            won: true,
            finalBalance,
            propertiesCount
          }).catch((err) => {
            console.warn('[OpponentLeftModal] Could not record forfeit win:', err);
          });
        }
      }
    } else {
      hasRecordedRef.current = false;
    }
  }, [open, finalBalance, propertiesCount]);

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
          p: 2,
          textAlign: 'center',
          overflow: 'hidden',
          border: '1.5px solid rgba(226, 232, 240, 0.8)'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {/* Top Forfeit Badge */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.5,
              py: 0.4,
              borderRadius: '9999px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '11px',
              fontWeight: 850,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}
          >
            <PersonRemoveRoundedIcon sx={{ fontSize: 14 }} />
            Match Abandoned
          </Box>
        </Box>

        {/* Big Trophy & Forfeit Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1.8,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 36 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 850,
            color: '#0f172a',
            fontSize: '19px',
            lineHeight: 1.25,
            mb: 0.6
          }}
        >
          {opponentName || 'Opponent'} Left Match
        </Typography>

        {/* Subtitle / Forfeit notice */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: 1.5,
            mb: 2,
            px: 1
          }}
        >
          Your opponent has forfeited and left the room.{' '}
          <strong style={{ color: '#059669' }}>You win by default! 🏆</strong>
        </Typography>

        {/* Rewards Card */}
        <Box
          sx={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            p: 1.5,
            mb: 2.5
          }}
        >
          <Typography
            sx={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              mb: 1
            }}
          >
            Victory Rewards Granted
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
            {/* XP Points */}
            <Box
              sx={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#d97706' }}>
                <StarIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontWeight: 850, fontSize: '13px', color: '#0f172a' }}>
                  +350
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b' }}>
                Experience XP
              </Typography>
            </Box>

            {/* Coins */}
            <Box
              sx={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#059669' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontWeight: 850, fontSize: '13px', color: '#0f172a' }}>
                  +₹2,500
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b' }}>
                Dividend Bonus
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Stack spacing={1.2}>
          <CandyButton
            fullWidth
            variant="mint"
            size="lg"
            onClick={onClaimVictory}
          >
            🏆 Claim Victory & Return to Menu
          </CandyButton>

          <CandyButton
            fullWidth
            variant="glass"
            size="md"
            onClick={onContinueWithAI}
          >
            <SmartToyIcon sx={{ fontSize: 16, mr: 0.6 }} />
            Replace with AI & Continue Playing
          </CandyButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
