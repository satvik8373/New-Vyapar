import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { PlayerData } from '@shared/types/player';
import { BOARD_TILES, COLOR_HEX_MAP, BoardTileStep } from '@shared/game-data/boardData';
import { GameEngine } from '../../../game-engine/GameEngine';
import { CityDeedStack } from '../cards/CityDeedStack';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { CurrencyCoin } from '../common/CurrencyCoin';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LockIcon from '@mui/icons-material/Lock';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import StyleIcon from '@mui/icons-material/Style';
import './CornerPlayerHUD.css';

export interface HUDPlayerData extends PlayerData {
  isHuman?: boolean;
  netWorth?: number;
}

interface CornerPlayerHUDProps {
  player: HUDPlayerData;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  isActiveTurn: boolean;
  isHeroPlayer?: boolean;
  lastAcquiredStep?: number;
  onTrade?: (player: HUDPlayerData) => void;
  onOpenDeedPopup?: (player: HUDPlayerData) => void;
}

export const CornerPlayerHUD: React.FC<CornerPlayerHUDProps> = ({
  player,
  position,
  isActiveTurn,
  isHeroPlayer = false,
  lastAcquiredStep,
  onTrade,
  onOpenDeedPopup
}) => {
  const engine = GameEngine.getInstance();
  const [showOpponentPopover, setShowOpponentPopover] = useState(false);
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(30);

  useEffect(() => {
    if (isActiveTurn) {
      setTurnTimerSeconds(30);
      const timer = setInterval(() => {
        setTurnTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActiveTurn, player.id]);

  const colorHex =
    typeof (player.tokenColorHex || player.tokenColor) === 'number'
      ? `#${Number(player.tokenColorHex || player.tokenColor).toString(16).padStart(6, '0')}`
      : String(player.tokenColorHex || player.tokenColor || '#2563eb');

  const isBankrupt = Boolean(player.isBankrupt);
  const isInJail = Boolean(player.isInJail);

  // Find all tiles owned by this player
  const ownedTiles: BoardTileStep[] = BOARD_TILES.filter((t) =>
    player.ownedPropertyIds?.includes(t.step)
  );

  // Close opponent popover when clicking anywhere outside
  useEffect(() => {
    if (!showOpponentPopover) return;
    const handleClickOutside = () => {
      setShowOpponentPopover(false);
      engine.closePropertyModal();
      engine.setHoveredOwner(null);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
      window.addEventListener('touchend', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('touchend', handleClickOutside);
    };
  }, [showOpponentPopover, engine]);

  // Compute strategic intelligence for opponents
  const totalValuation = ownedTiles.reduce((sum, t) => sum + (t.price || 0), 0);
  let maxHazardTile: BoardTileStep | null = null;
  let maxHazardRent = 0;

  ownedTiles.forEach((t) => {
    const rent = engine.calculateRent(t.step).amount;
    if (rent > maxHazardRent) {
      maxHazardRent = rent;
      maxHazardTile = t;
    }
  });

  // Calculate monopolies
  const colorGroups: Record<string, { owned: number; total: number; colorHex: string; name: string }> = {};
  BOARD_TILES.forEach((t) => {
    if (t.color && t.type === 'PROPERTY') {
      if (!colorGroups[t.color]) {
        colorGroups[t.color] = {
          owned: 0,
          total: 0,
          colorHex: COLOR_HEX_MAP[t.color] || '#3b82f6',
          name: t.color.toUpperCase()
        };
      }
      colorGroups[t.color].total++;
    }
  });

  ownedTiles.forEach((t) => {
    if (t.color && colorGroups[t.color]) {
      colorGroups[t.color].owned++;
    }
  });

  const activeMonopolies = Object.entries(colorGroups).filter(([_, g]) => g.owned === g.total && g.total > 0);
  const nearMonopolies = Object.entries(colorGroups).filter(([_, g]) => g.owned === g.total - 1 && g.total > 1);

  return (
    <div
      className={`minimal-hud-wrapper pos-${position}`}
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          engine.setHoveredOwner(player.id);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          engine.setHoveredOwner(null);
        }
      }}
    >
      {/* ====================================================================
          1. CLEAN, MINIMAL & PROFESSIONAL PLAYER HUD CHIP
          ==================================================================== */}
      <div
        className={`minimal-hud-chip ${isActiveTurn ? 'is-turn' : ''} ${isHeroPlayer ? 'is-hero' : ''} ${isBankrupt ? 'is-bankrupt' : ''}`}
        style={{
          '--player-accent': colorHex
        } as React.CSSProperties}
      >
        {/* Solid Swatch Portrait Avatar */}
        <div className="hud-avatar-wrapper">
          <PlayerAvatar
            avatar={player.avatar}
            name={player.name}
            color={colorHex}
            size={28}
            isActiveTurn={false}
          />
          {isInJail && !isBankrupt && (
            <span className="hud-jail-badge" title="In Jail">
              <LockIcon sx={{ fontSize: 9 }} />
            </span>
          )}
        </div>

        {/* 2-Row Stack: Top = Name+Role+Timer, Bottom = Money + Card & Trade Actions */}
        <div className="hud-text-stack">
          <div className="hud-name-line">
            <span className="hud-player-name" title={player.name}>
              {player.name.replace(/\s*\(AI\)/i, '').trim()}
            </span>
            {isHeroPlayer && <span className="hud-role-tag">YOU</span>}
            {!player.isHuman && !engine.getMultiplayerAdapter()?.isMultiplayerActive() && (player.avatar === 'bot' || player.name.includes('(AI)')) && (
              <span className="hud-role-tag ai">AI</span>
            )}
            {isActiveTurn && (
              <span className="hud-turn-timer" title="Turn time remaining">
                {turnTimerSeconds}s
              </span>
            )}
          </div>

          <div className="hud-bottom-row">
            <div className="hud-wealth-line">
              <CurrencyCoin size={13} />
              <span className="hud-balance-val">
                {player.balance !== undefined ? player.balance.toLocaleString() : '0'}
              </span>
            </div>

            {/* Property Deeds Count Button */}
            <Tooltip
              arrow
              title={
                ownedTiles.length > 0
                  ? isHeroPlayer
                    ? `${ownedTiles.length} title deeds • Click to view floating cards`
                    : `${ownedTiles.length} properties • Click to view strategic intelligence & trade`
                  : 'No properties acquired yet'
              }
            >
              <button
                className={`hud-card-icon-btn ${ownedTiles.length === 0 ? 'is-empty' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (ownedTiles.length > 0) {
                    if (isHeroPlayer && onOpenDeedPopup) {
                      onOpenDeedPopup(player);
                    } else {
                      setShowOpponentPopover(!showOpponentPopover);
                    }
                  }
                }}
              >
                <StyleIcon sx={{ fontSize: 12 }} />
                {ownedTiles.length > 0 && (
                  <span className="hud-card-badge">{ownedTiles.length}</span>
                )}
              </button>
            </Tooltip>

            {/* Quick Trade Button for opponents */}
            {!isHeroPlayer && !isBankrupt && onTrade && (
              <Tooltip arrow title={`Trade with ${player.name}`}>
                <button
                  className="hud-action-btn trade-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrade(player);
                  }}
                >
                  <HandshakeIcon sx={{ fontSize: 12 }} />
                </button>
              </Tooltip>
            )}

            {/* Bankrupt Indicator */}
            {isBankrupt && (
              <span className="hud-bankrupt-tag">BANKRUPT</span>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. PRODUCTIVE STRATEGIC INTELLIGENCE POPOVER (For Opponents)
          ==================================================================== */}
      {showOpponentPopover && !isHeroPlayer && (
        <div
          className={`opponent-property-popover popover-${position}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="opponent-popover-header">
            <div className="opponent-popover-title-row">
              <span className="opponent-popover-title">{player.name}'s Intelligence</span>
              <span className="opponent-popover-count">{ownedTiles.length} Assets</span>
            </div>
            <button
              className="opponent-popover-close-btn"
              onClick={() => {
                setShowOpponentPopover(false);
                engine.closePropertyModal();
                engine.setHoveredOwner(null);
              }}
              title="Close"
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </button>
          </div>

          {/* Strategic Metrics (Productive Game Insights) */}
          <div className="opponent-popover-intel-strip">
            <div className="intel-metric">
              <span className="intel-metric-label">PORTFOLIO</span>
              <span className="intel-metric-val">₹{totalValuation.toLocaleString()}</span>
            </div>
            {maxHazardTile && (
              <div className="intel-metric hazard">
                <span className="intel-metric-label">MAX RENT HAZARD</span>
                <span className="intel-metric-val font-rose">
                  ₹{maxHazardRent.toLocaleString()} ({(maxHazardTile as BoardTileStep).name.split(' ')[0]})
                </span>
              </div>
            )}
          </div>

          {/* Monopoly Threat Status */}
          {activeMonopolies.length > 0 && (
            <div className="opponent-monopoly-alert active">
              <span className="monopoly-fire-dot" />
              <span>
                <strong>{activeMonopolies.length} Monopoly Active</strong> (2x Rent Hazard)
              </span>
            </div>
          )}

          {nearMonopolies.length > 0 && activeMonopolies.length === 0 && (
            <div className="opponent-monopoly-alert near">
              <span>⚠️ 1 away from {nearMonopolies[0][1].name} Monopoly (Target for Trade)</span>
            </div>
          )}

          {/* Color-Grouped Property Rows */}
          <div className="opponent-popover-list">
            {ownedTiles.map((t) => {
              const accent = t.color ? COLOR_HEX_MAP[t.color] || '#334155' : '#475569';
              const rent = engine.calculateRent(t.step).amount;
              return (
                <div
                  key={t.step}
                  className="opponent-prop-row"
                  onMouseEnter={() => {
                    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                      engine.inspectProperty(t.step);
                    }
                  }}
                  onMouseLeave={() => {
                    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                      engine.closePropertyModal();
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (engine.getState().selectedProperty?.step === t.step) {
                      engine.closePropertyModal();
                    } else {
                      engine.inspectProperty(t.step);
                    }
                  }}
                  title="Hover or tap to preview on board"
                >
                  <span
                    className="opponent-prop-dot"
                    style={{ backgroundColor: accent }}
                  />
                  <div className="opponent-prop-info">
                    <span className="opponent-prop-name">{t.name}</span>
                    {t.gujaratiName && (
                      <span className="opponent-prop-guj">{t.gujaratiName}</span>
                    )}
                  </div>
                  <span className="opponent-prop-rent">
                    Rent ₹{rent.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Direct Action: Propose Trade */}
          {onTrade && !isBankrupt && (
            <button
              className="opponent-popover-trade-btn"
              onClick={() => {
                setShowOpponentPopover(false);
                engine.closePropertyModal();
                engine.setHoveredOwner(null);
                onTrade(player);
              }}
            >
              <HandshakeIcon sx={{ fontSize: 14 }} /> Propose Trade with {player.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

