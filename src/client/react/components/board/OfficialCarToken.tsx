import React from 'react';

export interface OfficialCarTokenProps {
  playerIndex: number; // 0=P1 (Crimson), 1=P2 (Forest), 2=P3 (Navy), 3=P4 (Amber)
  size?: number;
  isActive?: boolean;
  playerName?: string;
  playerColor?: string;
  edge?: string; // 'bottom' | 'top' | 'left' | 'right' | 'corner'
  step?: number;
}

export interface PlayerColorTheme {
  name: string;
  main: string;
  light: string;
  dark: string;
  stripe: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}

export const PLAYER_COLOR_THEMES: Record<number, PlayerColorTheme> = {
  0: {
    name: 'Player 1',
    main: '#dc2626',
    light: '#f87171',
    dark: '#991b1b',
    stripe: '#ffffff',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
    label: '1'
  },
  1: {
    name: 'Computer 1 (AI)',
    main: '#16a34a',
    light: '#4ade80',
    dark: '#14532d',
    stripe: '#ffffff',
    badgeBg: '#16a34a',
    badgeText: '#ffffff',
    label: '2'
  },
  2: {
    name: 'Computer 2 (AI)',
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1e3a8a',
    stripe: '#ffffff',
    badgeBg: '#2563eb',
    badgeText: '#ffffff',
    label: '3'
  },
  3: {
    name: 'Computer 3 (AI)',
    main: '#d97706',
    light: '#fbbf24',
    dark: '#78350f',
    stripe: '#ffffff',
    badgeBg: '#d97706',
    badgeText: '#ffffff',
    label: '4'
  }
};

/**
 * Vehicle orientation based on counter-clockwise circuit flow:
 * SVG car faces RIGHT (East, 0deg) naturally.
 * - Bottom road: Left→Right (East)   → rotate(0deg)
 * - Right road:  Bottom→Top (North)  → rotate(-90deg)
 * - Top road:    Right→Left (West)   → rotate(180deg)
 * - Left road:   Top→Bottom (South)  → rotate(90deg)
 */
function getVehicleTransform(edge?: string, step?: number): string {
  if (edge === 'bottom') return 'rotate(0deg)';
  if (edge === 'right') return 'rotate(-90deg)';
  if (edge === 'top') return 'rotate(180deg)';
  if (edge === 'left') return 'rotate(90deg)';
  if (edge === 'corner') {
    switch (step) {
      case 0:  return 'rotate(0deg)';
      case 8:  return 'rotate(-90deg)';
      case 16: return 'rotate(180deg)';
      case 24: return 'rotate(90deg)';
      default: return 'rotate(0deg)';
    }
  }
  return 'rotate(0deg)';
}

/**
 * Streamlined, high-performance Formula GT Vector Pawn Car.
 * Proportional 48x24 viewBox (exact 2:1 aspect ratio), with consistent non-scaling strokes.
 * Guaranteed fixed pixel dimensions that never get squished or scaled down by flexbox or max-width.
 */
