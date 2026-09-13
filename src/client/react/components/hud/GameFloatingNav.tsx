import React from 'react';
import { Tooltip } from '@mui/material';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SettingsIcon from '@mui/icons-material/Settings';
import { GameEngine } from '../../../game-engine/GameEngine';
import { BOARD_TILES } from '@shared/game-data/boardData';
import './GameFloatingNav.css';

export interface GameFloatingNavProps {
  onOpenOperationsDesk: (tab?: 'build' | 'sell' | 'mortgage' | 'redeem' | 'trade') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenBank: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  unreadLogCount?: number;
  isPortrait?: boolean;
  isMicActive?: boolean;
  isMicMuted?: boolean;
  isSpeaking?: boolean;
  onToggleMic?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  boardScale?: number;
  onOpenChance?: () => void;
}

export const GameFloatingNav: React.FC<GameFloatingNavProps> = ({
  onOpenOperationsDesk,
  isMuted,
  onToggleMute,
  onOpenBank,
  onOpenLogs,
  onOpenSettings,
  unreadLogCount = 0,
  isPortrait = false,
  isMicActive = false,
  isMicMuted = false,
  isSpeaking = false,
  onToggleMic
}) => {
  const engine = GameEngine.getInstance();
  const state = engine.getState();
  const { players, propertyHouses, mortgagedProperties } = state;

  const heroPlayer = players.find((p) => p.isHuman) || players[0];
  const ownedSteps = heroPlayer?.ownedPropertyIds || [];
  const ownedTiles = ownedSteps
    .map((s) => BOARD_TILES.find((t) => t.step === s))
    .filter(Boolean);

  // Active actionable items for operations desk (e.g. monopolies ready to build, or mortgaged properties to redeem)
  const buildableCount = ownedTiles.filter((t) => {
    if (!t || !t.color || t.type !== 'PROPERTY') return false;
    if (mortgagedProperties.includes(t.step)) return false;
    const currentHouses = propertyHouses[t.step] || 0;
    if (currentHouses >= 5) return false;
    const hasMonopoly = engine.ownsColorGroup(heroPlayer?.id || '', t.color);
    if (!hasMonopoly) return false;
    const cost = engine.getHouseCost(t.step);
    return (heroPlayer?.balance ?? 0) >= cost;
  }).length;

  const mortgagedCount = ownedSteps.filter((s) => mortgagedProperties.includes(s)).length;
  const actionableCount = buildableCount + mortgagedCount;

  return (
    <aside
      className={`game-unified-console-dock ${isPortrait ? 'is-portrait' : ''}`}
      role="toolbar"
      aria-label="Tabletop Command Console"
    >
      {/* ── Main Unified Console Rail (Slim, Symmetrical, Professional) ── */}
      <div className="console-main-rail">
        {/* 1. OPERATIONS DESK BUTTON (BUILD, SELL, MORTGAGE, REDEEM, TRADE) */}
        <Tooltip
          title={
            actionableCount > 0
              ? `Operations Desk (${actionableCount} actions ready: Build, Mortgage, Trade)`
              : 'Operations Desk (Build, Sell, Mortgage, Redeem, Trade)'
          }
          arrow
          placement={isPortrait ? 'top' : 'left'}
        >
          <button
            type="button"
            className="console-operations-btn"
            onClick={() => onOpenOperationsDesk()}
            aria-label="Operations Desk"
          >
            <DomainAddIcon sx={{ fontSize: 20 }} />
            {actionableCount > 0 && (
              <span className="ops-badge">
                {actionableCount}
              </span>
            )}
          </button>
        </Tooltip>

        <div className="console-divider" />

        {/* 2. CENTRAL BANK */}
        <Tooltip title="Central Bank of Gujarat" arrow placement={isPortrait ? 'top' : 'left'}>
          <button
            type="button"
            className="console-icon-btn btn-bank"
            onClick={onOpenBank}
            aria-label="Central Bank"
          >
            <AccountBalanceIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>

        {/* 3. ACTIVITY LOGS */}
        <Tooltip title="Match Activity Feed" arrow placement={isPortrait ? 'top' : 'left'}>
          <button
            type="button"
            className="console-icon-btn btn-logs"
            onClick={onOpenLogs}
            aria-label="Activity Feed"
          >
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
            {unreadLogCount > 0 && (
              <span className="console-badge">{unreadLogCount > 9 ? '9+' : unreadLogCount}</span>
            )}
          </button>
        </Tooltip>

        {/* 4. LIVE VOICE MIC */}
        {onToggleMic && (
          <Tooltip
            title={
              !isMicActive
                ? 'Turn On Live Mic'
                : isMicMuted
                ? 'Unmute Mic (Currently Muted)'
                : isSpeaking
                ? 'Speaking… (Click to Mute)'
                : 'Mute Mic (Live Voice Active)'
            }
            arrow
            placement={isPortrait ? 'top' : 'left'}
          >
            <button
              type="button"
              className={`console-icon-btn btn-mic ${
                !isMicActive
                  ? 'is-mic-off'
                  : isMicMuted
                  ? 'is-mic-muted'
                  : isSpeaking
                  ? 'is-speaking'
                  : 'is-mic-live'
              }`}
              onClick={onToggleMic}
              aria-label={
                !isMicActive
                  ? 'Turn On Live Mic'
                  : isMicMuted
                  ? 'Unmute Mic'
                  : 'Mute Mic'
              }
            >
              {isMicActive && !isMicMuted ? (
                <MicIcon sx={{ fontSize: 18 }} />
              ) : (
                <MicOffIcon sx={{ fontSize: 18 }} />
              )}
            </button>
          </Tooltip>
        )}

        {/* 5. AUDIO MUTE */}
        <Tooltip title={isMuted ? 'Unmute Audio' : 'Mute Audio'} arrow placement={isPortrait ? 'top' : 'left'}>
          <button
            type="button"
            className={`console-icon-btn ${isMuted ? 'is-muted' : ''}`}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
          </button>
        </Tooltip>

        {/* 5. SETTINGS / MENU */}
        <Tooltip title="Game Menu & Rules" arrow placement={isPortrait ? 'top' : 'left'}>
          <button
            type="button"
            className="console-icon-btn btn-settings"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
