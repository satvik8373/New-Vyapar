import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { AuthService } from '../../firebase/authService';

export interface ChatMessage {
  id: string;
  sender: string;
  color: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Match System', color: '#64748b', text: 'Welcome to the Gujarat Business Board. Best of trade!', time: 'Now', isSelf: false }
];

const QUICK_REACTIONS = ['Good Luck!', 'GG', 'Well Played', 'Nice Move', 'Trade?'];

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({ open, onClose }) => {
  const currentProfile = AuthService.getInstance().getCurrentProfile();
  const myName = currentProfile?.name || 'You';
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: myName,
      color: '#e11d48',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          background: '#ffffff',
          boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.08)',
          borderLeft: '2px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2.5
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1.5px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
          Game Chat
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages List */}
      <List sx={{ flex: 1, overflowY: 'auto', my: 2, pr: 0.5 }}>
        {messages.map((m) => (
          <ListItem
            key={m.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.isSelf ? 'flex-end' : 'flex-start',
              px: 0,
              py: 0.8
            }}
          >
            <Typography variant="caption" sx={{ color: m.color, fontWeight: 800, mb: 0.3 }}>
              {m.sender} • {m.time}
            </Typography>
            <Box
              sx={{
                maxWidth: '85%',
                p: 1.5,
                borderRadius: '16px',
                background: m.isSelf ? '#e11d48' : '#f8fafc',
                color: m.isSelf ? '#ffffff' : '#1e293b',
                boxShadow: m.isSelf ? '0 3px 0 #be123c' : '0 2px 4px rgba(0, 0, 0, 0.04)',
                border: m.isSelf ? 'none' : '1.5px solid #e2e8f0',
                fontSize: '14px',
                fontWeight: 600,
                wordBreak: 'break-word'
              }}
            >
              {m.text}
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Quick Reactions */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 0.5 }}>
        {QUICK_REACTIONS.map((label) => (
          <Chip
            key={label}
            label={label}
            clickable
            onClick={() => handleSend(label)}
            sx={{
              background: '#f1f5f9',
              color: '#334155',
              fontWeight: 700,
              fontSize: '12px',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              '&:hover': { background: '#e2e8f0', borderColor: '#94a3b8' }
            }}
          />
        ))}
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: '#f8fafc',
              borderRadius: '14px',
              color: '#1e293b',
              fontWeight: 600,
              '& fieldset': { borderColor: '#cbd5e1' },
              '&:hover fieldset': { borderColor: '#94a3b8' }
            }
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          sx={{
            background: '#ff4757',
            color: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 3px 0 #d63031',
            '&:hover': { background: '#e84118' },
            '&:active': { transform: 'translateY(2px)', boxShadow: '0 1px 0 #d63031' }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Drawer>
  );
};
