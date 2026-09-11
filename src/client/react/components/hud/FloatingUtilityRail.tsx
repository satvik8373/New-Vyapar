import React, { useState } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import './FloatingUtilityRail.css';

interface FloatingUtilityRailProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  boardScale?: number;
  onOpenTrade: () => void;
  onOpenBank: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  unreadLogCount?: number;
}

export const FloatingUtilityRail: React.FC<FloatingUtilityRailProps> = ({
  isMuted,
  onToggleMute,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  boardScale = 1,
  onOpenTrade,
  onOpenBank,
  onOpenLogs,
  onOpenSettings,
  unreadLogCount = 0
}) => {
  // Minimizes only the vertical [+ / -] zoom wing on the left side
  const [isZoomMinimized, setIsZoomMinimized] = useState(false);
  const isZoomed = boardScale > 1.05;

  return (
    <div className="connected-utility-console">
      {/* ── LEFT-SIDE CONNECTED ZOOM WING (VERTICAL STACK, ZERO GAP) ── */}
      <div className={`connected-zoom-wing ${isZoomMinimized ? 'is-minimized' : 'is-expanded'}`}>
        {/* Single Minimize / Expand Chevron Toggle */}
        <button
          className="zoom-wing-toggle-btn"
          onClick={() => setIsZoomMinimized(!isZoomMinimized)}
          title={isZoomMinimized ? 'Expand Zoom (+ / −)' : 'Minimize Zoom'}
          aria-label="Toggle Zoom Controls"
        >
          {isZoomMinimized ? (
            <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
          ) : (
            <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
          )}
        </button>

        {/* Vertical Zoom Controls: [+] on top, [1x] in middle, [-] on bottom */}
        {!isZoomMinimized && (
          <div className="zoom-wing-vertical-buttons">
            {/* Zoom In (+) */}
            <button
              className="zoom-btn btn-zoom-in"
              onClick={onZoomIn}
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* 1× Reset Badge (when zoomed) */}
            {isZoomed && onResetZoom && (
              <button
                className="zoom-btn btn-zoom-reset"
                onClick={onResetZoom}
                title="Reset to 1×"
                aria-label="Reset zoom to 1x"
              >
                1×
              </button>
            )}

            {/* Zoom Out (−) */}
            <button
              className="zoom-btn btn-zoom-out"
              onClick={onZoomOut}
              title="Zoom Out (−)"
              aria-label="Zoom Out"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── VERTICAL ACTION RAIL (PHYSICALLY CONNECTED, PERFECT SIZE) ── */}
      <div className="connected-vertical-rail">
        {/* 1. Audio Mute / Unmute */}
        <button
          className={`rail-btn ${isMuted ? 'is-muted' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeOffIcon sx={{ fontSize: 19 }} /> : <VolumeUpIcon sx={{ fontSize: 19 }} />}
        </button>

        {/* 2. Propose Trade */}
        <button
          className="rail-btn btn-indigo"
          onClick={onOpenTrade}
          title="Trade Desk"
          aria-label="Trade Desk"
        >
          <HandshakeIcon sx={{ fontSize: 19 }} />
        </button>

        {/* 3. Central Bank */}
        <button
          className="rail-btn btn-emerald"
          onClick={onOpenBank}
          title="Central Bank of Gujarat"
          aria-label="Central Bank of Gujarat"
        >
          <AccountBalanceIcon sx={{ fontSize: 19 }} />
        </button>

        {/* 4. Match Activity Logs */}
        <button
          className="rail-btn btn-slate"
          onClick={onOpenLogs}
          title="Activity Feed"
          aria-label="Activity Feed"
        >
          <FormatListBulletedIcon sx={{ fontSize: 19 }} />
          {unreadLogCount > 0 && (
            <span className="rail-badge">{unreadLogCount > 9 ? '9+' : unreadLogCount}</span>
          )}
        </button>

        {/* 5. Game Menu & Settings */}
        <button
          className="rail-btn btn-slate"
          onClick={onOpenSettings}
          title="Game Menu & Settings"
          aria-label="Game Menu & Settings"
        >
          <SettingsIcon sx={{ fontSize: 19 }} />
        </button>
      </div>
    </div>
  );
};
