import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { MoneyDisplay } from '../components/common/MoneyDisplay';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { UserService, UserProfileDoc } from '../../firebase/userService';
import { AuthService } from '../../firebase/authService';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ open, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<UserProfileDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const currentProfile = AuthService.getInstance().getCurrentProfile();
  const currentUid = currentProfile?.uid || '';

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    UserService.getInstance().getTopLeaderboard(8).then((list) => {
      setLeaderboard(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          p: 1.5
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LeaderboardIcon sx={{ color: '#ffa502', fontSize: 26 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '16px' }}>
              Gujarat Leaderboard
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              Live Rankings by Trader Points (XP)
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#e2e8f0', px: 1, py: 1.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={30} sx={{ color: '#ffa502' }} />
          </Box>
        ) : (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              const isMe = item.uid === currentUid;
              const isTop3 = rank <= 3;

              return (
                <ListItem
                  key={item.uid || item.displayName + index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    borderRadius: '14px',
                    background: isMe ? '#eff6ff' : '#f8fafc',
                    border: isMe ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        background: rank === 1 ? '#fef3c7' : rank === 2 ? '#f1f5f9' : rank === 3 ? '#ffedd5' : '#f1f5f9',
                        color: rank === 1 ? '#d97706' : rank === 2 ? '#475569' : rank === 3 ? '#c2410c' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '12px'
                      }}
                    >
                      {rank === 1 ? <EmojiEventsIcon sx={{ fontSize: 16, color: '#f59e0b' }} /> : `#${rank}`}
                    </Box>

                    <PlayerAvatar avatar={item.avatar || 'crown'} color="#e11d48" size={36} level={item.level} />

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {item.displayName}
                        </Typography>
                        {isMe && (
                          <AppBadge badgeVariant="primary" label="YOU" sx={{ height: 18, fontSize: '9px', fontWeight: 900 }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                        {item.rankTitle || 'Gujarat Merchant'} • {item.points} XP
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <MoneyDisplay amount={item.coins} sx={{ fontSize: '13.5px', color: '#059669', fontWeight: 900 }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 700, fontSize: '10px' }}>
                      {item.gamesWon} Wins
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        <AppButton
          fullWidth
          variant="primary"
          size="medium"
          onClick={onClose}
        >
          Close
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
