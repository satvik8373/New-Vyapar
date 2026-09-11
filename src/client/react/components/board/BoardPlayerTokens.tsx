import React from 'react';
import { motion } from 'framer-motion';
import { PlayerData } from '@shared/types/player';
import { OfficialCarToken, PLAYER_COLOR_THEMES } from './OfficialCarToken';
import { GameEngine } from '../../../game-engine/GameEngine';

interface BoardPlayerTokensProps {
  players: PlayerData[];
  activePlayerId?: string;
  isHopping?: boolean;
  edge?: string;
  step?: number;
}

/**
 * Resolves a player's fixed 0-indexed identity (0=P1, 1=P2, 2=P3, 3=P4)
 * regardless of where or how they appear in a tile list.
 */
function getPlayerIdentityIndex(player: PlayerData): number {
  try {
    const all = GameEngine.getInstance().getState().players;
    if (all && all.length > 0) {
      const idx = all.findIndex((ap: any) => ap.id === player.id);
      if (idx !== -1) return idx % 4;
    }
  } catch {
    // fallback
  }
  if (player.tokenColor) {
    const c = String(player.tokenColor).toLowerCase();
    if (c.includes('e11d48') || c.includes('dc2626') || c.includes('red') || c.includes('crimson')) return 0;
    if (c.includes('059669') || c.includes('16a34a') || c.includes('green') || c.includes('emerald')) return 1;
    if (c.includes('0284c7') || c.includes('2563eb') || c.includes('blue') || c.includes('sapphire')) return 2;
    if (c.includes('d97706') || c.includes('amber') || c.includes('gold')) return 3;
  }
  if (player.colorName) {
    const n = player.colorName.toLowerCase();
    if (n.includes('ruby') || n.includes('crimson') || n.includes('red')) return 0;
    if (n.includes('emerald') || n.includes('green')) return 1;
    if (n.includes('sapphire') || n.includes('blue')) return 2;
    if (n.includes('amber') || n.includes('gold')) return 3;
  }
  if (player.id === 'p1') return 0;
  if (player.id === 'p2') return 1;
  if (player.id === 'p3') return 2;
  if (player.id === 'p4') return 3;
  const match = player.id.match(/\d+/);
  if (match) {
    const n = parseInt(match[0], 10);
    if (!isNaN(n) && n >= 1) return (n - 1) % 4;
  }
  return 0;
}

export const BoardPlayerTokens: React.FC<BoardPlayerTokensProps> = ({
  players,
  activePlayerId,
  isHopping = false,
  edge = 'bottom',
  step
}) => {
  if (!players || players.length === 0) return null;

  const count = players.length;
  // Car size: height must be comfortably smaller than road lane width (24px road → 18px car max)
  const tokenSize = count === 1 ? 18 : count === 2 ? 15 : 13;
  const isVertical = edge === 'left' || edge === 'right' || (edge === 'corner' && (step === 8 || step === 24));

  return (
    <div
      className={`board-tokens-dock tokens-count-${count} edge-${edge}`}
      style={{
        display: 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        zIndex: 35
      }}
    >
      {players.map((p, idx) => {
        const identityIdx = getPlayerIdentityIndex(p);
        const isActive = p.id === activePlayerId;
        const theme = PLAYER_COLOR_THEMES[identityIdx % 4];

        // Staggered starting grid positions when multiple cars occupy the lane
        const isStaggered = count >= 3;
        const lateralOffset = isStaggered ? (idx % 2 === 0 ? -3 : 3) : 0;
        const longitudinalMargin = idx > 0 ? (count >= 3 ? -10 : 3) : 0;

        return (
          <motion.div
            key={p.id}
            layoutId={`player-pawn-${p.id}`}
            transition={{
              layout: {
                duration: isHopping ? 0.48 : 0.55,
                ease: isHopping ? 'linear' : [0.16, 1, 0.3, 1]
              }
            }}
            style={{
              display: 'inline-flex',
              ...(isVertical
                ? {
                    marginTop: `${longitudinalMargin}px`,
                    transform: `translateX(${lateralOffset}px)`
                  }
                : {
                    marginLeft: `${longitudinalMargin}px`,
                    transform: `translateY(${lateralOffset}px)`
                  }),
              zIndex: isActive ? 50 : 30 + idx,
              position: 'relative'
            }}
            title={`${p.name} (${theme.name} • ₹${p.balance.toLocaleString()})`}
          >
            <OfficialCarToken
              playerIndex={identityIdx}
              size={tokenSize}
              isActive={isActive}
              playerName={p.name}
              playerColor={p.tokenColor}
              edge={edge}
              step={step}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
