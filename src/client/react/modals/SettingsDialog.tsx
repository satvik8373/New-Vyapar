import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Divider,
  DialogContentText
} from '@mui/material';
import { CandyButton } from '../components/common/CandyButton';
import { usePWAInstall } from '../utils/usePWAInstall';

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
  const { canInstall, isInstalled, installApp } = usePWAInstall();
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [graphics, setGraphics] = useState('High');
  const [confirmLeave, setConfirmLeave] = useState(false);

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

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          <FormControlLabel
            control={<Switch checked={sound} onChange={(e) => setSound(e.target.checked)} color="primary" />}
            label={<Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>Sound Effects</Typography>}
            sx={{ justifyContent: 'space-between', ml: 0 }}
          />

          <FormControlLabel
            control={<Switch checked={music} onChange={(e) => setMusic(e.target.checked)} color="primary" />}
            label={<Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>Background Music</Typography>}
            sx={{ justifyContent: 'space-between', ml: 0 }}
          />

          <FormControlLabel
            control={<Switch checked={vibration} onChange={(e) => setVibration(e.target.checked)} color="primary" />}
            label={<Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>Haptic Vibration</Typography>}
            sx={{ justifyContent: 'space-between', ml: 0 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>Graphics Quality</Typography>
            <Select
              size="small"
              value={graphics}
              onChange={(e) => setGraphics(e.target.value)}
              sx={{
                background: '#f8fafc',
                borderRadius: '12px',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '12px',
                height: 36,
                '& fieldset': { borderColor: 'rgba(203, 213, 225, 0.8)' }
              }}
            >
              <MenuItem value="High">High (60 FPS)</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Battery Saver</MenuItem>
            </Select>
          </Box>

          {canInstall && (
            <CandyButton
              fullWidth
              variant="mint"
              size="sm"
              onClick={async () => {
                await installApp();
              }}
            >
              📲 Install App (Fullscreen)
            </CandyButton>
          )}

          {isInstalled && (
            <Box sx={{ textAlign: 'center', py: 0.4 }}>
              <Typography sx={{ fontSize: '11.5px', color: '#10b981', fontWeight: 800 }}>
                ✓ App Installed (Fullscreen Enabled)
              </Typography>
            </Box>
          )}

          {!isInstalled && !canInstall && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
            <Box sx={{ p: 1, backgroundColor: '#f1f5f9', borderRadius: '10px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                📲 To install on iOS: Tap <strong>Share</strong> ➔ <strong>'Add to Home Screen'</strong>
              </Typography>
            </Box>
          )}

          <CandyButton
            fullWidth
            variant="glass"
            size="sm"
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
          >
            Help & Rules Guide
          </CandyButton>

          <CandyButton
            fullWidth
            variant="danger"
            size="sm"
            onClick={() => setConfirmLeave(true)}
          >
            Leave Match
          </CandyButton>

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