const CleanFormulaGTCarSVG: React.FC<{
  theme: PlayerColorTheme;
  width: number;
  height: number;
  isActive: boolean;
}> = ({ theme, width, height, isActive }) => {
  return (
    <svg
      viewBox="0 0 48 24"
      width={width}
      height={height}
      style={{
        display: 'block',
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: 'none',
        maxHeight: 'none',
        overflow: 'visible',
        flexShrink: 0
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Performance Wheels */}
      {/* Rear Tires */}
      <rect x="6" y="0.5" width="9" height="4" rx="1.2" fill="#0f172a" stroke="#000000" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      <rect x="6" y="19.5" width="9" height="4" rx="1.2" fill="#0f172a" stroke="#000000" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      {/* Front Tires */}
      <rect x="33" y="0.5" width="8" height="4" rx="1.2" fill="#0f172a" stroke="#000000" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      <rect x="33" y="19.5" width="8" height="4" rx="1.2" fill="#0f172a" stroke="#000000" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />

      {/* Main Car Bodywork */}
      <path
        d="M 4 12 C 4 7, 7 3.5, 11 3.5 L 36 3.5 C 41 3.5, 45 7, 46 12 C 45 17, 41 20.5, 36 20.5 L 11 20.5 C 7 20.5, 4 17, 4 12 Z"
        fill={theme.main}
        stroke="#0f172a"
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Rear Spoiler / Wing */}
      <rect x="2" y="5" width="2.5" height="14" rx="0.6" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      {/* Ruby Taillights */}
      <rect x="3" y="6" width="1.2" height="3" rx="0.4" fill="#ef4444" />
      <rect x="3" y="15" width="1.2" height="3" rx="0.4" fill="#ef4444" />

      {/* Dual Center Racing Stripes */}
      <line x1="5" y1="10.8" x2="45" y2="10.8" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <line x1="5" y1="13.2" x2="45" y2="13.2" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" vectorEffect="non-scaling-stroke" />

      {/* Tinted Cockpit Glass (Windshield, Canopy, Rear Glass) */}
      <path
        d="M 16 6.5 C 22 6, 27 6, 33 7.5 C 34 9.5, 34 14.5, 33 16.5 C 27 18, 22 18, 16 17.5 C 14.5 14, 14.5 10, 16 6.5 Z"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
      />
      {/* Front Windshield Glass Highlight */}
      <path d="M 28 8 C 31 9.5, 32 11, 32.5 12 C 32 13, 31 14.5, 28 16" fill="none" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {/* Crisp White Player Number Enamel Roundel on Roof */}
      <circle cx="23" cy="12" r="4.8" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      <circle cx="23" cy="12" r="3.8" fill={theme.badgeBg || theme.main} />
      <text
        x="23"
        y="12.3"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="5.6"
        fontWeight="900"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fill="#ffffff"
      >
        {theme.label}
      </text>

      {/* Headlights */}
      <circle cx="43.5" cy="6.5" r="1.3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <circle cx="43.5" cy="17.5" r="1.3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

      {/* Active Player Clean Indicator Ring */}
      {isActive && (
        <circle
          cx="23"
          cy="12"
          r="6.0"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
};

/**
 * Official GT Racing Car Token for Navo Vyapar board game.
 * Guarantees identical size in all 4 orientations (never squished on left/right vertical tracks).
 */
export const OfficialCarToken: React.FC<OfficialCarTokenProps> = ({
  playerIndex,
  size = 14,
  isActive = false,
  playerName,
  playerColor,
  edge = 'bottom',
  step
}) => {
  const baseTheme = PLAYER_COLOR_THEMES[playerIndex % 4] || PLAYER_COLOR_THEMES[0];
  const theme = playerColor
    ? {
        ...baseTheme,
        main: playerColor,
        dark: playerColor,
        badgeBg: playerColor
      }
    : baseTheme;
  const vehicleTransform = getVehicleTransform(edge, step);

  // Exact 2:1 ratio: length is 2x width
  const tokenWidth = Math.round(size * 2);
  const tokenHeight = size;

  // Bounding box matches oriented car dimensions exactly without extra padding
  const isVertical = edge === 'left' || edge === 'right' || (edge === 'corner' && (step === 8 || step === 24));
  const boxWidth = isVertical ? tokenHeight : tokenWidth;
  const boxHeight = isVertical ? tokenWidth : tokenHeight;

  return (
    <div
      className={`official-car-token ${isActive ? 'is-active' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${boxWidth}px`,
        height: `${boxHeight}px`,
        minWidth: `${boxWidth}px`,
        minHeight: `${boxHeight}px`,
        maxWidth: 'none',
        maxHeight: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={`${playerName || theme.name} — Car #${theme.label}${isActive ? ' • Current Turn' : ''}`}
    >
      {/* Centered Soft Contact Shadow directly underneath car */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${(isVertical ? tokenHeight : tokenWidth) * 0.9}px`,
          height: `${(isVertical ? tokenWidth : tokenHeight) * 0.9}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          pointerEvents: 'none',
          filter: 'blur(1.5px)',
          zIndex: 1
        }}
      />

      {/* Car Body with Circuit-Flow Directional Rotation (Never squeezed by flexbox) */}
      <div
        style={{
          position: 'relative',
          width: `${tokenWidth}px`,
          height: `${tokenHeight}px`,
          minWidth: `${tokenWidth}px`,
          minHeight: `${tokenHeight}px`,
          maxWidth: 'none',
          maxHeight: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: vehicleTransform,
          transformOrigin: 'center center',
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          flexShrink: 0,
          zIndex: 2
        }}
      >
        <CleanFormulaGTCarSVG
          theme={theme}
          width={tokenWidth}
          height={tokenHeight}
          isActive={isActive}
        />
      </div>
    </div>
  );
};
