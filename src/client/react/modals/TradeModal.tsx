import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { CurrencyCoin } from '../components/common/CurrencyCoin';
import { GameEngine, GameEngineState, TradeProposal } from '../../game-engine/GameEngine';
import { BOARD_TILES, BoardTileStep, COLOR_HEX_MAP } from '@shared/game-data/boardData';
import { CandyButton } from '../components/common/CandyButton';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  onSendOffer?: (details: string) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ open, onClose, onSendOffer }) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((state) => setEngineState(state));
  }, [engine]);

  const { players } = engineState;
  const heroPlayer = players.find((p) => p.isHuman) || players[0];
  const otherPlayers = players.filter((p) => p.id !== heroPlayer?.id && !p.isBankrupt);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    otherPlayers[0]?.id || ''
  );

  useEffect(() => {
    if (!selectedPartnerId && otherPlayers.length > 0) {
      setSelectedPartnerId(otherPlayers[0].id);
    }
  }, [otherPlayers, selectedPartnerId]);

  const targetPartner = otherPlayers.find((p) => p.id === selectedPartnerId) || otherPlayers[0] || null;

  const [offerCash, setOfferCash] = useState(0);
  const [requestCash, setRequestCash] = useState(0);

  // Multi-select properties
  const [selectedMySteps, setSelectedMySteps] = useState<number[]>([]);
  const [selectedPartnerSteps, setSelectedPartnerSteps] = useState<number[]>([]);

  // Feedback banner (result of trade attempt)
  const [tradeResult, setTradeResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Clear selections when partner changes
  useEffect(() => {
    setSelectedMySteps([]);
    setSelectedPartnerSteps([]);
    setOfferCash(0);
    setRequestCash(0);
    setTradeResult(null);
  }, [selectedPartnerId]);

  if (!heroPlayer || !targetPartner) return null;

  const myProperties = BOARD_TILES.filter((t) => heroPlayer.ownedPropertyIds?.includes(t.step));
  const partnerProperties = BOARD_TILES.filter((t) => targetPartner.ownedPropertyIds?.includes(t.step));

  const toggleMyStep = (step: number) => {
    setTradeResult(null);
    setSelectedMySteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const togglePartnerStep = (step: number) => {
    setTradeResult(null);
    setSelectedPartnerSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  // Total valuation calculation
  const myOfferedVal =
    offerCash +
    selectedMySteps.reduce((sum, s) => {
      const tile = BOARD_TILES.find((t) => t.step === s);
      return sum + (tile?.price || 1000);
    }, 0);

  const partnerRequestedVal =
    requestCash +
    selectedPartnerSteps.reduce((sum, s) => {
      const tile = BOARD_TILES.find((t) => t.step === s);
      return sum + (tile?.price || 1000);
    }, 0);

  const handleSend = () => {
    const proposal: TradeProposal = {
      fromPlayerId: heroPlayer.id,
      toPlayerId: targetPartner.id,
      offeredPropertySteps: selectedMySteps,
      offeredCash: offerCash,
      requestedPropertySteps: selectedPartnerSteps,
      requestedCash: requestCash
    };

    const res = engine.executeTrade(proposal);
    if (res.success) {
      setTradeResult({ type: 'success', message: res.message });
      if (onSendOffer) onSendOffer(res.message);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setTradeResult({ type: 'error', message: res.message });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#ffffff',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px -10px rgba(15, 23, 42, 0.28)',
          width: 'min(580px, calc(100vw - 20px))',
          maxHeight: 'min(620px, calc(100vh - 24px))',
          m: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      {/* Top Banner: Candy Azure Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
          py: 1.2,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 850,
              fontSize: '16px',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
            }}
          >
            TRADE DESK (વેપાર સોદો)
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '11px',
              mt: 0.2
            }}
          >
            Propose Commercial Property & Capital Exchange
          </Typography>
        </Box>

        <CandyButton
          variant="glass"
          size="xs"
          onClick={onClose}
          style={{ minHeight: '28px', padding: '3px 8px', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </CandyButton>
      </Box>

      {/* Main Content Area */}
      <DialogContent
        sx={{
          p: 1.5,
          backgroundColor: '#f8fafc',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {/* Partner Selector Chips */}
        <Box>
          <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748b', mb: 0.5, textTransform: 'uppercase' }}>
            Select Trading Partner:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {otherPlayers.map((p) => (
              <Chip
                key={p.id}
                label={`${p.name} (₹${p.balance.toLocaleString()})`}
                onClick={() => setSelectedPartnerId(p.id)}
                sx={{
                  fontWeight: 800,
                  fontSize: '11.5px',
                  backgroundColor: selectedPartnerId === p.id ? '#7c3aed' : '#ffffff',
                  color: selectedPartnerId === p.id ? '#ffffff' : '#334155',
                  border: '1.5px solid',
                  borderColor: selectedPartnerId === p.id ? '#7c3aed' : '#cbd5e1',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedPartnerId === p.id ? '#6d28d9' : '#f1f5f9'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Feedback Alert */}
        {tradeResult && (
          <Alert
            severity={tradeResult.type}
            icon={tradeResult.type === 'success' ? <CheckCircleOutlineIcon fontSize="inherit" /> : undefined}
            sx={{ borderRadius: '12px', py: 0.5 }}
          >
            {tradeResult.message}
          </Alert>
        )}

        {/* Trade Exchange Columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 1,
            alignItems: 'start'
          }}
        >
          {/* Left: You Offer */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              p: 1.2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '11.5px', fontWeight: 850, color: '#0f172a' }}>
                YOU GIVE
              </Typography>
              <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                Total: ₹{myOfferedVal.toLocaleString()}
              </Typography>
            </Box>

            {/* Properties Owned List */}
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
              Select Properties to Offer:
            </Typography>
            {myProperties.length === 0 ? (
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', py: 1 }}>
                No properties owned
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: '160px', overflowY: 'auto' }}>
                {myProperties.map((tile) => {
                  const isSelected = selectedMySteps.includes(tile.step);
                  const accentHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#2563eb' : '#2563eb';
                  return (
                    <Box
                      key={tile.step}
                      onClick={() => toggleMyStep(tile.step)}
                      sx={{
                        p: '5px 8px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: isSelected ? accentHex : '#e2e8f0',
                        backgroundColor: isSelected ? `${accentHex}15` : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentHex }} />
                        <Typography sx={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                          {tile.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>
                        ₹{tile.price?.toLocaleString()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Cash Stepper */}
            <Box sx={{ mt: 'auto', pt: 0.5, borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', mb: 0.4 }}>
                Cash Offer (Bal: ₹{heroPlayer.balance.toLocaleString()}):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: '8px', p: '2px 6px', border: '1px solid #e2e8f0' }}>
                <IconButton size="small" onClick={() => setOfferCash((c) => Math.max(0, c - 200))}>
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CurrencyCoin size={12} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 850 }}>+{offerCash}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setOfferCash((c) => Math.min(heroPlayer.balance, c + 200))}>
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Middle Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 6 }}>
            <SwapHorizIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
          </Box>

          {/* Right: Partner Gives */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              p: 1.2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '11.5px', fontWeight: 850, color: '#0f172a' }}>
                YOU RECEIVE
              </Typography>
              <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                Total: ₹{partnerRequestedVal.toLocaleString()}
              </Typography>
            </Box>

            {/* Partner Properties List */}
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
              Select Properties to Request:
            </Typography>
            {partnerProperties.length === 0 ? (
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', py: 1 }}>
                Partner owns no properties
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: '160px', overflowY: 'auto' }}>
                {partnerProperties.map((tile) => {
                  const isSelected = selectedPartnerSteps.includes(tile.step);
                  const accentHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#2563eb' : '#2563eb';
                  return (
                    <Box
                      key={tile.step}
                      onClick={() => togglePartnerStep(tile.step)}
                      sx={{
                        p: '5px 8px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: isSelected ? accentHex : '#e2e8f0',
                        backgroundColor: isSelected ? `${accentHex}15` : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentHex }} />
                        <Typography sx={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                          {tile.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>
                        ₹{tile.price?.toLocaleString()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Requested Cash Stepper */}
            <Box sx={{ mt: 'auto', pt: 0.5, borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', mb: 0.4 }}>
                Cash Requested (Bal: ₹{targetPartner.balance.toLocaleString()}):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: '8px', p: '2px 6px', border: '1px solid #e2e8f0' }}>
                <IconButton size="small" onClick={() => setRequestCash((c) => Math.max(0, c - 200))}>
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CurrencyCoin size={12} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 850 }}>+{requestCash}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setRequestCash((c) => Math.min(targetPartner.balance, c + 200))}>
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: '10px 16px', gap: 1, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <CandyButton variant="glass" size="sm" onClick={onClose}>
          Cancel
        </CandyButton>
        <CandyButton
          fullWidth
          variant="azure"
          size="sm"
          disabled={selectedMySteps.length === 0 && offerCash === 0 && selectedPartnerSteps.length === 0 && requestCash === 0}
          onClick={handleSend}
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}
        >
          Propose Trade Deal
        </CandyButton>
      </DialogActions>
    </Dialog>
  );
};
