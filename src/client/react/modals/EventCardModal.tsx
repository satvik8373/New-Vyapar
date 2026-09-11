import React from 'react';
import { Dialog, DialogContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { MoneyDisplay } from '../components/common/MoneyDisplay';
import { CandyButton } from '../components/common/CandyButton';
import { CandyPill } from '../components/common/CandyPill';
import { CandyCard } from '../components/common/CandyCard';

interface EventCardModalProps {
  open: boolean;
  title: string;
  description: string;
  amount: number;
  isReward: boolean;
  onClose: () => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({
  open,
  title,
  description,
  amount,
  isReward,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.22)',
          p: 1.5,
          textAlign: 'center'
        }
      }}
    >
      <DialogContent sx={{ p: 1.5 }}>
        {/* Category Pill */}
        <CandyPill
          variant={isReward ? 'mint' : 'berry'}
          size="sm"
          dot
          pulse
          style={{ marginBottom: '14px' }}
        >
          {isReward ? 'COMMERCIAL OPPORTUNITY' : 'FINANCIAL ASSESSMENT'}
        </CandyPill>

        {/* Icon Badge */}
        <Box
          sx={{
            width: 52,
            height: 52,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '16px',
            background: isReward
              ? 'linear-gradient(180deg, #34d399 0%, #10b981 100%)'
              : 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: isReward
              ? '0 3px 0 #059669, 0 8px 20px rgba(16, 185, 129, 0.35)'
              : '0 3px 0 #e11d48, 0 8px 20px rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >
          {isReward ? (
            <TrendingUpIcon sx={{ fontSize: 28 }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 28 }} />
          )}
        </Box>

        <Typography
          sx={{
            fontWeight: 850,
            color: '#0f172a',
            fontSize: '18px',
            letterSpacing: '-0.02em',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            mb: 0.8
          }}
        >
          {title}
        </Typography>

        <Typography sx={{ color: '#64748b', fontSize: '13px', lineHeight: 1.45, mb: 2 }}>
          {description}
        </Typography>

        <CandyCard
          accent={isReward ? 'mint' : 'berry'}
          accentPosition="top"
          padding="sm"
          style={{
            backgroundColor: '#f8fafc',
            marginBottom: '18px',
            borderRadius: '14px'
          }}
        >
          <Typography sx={{ color: '#64748b', display: 'block', mb: 0.4, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
            {isReward ? 'Payout from Central Bank:' : 'Assessment to State Treasury:'}
          </Typography>
          <MoneyDisplay
            amount={amount}
            showPrefix
            positiveColor="#047857"
            negativeColor="#be123c"
            sx={{ fontSize: '22px', fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}
          />
        </CandyCard>

        <CandyButton
          fullWidth
          variant={isReward ? 'mint' : 'primary'}
          size="lg"
          onClick={onClose}
        >
          Acknowledge & Continue
        </CandyButton>
      </DialogContent>
    </Dialog>
  );
};
