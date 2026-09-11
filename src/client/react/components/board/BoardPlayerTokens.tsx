import React from 'react';
import { motion } from 'framer-motion';
import { PlayerData } from '@shared/types/player';
import { OfficialCarToken, PLAYER_COLOR_THEMES } from './OfficialCarToken';

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
              edge={edge}
              step={step}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
