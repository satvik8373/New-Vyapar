import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CurrencyCoin } from '../components/common/CurrencyCoin';
import { GreenHouseIcon, RedHotelIcon } from '../components/common/HouseHotelIcons';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { BOARD_TILES, BoardTileStep, COLOR_HEX_MAP } from '@shared/game-data/boardData';
import { CandyButton } from '../components/common/CandyButton';
import { CandyPill } from '../components/common/CandyPill';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  onSendOffer: (details: string) => void;
}

/** Mini Title Deed Card Component mirroring the classic board title deed */
const MiniTitleDeed: React.FC<{ tile: BoardTileStep; compact?: boolean }> = ({ tile, compact = false }) => {
  const accentHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#2563eb' : '#2563eb';
  const price = tile.price || 1500;
  const baseRent = Math.round(price * 0.1);
  const rent1 = baseRent * 3;
  const rentHotel = baseRent * 40;

  return (
    <Box
      sx={{
        width: { xs: 112, sm: compact ? 125 : 138 },
        backgroundColor: '#ffffff',
        border: '1.5px solid rgba(226, 232, 240, 0.95)',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        textAlign: 'center',
        flexShrink: 0
      }}
    >
      {/* Colored City Banner */}
      <Box
        sx={{
          backgroundColor: accentHex,
          color: '#ffffff',
          py: 0.5,
          px: 0.5,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Typography
          sx={{
            fontSize: '10.5px',
            fontWeight: 850,
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            fontFamily: '"Plus Jakarta Sans", sans-serif'
          }}
        >
          {tile.name.toUpperCase()}
        </Typography>
      </Box>

      {/* Deed Body */}
      <Box sx={{ p: '5px 8px', backgroundColor: '#fafbfc' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.4, mb: 0.2 }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 850, color: '#0f172a' }}>RENT</Typography>
          <CurrencyCoin size={10} />
          <Typography sx={{ fontSize: '10.5px', fontWeight: 850, color: '#0f172a' }}>{baseRent}</Typography>
        </Box>

        <Typography sx={{ fontSize: '7.5px', color: '#64748b', fontStyle: 'italic', lineHeight: 1.1, mb: 0.5 }}>
          Rent doubled on set
        </Typography>

        {/* Mini Schedule */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', pt: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
            <GreenHouseIcon size={10} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 750 }}>
              <CurrencyCoin size={8} />
              <span>{rent1}</span>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
            <RedHotelIcon size={10} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontWeight: 800, color: '#f43f5e' }}>
              <CurrencyCoin size={8} />
              <span>{rentHotel}</span>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const TradeModal: React.FC<TradeModalProps> = ({ open, onClose, onSendOffer }) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((state) => setEngineState(state));
  }, [engine]);

  const { players, activePlayerIndex } = engineState;
  const activePlayer = players[activePlayerIndex];
  const otherPlayers = players.filter((p) => p.id !== activePlayer?.id && !p.isBankrupt);

  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(0);
  const targetPartner = otherPlayers[selectedPartnerIndex] || otherPlayers[0] || null;

  const [offerCash, setOfferCash] = useState(500);
  const [requestCash, setRequestCash] = useState(0);

  // Property selections
  const myProperties = activePlayer
    ? BOARD_TILES.filter((t) => activePlayer.ownedPropertyIds?.includes(t.step))
    : [];
  const partnerProperties = targetPartner
    ? BOARD_TILES.filter((t) => targetPartner.ownedPropertyIds?.includes(t.step))
    : [];

  const [selectedMyPropStep, setSelectedMyPropStep] = useState<number | null>(null);
  const [selectedPartnerPropStep, setSelectedPartnerPropStep] = useState<number | null>(null);

  // Set default selection when available
  useEffect(() => {
    if (myProperties.length > 0 && selectedMyPropStep === null) {
      setSelectedMyPropStep(myProperties[0].step);
    }
    if (partnerProperties.length > 0 && selectedPartnerPropStep === null) {
      setSelectedPartnerPropStep(partnerProperties[0].step);
    }
  }, [myProperties, partnerProperties, selectedMyPropStep, selectedPartnerPropStep]);

  if (!activePlayer || !targetPartner) return null;

  const myDeed = myProperties.find((t) => t.step === selectedMyPropStep) || myProperties[0] || BOARD_TILES[1];
  const partnerDeed = partnerProperties.find((t) => t.step === selectedPartnerPropStep) || partnerProperties[0] || BOARD_TILES[3];

  const handleSend = () => {
    const offerText = `Offered ${myDeed.name} + ₹${offerCash} for ${partnerDeed.name}${requestCash > 0 ? ` + ₹${requestCash}` : ''}`;
    onSendOffer(offerText);
    onClose();
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
          borderRadius: '12px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.25)',
          width: 'min(560px, calc(100vw - 20px))',
          maxHeight: 'min(375px, calc(100vh - 16px))',
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
          background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
          py: 0.8,
          px: 1.8,
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
              fontSize: '15px',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
            }}
          >
            TRADE DESK
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '10px',
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
          style={{ minHeight: '26px', padding: '3px 6px', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </CandyButton>
      </Box>

      {/* Main Content Area */}
      <DialogContent sx={{ p: 1.2, backgroundColor: '#f8fafc', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Two Player Tags: Active Player (Left) vs Target Player (Right) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Active Player Tag */}
          <CandyPill
            variant="berry"
            size="sm"
            style={{ fontWeight: 800, padding: '3px 10px' }}
          >
            {activePlayer.name} (You)
          </CandyPill>

          <SwapHorizIcon sx={{ color: '#3b82f6', fontSize: 22 }} />

          {/* Target Player Tag */}
          <CandyPill
            variant="honey"
            size="sm"
            style={{ fontWeight: 800, padding: '3px 10px' }}
          >
            {targetPartner.name} (Partner)
          </CandyPill>
        </Box>

        {/* Title Deeds Exchange Stage */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 1 }}>
          {/* Left: Your Offered Title Deed */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              YOU GIVE
            </Typography>

            <MiniTitleDeed tile={myDeed} />

            {/* Cash offer adjust row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                borderRadius: '8px',
                p: '2px 6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <IconButton
                size="small"
                onClick={() => setOfferCash((c) => Math.max(0, c - 100))}
                sx={{ p: 0.2 }}
              >
                <RemoveIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <CurrencyCoin size={11} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800, minWidth: '38px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                +{offerCash}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOfferCash((c) => Math.min(activePlayer.balance, c + 100))}
                sx={{ p: 0.2 }}
              >
                <AddIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Box>

          <SwapHorizIcon sx={{ color: '#3b82f6', fontSize: 24 }} />

          {/* Right: Partner's Title Deed */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              YOU RECEIVE
            </Typography>

            <MiniTitleDeed tile={partnerDeed} />

            {/* Cash requested adjust row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                backgroundColor: '#ffffff',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                borderRadius: '8px',
                p: '2px 6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <IconButton
                size="small"
                onClick={() => setRequestCash((c) => Math.max(0, c - 100))}
                sx={{ p: 0.2 }}
              >
                <RemoveIcon sx={{ fontSize: 13 }} />
              </IconButton>
              <CurrencyCoin size={11} />
              <Typography sx={{ fontSize: '11px', fontWeight: 800, minWidth: '38px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                +{requestCash}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setRequestCash((c) => Math.min(targetPartner.balance, c + 100))}
                sx={{ p: 0.2 }}
              >
                <AddIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: '8px 14px', gap: 1, backgroundColor: '#ffffff', borderTop: '1px solid rgba(226, 232, 240, 0.8)', flexShrink: 0 }}>
        <CandyButton variant="glass" size="sm" onClick={onClose}>
          Decline
        </CandyButton>
        <CandyButton fullWidth variant="azure" size="sm" onClick={handleSend}>
          Send Trade Offer
        </CandyButton>
      </DialogActions>
    </Dialog>
  );
};
