import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarsIcon from '@mui/icons-material/Stars';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import TableChartIcon from '@mui/icons-material/TableChart';
import { BOARD_TILES, COLOR_HEX_MAP, BoardTileStep } from '@shared/game-data/boardData';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { CurrencyCoin } from '../components/common/CurrencyCoin';
import { CandyButton } from '../components/common/CandyButton';
import { CandyPill } from '../components/common/CandyPill';
import { CityDeedStack } from '../components/cards/CityDeedStack';

interface DeedLedgerModalProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_GROUPS = [
  { id: 'orange', name: 'Saurashtra Coast', hex: '#ea580c' },
  { id: 'blue',   name: 'Kutch Ports',      hex: '#0284c7' },
  { id: 'green',  name: 'Pilgrim Cities',   hex: '#059669' },
  { id: 'yellow', name: 'Central Heritage', hex: '#d97706' },
  { id: 'red',    name: 'Industrial Hubs',  hex: '#e11d48' },
  { id: 'pink',   name: 'Textile Arteries', hex: '#8b5cf6' }
];

export const DeedLedgerModal: React.FC<DeedLedgerModalProps> = ({ open, onClose }) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());
  const [viewMode, setViewMode] = useState<'table' | 'stack'>('table');

  useEffect(() => {
    return engine.subscribe((s) => setEngineState(s));
  }, [engine]);

  const { players, propertyHouses, mortgagedProperties } = engineState;

  const allDeedTiles = BOARD_TILES.filter(
    (t) => t.type === 'PROPERTY' || t.type === 'PORT'
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={viewMode === 'stack' ? 'sm' : 'md'}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.22)',
          p: 1.5
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 1 }}>
        <Box>
          <Typography
            sx={{
              fontWeight: 850,
              fontSize: '18px',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
            }}
          >
            STATE PROPERTY DEED LEDGER
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 550, mt: 0.2 }}>
            Master Ownership & Rent Schedule for all 28 Gujarat Commercial Properties
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CandyButton
            variant={viewMode === 'stack' ? 'mint' : 'glass'}
            size="xs"
            onClick={() => setViewMode(viewMode === 'stack' ? 'table' : 'stack')}
            style={{ minHeight: '30px', padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {viewMode === 'stack' ? (
              <>
                <TableChartIcon sx={{ fontSize: 15 }} /> Table View
              </>
            ) : (
              <>
                <ViewCarouselIcon sx={{ fontSize: 15 }} /> 3D Stack View
              </>
            )}
          </CandyButton>
          <CandyButton
            variant="glass"
            size="xs"
            onClick={onClose}
            style={{ minHeight: '30px', padding: '4px 8px' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </CandyButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(241, 245, 249, 0.9)', py: 2 }}>
        {viewMode === 'stack' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
            <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 600, mb: 1.5, textAlign: 'center' }}>
              Swipe or click cards to browse all 28 authentic Gujarat commercial title deeds.
            </Typography>
            <CityDeedStack
              tiles={allDeedTiles}
              sensitivity={180}
              sendToBackOnClick={true}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COLOR_GROUPS.map((group) => {
            const groupTiles: BoardTileStep[] = BOARD_TILES.filter(
              (t) => t.color === group.id && (t.type === 'PROPERTY' || t.type === 'PORT')
            );
            if (groupTiles.length === 0) return null;

            // Check if any player owns monopoly in this group
            const monopolyOwner = players.find((p) => engine.ownsColorGroup(p.id, group.id));

            return (
              <Box
                key={group.id}
                sx={{
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Color Group Header Banner */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: group.hex,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 850,
                        fontSize: '12.5px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                      }}
                    >
                      {group.name}
                    </Typography>
                    <CandyPill variant="slate" size="xs">
                      {groupTiles.length} Properties
                    </CandyPill>
                  </Box>

                  {monopolyOwner && (
                    <CandyPill
                      variant="honey"
                      size="xs"
                      icon={<StarsIcon sx={{ fontSize: 12, mr: 0.2 }} />}
                    >
                      Monopoly: {monopolyOwner.name}
                    </CandyPill>
                  )}
                </Box>

                {/* Property Tiles in this group */}
                <Box
                  sx={{
                    p: 1.5,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 1.2
                  }}
                >
                  {groupTiles.map((tile) => {
                    const owner = players.find((p) => p.ownedPropertyIds?.includes(tile.step));
                    const houses = propertyHouses[tile.step] || 0;
                    const isMortgaged = mortgagedProperties.includes(tile.step);
                    const rent = engine.calculateRent(tile.step).amount;

                    return (
                      <Box
                        key={tile.step}
                        onClick={() => {
                          onClose();
                          engine.inspectProperty(tile.step);
                        }}
                        sx={{
                          p: '10px 12px',
                          borderRadius: '12px',
                          border: owner ? `1.5px solid ${owner.tokenColor}55` : '1px solid rgba(226, 232, 240, 0.85)',
                          backgroundColor: owner ? '#f8fafc' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.6,
                          cursor: 'pointer',
                          transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            noWrap
                            sx={{
                              fontWeight: 800,
                              fontSize: '12px',
                              color: '#0f172a',
                              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                            }}
                          >
                            {tile.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <CurrencyCoin size={12} />
                            <Typography sx={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                              {tile.price?.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                            Rent: ₹{rent.toLocaleString()}
                          </Typography>
                          {owner ? (
                            <CandyPill
                              variant="neutral"
                              size="xs"
                              style={{
                                color: owner.tokenColor,
                                fontWeight: 800,
                                borderColor: `${owner.tokenColor}55`
                              }}
                            >
                              {owner.name}
                            </CandyPill>
                          ) : (
                            <CandyPill variant="mint" size="xs">
                              Available
                            </CandyPill>
                          )}
                        </Box>

                        {isMortgaged && (
                          <Typography sx={{ fontSize: '9.5px', fontWeight: 800, color: '#f43f5e' }}>
                            Currently Mortgaged
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
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
