import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ShareIcon from '@mui/icons-material/Share';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppHeader, AppCard, AppBadge, AppButton } from '../components/common';
import { RoomService, RoomDoc, RoomPlayer } from '../../firebase/roomService';
import { AuthService } from '../../firebase/authService';

interface LobbyScreenProps {
  roomCode: string;
  onBack: () => void;
  onStartGame: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ roomCode, onBack, onStartGame }) => {
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const hasStartedRef = React.useRef(false);

  const currentProfile = AuthService.getInstance().getCurrentProfile();
  const currentUid = currentProfile?.uid || '';

  useEffect(() => {
    setLoading(true);

    const checkStatus = (updatedRoom: RoomDoc | null) => {
      if (!updatedRoom) {
        setError('Room closed or expired.');
        return;
      }
      setRoom(updatedRoom);

      // When host starts the game, all players transition to GameScreen
      if (updatedRoom.status === 'PLAYING') {
        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          onStartGame();
        }
      }
    };

    // 1. Live WebSocket Realtime Database Listener
    const unsubscribe = RoomService.getInstance().listenRoom(
      roomCode,
      (updatedRoom) => {
        setLoading(false);
        checkStatus(updatedRoom);
      },
      (err) => {
        setLoading(false);
        console.warn('Lobby RTDB listener error:', err);
      }
    );

    // 2. Immediate fetch upon mounting
    RoomService.getInstance().getRoom(roomCode).then((r) => {
      setLoading(false);
      if (r) checkStatus(r);
    });

    // 3. Fallback Heartbeat Pulse (every 1.2s) to guarantee transition even on throttled mobile connections
    const intervalId = setInterval(async () => {
      const r = await RoomService.getInstance().getRoom(roomCode);
      if (r) {
        checkStatus(r);
      }
    }, 1200);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [roomCode, onStartGame]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Join my Gujarat Board Game room on Navo Vyapar! Room Code: ${roomCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Navo Vyapar Match', text }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const isHost = room?.hostUid === currentUid;
  const players: RoomPlayer[] = room?.players || [];
  const maxPlayers = room?.maxPlayers || 4;

  const handleStart = async () => {
    if (!isHost) return;
    setStarting(true);
    setError('');
    try {
      await RoomService.getInstance().startGame(roomCode, currentUid);
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        onStartGame();
      }
    } catch (e: any) {
      console.error('Failed to start game:', e);
      setError(e.message || 'Failed to start game.');
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    await RoomService.getInstance().leaveRoom(roomCode, currentUid);
    onBack();
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
      <Box sx={{ maxWidth: 520, width: '100%', mx: 'auto' }}>
        <AppHeader
          title="Online Match Lobby"
          subtitle="Real-Time Official Firebase Multiplayer"
          onBack={handleLeave}
          rightAction={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={copied ? 'Copied to clipboard!' : 'Click to Copy Code'}>
                <Box onClick={handleCopyCode} sx={{ cursor: 'pointer' }}>
                  <AppBadge
                    badgeVariant="primary"
                    icon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                    label={`Code: ${roomCode}`}
                    sx={{ height: 36, px: 1.5, fontSize: '13px' }}
                  />
                </Box>
              </Tooltip>

              <Tooltip title="Share Invite">
                <IconButton
                  size="small"
                  onClick={handleShare}
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
      </Box>

      {/* Players List Container */}
      <Box sx={{ maxWidth: 520, width: '100%', mx: 'auto', my: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#64748b',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            REAL PLAYERS CONNECTED ({players.length} / {maxPlayers})
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              color: '#ffa502',
              fontWeight: 800
            }}
          >
            ● Live Synced
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={36} sx={{ color: '#ffa502' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Connected Real Players */}
            {players.map((player, idx) => {
              const isMe = player.uid === currentUid;
              return (
                <AppCard
                  key={player.uid}
                  padded={false}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    border: isMe ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    backgroundColor: isMe ? '#eff6ff' : '#ffffff',
                    borderRadius: '12px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PlayerAvatar
                      avatar={player.avatar}
                      color={player.color}
                      size={46}
                      isHost={player.isHost}
                    />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                            fontWeight: 800,
                            fontSize: '15px',
                            color: '#1e293b'
                          }}
                        >
                          {player.name}
                        </Typography>
                        {isMe && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                              bgcolor: '#3b82f6',
                              color: '#ffffff',
                              px: 0.8,
                              py: 0.1,
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '10px'
                            }}
                          >
                            YOU
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                          color: player.color,
                          fontWeight: 700
                        }}
                      >
                        {player.isHost ? '👑 Room Host • Player 1' : `Player ${idx + 1}`} ({player.colorName})
                      </Typography>
                    </Box>
                  </Box>

                  <AppBadge
                    badgeVariant="success"
                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                    label="Ready"
                  />
                </AppCard>
              );
            })}

            {/* Waiting Slots for Remaining Players */}
            {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
              <AppCard
                key={`empty_${i}`}
                padded={false}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.6,
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  opacity: 0.85
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: '2px dashed #94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}
                  >
                    <HourglassEmptyIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#64748b'
                      }}
                    >
                      Waiting for player to join...
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        color: '#94a3b8',
                        fontWeight: 600
                      }}
                    >
                      Share code "{roomCode}" with your friend
                    </Typography>
                  </Box>
                </Box>
              </AppCard>
            ))}
          </Box>
        )}

        {error && (
          <Typography
            sx={{
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'center',
              mt: 2
            }}
          >
            {error}
          </Typography>
        )}
      </Box>

      {/* Action Footer */}
      <Box sx={{ maxWidth: 520, width: '100%', mx: 'auto' }}>
        {isHost ? (
          <AppButton
            fullWidth
            variant="primary"
            size="large"
            disabled={starting}
            startIcon={starting ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : <PlayArrowIcon sx={{ fontSize: 26 }} />}
            onClick={handleStart}
          >
            {starting ? 'STARTING MATCH...' : players.length > 1 ? 'START MULTIPLAYER MATCH' : 'START GAME NOW'}
          </AppButton>
        ) : (
          <AppCard
            padded={false}
            sx={{
              p: 2.5,
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.12s ease',
              '&:hover': {
                transform: 'scale(1.01)'
              }
            }}
            onClick={async () => {
              const r = await RoomService.getInstance().getRoom(roomCode);
              if (r && r.status === 'PLAYING') {
                onStartGame();
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: '#3b82f6' }} />
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#1e293b'
                }}
              >
                Waiting for Room Host to start the game...
              </Typography>
            </Box>
          </AppCard>
        )}
      </Box>
    </Box>
  );
};
