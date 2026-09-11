import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessPawn } from '@fortawesome/free-solid-svg-icons';

export interface OfficialPawnTokenProps {
  playerIndex: number; // 0=Satvik (Crimson), 1=Priya (Forest), 2=Aarav (Navy), 3=Diya (Amber)
  size?: number;
  isActive?: boolean;
  playerName?: string;
}

interface PlayerColorTheme {
  name: string;
  color: string;
  darkColor: string;
  badgeBg: string;
}

export const PLAYER_COLOR_THEMES: Record<number, PlayerColorTheme> = {
  0: {
    name: 'Player 1',
    color: '#b91c1c', // Deep rich matte crimson
    darkColor: '#7f1d1d',
    badgeBg: '#fef2f2'
  },
  1: {
    name: 'Computer 1 (AI)',
    color: '#047857', // Deep matte forest emerald
    darkColor: '#064e3b',
    badgeBg: '#ecfdf5'
  },
  2: {
    name: 'Computer 2 (AI)',
    color: '#1d4ed8', // Classic matte royal navy
    darkColor: '#1e3a8a',
    badgeBg: '#eff6ff'
  },
  3: {
    name: 'Computer 3 (AI)',
    color: '#b45309', // Rich matte warm amber ochre
    darkColor: '#78350f',
    badgeBg: '#fffbeb'
  }
};

/**
 * Minimal Official Executive Board Game Pawn Piece
 * Uses ready-made FontAwesome standard chess-pawn vector.
 * Completely static, calm, grounded with zero neon, zero glow,
 * and zero bounce animation.
 */
export const OfficialPawnToken: React.FC<OfficialPawnTokenProps> = ({
  playerIndex,
  size = 17,
  isActive = false,
  playerName
}) => {
  const theme = PLAYER_COLOR_THEMES[playerIndex % 4];
  const height = Math.round(size * 1.35);

  return (
    <div
      className={`official-pawn-token ${isActive ? 'is-active' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: size,
        height,
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={`${playerName || theme.name} (${theme.name})${isActive ? ' • Current Turn' : ''}`}
    >
      {/* Subtle, realistic matte tabletop contact shadow - NO NEON, NO GLOW */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: Math.round(size * 0.8),
          height: 3,
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 23, 42, 0.32)',
          pointerEvents: 'none'
        }}
      />

      {/* Upright Official FontAwesome Chess Pawn - Clean, Matte, Crisp */}
      <FontAwesomeIcon
        icon={faChessPawn}
        style={{
          fontSize: `${size}px`,
          width: `${size}px`,
          height: `${Math.round(size * 1.25)}px`,
          color: theme.color,
          filter: isActive
            ? 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45))'
            : 'drop-shadow(0 1.5px 2px rgba(0, 0, 0, 0.28))',
          position: 'relative',
          zIndex: 2,
          display: 'block'
        }}
      />

      {/* Minimal clean active turn indicator: small crisp dot at top - NO NEON, NO GLOW */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            border: '1px solid #ffffff',
            zIndex: 3
          }}
        />
      )}
    </div>
  );
};
