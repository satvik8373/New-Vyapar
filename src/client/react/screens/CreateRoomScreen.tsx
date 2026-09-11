import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { AppHeader, AppCard, AppButton } from '../components/common';
import { RoomService } from '../../firebase/roomService';
import { AuthService } from '../../firebase/authService';

interface CreateRoomScreenProps {
  onBack: () => void;
  onCreateSuccess: (roomCode: string, playerCount: number) => void;
  userName?: string;
  userAvatar?: string;
}

export const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({
  onBack,
  onCreateSuccess,
  userName = 'Trader',
  userAvatar = 'crown'
}) => {
  const [roomName, setRoomName] = useState(`${userName}'s Gujarat Trade`);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      let profile = AuthService.getInstance().getCurrentProfile();
      if (!profile) {
        profile = await AuthService.getInstance().signInGuest(userName, userAvatar);
      }
      const code = await RoomService.getInstance().createRoom(
        profile,
        roomName,
        playerCount
      );
      onCreateSuccess(code, playerCount);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setError(err.message || 'Failed to create room on Firebase.');
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
          title="Create Room"
          subtitle="Configure match rules and invite players"
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
        {/* Room Name */}
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
            Room Name
          </Typography>
          <TextField
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
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

        {/* Number of Players */}
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
            Number of Players
          </Typography>
          <ToggleButtonGroup
            value={playerCount}
            exclusive
            onChange={(_e, val) => val && setPlayerCount(val)}
            fullWidth
            sx={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '14px',
              p: 0.5,
              '& .MuiToggleButton-root': {
                border: 'none',
                color: '#64748b',
                borderRadius: '10px !important',
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 800,
                fontSize: '16px',
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: '#ffa502',
                  color: '#ffffff',
                  boxShadow: '0 3px 0 #e67e22'
                }
              }
            }}
          >
            <ToggleButton value={2}>2 Players</ToggleButton>
            <ToggleButton value={3}>3 Players</ToggleButton>
            <ToggleButton value={4}>4 Players</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Toggles */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    color: '#1e293b',
                    fontWeight: 700
                  }}
                >
                  Private Room
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    color: '#64748b'
                  }}
                >
                  Only players with room code can join
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={allowSpectators}
                onChange={(e) => setAllowSpectators(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    color: '#1e293b',
                    fontWeight: 700
                  }}
                >
                  Allow Spectators
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    color: '#64748b'
                  }}
                >
                  Friends can watch game live
                </Typography>
              </Box>
            }
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', fontWeight: 600 }}>
            {error}
          </Alert>
        )}

        {/* Submit */}
        <AppButton
          fullWidth
          variant="primary"
          size="large"
          onClick={handleCreate}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'CREATE ROOM'}
        </AppButton>
      </AppCard>
      <Box />
    </Box>
  );
};
