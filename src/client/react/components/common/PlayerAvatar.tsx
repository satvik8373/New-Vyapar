import React from 'react';
import { Box } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DiamondIcon from '@mui/icons-material/Diamond';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const LeafSvgIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
);

interface PlayerAvatarProps {
  avatar: string;
  name?: string;
  color: string;
  size?: number;
  isActiveTurn?: boolean;
  isHost?: boolean;
  level?: number;
}

export const isBotPlayer = (name?: string, avatar?: string): boolean => {
  const n = (name || '').trim().toLowerCase();
  const a = (avatar || '').trim().toLowerCase();
  return a === 'bot' || a === 'ai' || n.includes('(ai)') || n.includes('bot') || n.startsWith('computer');
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  name = 'Player',
  color = '#e11d48',
  size = 34,
  isActiveTurn = false
}) => {
  const isBot = isBotPlayer(name, avatar);
  const a = (avatar || '').trim().toLowerCase();
  const isImageSrc = avatar && (avatar.startsWith('http') || (avatar.startsWith('/') && !avatar.includes('avatars/')));

  const renderIconContent = () => {
    // 1. Dedicated Robot / AI Avatar for Computer Players
    if (isBot) {
      return (
        <SmartToyIcon
          sx={{
            fontSize: Math.round(size * 0.62),
            color: '#ffffff',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'
          }}
        />
      );
    }

    // 2. Custom photo URL (e.g. Google Auth profile)
    if (isImageSrc) {
      return (
        <img
          src={avatar}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      );
    }

    // 3. Official Merchant Badges
    const iconSize = Math.round(size * 0.58);
    if (a === 'crown') {
      return <WorkspacePremiumIcon sx={{ fontSize: iconSize, color: '#ffffff' }} />;
    }
    if (a === 'diamond') {
      return <DiamondIcon sx={{ fontSize: iconSize, color: '#ffffff' }} />;
    }
    if (a === 'star') {
      return <StarIcon sx={{ fontSize: iconSize, color: '#ffffff' }} />;
    }
    if (a === 'leaf') {
      return <LeafSvgIcon size={iconSize} />;
    }

    // 4. Clean Monogram Initial
    const initial = (name || 'P').trim().charAt(0).toUpperCase();
    return (
      <span
        style={{
          color: '#ffffff',
          fontWeight: 900,
          fontSize: `${Math.round(size * 0.46)}px`,
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          lineHeight: 1
        }}
      >
        {initial}
      </span>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: isImageSrc ? '#ffffff' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: 'none',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {renderIconContent()}
    </Box>
  );
};

function adjustColor(hex: string, percent: number): string {
  if (!hex || hex[0] !== '#') return hex;
  let num = parseInt(hex.slice(1), 16);
  if (hex.length === 4) {
    num = parseInt(hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3], 16);
  }
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
