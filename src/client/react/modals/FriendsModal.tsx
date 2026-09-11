import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  List,
  ListItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { AppButton } from '../components/common/AppButton';

interface FriendsModalProps {
  open: boolean;
  onClose: () => void;
}

const FRIENDS_LIST = [
  { id: '1', name: 'Rohan Patel', avatar: 'diamond', color: '#3b82f6', isOnline: true },
  { id: '2', name: 'Nilesh Shah', avatar: 'leaf', color: '#10b981', isOnline: true },
  { id: '3', name: 'Aman Desai', avatar: 'star', color: '#f59e0b', isOnline: false }
];

export const FriendsModal: React.FC<FriendsModalProps> = ({ open, onClose }) => {
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const handleInvite = (id: string) => {
    setInvited(prev => ({ ...prev, [id]: true }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          p: 1.5
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Friends (3)
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#e2e8f0' }}>
        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, mb: 1.5, display: 'block', letterSpacing: '0.04em' }}>
          ONLINE FRIENDS (2)
        </Typography>

        <List sx={{ p: 0 }}>
          {FRIENDS_LIST.map((f) => (
            <ListItem
              key={f.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.2,
                mb: 1.2,
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PlayerAvatar avatar={f.avatar} color={f.color} size={36} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    {f.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: f.isOnline ? '#10b981' : '#94a3b8'
                      }}
                    />
                    <Typography variant="caption" sx={{ color: f.isOnline ? '#10b981' : '#94a3b8', fontWeight: 700, fontSize: '10px' }}>
                      {f.isOnline ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {f.isOnline && (
                <AppButton
                  size="small"
                  variant={invited[f.id] ? 'neutral' : 'outlined'}
                  disabled={invited[f.id]}
                  onClick={() => handleInvite(f.id)}
                >
                  {invited[f.id] ? 'Invited' : 'Invite'}
                </AppButton>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <AppButton
          fullWidth
          variant="danger"
          size="medium"
          startIcon={<PersonAddIcon />}
          onClick={onClose}
        >
          Add Friend
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

