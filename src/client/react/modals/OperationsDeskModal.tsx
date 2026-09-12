import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import SellIcon from '@mui/icons-material/Sell';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { GameEngine, GameEngineState, TradeProposal } from '../../game-engine/GameEngine';
import { BOARD_TILES, BoardTileStep, COLOR_HEX_MAP } from '@shared/game-data/boardData';
import { CandyButton } from '../components/common/CandyButton';
import { GreenHouseIcon, RedHotelIcon } from '../components/common/HouseHotelIcons';
import { CurrencyCoin } from '../components/common/CurrencyCoin';

export type OperationsTab = 'build' | 'sell' | 'mortgage' | 'redeem' | 'trade';

interface OperationsDeskModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: OperationsTab;
  initialTradePartnerId?: string;
  onSendTradeOffer?: (details: string) => void;
}

export const OperationsDeskModal: React.FC<OperationsDeskModalProps> = ({
  open,
  onClose,
  initialTab = 'build',
  initialTradePartnerId,
  onSendTradeOffer
}) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());
  const [activeTab, setActiveTab] = useState<OperationsTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    return engine.subscribe((state) => setEngineState(state));
  }, [engine]);

  const { players, propertyHouses, mortgagedProperties } = engineState;
  const heroPlayer = players.find((p) => p.isHuman) || players[0];
  const ownedSteps = heroPlayer?.ownedPropertyIds || [];

  const ownedTiles: BoardTileStep[] = ownedSteps
    .map((step) => BOARD_TILES.find((t) => t.step === step))
    .filter((t): t is BoardTileStep => Boolean(t && t.price));

  const isIndebted = (heroPlayer?.balance ?? 0) < 0;
  const debtAmount = Math.abs(heroPlayer?.balance ?? 0);

  // Group owned properties by color
  const colorGroups: Record<string, BoardTileStep[]> = {};
  ownedTiles.forEach((t) => {
    if (t.color) {
      if (!colorGroups[t.color]) colorGroups[t.color] = [];
      colorGroups[t.color].push(t);
    }
  });

  const groupEntries = Object.entries(colorGroups);

  // ── Trade Tab Logic & State ──
  const otherPlayers = players.filter((p) => p.id !== heroPlayer?.id && !p.isBankrupt);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialTradePartnerId || otherPlayers[0]?.id || ''
  );

  useEffect(() => {
    if (initialTradePartnerId && otherPlayers.some((p) => p.id === initialTradePartnerId)) {
      setSelectedPartnerId(initialTradePartnerId);
    } else if (!selectedPartnerId && otherPlayers.length > 0) {
      setSelectedPartnerId(otherPlayers[0].id);
    }
  }, [initialTradePartnerId, otherPlayers, selectedPartnerId]);

  const targetPartner = otherPlayers.find((p) => p.id === selectedPartnerId) || otherPlayers[0] || null;
  const [offerCash, setOfferCash] = useState(0);
  const [requestCash, setRequestCash] = useState(0);
  const [selectedMySteps, setSelectedMySteps] = useState<number[]>([]);
  const [selectedPartnerSteps, setSelectedPartnerSteps] = useState<number[]>([]);
  const [tradeResult, setTradeResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSelectedMySteps([]);
    setSelectedPartnerSteps([]);
    setOfferCash(0);
    setRequestCash(0);
    setTradeResult(null);
  }, [selectedPartnerId]);

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

  const partnerProperties = targetPartner
    ? BOARD_TILES.filter((t) => targetPartner.ownedPropertyIds?.includes(t.step))
    : [];

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

  const handleSendTrade = () => {
    if (!heroPlayer || !targetPartner) return;
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
      if (onSendTradeOffer) onSendTradeOffer(res.message);
      setTimeout(() => {
        setTradeResult(null);
        setSelectedMySteps([]);
        setSelectedPartnerSteps([]);
        setOfferCash(0);
        setRequestCash(0);
      }, 1600);
    } else {
      setTradeResult({ type: 'error', message: res.message });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: { xs: '18px', sm: '24px' },
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.28)',
          p: { xs: 1, sm: 1.6 },
          maxHeight: { xs: '94vh', sm: '88vh' },
          width: { xs: '96%', sm: '640px', md: '720px' },
          m: { xs: 1, sm: 2 }
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 0.5, sm: 0.8 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          pb: { xs: 0.8, sm: 1 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: '10px',
              background:
                activeTab === 'build'
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  : activeTab === 'sell'
                  ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                  : activeTab === 'mortgage'
                  ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                  : activeTab === 'redeem'
                  ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
            }}
          >
            {activeTab === 'build' && <DomainAddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            {activeTab === 'sell' && <SellIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            {activeTab === 'mortgage' && <AccountBalanceWalletIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            {activeTab === 'redeem' && <LockOpenIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            {activeTab === 'trade' && <HandshakeIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '14px', sm: '15px' },
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                lineHeight: 1.1,
                color: '#0f172a'
              }}
            >
              OPERATIONS DESK
            </Typography>
            <Typography sx={{ fontSize: { xs: '9.5px', sm: '10.5px' }, color: '#64748b', fontWeight: 600 }}>
              Balance:{' '}
              <span
                style={{
                  color: isIndebted ? '#dc2626' : '#16a34a',
                  fontWeight: 850
                }}
              >
                ₹{heroPlayer?.balance.toLocaleString()}
              </span>
            </Typography>
          </Box>
        </Box>

        <CandyButton
          variant="glass"
          size="xs"
          onClick={onClose}
          style={{ minHeight: '28px', padding: '3px 8px' }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </CandyButton>
      </DialogTitle>

      {/* Indebted Warning */}
      {isIndebted && (
        <Alert severity="error" sx={{ my: 0.8, borderRadius: '10px', py: 0.3, fontSize: '11px' }}>
          You owe <strong>₹{debtAmount.toLocaleString()}</strong> in debt! Liquidate or mortgage assets to clear debt.
        </Alert>
      )}

      {/* Tabs Row */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{
          minHeight: '34px',
          borderBottom: '1px solid #e2e8f0',
          mb: 0.8,
          '& .MuiTab-root': {
            minHeight: '34px',
            fontSize: { xs: '10.5px', sm: '11.5px' },
            fontWeight: 850,
            textTransform: 'none',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            py: 0.4,
            px: { xs: 0.5, sm: 1 },
            gap: 0.4
          }
        }}
      >
        <Tab icon={<DomainAddIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Build" value="build" />
        <Tab icon={<SellIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Sell" value="sell" />
        <Tab icon={<AccountBalanceWalletIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Mortgage" value="mortgage" />
        <Tab icon={<LockOpenIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Redeem" value="redeem" />
        <Tab icon={<HandshakeIcon sx={{ fontSize: 13 }} />} iconPosition="start" label="Trade" value="trade" />
      </Tabs>

      <DialogContent sx={{ p: { xs: 0.4, sm: 0.8 }, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* ── TAB 1: BUILD (HOUSES & HOTELS) ──────────────────────────────── */}
        {activeTab === 'build' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {Object.keys(colorGroups).length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 3,
                  px: 2,
                  background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '1.5px dashed #86efac'
                }}
              >
                <Typography sx={{ fontSize: '24px', mb: 0.5 }}>🎪✨</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '13px', color: '#0f172a', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  No Properties Owned Yet!
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748b', mt: 0.4, maxWidth: '280px', mx: 'auto', lineHeight: 1.4 }}>
                  Roll the dice and land on Gujarat cities to buy deeds and start building your candy business empire!
                </Typography>
              </Box>
            ) : (
              (() => {
                const groupEntries = Object.entries(colorGroups);
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {groupEntries.map(([color, tiles]) => {
                  const groupTiles = BOARD_TILES.filter(
                    (t) => t.color === color && t.type === 'PROPERTY'
                  );
                  const hasMonopoly = engine.ownsColorGroup(heroPlayer?.id || '', color);
                  const accentHex = COLOR_HEX_MAP[color] || '#2563eb';
                  const minHousesInGroup = Math.min(...tiles.map((t) => propertyHouses[t.step] || 0));

                  return (
                    <Box
                      key={color}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.6,
                        background: '#f8fafc',
                        borderRadius: '12px',
                        p: { xs: 0.6, sm: 0.8 },
                        border: `1px solid ${hasMonopoly ? `${accentHex}40` : '#e2e8f0'}`
                      }}
                    >
                      {/* Clean Group Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 0.6,
                          py: 0.3
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              backgroundColor: accentHex,
                              boxShadow: `0 0 0 2px ${accentHex}25`
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 850,
                              fontSize: { xs: '11px', sm: '12px' },
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              color: '#0f172a',
                              fontFamily: '"Plus Jakarta Sans", sans-serif'
                            }}
                          >
                            {color} Group
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '10px',
                              fontWeight: 750,
                              color: '#64748b'
                            }}
                          >
                            ({tiles.length}/{groupTiles.length} Owned)
                          </Typography>
                        </Box>

                        {hasMonopoly ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              px: 0.8,
                              py: 0.2,
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              borderRadius: '9999px'
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '9px',
                                fontWeight: 900,
                                color: '#b45309',
                                letterSpacing: '0.2px'
                              }}
                            >
                              👑 MONOPOLY READY
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              color: '#94a3b8'
                            }}
                          >
                            Need {groupTiles.length - tiles.length} more for Monopoly
                          </Typography>
                        )}
                      </Box>

                      {/* Grouped Cards Grid */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(auto-fill, minmax(130px, 1fr))',
                            sm: 'repeat(auto-fill, minmax(150px, 1fr))'
                          },
                          gap: { xs: 0.6, sm: 0.8 }
                        }}
                      >
                        {tiles.map((tile) => {
                          const houses = propertyHouses[tile.step] || 0;
                          const isMortgaged = mortgagedProperties.includes(tile.step);
                          const houseCost = engine.getHouseCost(tile.step);
                          const canAfford = (heroPlayer?.balance ?? 0) >= houseCost;
                          const isEven = houses <= minHousesInGroup;
                          const canBuild = hasMonopoly && !isMortgaged && houses < 5 && canAfford && isEven;

                          return (
                            <Box
                              key={tile.step}
                              sx={{
                                backgroundColor: '#ffffff',
                                borderRadius: '10px',
                                border: `1.5px solid ${isMortgaged ? '#f59e0b' : hasMonopoly ? accentHex : '#e2e8f0'}`,
                                boxShadow: hasMonopoly ? `0 2px 8px ${accentHex}18` : '0 1px 3px rgba(0,0,0,0.03)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                                }
                              }}
                            >
                              {/* Title Deed Color Header */}
                              <Box
                                sx={{
                                  backgroundColor: accentHex,
                                  background: `linear-gradient(180deg, ${accentHex} 0%, ${accentHex}ee 100%)`,
                                  px: 0.8,
                                  py: 0.45,
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: '10.5px',
                                    letterSpacing: '0.2px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textTransform: 'uppercase',
                                    lineHeight: 1
                                  }}
                                >
                                  {tile.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: '9.5px',
                                    letterSpacing: '0.1px',
                                    lineHeight: 1,
                                    opacity: 0.95
                                  }}
                                >
                                  ₹{tile.price}
                                </Typography>
                              </Box>

                              {/* Card Body */}
                              <Box sx={{ p: 0.8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {/* Group Badge & Set Indicator */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8.5px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accentHex }} />
                                    <span style={{ color: '#475569', fontWeight: 700, textTransform: 'capitalize' }}>{color}</span>
                                  </Box>
                                  {hasMonopoly ? (
                                    <span style={{ color: '#059669', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <span>👑</span> MONOPOLY
                                    </span>
                                  ) : (
                                    <span style={{ color: '#64748b', fontWeight: 700 }}>
                                      {tiles.length}/{groupTiles.length} Set
                                    </span>
                                  )}
                                </Box>

                                {/* 5 Development Slots: 4 Houses + 1 Grand Hotel */}
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: '3px',
                                    p: '4px',
                                    borderRadius: '6px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #f1f5f9'
                                  }}
                                >
                                  {[1, 2, 3, 4].map((slot) => {
                                    const filled = houses >= slot;
                                    return (
                                      <Box
                                        key={slot}
                                        sx={{
                                          height: '16px',
                                          borderRadius: '3px',
                                          background: filled
                                            ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
                                            : '#e2e8f0',
                                          boxShadow: filled ? '0 1px 2px rgba(5,150,105,0.35)' : 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#ffffff'
                                        }}
                                        title={filled ? `House ${slot} (Built)` : `House Slot ${slot}`}
                                      >
                                        {filled ? (
                                          <GreenHouseIcon size={8.5} />
                                        ) : (
                                          <Box sx={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                                        )}
                                      </Box>
                                    );
                                  })}
                                  {/* 5th Slot: Grand Vyapar Hotel */}
                                  {(() => {
                                    const hasHotel = houses === 5;
                                    return (
                                      <Box
                                        sx={{
                                          height: '16px',
                                          borderRadius: '3px',
                                          background: hasHotel
                                            ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)'
                                            : 'rgba(244, 63, 94, 0.08)',
                                          border: hasHotel ? 'none' : '1px dashed rgba(244, 63, 94, 0.45)',
                                          boxShadow: hasHotel ? '0 1px 3px rgba(225,29,72,0.4)' : 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: hasHotel ? '#ffffff' : '#f43f5e'
                                        }}
                                        title={hasHotel ? 'Grand Vyapar Hotel (Max Level)' : 'Hotel Slot (Level 5)'}
                                      >
                                        <RedHotelIcon size={hasHotel ? 9.5 : 8} />
                                      </Box>
                                    );
                                  })()}
                                </Box>

                                {/* Level & House Cost */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8.5px', color: '#64748b', fontWeight: 750, px: 0.1 }}>
                                  <span>
                                    {houses === 5
                                      ? '🌟 Lv 5 Hotel (Max)'
                                      : houses === 4
                                      ? 'Lv 4 • Next: 🏨 Hotel'
                                      : houses > 0
                                      ? `Lv ${houses} (${houses}/4 Houses)`
                                      : 'Lv 0 (No Buildings)'}
                                  </span>
                                  <span style={{ color: houses === 5 ? '#e11d48' : '#0f172a', fontWeight: 850 }}>
                                    {houses === 5 ? 'MAX' : `+₹${houseCost}`}
                                  </span>
                                </Box>

                                {/* Build Action Button / Status Badge */}
                                {houses === 5 ? (
                                  <Box
                                    sx={{
                                      py: 0.4,
                                      borderRadius: '6px',
                                      backgroundColor: '#ffe4e6',
                                      color: '#e11d48',
                                      fontSize: '8.5px',
                                      fontWeight: 900,
                                      textAlign: 'center'
                                    }}
                                  >
                                    MAX HOTEL 🌟
                                  </Box>
                                ) : isMortgaged ? (
                                  <Box
                                    sx={{
                                      py: 0.4,
                                      borderRadius: '6px',
                                      backgroundColor: '#fef3c7',
                                      color: '#b45309',
                                      fontSize: '8.5px',
                                      fontWeight: 900,
                                      textAlign: 'center'
                                    }}
                                  >
                                    MORTGAGED
                                  </Box>
                                ) : !hasMonopoly ? (
                                  <Box
                                    sx={{
                                      py: 0.4,
                                      borderRadius: '6px',
                                      backgroundColor: '#f1f5f9',
                                      color: '#64748b',
                                      fontSize: '8px',
                                      fontWeight: 850,
                                      textAlign: 'center',
                                      border: '1px dashed #cbd5e1'
                                    }}
                                  >
                                    NEED SET ({tiles.length}/{groupTiles.length})
                                  </Box>
                                ) : !canAfford ? (
                                  <Box
                                    sx={{
                                      py: 0.4,
                                      borderRadius: '6px',
                                      backgroundColor: '#fee2e2',
                                      color: '#b91c1c',
                                      fontSize: '8px',
                                      fontWeight: 850,
                                      textAlign: 'center'
                                    }}
                                  >
                                    NEED ₹{houseCost}
                                  </Box>
                                ) : !isEven ? (
                                  <Box
                                    sx={{
                                      py: 0.4,
                                      borderRadius: '6px',
                                      backgroundColor: '#fef3c7',
                                      color: '#92400e',
                                      fontSize: '8px',
                                      fontWeight: 850,
                                      textAlign: 'center'
                                    }}
                                  >
                                    BUILD EVENLY
                                  </Box>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => engine.buildHouse(tile.step, heroPlayer?.id)}
                                    style={{
                                      width: '100%',
                                      padding: '4px 2px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: houses === 4
                                        ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)'
                                        : 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                                      color: '#ffffff',
                                      fontSize: '9px',
                                      fontWeight: 900,
                                      cursor: 'pointer',
                                      boxShadow: houses === 4
                                        ? '0 2px 0 #be123c, 0 3px 6px rgba(225, 29, 72, 0.4)'
                                        : '0 2px 0 #047857, 0 3px 5px rgba(16, 185, 129, 0.35)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '3px',
                                      letterSpacing: '0.02em',
                                      transition: 'all 0.08s ease'
                                    }}
                                    onMouseDown={(e) => {
                                      e.currentTarget.style.transform = 'translateY(1.5px)';
                                      e.currentTarget.style.boxShadow = houses === 4
                                        ? '0 0.5px 0 #be123c'
                                        : '0 0.5px 0 #047857';
                                    }}
                                    onMouseUp={(e) => {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = houses === 4
                                        ? '0 2px 0 #be123c, 0 3px 6px rgba(225, 29, 72, 0.4)'
                                        : '0 2px 0 #047857, 0 3px 5px rgba(16, 185, 129, 0.35)';
                                    }}
                                  >
                                    {houses === 4 ? (
                                      <>
                                        <RedHotelIcon size={11} />
                                        <span>UPGRADE TO HOTEL (+₹{houseCost})</span>
                                      </>
                                    ) : (
                                      <>
                                        <AddIcon sx={{ fontSize: 11 }} />
                                        <span>BUILD (+₹{houseCost})</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
                  </Box>
                );
              })()
            )}
          </Box>
        )}

        {/* ── TAB 2: SELL (BUILDINGS & PROPERTIES) ────────────────────────── */}
        {activeTab === 'sell' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Section A: Sell Buildings */}
            <Typography sx={{ fontWeight: 850, fontSize: '13px', color: '#334155', px: 0.5 }}>
              1. SELL BUILDINGS BACK TO BANK (50% REFUND)
            </Typography>
            {ownedTiles.filter((t) => (propertyHouses[t.step] || 0) > 0).length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                  No houses or hotels currently built to sell.
                </Typography>
              </Box>
            ) : (
              ownedTiles
                .filter((t) => (propertyHouses[t.step] || 0) > 0)
                .map((tile) => {
                  const houses = propertyHouses[tile.step] || 0;
                  const houseCost = engine.getHouseCost(tile.step);
                  const refund = Math.round(houseCost * 0.5);
                  const groupTiles = tile.color
                    ? BOARD_TILES.filter((t) => t.color === tile.color && (t.type === 'PROPERTY' || t.type === 'PORT'))
                    : [tile];
                  const maxInGroup = Math.max(...groupTiles.map((t) => propertyHouses[t.step] || 0));
                  const canSellEvenly = houses >= maxInGroup;

                  return (
                    <Box
                      key={tile.step}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '8px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>{tile.name}</Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                          Has {houses === 5 ? 'Hotel' : `${houses} House${houses > 1 ? 's' : ''}`} • Refund: +₹{refund.toLocaleString()}
                        </Typography>
                      </Box>
                      <CandyButton
                        variant="honey"
                        size="xs"
                        disabled={!canSellEvenly}
                        onClick={() => engine.sellHouse(tile.step, heroPlayer?.id)}
                        icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                        style={{ minHeight: '30px', padding: '4px 10px', fontSize: '11px' }}
                      >
                        Sell 1 (+₹{refund})
                      </CandyButton>
                    </Box>
                  );
                })
            )}

            {/* Section B: Sell Property Deed to Bank */}
            <Typography sx={{ fontWeight: 850, fontSize: '13px', color: '#334155', px: 0.5, mt: 1 }}>
              2. LIQUIDATE PROPERTY TO BANK (50% VALUE)
            </Typography>
            {ownedTiles.filter((t) => (propertyHouses[t.step] || 0) === 0).length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                  No eligible properties to sell (sell buildings first).
                </Typography>
              </Box>
            ) : (
              ownedTiles
                .filter((t) => (propertyHouses[t.step] || 0) === 0)
                .map((tile) => {
                  const saleValue = Math.round((tile.price || 1000) * 0.5);
                  return (
                    <Box
                      key={tile.step}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '8px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>{tile.name}</Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                          Original: ₹{(tile.price || 0).toLocaleString()} • Payout: +₹{saleValue.toLocaleString()}
                        </Typography>
                      </Box>
                      <CandyButton
                        variant="danger"
                        size="xs"
                        onClick={() => engine.sellProperty(tile.step, heroPlayer?.id)}
                        style={{ minHeight: '30px', padding: '4px 10px', fontSize: '11px' }}
                      >
                        Sell to Bank (+₹{saleValue})
                      </CandyButton>
                    </Box>
                  );
                })
            )}
          </Box>
        )}

        {/* ── TAB 3: MORTGAGE ────────────────────────────────────────────── */}
        {activeTab === 'mortgage' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '11.5px', color: '#64748b', px: 0.5 }}>
              Mortgage unmortgaged properties for instant 50% cash. No rent is collected while mortgaged.
            </Typography>
            {ownedTiles.filter((t) => !mortgagedProperties.includes(t.step)).length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                  All your properties are currently mortgaged or you own no properties.
                </Typography>
              </Box>
            ) : (
              ownedTiles
                .filter((t) => !mortgagedProperties.includes(t.step))
                .map((tile) => {
                  const houses = propertyHouses[tile.step] || 0;
                  const mortgageCash = Math.round((tile.price || 1000) * 0.5);
                  const canMortgage = houses === 0;

                  return (
                    <Box
                      key={tile.step}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '8px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>{tile.name}</Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                          Mortgage Value: +₹{mortgageCash.toLocaleString()}
                        </Typography>
                      </Box>
                      <CandyButton
                        variant="azure"
                        size="xs"
                        disabled={!canMortgage}
                        onClick={() => engine.mortgageProperty(tile.step, heroPlayer?.id)}
                        style={{ minHeight: '30px', padding: '4px 12px', fontSize: '11px' }}
                      >
                        {houses > 0 ? 'Sell Houses First' : `Mortgage (+₹${mortgageCash})`}
                      </CandyButton>
                    </Box>
                  );
                })
            )}
          </Box>
        )}

        {/* ── TAB 4: REDEEM (UNMORTGAGE) ─────────────────────────────────── */}
        {activeTab === 'redeem' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '11.5px', color: '#64748b', px: 0.5 }}>
              Pay back mortgage loan + 10% statutory interest to re-enable rent collection on your properties.
            </Typography>
            {ownedTiles.filter((t) => mortgagedProperties.includes(t.step)).length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                  No properties currently mortgaged.
                </Typography>
              </Box>
            ) : (
              ownedTiles
                .filter((t) => mortgagedProperties.includes(t.step))
                .map((tile) => {
                  const redeemCost = Math.round((tile.price || 1000) * 0.55);
                  const canAfford = (heroPlayer?.balance ?? 0) >= redeemCost;

                  return (
                    <Box
                      key={tile.step}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '8px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>{tile.name}</Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                          Redemption Cost: -₹{redeemCost.toLocaleString()} (Principal + 10%)
                        </Typography>
                      </Box>
                      <CandyButton
                        variant="azure"
                        size="xs"
                        disabled={!canAfford}
                        onClick={() => engine.unmortgageProperty(tile.step, heroPlayer?.id)}
                        style={{ minHeight: '30px', padding: '4px 12px', fontSize: '11px' }}
                      >
                        {canAfford ? `Redeem (-₹${redeemCost})` : `Need ₹${redeemCost}`}
                      </CandyButton>
                    </Box>
                  );
                })
            )}
          </Box>
        )}

        {/* ── TAB 5: TRADE (DEAL & BARTER) ────────────────────────────────── */}
        {activeTab === 'trade' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Partner Selector */}
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748b', mb: 0.5, textTransform: 'uppercase' }}>
                Select Trading Partner:
              </Typography>
              {otherPlayers.length === 0 ? (
                <Typography sx={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                  No other active players available to trade.
                </Typography>
              ) : (
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
              )}
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
            {targetPartner && (
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
                  {ownedTiles.length === 0 ? (
                    <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', py: 1 }}>
                      No properties owned
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: '160px', overflowY: 'auto' }}>
                      {ownedTiles.map((tile) => {
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
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.12s ease',
                              '&:hover': {
                                borderColor: accentHex
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentHex }} />
                              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>
                                {tile.name}
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                              ₹{tile.price?.toLocaleString()}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Cash Offer Counter */}
                  <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', mb: 0.5 }}>
                      Cash Offer:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                      <CandyButton
                        variant="glass"
                        size="xs"
                        onClick={() => setOfferCash((c) => Math.max(0, c - 100))}
                        disabled={offerCash <= 0}
                        style={{ minWidth: '28px', minHeight: '28px', padding: 0 }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </CandyButton>
                      <Typography sx={{ fontSize: '12px', fontWeight: 850, color: '#047857' }}>
                        ₹{offerCash.toLocaleString()}
                      </Typography>
                      <CandyButton
                        variant="glass"
                        size="xs"
                        onClick={() => setOfferCash((c) => Math.min(heroPlayer?.balance || 0, c + 100))}
                        disabled={offerCash + 100 > (heroPlayer?.balance || 0)}
                        style={{ minWidth: '28px', minHeight: '28px', padding: 0 }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </CandyButton>
                    </Box>
                  </Box>
                </Box>

                {/* Center Swap Arrow */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', pt: 8 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      border: '1.5px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}
                  >
                    <SwapHorizIcon sx={{ fontSize: 20 }} />
                  </Box>
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
                      {targetPartner.name.toUpperCase()} GIVES
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
                      Total: ₹{partnerRequestedVal.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Properties Owned List */}
                  <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
                    Select Properties to Request:
                  </Typography>
                  {partnerProperties.length === 0 ? (
                    <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', py: 1 }}>
                      No properties owned
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
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.12s ease',
                              '&:hover': {
                                borderColor: accentHex
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentHex }} />
                              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>
                                {tile.name}
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                              ₹{tile.price?.toLocaleString()}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Cash Request Counter */}
                  <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', mb: 0.5 }}>
                      Cash Request:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                      <CandyButton
                        variant="glass"
                        size="xs"
                        onClick={() => setRequestCash((c) => Math.max(0, c - 100))}
                        disabled={requestCash <= 0}
                        style={{ minWidth: '28px', minHeight: '28px', padding: 0 }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </CandyButton>
                      <Typography sx={{ fontSize: '12px', fontWeight: 850, color: '#047857' }}>
                        ₹{requestCash.toLocaleString()}
                      </Typography>
                      <CandyButton
                        variant="glass"
                        size="xs"
                        onClick={() => setRequestCash((c) => Math.min(targetPartner.balance || 0, c + 100))}
                        disabled={requestCash + 100 > (targetPartner.balance || 0)}
                        style={{ minWidth: '28px', minHeight: '28px', padding: 0 }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </CandyButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Propose Trade Button */}
            {targetPartner && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <CandyButton
                  variant="grape"
                  size="sm"
                  onClick={handleSendTrade}
                  disabled={
                    (selectedMySteps.length === 0 && offerCash === 0) ||
                    (selectedPartnerSteps.length === 0 && requestCash === 0)
                  }
                  style={{ minHeight: '34px', padding: '0 20px', fontSize: '12px', fontWeight: 850 }}
                >
                  Propose Trade Deal (વેપાર સોદો)
                </CandyButton>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
