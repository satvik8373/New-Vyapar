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
 * Resolves vehicle orientation based on counter-clockwise circuit flow:
 * SVG car faces RIGHT (East, 0deg) naturally.
 * - Bottom road: moving Left→Right (East)   → rotate(0deg)
 * - Right road:  moving Bottom→Top (North)  → rotate(-90deg)
 * - Top road:    moving Right→Left (West)   → rotate(180deg)
 * - Left road:   moving Top→Bottom (South)  → rotate(90deg)
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
 * High-Detail Formula GT Supercar SVG Vector.
 * 64x32 viewport, perfectly symmetrical along Y=16 centerline.
 */
const FormulaGTCarSVG: React.FC<{
  theme: PlayerColorTheme;
  width: number;
  height: number;
  isActive: boolean;
  uid: string;
}> = ({ theme, width, height, isActive, uid }) => {
  const w = 64;
  const h = 32;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={width}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Body Paint Gradient */}
        <linearGradient id={`body-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.dark} />
          <stop offset="18%" stopColor={theme.main} />
          <stop offset="50%" stopColor={theme.light} />
          <stop offset="82%" stopColor={theme.main} />
          <stop offset="100%" stopColor={theme.dark} />
        </linearGradient>

        {/* Windshield & Glass Gradient */}
        <linearGradient id={`glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#0a1826" />
          <stop offset="45%" stopColor="#1e3a54" />
          <stop offset="75%" stopColor="#6ba4d8" />
          <stop offset="100%" stopColor="#cbe6ff" />
        </linearGradient>

        {/* Glass Specular Streak */}
        <linearGradient id={`spec-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Carbon Fiber / Wheels */}
        <linearGradient id={`carbon-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e2229" />
          <stop offset="50%" stopColor="#111317" />
          <stop offset="100%" stopColor="#090a0c" />
        </linearGradient>

        <radialGradient id={`rim-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Headlight Beam Glow */}
        <linearGradient id={`beam-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(254, 240, 138, 0.85)" />
          <stop offset="100%" stopColor="rgba(254, 240, 138, 0)" />
        </linearGradient>
      </defs>

      {/* Under-chassis Ambient Occlusion */}
      <path d="M 5 6 Q 32 3 59 6 Q 63 16 59 26 Q 32 29 5 26 Z" fill="rgba(0,0,0,0.6)" filter="blur(1.5px)" />

      {/* 4 Wide Performance Tires with Rims */}
      {/* Rear Top Wheel */}
      <rect x="10" y="1" width="12" height="5" rx="1.8" fill={`url(#carbon-${uid})`} stroke="#0b0d10" strokeWidth="0.6" />
      <line x1="12" y1="2.5" x2="20" y2="2.5" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <circle cx="16" cy="3.5" r="1.6" fill={`url(#rim-${uid})`} />

      {/* Rear Bottom Wheel */}
      <rect x="10" y="26" width="12" height="5" rx="1.8" fill={`url(#carbon-${uid})`} stroke="#0b0d10" strokeWidth="0.6" />
      <line x1="12" y1="29.5" x2="20" y2="29.5" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <circle cx="16" cy="28.5" r="1.6" fill={`url(#rim-${uid})`} />

      {/* Front Top Wheel */}
      <rect x="44" y="1.5" width="11" height="4.8" rx="1.6" fill={`url(#carbon-${uid})`} stroke="#0b0d10" strokeWidth="0.6" />
      <line x1="46" y1="3" x2="53" y2="3" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <circle cx="49.5" cy="3.9" r="1.5" fill={`url(#rim-${uid})`} />

      {/* Front Bottom Wheel */}
      <rect x="44" y="25.7" width="11" height="4.8" rx="1.6" fill={`url(#carbon-${uid})`} stroke="#0b0d10" strokeWidth="0.6" />
      <line x1="46" y1="29" x2="53" y2="29" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <circle cx="49.5" cy="28.1" r="1.5" fill={`url(#rim-${uid})`} />

      {/* Main Sculpted Aerodynamic Bodywork */}
      <path
        d="
          M 5 16
          C 4 12, 5 8, 7 6
          C 10 4.5, 14 4, 18 4.2
          C 23 4.5, 27 6.2, 33 6.2
          C 38 6.2, 42 4.8, 46 4.8
          C 52 4.8, 57 7.5, 60 10.5
          C 62.5 13, 63.5 14.5, 63.5 16
          C 63.5 17.5, 62.5 19, 60 21.5
          C 57 24.5, 52 27.2, 46 27.2
          C 42 27.2, 38 25.8, 33 25.8
          C 27 25.8, 23 27.5, 18 27.8
          C 14 28, 10 27.5, 7 26
          C 5 24, 4 20, 5 16 Z
        "
        fill={`url(#body-${uid})`}
        stroke={theme.dark}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Aerodynamic Side Crease Lines */}
      <path d="M 19 6.5 Q 32 7.5 45 6.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" fill="none" />
      <path d="M 19 25.5 Q 32 24.5 45 25.5" stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" fill="none" />

      {/* Dual Racing Stripes Down Center */}
      <path d="M 5.5 13.6 L 62.5 13.6 L 62.5 15 L 5.5 15 Z" fill={theme.stripe} opacity="0.9" />
      <path d="M 5.5 17 L 62.5 17 L 62.5 18.4 L 5.5 18.4 Z" fill={theme.stripe} opacity="0.9" />

      {/* Front Hood Air Extractors */}
      <path d="M 50 10.5 L 54 11.2 L 53.5 12.2 L 49.5 11.5 Z" fill="#111827" />
      <path d="M 50 21.5 L 54 20.8 L 53.5 19.8 L 49.5 20.5 Z" fill="#111827" />

      {/* Cockpit Glass Canopy */}
      {/* Front Windshield */}
      <path
        d="
          M 37 8.5
          C 43 9.2, 46 11.5, 47 16
          C 46 20.5, 43 22.8, 37 23.5
          C 38.5 20, 39 16, 38.5 12
          C 38 10, 37.5 9, 37 8.5 Z
        "
        fill={`url(#glass-${uid})`}
        stroke="#0f172a"
        strokeWidth="0.6"
      />
      {/* Windshield Specular Reflection Arc */}
      <path d="M 38 9.8 C 42.5 10.5, 44.8 12.5, 45.5 16" stroke={`url(#spec-${uid})`} strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Rear Window */}
      <path
        d="
          M 18 10
          C 22 9.5, 25 10, 26 10.5
          L 26 21.5
          C 25 22, 22 22.5, 18 22
          C 19 18, 19 14, 18 10 Z
        "
        fill={`url(#glass-${uid})`}
        stroke="#0f172a"
        strokeWidth="0.6"
      />
      <line x1="20" y1="12" x2="25" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

      {/* Roof Panel */}
      <path
        d="
          M 26 10
          C 30 9.5, 34 9.5, 37 9.8
          C 38 12, 38.5 16, 38 20
          C 35 22.2, 30 22.5, 26 22
          Z
        "
        fill={`url(#body-${uid})`}
        stroke="#0f172a"
        strokeWidth="0.5"
      />

      {/* Side Mirrors */}
      <path d="M 40 5.5 C 42 4.5, 44 4.5, 44 6 C 43 7, 41 7, 40 6.5 Z" fill={theme.main} stroke={theme.dark} strokeWidth="0.5" />
      <ellipse cx="43" cy="5.5" rx="0.9" ry="0.6" fill="#e0f2fe" />
      <path d="M 40 26.5 C 42 27.5, 44 27.5, 44 26 C 43 25, 41 25, 40 25.5 Z" fill={theme.main} stroke={theme.dark} strokeWidth="0.5" />
      <ellipse cx="43" cy="26.5" rx="0.9" ry="0.6" fill="#e0f2fe" />

      {/* High-Intensity Xenon Headlights with Projector Lenses */}
      {/* Top Headlight */}
      <path d="M 56 7.5 Q 60.5 9.5 61.5 11.5 Q 58.5 12 56 10 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
      <circle cx="58" cy="9.5" r="0.9" fill="#ffffff" />
      {/* Bottom Headlight */}
      <path d="M 56 24.5 Q 60.5 22.5 61.5 20.5 Q 58.5 20 56 22 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
      <circle cx="58" cy="22.5" r="0.9" fill="#ffffff" />

      {/* Active Headlight Beam Cones */}
      {isActive && (
        <>
          <polygon points="61.5,9.5 78,3 78,14 61.5,11.5" fill={`url(#beam-${uid})`} opacity="0.8" />
          <polygon points="61.5,22.5 78,18 78,29 61.5,20.5" fill={`url(#beam-${uid})`} opacity="0.8" />
        </>
      )}

      {/* Rear GT Wing / Spoiler with Endplates */}
      <rect x="2" y="5.5" width="3.2" height="21" rx="0.8" fill="#111827" stroke={theme.dark} strokeWidth="0.5" />
      <rect x="1.5" y="4.5" width="4.2" height="2.2" rx="0.5" fill={theme.main} />
      <rect x="1.5" y="25.3" width="4.2" height="2.2" rx="0.5" fill={theme.main} />
      <line x1="4.5" y1="12" x2="7.5" y2="12" stroke="#374151" strokeWidth="1.2" />
      <line x1="4.5" y1="20" x2="7.5" y2="20" stroke="#374151" strokeWidth="1.2" />

      {/* Rear Ruby Taillights */}
      <line x1="5.5" y1="8" x2="5.5" y2="12" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5.5" y1="20" x2="5.5" y2="24" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />

      {/* Driver Racing Number Enamel Roundel (Centered on Roof) */}
      <circle cx="31.5" cy="16" r="4.8" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="31.5" cy="16" r="3.9" fill={theme.badgeBg || theme.main} />
      <text
        x="31.5"
        y="16.1"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="4.6"
        fontWeight="900"
        fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif"
        fill={theme.badgeText || '#ffffff'}
      >
        {theme.label}
      </text>

      {/* Active Turn Pulsing Indicator */}
      {isActive && (
        <circle cx="31.5" cy="16" r="5.8" fill="none" stroke="#38bdf8" strokeWidth="0.9" strokeDasharray="2 1.5">
          <animateTransform attributeName="transform" type="rotate" from="0 31.5 16" to="360 31.5 16" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

/**
 * Premium Official Formula GT Racing Car Token for Navo Vyapar board game.
 * Top-down overhead perspective with authentic racing supercar details.
 */
export const OfficialCarToken: React.FC<OfficialCarTokenProps> = ({
  playerIndex,
  size = 26,
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
  const uid = `p${playerIndex}-${edge}-${step ?? 'x'}`;

  // Vehicle aspect ratio 2:1 (length 2x width)
  const tokenWidth = Math.round(size * 2);
  const tokenHeight = size;

  // Swap bounding box dimensions on vertical track edges (left & right roads)
  const isVertical = edge === 'left' || edge === 'right' || (edge === 'corner' && (step === 8 || step === 24));
  const boxWidth = isVertical ? tokenHeight + 4 : tokenWidth + 4;
  const boxHeight = isVertical ? tokenWidth + 4 : tokenHeight + 4;

  return (
    <div
      className={`official-car-token ${isActive ? 'is-active' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: boxWidth,
        height: boxHeight,
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={`${playerName || theme.name} — Car #${theme.label}${isActive ? ' • Current Turn' : ''}`}
    >
      {/* Road contact shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: (isVertical ? tokenHeight : tokenWidth) * 0.85,
          height: isVertical ? (tokenWidth * 0.75) : 6,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          pointerEvents: 'none',
          filter: 'blur(2px)'
        }}
      />

      {/* Car with directional rotation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: vehicleTransform,
          transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <FormulaGTCarSVG
          theme={theme}
          width={tokenWidth}
          height={tokenHeight}
          isActive={isActive}
          uid={uid}
        />
      </div>
    </div>
  );
};
