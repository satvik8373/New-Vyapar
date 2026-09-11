import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  DialogContentText
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import { CandyButton } from '../components/common/CandyButton';
import { SoundEffects } from '../../audio/SoundEffects';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onLeaveGame: () => void;
  onLogout?: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  onOpenHelp,
  onLeaveGame,
  onLogout
}) => {
  const [sound, setSound] = useState(() => !SoundEffects.getInstance().getIsMuted());
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    return SoundEffects.getInstance().subscribe((isMuted) => {
      setSound(!isMuted);
    });
  }, []);

  const handleToggleSound = (enabled: boolean) => {
    setSound(enabled);
    SoundEffects.getInstance().setMuted(!enabled);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.22)',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '20px',
            p: 1.5
          }
        }}
      >
        <DialogTitle
          sx={{
            color: '#0f172a',
            fontWeight: 850,
            textAlign: 'center',
            fontSize: '18px',
            letterSpacing: '-0.02em',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
          }}
        >
          Game Settings
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Audio Sound Effects */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {sound ? (
                <VolumeUpIcon sx={{ color: '#059669', fontSize: 22 }} />
              ) : (
                <VolumeOffIcon sx={{ color: '#94a3b8', fontSize: 22 }} />
              )}
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '13px' }}>
                  Game Audio & Sound
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                  {sound ? 'Dice rolls, cars & board effects active' : 'All sounds muted'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={sound}
              onChange={(e) => handleToggleSound(e.target.checked)}
              color="primary"
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Help & Rules */}
          <CandyButton
            fullWidth
            variant="glass"
            size="sm"
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
          >
            <MenuBookIcon sx={{ fontSize: 16, mr: 0.8 }} />
            Help & Rules Guide
          </CandyButton>

          {/* Leave Match */}
          <CandyButton
            fullWidth
            variant="danger"
            size="sm"
            onClick={() => setConfirmLeave(true)}
          >
            <ExitToAppIcon sx={{ fontSize: 16, mr: 0.8 }} />
            Leave Match
          </CandyButton>

          {/* Optional Logout */}
          {onLogout && (
            <CandyButton
              fullWidth
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              <LogoutIcon sx={{ fontSize: 16, mr: 0.8 }} />
              Log Out
            </CandyButton>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <CandyButton
            fullWidth
            variant="primary"
            size="lg"
            onClick={onClose}
          >
            Resume Game
          </CandyButton>
        </DialogActions>
      </Dialog>

      {/* Leave Game Confirmation */}
      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: '#ffffff',
            borderRadius: '20px',
            border: '2px solid rgba(251, 113, 133, 0.4)',
            boxShadow: '0 20px 48px rgba(244, 63, 94, 0.15)',
            p: 1.5
          }
        }}
      >
        <DialogTitle sx={{ color: '#f43f5e', fontWeight: 850, fontSize: '18px' }}>
          Leave Match?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontWeight: 550, fontSize: '13px' }}>
            Are you sure you want to exit to the Main Menu? Your active game progress will be forfeited.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <CandyButton
            variant="glass"
            size="md"
            onClick={() => setConfirmLeave(false)}
          >
            Cancel
          </CandyButton>
          <CandyButton
            variant="danger"
            size="md"
            onClick={() => {
              setConfirmLeave(false);
              onClose();
              onLeaveGame();
            }}
          >
            Yes, Leave Game
          </CandyButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
