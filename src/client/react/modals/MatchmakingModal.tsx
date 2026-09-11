import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import GroupsIcon from '@mui/icons-material/Groups';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { QueueStatus } from '../../services/MultiplayerService';
import { CandyButton, CandyCard, CandyPill } from '../components/common';
import { PlayerAvatar } from '../components/common/PlayerAvatar';

interface MatchmakingModalProps {
  open: boolean;
  queueStatus: QueueStatus;
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  open,
  queueStatus,
  onCancel
}) => {
  const playerCount = queueStatus.players.length;
  const countdown = queueStatus.countdown;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.22)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          p: 1
        }
      }}
    >
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        {/* Animated Radar Pulse Container */}
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Radar ripple 1 */}
          <motion.div
            animate={{
              scale: [1, 1.8, 2.2],
              opacity: [0.6, 0.2, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.25)',
              pointerEvents: 'none'
            }}
          />

          {/* Radar ripple 2 */}
          <motion.div
            animate={{
              scale: [1, 1.6, 2],
              opacity: [0.5, 0.15, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              delay: 0.7,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: 'rgba(225, 29, 72, 0.2)',
              pointerEvents: 'none'
            }}
          />

          {/* Center Icon badge */}
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              position: 'relative',
              zIndex: 2
            }}
          >
            <GroupsIcon sx={{ fontSize: 36 }} />
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 800,
            color: '#0f172a',
            fontSize: '20px',
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          Finding Opponents...
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontWeight: 600,
            fontSize: '13px',
            mb: 2
          }}
        >
          Connecting to Gujarat Commerce online arena
        </Typography>

        {/* Players Found Pill */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <CandyPill variant="azure" size="sm" dot pulse>
            Players in queue: {playerCount} / 4
          </CandyPill>
        </Box>

        {/* 15-Second Bot Fill Notification */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '14px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            textAlign: 'left'
          }}
        >
          <SmartToyIcon sx={{ color: '#0284c7', fontSize: 26 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: 1.2
              }}
            >
              Bot Fill: {countdown}s remaining
            </Typography>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748b'
              }}
            >
              Bots will automatically fill remaining seats when timer expires
            </Typography>
          </Box>
        </Box>

        {/* Joined Players avatars preview */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3 }}>
          {queueStatus.players.map((p, idx) => (
            <motion.div
              key={p.id || idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <PlayerAvatar
                  avatar={p.avatar || 'crown'}
                  color={idx === 0 ? '#ff4757' : idx === 1 ? '#54a0ff' : '#10ac84'}
                  size={42}
                />
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155',
                    mt: 0.5,
                    maxWidth: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p.name}
                </Typography>
              </Box>
            </motion.div>
          ))}
          {Array.from({ length: Math.max(0, 4 - playerCount) }).map((_, i) => (
            <Box
              key={`empty_${i}`}
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              ?
            </Box>
          ))}
        </Box>

        <CandyButton
          variant="ghost"
          size="md"
          fullWidth
          icon={<CloseIcon />}
          onClick={onCancel}
        >
          Cancel Matchmaking
        </CandyButton>
      </DialogContent>
    </Dialog>
  );
};
