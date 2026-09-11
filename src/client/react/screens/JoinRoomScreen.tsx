import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppHeader, AppCard, AppButton } from '../components/common';
import { RoomService } from '../../firebase/roomService';
import { AuthService } from '../../firebase/authService';

interface JoinRoomScreenProps {
  onBack: () => void;
  onJoinSuccess: (roomCode: string, playerName: string, avatar: string) => void;
  initialName?: string;
  initialAvatar?: string;
}

const AVATARS = [
  { id: 'crown', color: '#ff4757', name: 'Royal' },
  { id: 'diamond', color: '#54a0ff', name: 'Diamond' },
  { id: 'leaf', color: '#10ac84', name: 'Merchant' },
  { id: 'star', color: '#ffa502', name: 'Imperial' }
];

export const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  onBack,
  onJoinSuccess,
  initialName = 'Trader',
  initialAvatar = 'diamond'
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(initialName);
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setErrorMessage('Please enter a valid room code.');
      return;
    }
    if (!playerName.trim()) {
      setErrorMessage('Please enter your player name.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      let profile = AuthService.getInstance().getCurrentProfile();
      if (!profile) {
        profile = await AuthService.getInstance().signInGuest(playerName.trim(), selectedAvatar);
      } else {
        await AuthService.getInstance().updatePlayerDetails(playerName.trim(), selectedAvatar).catch(() => {});
        profile = AuthService.getInstance().getCurrentProfile()!;
      }

      await RoomService.getInstance().joinRoom(code, profile);
      onJoinSuccess(code, playerName.trim(), selectedAvatar);
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setErrorMessage(err.message || 'Unable to join room. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f8fafc',
        p: { xs: 2.5, sm: 4 },
        overflowY: 'auto'
      }}
    >
      {/* Reusable Header */}
      <Box sx={{ maxWidth: 460, width: '100%', mx: 'auto' }}>
        <AppHeader
          title="Join Room"
          subtitle="Enter a 5-letter room code to play"
          onBack={onBack}
        />
      </Box>

      {/* Reusable Form Card */}
      <AppCard
        sx={{
          maxWidth: 460,
          width: '100%',
          mx: 'auto',
          my: 'auto',
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: '14px', fontWeight: 600 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Enter Room Code */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#1e293b',
              fontWeight: 800,
              mb: 1
            }}
          >
            Enter Room Code
          </Typography>
          <TextField
            fullWidth
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="e.g. A7K92"
            variant="outlined"
            inputProps={{
              style: {
                textAlign: 'center',
                letterSpacing: '6px',
                fontSize: '22px',
                fontWeight: 900,
                color: '#ffa502',
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
              },
              maxLength: 6
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                '& fieldset': { borderColor: '#cbd5e1' }
              }
            }}
          />
        </Box>

        {/* Player Name */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#1e293b',
              fontWeight: 800,
              mb: 1
            }}
          >
            Your Name
          </Typography>
          <TextField
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 600,
                '& fieldset': { borderColor: '#cbd5e1' }
              }
            }}
          />
        </Box>

        {/* Choose Avatar */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#1e293b',
              fontWeight: 800,
              mb: 1.5
            }}
          >
            Choose Avatar
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1 }}>
            {AVATARS.map((av) => {
              const isSelected = selectedAvatar === av.id;
              return (
                <Box
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.id)}
                  sx={{
                    p: 0.8,
                    borderRadius: '18px',
                    border: isSelected ? `3px solid ${av.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 4px 12px ${av.color}30` : 'none'
                  }}
                >
                  <PlayerAvatar avatar={av.id} color={av.color} size={46} />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Submit */}
        <AppButton
          fullWidth
          variant="secondary"
          size="large"
          onClick={handleJoin}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'JOIN GAME'}
        </AppButton>
      </AppCard>
      <Box />
    </Box>
  );
};
