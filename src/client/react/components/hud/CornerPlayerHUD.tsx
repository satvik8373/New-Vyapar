import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { PlayerData } from '@shared/types/player';
import { BOARD_TILES, BoardTileStep } from '@shared/game-data/boardData';
import { GameEngine } from '../../../game-engine/GameEngine';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { CurrencyCoin } from '../common/CurrencyCoin';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LockIcon from '@mui/icons-material/Lock';
import StyleIcon from '@mui/icons-material/Style';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
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
  isSpeaking?: boolean;
  isMicMuted?: boolean;
  isInVoice?: boolean;
  isPeerMutedLocally?: boolean;
  onToggleMutePeer?: (peerId: string) => void;
}

export const CornerPlayerHUD: React.FC<CornerPlayerHUDProps> = ({
  player,
  position,
  isActiveTurn,
  isHeroPlayer = false,
  onTrade,
  onOpenDeedPopup,
  isSpeaking = false,
  isMicMuted = false,
  isInVoice = false,
  isPeerMutedLocally = false,
  onToggleMutePeer
}) => {
  const engine = GameEngine.getInstance();
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(30);

  useEffect(() => {
    if (isActiveTurn) {
      setTurnTimerSeconds(30);
      const timer = setInterval(() => {
        if (!engine.isGamePaused()) {
          setTurnTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActiveTurn, player.id, engine]);

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
      {/* 1. CLEAN, MINIMAL & PROFESSIONAL SOLID PLAYER HUD CHIP — ROCK-SOLID UNIFORM SIZE */}
      <div
        className={`minimal-hud-chip ${isActiveTurn ? 'is-turn' : ''} ${isHeroPlayer ? 'is-hero' : ''} ${isBankrupt ? 'is-bankrupt' : ''}`}
        style={{
          '--player-accent': colorHex
        } as React.CSSProperties}
      >
        {/* Avatar */}
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

        {/* 2-Row Stack */}
        <div className="hud-content-stack">
          {/* Top Row: Name + Voice + YOU Role + Turn Timer (Fixed slot, no layout shift) */}
          <div className="hud-top-row">
            <div className="hud-identity-group">
              <span className="hud-player-name" title={player.name}>
                {player.name.replace(/\s*\(AI\)/i, '').trim()}
              </span>
              {isInVoice && (
                <span
                  className={`hud-voice-indicator ${isSpeaking ? 'speaking' : isMicMuted ? 'muted' : 'connected'}`}
                  title={isSpeaking ? `${player.name} is speaking` : isMicMuted ? 'Microphone Muted' : 'Voice Connected'}
                >
                  {isMicMuted ? (
                    <MicOffIcon sx={{ fontSize: 11 }} />
                  ) : isSpeaking ? (
                    <VolumeUpIcon sx={{ fontSize: 11 }} />
                  ) : (
                    <MicIcon sx={{ fontSize: 11 }} />
                  )}
                </span>
              )}
              {isHeroPlayer && <span className="hud-role-tag">YOU</span>}
            </div>

            {/* Turn Timer Countdown: Slot is always present with fixed width so chip never resizes or flickers */}
            <span
              className={`hud-turn-timer ${isActiveTurn ? 'is-active' : 'is-idle'}`}
              title={isActiveTurn ? 'Turn time remaining' : undefined}
              aria-hidden={!isActiveTurn}
            >
              {isActiveTurn ? `${turnTimerSeconds}s` : '30s'}
            </span>
          </div>

          {/* Bottom Row: Cash Balance + Property Deeds + Trade + Mute */}
          <div className="hud-bottom-row">
            {/* Cash Balance */}
            <div className="hud-wealth-group">
              <CurrencyCoin size={11} />
              <span className="hud-balance-val">
                {player.balance !== undefined ? player.balance.toLocaleString() : '0'}
              </span>
            </div>

            {/* Actions */}
            <div className="hud-actions-group">
              {/* Property Deeds Count Button — Constant width prevents sizing pop */}
              <Tooltip
                arrow
                title={
                  ownedTiles.length > 0
                    ? isHeroPlayer
                      ? `${ownedTiles.length} title deeds • Click to view cards`
                      : `${ownedTiles.length} properties • Click to open Trade`
                    : 'No properties acquired yet'
                }
              >
                <button
                  type="button"
                  className={`hud-card-icon-btn ${ownedTiles.length === 0 ? 'is-empty' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ownedTiles.length > 0) {
                      if (isHeroPlayer && onOpenDeedPopup) {
                        onOpenDeedPopup(player);
                      } else if (onTrade) {
                        onTrade(player);
                      }
                    }
                  }}
                >
                  <StyleIcon sx={{ fontSize: 10 }} />
                  <span className={`hud-card-badge ${ownedTiles.length === 0 ? 'is-zero' : ''}`}>
                    {ownedTiles.length}
                  </span>
                </button>
              </Tooltip>

              {/* Quick Trade Button for opponents */}
              {!isHeroPlayer && !isBankrupt && onTrade && (
                <Tooltip arrow title={`Trade with ${player.name}`}>
                  <button
                    type="button"
                    className="hud-action-btn trade-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrade(player);
                    }}
                  >
                    <HandshakeIcon sx={{ fontSize: 10 }} />
                  </button>
                </Tooltip>
              )}

              {/* Manual Mute / Unmute Opponent Voice Button */}
              {!isHeroPlayer && !isBankrupt && onToggleMutePeer && (
                <Tooltip
                  arrow
                  title={
                    isPeerMutedLocally
                      ? `Unmute ${player.name}'s voice`
                      : `Mute ${player.name}'s voice`
                  }
                >
                  <button
                    type="button"
                    className={`hud-action-btn mute-btn ${isPeerMutedLocally ? 'is-muted' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMutePeer(player.id);
                    }}
                    aria-label={isPeerMutedLocally ? `Unmute ${player.name}` : `Mute ${player.name}`}
                  >
                    {isPeerMutedLocally ? (
                      <VolumeOffIcon sx={{ fontSize: 10, color: '#ef4444' }} />
                    ) : (
                      <VolumeUpIcon sx={{ fontSize: 10 }} />
                    )}
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
      </div>
    </div>
  );
};
