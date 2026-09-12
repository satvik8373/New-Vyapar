import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import KeyIcon from '@mui/icons-material/Key';
import GavelIcon from '@mui/icons-material/Gavel';
import { CHANCE_CARDS, ChanceCard } from '../../game-engine/GameEngine';

interface ChanceDeckModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChanceDeckModal: React.FC<ChanceDeckModalProps> = ({ open, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'rewards' | 'assessments'>('all');

  const filteredCards = CHANCE_CARDS.filter((card) => {
    if (filter === 'rewards') return card.isReward;
    if (filter === 'assessments') return !card.isReward;
    return true;
  });

  const getCardIcon = (card: ChanceCard) => {
    if (card.isGetOutOfJailFree) return <KeyIcon sx={{ fontSize: 20, color: '#f59e0b' }} />;
    if (card.isGoToJail) return <GavelIcon sx={{ fontSize: 20, color: '#ef4444' }} />;
    if (card.moveToTile !== undefined) return <FlightTakeoffIcon sx={{ fontSize: 20, color: '#3b82f6' }} />;
    if (card.isReward) return <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />;
    return <TrendingDownIcon sx={{ fontSize: 20, color: '#f43f5e' }} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.28)',
          p: { xs: 1.5, sm: 2 },
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          pb: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', lineHeight: 1.2 }}>
              Gujarat Chance Deck (નસીબ પત્તા)
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Commercial fortunes, state bounties, tariffs & express voyages
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 1.5 }, mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`All Deck (${CHANCE_CARDS.length})`}
            size="small"
            clickable
            color={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
          <Chip
            label={`Opportunities (${CHANCE_CARDS.filter((c) => c.isReward).length})`}
            size="small"
            clickable
            color={filter === 'rewards' ? 'success' : 'default'}
            onClick={() => setFilter('rewards')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
          <Chip
            label={`Assessments (${CHANCE_CARDS.filter((c) => !c.isReward).length})`}
            size="small"
            clickable
            color={filter === 'assessments' ? 'error' : 'default'}
            onClick={() => setFilter('assessments')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
        </Box>

        {/* Card Grid List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
          {filteredCards.map((card) => (
            <Box
              key={card.id}
              sx={{
                p: 1.4,
                borderRadius: '14px',
                border: card.isReward ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                backgroundColor: card.isReward ? '#f0fdf4' : '#fff1f2',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: card.isReward ? '#dcfce7' : '#ffe4e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getCardIcon(card)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 850, fontSize: '13.5px', color: '#0f172a' }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '11.5px', fontWeight: 600, mt: 0.2 }}>
                    {card.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                {card.amount !== undefined && (
                  <Chip
                    label={`${card.amount > 0 ? '+' : ''}₹${card.amount.toLocaleString()}`}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      fontSize: '11.5px',
                      backgroundColor: card.amount > 0 ? '#10b981' : '#f43f5e',
                      color: '#ffffff'
                    }}
                  />
                )}
                {card.moveToTile !== undefined && (
                  <Chip
                    label={`Advance`}
                    size="small"
                    sx={{ fontWeight: 900, fontSize: '11px', backgroundColor: '#3b82f6', color: '#ffffff' }}
                  />
                )}
                {card.isGetOutOfJailFree && (
                  <Chip
                    label="Free Bail"
                    size="small"
                    sx={{ fontWeight: 900, fontSize: '11px', backgroundColor: '#f59e0b', color: '#ffffff' }}
                  />
                )}
                {card.payEachPlayer !== undefined && (
                  <Chip
                    label={`${card.payEachPlayer > 0 ? '+' : ''}₹${card.payEachPlayer}/player`}
                    size="small"
                    sx={{ fontWeight: 900, fontSize: '10.5px', backgroundColor: card.payEachPlayer > 0 ? '#10b981' : '#f43f5e', color: '#ffffff' }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
