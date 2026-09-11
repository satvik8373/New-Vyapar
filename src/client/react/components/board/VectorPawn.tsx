import React from 'react';
import { motion } from 'framer-motion';

interface VectorPawnProps {
  playerIndex: number; // 0=Satvik (Red), 1=Priya (Green), 2=Aarav (Blue), 3=Diya (Gold)
  width?: number;
  isActive?: boolean;
  playerName?: string;
}

interface PawnColorPalette {
  bodyStart: string;
  bodyMid: string;
  bodyDark: string;
  bodyHighlight: string;
  accent: string;
  name: string;
}

const PAWN_PALETTES: Record<number, PawnColorPalette> = {
  0: {
    bodyStart: '#f43f5e',
    bodyMid: '#e11d48',
    bodyDark: '#881337',
    bodyHighlight: '#fda4af',
    accent: '#e11d48',
    name: 'Ruby Red'
  },
  1: {
    bodyStart: '#10b981',
    bodyMid: '#059669',
    bodyDark: '#064e3b',
    bodyHighlight: '#6ee7b7',
    accent: '#059669',
    name: 'Emerald Green'
  },
  2: {
    bodyStart: '#0284c7',
    bodyMid: '#0369a1',
    bodyDark: '#082f49',
    bodyHighlight: '#7dd3fc',
    accent: '#0284c7',
    name: 'Sapphire Blue'
  },
  3: {
    bodyStart: '#f59e0b',
    bodyMid: '#d97706',
    bodyDark: '#78350f',
    bodyHighlight: '#fde68a',
    accent: '#d97706',
    name: 'Topaz Gold'
  }
};

export const VectorPawn: React.FC<VectorPawnProps> = ({
  playerIndex,
  width = 18,
  isActive = false,
  playerName
}) => {
  const palette = PAWN_PALETTES[playerIndex % 4];
  const height = Math.round(width * 1.55); // Aspect ratio ~1:1.55
  const gradientId = `pawn-grad-${playerIndex % 4}`;
  const goldId = `pawn-gold-${playerIndex % 4}`;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width,
        height,
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      {/* Soft Contact Tabletop Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: Math.round(width * 0.95),
          height: Math.max(3.5, Math.round(width * 0.2)),
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.48) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(15, 23, 42, 0) 80%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Active Turn Halo Glow */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            width: Math.round(width * 1.35),
            height: Math.round(width * 0.5),
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${palette.accent}99 0%, ${palette.accent}33 55%, transparent 80%)`,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1,
            animation: 'turnPawnPulse 1.6s ease-in-out infinite alternate'
          }}
        />
      )}

      {/* 3D Precision Vector SVG Pawn */}
      <motion.svg
        viewBox="0 0 24 36"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
        transition={
          isActive
            ? {
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut'
              }
            : { duration: 0.2 }
        }
        style={{
          position: 'relative',
          display: 'block',
          zIndex: 2,
          filter: isActive
            ? `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 4px ${palette.accent}99)`
            : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3))'
        }}
      >
        <defs>
          {/* Polished Gold Metallic Bezel Gradient */}
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Luxury Pawn Body Gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.bodyStart} />
            <stop offset="35%" stopColor={palette.bodyHighlight} />
            <stop offset="65%" stopColor={palette.bodyMid} />
            <stop offset="100%" stopColor={palette.bodyDark} />
          </linearGradient>

          {/* Specular Radial Highlight for Spherical Head */}
          <radialGradient id={`head-highlight-${playerIndex % 4}`} cx="32%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="85%" stopColor={palette.bodyDark} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* 1. Heavy Weighted Gold Pedestal Base */}
        <path
          d="M 3.5 32 C 3.5 29, 7.5 28, 12 28 C 16.5 28, 20.5 29, 20.5 32 C 20.5 34, 16.5 35, 12 35 C 7.5 35, 3.5 34, 3.5 32 Z"
          fill={`url(#${goldId})`}
          stroke="#78350f"
          strokeWidth="0.5"
        />

        {/* 2. Sculpted Pawn Torso & Waist (Classic Chess / Game Pawn Silhouette) */}
        <path
          d="M 7.5 28.5 C 8 22.5, 9.8 16.5, 10.4 14.2 L 13.6 14.2 C 14.2 16.5, 16 22.5, 16.5 28.5 Z"
          fill={`url(#${gradientId})`}
        />

        {/* Specular Torso Sheen */}
        <path
          d="M 11.2 14.8 L 12.8 14.8 C 12.5 19.5, 12 24.5, 11.6 28.5 L 11 28.5 Z"
          fill="#ffffff"
          opacity="0.32"
        />

        {/* 3. Gold Metallic Collar Ring */}
        <ellipse
          cx="12"
          cy="14"
          rx="4.2"
          ry="1.3"
          fill={`url(#${goldId})`}
          stroke="#78350f"
          strokeWidth="0.4"
        />

        {/* 4. Spherical Pawn Head */}
        <circle
          cx="12"
          cy="7.5"
          r="5.5"
          fill={`url(#${gradientId})`}
        />

        {/* 3D Glass / Acrylic Spherical Specular Overlay */}
        <circle
          cx="12"
          cy="7.5"
          r="5.5"
          fill={`url(#head-highlight-${playerIndex % 4})`}
        />

        {/* Crisp Pinpoint Reflection Dot */}
        <circle
          cx="10.2"
          cy="5.8"
          r="1.2"
          fill="#ffffff"
          opacity="0.9"
        />
      </motion.svg>
    </div>
  );
};
