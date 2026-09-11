import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
  TextField,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { MoneyDisplay } from '../components/common/MoneyDisplay';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { UserService, UserProfileDoc } from '../../firebase/userService';
import { AuthService } from '../../firebase/authService';

import LogoutIcon from '@mui/icons-material/Logout';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'crown', name: 'Royal Crown', role: 'Chief Merchant', color: '#ff4757' },
  { id: 'diamond', name: 'Diamond', role: 'Port Strategist', color: '#0284c7' },
  { id: 'leaf', name: 'Gujarat Leaf', role: 'Commodity Trader', color: '#059669' },
  { id: 'star', name: 'Imperial Star', role: 'Real Estate Tycoon', color: '#f59e0b' }
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, onLogout }) => {
  const currentProfile = AuthService.getInstance().getCurrentProfile();
  const uid = currentProfile?.uid || '';

  const [userDoc, setUserDoc] = useState<UserProfileDoc | null>(UserService.getInstance().getCachedProfile());
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userDoc?.avatar || 'crown');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userDoc?.displayName || 'Trader');

  useEffect(() => {
    if (!uid || !open) return;
    const unsub = UserService.getInstance().subscribeUserProfile(uid, (docData) => {
      setUserDoc(docData);
      setSelectedAvatar(docData.avatar || 'crown');
      setEditedName(docData.displayName || 'Trader');
    });
    return () => unsub();
  }, [uid, open]);

  const handleSelectAvatar = async (id: string) => {
    setSelectedAvatar(id);
    if (uid) {
      await UserService.getInstance().updateProfileDetails(uid, { avatar: id });
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim() && uid) {
      await UserService.getInstance().updateProfileDetails(uid, { displayName: editedName.trim() });
      await AuthService.getInstance().updatePlayerDetails(editedName.trim(), selectedAvatar);
      setIsEditingName(false);
    }
  };

  const currentOption = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  // XP Progress calculation
  const points = userDoc?.points ?? 150;
  const level = userDoc?.level ?? 1;
  const rankTitle = userDoc?.rankTitle ?? 'Novice Trader';
  const currentLevelMin = (level - 1) * 250;
  const nextLevelMin = level * 250;
  const progressPercent = Math.min(100, Math.max(0, ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100));

  const gamesPlayed = userDoc?.gamesPlayed ?? 0;
  const gamesWon = userDoc?.gamesWon ?? 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const propertiesBought = userDoc?.propertiesBought ?? 0;
  const totalEarnings = userDoc?.totalEarnings ?? 12500;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2)',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          p: 1.5,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Merchant Trader Profile
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748b', p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 1 }}>
        {/* Active Avatar & Level Badge */}
        <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <PlayerAvatar
            avatar={currentOption.id}
            name={currentOption.name}
            color={currentOption.color}
            size={72}
            level={level}
          />
        </Box>

        {/* Display Name with Edit Button */}
        {isEditingName ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <TextField
              size="small"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              sx={{ maxWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontWeight: 800 } }}
            />
            <IconButton onClick={handleSaveName} sx={{ color: '#10b981' }}>
              <SaveIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '19px', letterSpacing: '-0.2px' }}>
              {userDoc?.displayName || editedName}
            </Typography>
            <IconButton size="small" onClick={() => setIsEditingName(true)} sx={{ color: '#94a3b8' }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <AppBadge badgeVariant="primary" label={`Level ${level}`} sx={{ fontWeight: 800 }} />
          <AppBadge badgeVariant="warning" label={rankTitle} sx={{ fontWeight: 800 }} />
        </Box>

        {/* XP Level Progress Bar */}
        <Box sx={{ mb: 2.5, p: 1.5, background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Experience Points (XP)
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0f172a' }}>
              {points} / {nextLevelMin} XP
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ffa502',
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* 3D Avatar Selector */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', mb: 1, letterSpacing: '0.4px', textAlign: 'left' }}>
            Choose Your Board Avatar
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedAvatar;
              return (
                <Tooltip key={opt.id} arrow title={`${opt.name} — ${opt.role}`}>
                  <Box
                    onClick={() => handleSelectAvatar(opt.id)}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 0.8,
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#0f172a',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <PlayerAvatar
                      avatar={opt.id}
                      name={opt.name}
                      color={opt.color}
                      size={38}
                    />
                    <Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                      {opt.name.split(' ')[0]}
                    </Typography>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          fontSize: 14,
                          color: '#0f172a'
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Live Firestore Database Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: '#f8fafc',
            p: 1.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            mb: 1.5
          }}
        >
          <Box sx={{ textAlign: 'left', pl: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Games Played</Typography>
            <Typography sx={{ color: '#0f172a', fontWeight: 900, fontSize: '16px' }}>{gamesPlayed}</Typography>
          </Box>
          <Box sx={{ textAlign: 'left', pl: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Victories</Typography>
            <Typography sx={{ color: '#059669', fontWeight: 900, fontSize: '16px' }}>{gamesWon}</Typography>
          </Box>
          <Box sx={{ textAlign: 'left', pl: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Win Rate</Typography>
            <Typography sx={{ color: '#d97706', fontWeight: 900, fontSize: '16px' }}>{winRate}%</Typography>
          </Box>
          <Box sx={{ textAlign: 'left', pl: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Deeds Bought</Typography>
            <Typography sx={{ color: '#2563eb', fontWeight: 900, fontSize: '16px' }}>{propertiesBought}</Typography>
          </Box>
        </Box>

        {/* Lifetime Earnings from Firestore */}
        <Box sx={{ background: '#f8fafc', p: 1.2, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>
            Cumulative Trader Earnings
          </Typography>
          <MoneyDisplay amount={totalEarnings} sx={{ fontSize: '18px', color: '#059669', fontWeight: 900 }} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, pt: 1, display: 'flex', gap: 1 }}>
        {onLogout && (
          <AppButton
            variant="danger"
            size="medium"
            startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              onClose();
              onLogout();
            }}
            sx={{ flex: 1, py: 1 }}
          >
            Log Out
          </AppButton>
        )}
        <AppButton
          fullWidth={!onLogout}
          variant="primary"
          size="medium"
          onClick={onClose}
          sx={{ flex: 1.4, py: 1 }}
        >
          Save & Close
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
