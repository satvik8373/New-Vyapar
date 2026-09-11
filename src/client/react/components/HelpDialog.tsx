import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import { CandyButton } from './common/CandyButton';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          color: '#0f172a',
          fontWeight: 850,
          fontSize: '18px',
          letterSpacing: '-0.02em'
        }}
      >
        Rules & Gameplay Guide
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#64748b',
            fontWeight: 550,
            mb: 2
          }}
        >
          Navo Vyapar is an authentic digital tabletop business board game inspired by Gujarat commerce.
        </Typography>

        <List>
          <ListItem alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <CasinoIcon sx={{ color: '#f59e0b', fontSize: 26 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#0f172a', fontWeight: 800 }}>Roll Dice & Move</Typography>}
              secondary={<Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#64748b', fontWeight: 500 }}>On your turn, roll the single 3D die (1–6). Your merchant token advances step-by-step around the board.</Typography>}
            />
          </ListItem>

          <Divider sx={{ my: 1, borderColor: 'rgba(241, 245, 249, 0.9)' }} />

          <ListItem alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <StorefrontIcon sx={{ color: '#10b981', fontSize: 26 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#0f172a', fontWeight: 800 }}>Buy Properties</Typography>}
              secondary={<Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#64748b', fontWeight: 500 }}>Landing on an unowned Gujarat estate allows you to purchase its title deed. Opponents landing on your sites pay you rent.</Typography>}
            />
          </ListItem>

          <Divider sx={{ my: 1, borderColor: 'rgba(241, 245, 249, 0.9)' }} />

          <ListItem alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <AccountBalanceIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#0f172a', fontWeight: 800 }}>Navo Bank Clearing</Typography>}
              secondary={<Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#64748b', fontWeight: 500 }}>Collect ₹1,500 every time you pass START (₹3,000 exact landing). Collect bank dividends or pay state taxes on financial tiles.</Typography>}
            />
          </ListItem>

          <Divider sx={{ my: 1, borderColor: 'rgba(241, 245, 249, 0.9)' }} />

          <ListItem alignItems="flex-start">
            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
              <PaymentsIcon sx={{ color: '#f43f5e', fontSize: 26 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#0f172a', fontWeight: 800 }}>Keyboard Shortcuts</Typography>}
              secondary={<Typography variant="body2" sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: '#64748b', fontWeight: 500 }}>Press <b>Space</b> to roll dice, <b>E</b> to end turn, <b>B</b> to Buy property, <b>P / Escape</b> to Pass.</Typography>}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <CandyButton
          onClick={onClose}
          variant="primary"
          size="md"
          style={{ paddingLeft: '32px', paddingRight: '32px' }}
        >
          Got It
        </CandyButton>
      </DialogActions>
    </Dialog>
  );
};
