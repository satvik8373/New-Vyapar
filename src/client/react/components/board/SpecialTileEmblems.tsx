import React from 'react';

/**
 * TaxEmblem: Scales of commercial justice & tax duty seal
 */
export const TaxEmblem: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="taxGoldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="taxDropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
      </filter>
    </defs>
    {/* Shield Seal Background */}
    <path
      d="M24 4L40 9V22C40 33 24 43 24 43C24 43 8 33 8 22V9L24 4Z"
      fill="rgba(255, 255, 255, 0.16)"
      stroke="url(#taxGoldGrad)"
      strokeWidth="2"
      filter="url(#taxDropGlow)"
    />
    {/* Center Post */}
    <path d="M24 11V33" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="11" r="2.5" fill="url(#taxGoldGrad)" />
    {/* Horizontal Beam */}
    <path d="M13 16H35" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    {/* Left Pan */}
    <path d="M13 16L9 24H17L13 16Z" fill="url(#taxGoldGrad)" opacity="0.9" />
    <path d="M9 24C9 26.2 10.8 28 13 28C15.2 28 17 26.2 17 24H9Z" fill="#ffffff" />
    {/* Right Pan */}
    <path d="M35 16L31 24H39L35 16Z" fill="url(#taxGoldGrad)" opacity="0.9" />
    <path d="M31 24C31 26.2 32.8 28 35 28C37.2 28 39 26.2 39 24H31Z" fill="#ffffff" />
    {/* Base Stand */}
    <path d="M17 34H31" stroke="url(#taxGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * BankEmblem: Classical neoclassical bank pillars & vault facade
 */
export const BankEmblem: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bankSkyGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <filter id="bankDropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
      </filter>
    </defs>
    {/* Triangular Pediment */}
    <path d="M6 17L24 6L42 17H6Z" fill="#ffffff" filter="url(#bankDropGlow)" />
    <circle cx="24" cy="13" r="2.5" fill="url(#bankSkyGrad)" />
    {/* Architrave beam */}
    <rect x="7" y="18" width="34" height="3" rx="1" fill="url(#bankSkyGrad)" />
    {/* 4 Pillars */}
    <rect x="9" y="22" width="4.5" height="15" rx="1" fill="#ffffff" />
    <rect x="17.5" y="22" width="4.5" height="15" rx="1" fill="#ffffff" />
    <rect x="26" y="22" width="4.5" height="15" rx="1" fill="#ffffff" />
    <rect x="34.5" y="22" width="4.5" height="15" rx="1" fill="#ffffff" />
    {/* Base Steps */}
    <rect x="6" y="38" width="36" height="3" rx="1" fill="url(#bankSkyGrad)" />
    <rect x="4" y="41.5" width="40" height="3.5" rx="1" fill="#ffffff" />
  </svg>
);

/**
 * GoldReserveEmblem: Stack of pure 999.9 gold bullion bars with sparkles
 */
export const GoldReserveEmblem: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldBarLight" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="goldBarShadow" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <filter id="goldDropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    {/* Bottom Left Ingot */}
    <path d="M5 33L13 25H27L19 33H5Z" fill="url(#goldBarLight)" filter="url(#goldDropGlow)" />
    <path d="M19 33L27 25V31L19 39V33Z" fill="url(#goldBarShadow)" />
    <path d="M5 33H19V39H5V33Z" fill="#eab308" />

    {/* Bottom Right Ingot */}
    <path d="M21 33L29 25H43L35 33H21Z" fill="url(#goldBarLight)" filter="url(#goldDropGlow)" />
    <path d="M35 33L43 25V31L35 39V33Z" fill="url(#goldBarShadow)" />
    <path d="M21 33H35V39H21V33Z" fill="#eab308" />

    {/* Top Ingot */}
    <path d="M13 21L21 13H35L27 21H13Z" fill="url(#goldBarLight)" filter="url(#goldDropGlow)" />
    <path d="M27 21L35 13V19L27 27V21Z" fill="url(#goldBarShadow)" />
    <path d="M13 21H27V27H13V21Z" fill="#facc15" />

    {/* Stamped purity badge */}
    <text x="20" y="25.5" fill="#78350f" fontSize="4" fontWeight="900" fontFamily="sans-serif">999.9</text>

    {/* Starburst sparkles */}
    <path d="M37 8L38.5 11L41.5 12.5L38.5 14L37 17L35.5 14L32.5 12.5L35.5 11L37 8Z" fill="#ffffff" />
    <circle cx="9" cy="14" r="1.5" fill="#ffffff" />
  </svg>
);

/**
 * ChanceEmblem: Glowing playing card with 3D golden question mark
 */
export const ChanceEmblem: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chanceGoldStar" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="cardPurpleGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#581c87" />
      </linearGradient>
      <filter id="chanceDropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>
    {/* Angled background card */}
    <rect x="7" y="10" width="24" height="32" rx="3.5" transform="rotate(-10 7 10)" fill="rgba(255, 255, 255, 0.2)" stroke="#ffffff" strokeWidth="1.5" />
    {/* Foreground fortune card */}
    <rect x="14" y="6" width="24" height="34" rx="3.5" fill="url(#cardPurpleGrad)" stroke="url(#chanceGoldStar)" strokeWidth="1.8" filter="url(#chanceDropGlow)" />
    {/* Inner dashed frame */}
    <rect x="16.5" y="8.5" width="19" height="29" rx="2" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" strokeDasharray="2 1.5" fill="none" />
    {/* 3D Gold Question Mark */}
    <text
      x="26"
      y="29"
      textAnchor="middle"
      fill="url(#chanceGoldStar)"
      fontSize="19"
      fontWeight="900"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.6))"
    >
      ?
    </text>
    {/* Sparkle accents */}
    <path d="M19 12L19.8 13.5L20.6 12L19.8 10.5L19 12Z" fill="#ffffff" />
    <path d="M31 32L31.8 33.5L32.6 32L31.8 30.5L31 32Z" fill="#ffffff" />
  </svg>
);
