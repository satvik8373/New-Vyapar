import React, { useEffect, useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarsIcon from '@mui/icons-material/Stars';
import { BOARD_TILES, COLOR_HEX_MAP, BoardTileStep, TileColor } from '@shared/game-data/boardData';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { PlayerAvatar } from './common/PlayerAvatar';
import { CurrencyCoin } from './common/CurrencyCoin';
import { CandyPill } from './common/CandyPill';

interface PlayerCardsProps {
  layout?: 'vertical' | 'horizontal';
}

export const PlayerCards: React.FC<PlayerCardsProps> = () => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((state) => {
      setEngineState(state);
    });
  }, [engine]);

  const { players, activePlayerIndex, propertyHouses, mortgagedProperties, hoveredOwnerId } = engineState;
  const activePlayer = players[activePlayerIndex];
  const activePlayerId = activePlayer?.id;

  if (players.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
      {players.map((player, pIdx) => {
        const isActive = player.id === activePlayerId;
        const isHovered = hoveredOwnerId === player.id;

        // Owned property tiles
        const ownedTiles: BoardTileStep[] = BOARD_TILES.filter((t) =>
          player.ownedPropertyIds?.includes(t.step)
        );

        // Find full-color group monopolies
        const uniqueColors = Array.from(
          new Set(ownedTiles.map((t) => t.color).filter((c): c is NonNullable<TileColor> => Boolean(c)))
        );
        const monopolies = uniqueColors.filter((color) => engine.ownsColorGroup(player.id, color));

        return (
          <Box
            key={player.id}
            onMouseEnter={() => engine.setHoveredOwner(player.id)}
            onMouseLeave={() => engine.setHoveredOwner(null)}
            sx={{
              p: '8px 10px',
              borderRadius: '12px',
              backgroundColor: isActive
                ? 'rgba(248, 250, 252, 0.95)'
                : isHovered
                ? 'rgba(241, 245, 249, 0.6)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(203, 213, 225, 0.9)'
                : '1px solid transparent',
              boxShadow: isActive
                ? '0 2px 8px rgba(15, 23, 42, 0.04)'
                : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.6,
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default'
            }}
          >
            {/* Top Row: Avatar, Name & Turn Pill, Balance */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <PlayerAvatar
                  avatar={player.avatar}
                  name={player.name}
                  color={player.tokenColor}
                  size={28}
                  isActiveTurn={isActive}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontWeight: 800,
                        fontSize: '13px',
                        color: '#0f172a',
                        lineHeight: 1.2,
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                      }}
                    >
                      {player.name}
                    </Typography>

                    {isActive && (
                      <CandyPill variant="mint" size="xs" dot pulse>
                        TURN
                      </CandyPill>
                    )}

                    {player.isInJail && (
                      <CandyPill variant="berry" size="xs" icon={<LockIcon sx={{ fontSize: 9 }} />}>
                        JAIL
                      </CandyPill>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: '#64748b',
                      fontWeight: 600,
                      lineHeight: 1.1,
                      mt: 0.2,
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                    }}
                  >
                    P{pIdx + 1} • {player.colorName}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Cash & Net Worth */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CurrencyCoin size={13} />
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: '13.5px',
                      color: '#0f172a',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.2,
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                    }}
                  >
                    {player.balance.toLocaleString()}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '9.5px',
                    color: '#64748b',
                    fontWeight: 600,
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
                  }}
                >
                  ₹{player.netWorth.toLocaleString()} net
                </Typography>
              </Box>
            </Box>

            {/* Bottom Row: Inline Mini Deed Racks & Monopoly Tags (Fluid, No Heavy Boxes) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 20,
                pt: 0.2
              }}
            >
              {/* Left: Deed Count / Monopolies */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                  {ownedTiles.length} {ownedTiles.length === 1 ? 'deed' : 'deeds'}
                </Typography>

                {monopolies.length > 0 && (
                  <Tooltip title={`Full Color Monopoly: ${monopolies.join(', ').toUpperCase()}`}>
                    <span>
                      <CandyPill
                        variant="honey"
                        size="xs"
                        icon={<StarsIcon sx={{ fontSize: 9, mr: 0.2 }} />}
                      >
                        Monopoly
                      </CandyPill>
                    </span>
                  </Tooltip>
                )}
              </Box>

              {/* Right: Mini Title Deed Chips */}
              {ownedTiles.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {ownedTiles.map((tile) => {
                    const colorHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#64748b' : '#0284c7';
                    const houses = propertyHouses[tile.step] || 0;
                    const isMortgaged = mortgagedProperties.includes(tile.step);
                    const rent = engine.calculateRent(tile.step).amount;
                    const hasMonopoly = tile.color ? monopolies.includes(tile.color) : false;

                    return (
                      <Tooltip
                        key={tile.step}
                        arrow
                        title={
                          <Box sx={{ p: 0.4, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#ffffff' }}>
                              {tile.name}
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: '#cbd5e1' }}>
                              Rent: ₹{rent.toLocaleString()}{houses > 0 ? ` (${houses === 5 ? 'Hotel' : `${houses} Houses`})` : ''}
                            </Typography>
                            {isMortgaged && (
                              <Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#f87171' }}>
                                Currently Mortgaged
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <Box
                          onClick={() => engine.inspectProperty(tile.step)}
                          sx={{
                            width: 14,
                            height: 18,
                            borderRadius: '3px',
                            backgroundColor: isMortgaged ? '#f1f5f9' : '#ffffff',
                            border: hasMonopoly
                              ? '1.5px solid #f59e0b'
                              : '1px solid rgba(203, 213, 225, 0.9)',
                            boxShadow: hasMonopoly
                              ? '0 0 6px rgba(245, 158, 11, 0.4)'
                              : '0 1px 2px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            opacity: isMortgaged ? 0.6 : 1,
                            transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            '&:hover': {
                              transform: 'translateY(-2px) scale(1.2)',
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                              zIndex: 10
                            }
                          }}
                        >
                          {/* Top Colored Band */}
                          <Box
                            sx={{
                              width: '100%',
                              height: 5,
                              backgroundColor: colorHex,
                              flexShrink: 0
                            }}
                          />

                          {/* Card Body */}
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#ffffff'
                            }}
                          >
                            {houses === 5 ? (
                              <Box sx={{ width: 4, height: 4, borderRadius: '1px', backgroundColor: '#f43f5e' }} />
                            ) : houses > 0 ? (
                              <Box sx={{ width: 3.5, height: 3.5, borderRadius: '1px', backgroundColor: '#10b981' }} />
                            ) : (
                              <Typography sx={{ fontSize: '6.5px', fontWeight: 800, color: '#475569', lineHeight: 1 }}>
                                {tile.name.charAt(0)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
