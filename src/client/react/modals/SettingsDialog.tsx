import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Switch,
  Divider,
  DialogContentText,
  Alert
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import { CandyButton } from '../components/common/CandyButton';
import { SoundEffects } from '../../audio/SoundEffects';
import { VoiceAnnouncer } from '../../services/VoiceAnnouncer';
import { GameEngine } from '../../game-engine/GameEngine';

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
  const engine = GameEngine.getInstance();
  const [sound, setSound] = useState(() => !SoundEffects.getInstance().getIsMuted());
  const [voiceEnabled, setVoiceEnabled] = useState(() => VoiceAnnouncer.getInstance().isEnabled());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const hasSavedMatch = engine.hasSavedGame();
  const savedSummary = engine.getSavedGameSummary();

  // Pause gameplay when Settings is open, resume when closed
  useEffect(() => {
    if (open) {
      engine.pauseGame();
    } else {
      engine.resumeGame();
    }
    return () => {
      if (open) {
        engine.resumeGame();
      }
    };
  }, [open, engine]);

  useEffect(() => {
    const unsubSound = SoundEffects.getInstance().subscribe((isMuted) => {
      setSound(!isMuted);
    });
    const unsubVoice = VoiceAnnouncer.getInstance().subscribe((enabled) => {
      setVoiceEnabled(enabled);
    });
    return () => {
      unsubSound();
      unsubVoice();
    };
  }, []);

  const handleToggleSound = (enabled: boolean) => {
    setSound(enabled);
    SoundEffects.getInstance().setMuted(!enabled);
  };

  const handleToggleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    VoiceAnnouncer.getInstance().setEnabled(enabled);
  };

  const handleSaveMatch = () => {
    const success = engine.saveGame();
    if (success) {
      SoundEffects.getInstance().playMoneyChime();
      setSaveToast('Match saved successfully to local storage!');
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  const handleLoadMatch = () => {
    const success = engine.loadGame();
    if (success) {
      SoundEffects.getInstance().playPurchaseJingle();
      onClose();
    }
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
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.25)',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '24px',
            p: 1.5
          }
        }}
      >
        <DialogTitle
          sx={{
            color: '#0f172a',
            fontWeight: 900,
            textAlign: 'center',
            fontSize: '19px',
            letterSpacing: '-0.02em',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            pb: 0.5
          }}
        >
          Options & Controls
        </DialogTitle>

        {/* Cartoon Candy Match Paused Banner */}
        <Box
          sx={{
            mx: { xs: 1.5, sm: 2 },
            mb: 0.8,
            py: 0.6,
            px: 1.2,
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1.5px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.8,
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.18)'
          }}
        >
          <PauseCircleFilledIcon sx={{ color: '#d97706', fontSize: 18 }} />
          <Typography
            sx={{
              color: '#92400e',
              fontWeight: 850,
              fontSize: '11.5px',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.01em'
            }}
          >
            Match Paused — Take your time!
          </Typography>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, px: 1 }}>
          {saveToast && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ borderRadius: '12px', fontWeight: 700, fontSize: '12px', py: 0.5 }}
            >
              {saveToast}
            </Alert>
          )}

          {/* 1. Audio Sound Effects */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              borderRadius: '14px',
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
                  Sound Effects
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                  {sound ? 'Dice, cars & chimes active' : 'All sounds muted'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={sound}
              onChange={(e) => handleToggleSound(e.target.checked)}
              color="primary"
            />
          </Box>

          {/* 2. Voice Announcer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {voiceEnabled ? (
                <RecordVoiceOverIcon sx={{ color: '#2563eb', fontSize: 22 }} />
              ) : (
                <VoiceOverOffIcon sx={{ color: '#94a3b8', fontSize: 22 }} />
              )}
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '13px' }}>
                  Live Voice Announcer
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                  {voiceEnabled ? 'Spoken commentary on turn events' : 'Speech announcer off'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={voiceEnabled}
              onChange={(e) => handleToggleVoice(e.target.checked)}
              color="primary"
            />
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* 3. Save & Load Game Buttons */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <CandyButton
              fullWidth
              variant="mint"
              size="sm"
              onClick={handleSaveMatch}
            >
              <SaveIcon sx={{ fontSize: 16, mr: 0.6 }} />
              Save Match
            </CandyButton>

            <CandyButton
              fullWidth
              variant="azure"
              size="sm"
              disabled={!hasSavedMatch}
              onClick={handleLoadMatch}
            >
              <FileDownloadIcon sx={{ fontSize: 16, mr: 0.6 }} />
              Load Saved
            </CandyButton>
          </Box>

          {hasSavedMatch && savedSummary && (
            <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', fontSize: '10.5px', fontWeight: 600 }}>
              Last saved: {savedSummary.date} • ₹{savedSummary.balance.toLocaleString()} • {savedSummary.propertiesCount} properties
            </Typography>
          )}

          <Divider sx={{ my: 0.5 }} />

          {/* 4. Help & Rules */}
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
            Vyapar Rulebook & Guide
          </CandyButton>

          {/* 5. Leave Match */}
          <CandyButton
            fullWidth
            variant="danger"
            size="sm"
            onClick={() => setConfirmLeave(true)}
          >
            <ExitToAppIcon sx={{ fontSize: 16, mr: 0.8 }} />
            Leave Match
          </CandyButton>

          {/* 6. Optional Logout */}
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

        <DialogActions sx={{ p: 1.5, pt: 0.5 }}>
          <CandyButton
            fullWidth
            variant="primary"
            size="lg"
            onClick={onClose}
          >
            Resume Match
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
            Are you sure you want to exit to the Main Menu? You can save your match first using the Save Match button.
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
            Yes, Leave Match
          </CandyButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
