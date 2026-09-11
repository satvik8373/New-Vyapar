import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Divider
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { MoneyDisplay } from '../components/common/MoneyDisplay';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppButton } from '../components/common/AppButton';
import { AppCard } from '../components/common/AppCard';
import { AppBadge } from '../components/common/AppBadge';
import { PlayerData } from '../../../shared/types/player';
import { UserService } from '../../firebase/userService';
import { AuthService } from '../../firebase/authService';
import { FriendService } from '../../firebase/friendService';

interface ResultModalProps {
  open: boolean;
  onPlayAgain: () => void;
  onBackToHome: () => void;
  winnerName?: string;
  isHumanWinner?: boolean;
  humanPlayer?: PlayerData & { isHuman: boolean; netWorth: number };
  allPlayers?: (PlayerData & { isHuman: boolean; netWorth: number })[];
}

export const ResultModal: React.FC<ResultModalProps> = ({
  open,
  onPlayAgain,
  onBackToHome,
  winnerName,
  isHumanWinner = false,
  humanPlayer,
  allPlayers = []
}) => {
  const hasRecordedRef = useRef(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!open) {
      hasRecordedRef.current = false;
      setIsDismissed(false);
      return;
    }

    if (!hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const currentProfile = AuthService.getInstance().getCurrentProfile();
      if (currentProfile?.uid) {
        UserService.getInstance().recordGameFinished(currentProfile.uid, {
          won: isHumanWinner,
          finalBalance: humanPlayer?.balance || 5000,
          propertiesCount: humanPlayer?.ownedPropertyIds?.length || 0
        });

        // Record each opponent from this match as a recent opponent
        const opponents = allPlayers.filter((p) => !p.isHuman && p.id && p.id !== currentProfile.uid);
        opponents.forEach((opp) => {
          FriendService.getInstance().recordRecentOpponent(currentProfile.uid, {
            uid: opp.id || opp.name,
            displayName: opp.name || 'Opponent',
            avatar: opp.avatar || 'crown'
          });
        });
      }
    }
  }, [open, isHumanWinner, humanPlayer]);

  const handlePlayAgainClick = () => {
    setIsDismissed(true);
    onPlayAgain();
  };

  const handleBackToHomeClick = () => {
    setIsDismissed(true);
    onBackToHome();
  };

  // Sort players by netWorth descending
  const sortedPlayers = [...allPlayers].sort((a, b) => (b.netWorth ?? b.balance) - (a.netWorth ?? a.balance));

  const xpEarned = isHumanWinner ? 350 : 120;
  const coinsEarned = isHumanWinner ? 2500 : 500;

  if (isDismissed) return null;

  return (
    <Dialog
      open={open && !isDismissed}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
          p: 2,
          textAlign: 'center'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {/* Trophy Icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '18px',
            background: isHumanWinner
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography
          sx={{
            fontWeight: 900,
            color: '#0f172a',
            fontSize: '22px',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            mb: 0.3
          }}
        >
          {isHumanWinner ? 'VICTORY! 🎉' : 'MATCH COMPLETE'}
        </Typography>

        <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '13.5px', mb: 2 }}>
          {winnerName ? `${winnerName} won the Gujarat Trade!` : 'The match has concluded.'}
        </Typography>

        {/* Real Points & Coin Rewards Box */}
        <AppCard
          padded={false}
          sx={{
            p: 1.8,
            mb: 2,
            background: isHumanWinner ? '#fffbeb' : '#f0fdf4',
            border: isHumanWinner ? '1.5px solid #fde68a' : '1.5px solid #bbf7d0',
            borderRadius: '16px'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: isHumanWinner ? '#b45309' : '#15803d',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              mb: 1
            }}
          >
            Match Rewards Saved to Your Database
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>
                  +{xpEarned} XP
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  Trader Points
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ color: '#10b981', fontSize: 24 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '16px', color: '#059669' }}>
                  +₹{coinsEarned.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                  Coins Added
                </Typography>
              </Box>
            </Box>
          </Box>
        </AppCard>

        {/* Final Standings Table */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
          <Typography
            sx={{
              color: '#64748b',
              fontWeight: 800,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
            }}
          >
            Final Standings
          </Typography>
          <AppBadge badgeVariant="neutral" label={`${sortedPlayers.length} Merchants`} sx={{ height: 22, fontSize: '11px' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2.5 }}>
          {sortedPlayers.map((p, idx) => (
            <Box
              key={p.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '8px 12px',
                background: p.isHuman ? '#eff6ff' : '#ffffff',
                border: p.isHuman ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '8px',
                    background: idx === 0 ? '#fef3c7' : '#f1f5f9',
                    color: idx === 0 ? '#d97706' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '11px'
                  }}
                >
                  #{idx + 1}
                </Box>
                <PlayerAvatar avatar={p.avatar} color={p.tokenColor} size={28} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    {p.name} {p.isHuman && '(You)'}
                  </Typography>
                </Box>
              </Box>

              <MoneyDisplay amount={p.netWorth ?? p.balance} sx={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }} />
            </Box>
          ))}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AppButton
            fullWidth
            variant="primary"
            size="medium"
            onClick={handlePlayAgainClick}
          >
            Play Again
          </AppButton>

          <AppButton
            fullWidth
            variant="outlined"
            size="medium"
            onClick={handleBackToHomeClick}
          >
            Main Menu
          </AppButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
