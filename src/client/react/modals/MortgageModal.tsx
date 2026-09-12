import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DomainIcon from '@mui/icons-material/Domain';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { GameEngine } from '../../game-engine/GameEngine';
import { BOARD_TILES, BoardTileStep } from '@shared/game-data/boardData';
import { CandyButton } from '../components/common/CandyButton';

interface MortgageModalProps {
  open: boolean;
  onClose: () => void;
}

export const MortgageModal: React.FC<MortgageModalProps> = ({ open, onClose }) => {
  const engine = GameEngine.getInstance();
  const state = engine.getState();
  const { players, mortgagedProperties, propertyHouses } = state;

  const heroPlayer = players.find((p) => p.isHuman) || players[0];
  const ownedSteps = heroPlayer?.ownedPropertyIds || [];

  const [filter, setFilter] = useState<'all' | 'active' | 'mortgaged'>('all');

  const ownedTiles: BoardTileStep[] = ownedSteps
    .map((step) => BOARD_TILES.find((t) => t.step === step))
    .filter((t): t is BoardTileStep => Boolean(t && t.price));

  const totalPotentialMortgageCash = ownedTiles
    .filter((t) => !mortgagedProperties.includes(t.step) && (propertyHouses[t.step] || 0) === 0)
    .reduce((sum, t) => sum + (t.price ? Math.round(t.price * 0.5) : 0), 0);

  const filteredTiles = ownedTiles.filter((t) => {
    const isMortgaged = mortgagedProperties.includes(t.step);
    if (filter === 'active') return !isMortgaged;
    if (filter === 'mortgaged') return isMortgaged;
    return true;
  });

  const isIndebted = (heroPlayer?.balance ?? 0) < 0;
  const debtAmount = Math.abs(heroPlayer?.balance ?? 0);

  const handleMortgage = (step: number) => {
    engine.mortgageProperty(step, heroPlayer?.id);
  };

  const handleUnmortgage = (step: number) => {
    engine.unmortgageProperty(step, heroPlayer?.id);
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
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', lineHeight: 1.2 }}>
              Mortgage & Asset Desk
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Mortgage properties for 50% cash • Redeem with 10% interest
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 1.5 }, mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Emergency Debt Alert if Balance is Negative */}
        {isIndebted && (
          <Alert
            severity="error"
            variant="filled"
            sx={{
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
            }}
          >
            ⚠️ In Debt: You owe ₹{debtAmount.toLocaleString()}! Mortgage your properties below to return to positive balance.
          </Alert>
        )}

        {/* Balance & Potential Summary Box */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            p: 1.5,
            backgroundColor: '#f1f5f9',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Your Cash Balance
            </Typography>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 900,
                color: isIndebted ? '#e11d48' : '#059669',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              {isIndebted ? '-' : ''}₹{Math.abs(heroPlayer?.balance ?? 0).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Available Mortgage Cash
            </Typography>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#2563eb',
                fontFamily: '"Plus Jakarta Sans", sans-serif'
              }}
            >
              +₹{totalPotentialMortgageCash.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`All (${ownedTiles.length})`}
            size="small"
            clickable
            color={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
          <Chip
            label={`Active (${ownedTiles.filter((t) => !mortgagedProperties.includes(t.step)).length})`}
            size="small"
            clickable
            color={filter === 'active' ? 'primary' : 'default'}
            onClick={() => setFilter('active')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
          <Chip
            label={`Mortgaged (${ownedTiles.filter((t) => mortgagedProperties.includes(t.step)).length})`}
            size="small"
            clickable
            color={filter === 'mortgaged' ? 'warning' : 'default'}
            onClick={() => setFilter('mortgaged')}
            sx={{ fontWeight: 800, fontSize: '11px' }}
          />
        </Box>

        {/* Property List */}
        {filteredTiles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DomainIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
            <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '14px' }}>
              {ownedTiles.length === 0
                ? 'You do not own any properties yet. Land on unowned cities to buy deeds!'
                : 'No properties match the selected filter.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
            {filteredTiles.map((tile) => {
              const isMortgaged = mortgagedProperties.includes(tile.step);
              const houses = propertyHouses[tile.step] || 0;
              const mortgageVal = tile.price ? Math.round(tile.price * 0.5) : 0;
              const unmortgageCost = tile.price ? Math.round(tile.price * 0.55) : 0;
              const canUnmortgage = (heroPlayer?.balance ?? 0) >= unmortgageCost;

              return (
                <Box
                  key={tile.step}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    borderRadius: '14px',
                    border: isMortgaged ? '1.5px dashed #cbd5e1' : '1px solid #e2e8f0',
                    backgroundColor: isMortgaged ? '#f8fafc' : '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    gap: 1
                  }}
                >
                  {/* Left: Color Bar & Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 38,
                        borderRadius: '6px',
                        backgroundColor: tile.color || '#64748b',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                        {tile.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '11px' }}>
                          Price: ₹{tile.price?.toLocaleString()}
                        </Typography>
                        {houses > 0 && (
                          <Chip
                            label={houses === 5 ? 'Hotel' : `${houses} House${houses > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ height: 18, fontSize: '9.5px', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534' }}
                          />
                        )}
                        {isMortgaged && (
                          <Chip
                            label="MORTGAGED"
                            size="small"
                            sx={{ height: 18, fontSize: '9px', fontWeight: 900, backgroundColor: '#fee2e2', color: '#991b1b' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Right: Actions */}
                  <Box sx={{ flexShrink: 0 }}>
                    {isMortgaged ? (
                      <CandyButton
                        variant="azure"
                        size="sm"
                        disabled={!canUnmortgage}
                        onClick={() => handleUnmortgage(tile.step)}
                      >
                        <LockOpenIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        Redeem (-₹{unmortgageCost.toLocaleString()})
                      </CandyButton>
                    ) : houses > 0 ? (
                      <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800, fontSize: '11px', display: 'block', textAlign: 'right' }}>
                        Sell buildings first
                      </Typography>
                    ) : (
                      <CandyButton
                        variant="glass"
                        size="sm"
                        onClick={() => handleMortgage(tile.step)}
                      >
                        <LockIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        Mortgage (+₹{mortgageVal.toLocaleString()})
                      </CandyButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
