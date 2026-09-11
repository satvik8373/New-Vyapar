import React from 'react';
import { BoardTileStep } from '@shared/game-data/boardData';
import { PlayerData } from '@shared/types/player';
import { BoardPlayerTokens } from './BoardPlayerTokens';

interface BoardCornerCellProps {
  tile: BoardTileStep;
  playersOnTile: PlayerData[];
  isActiveTile: boolean;
  activePlayerId?: string;
  isHopping?: boolean;
  isDimmed?: boolean;
  onClick?: (tile: BoardTileStep) => void;
}

export const BoardCornerCell: React.FC<BoardCornerCellProps> = ({
  tile,
  playersOnTile,
  isActiveTile,
  activePlayerId,
  isHopping = false,
  isDimmed = false,
  onClick
}) => {
  const getCornerTheme = () => {
    switch (tile.step) {
      case 0:
        return {
          title: 'START',
          sub: 'COLLECT ₹2,000',
          accent: '#059669',
          icon: (
            <div className="corner-go-badge">
              <svg className="corner-go-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
              <span className="corner-go-text">GO</span>
            </div>
          )
        };
      case 8:
        return {
          title: 'REST OASIS',
          sub: 'SAFE HAVEN',
          accent: '#0284c7',
          icon: (
            <div className="corner-oasis-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path>
                <path d="M12 14v8"></path>
                <path d="M8 22h8"></path>
                <circle cx="12" cy="7" r="1.5" fill="currentColor"></circle>
              </svg>
            </div>
          )
        };
      case 16:
        return {
          title: 'CENTRAL BANK',
          sub: 'BANK LOANS',
          accent: '#d97706',
          icon: (
            <div className="corner-bank-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10h18"></path>
                <path d="M12 2l9 5H3l9-5z"></path>
                <path d="M4 10v11"></path>
                <path d="M20 10v11"></path>
                <path d="M8 14v4"></path>
                <path d="M12 14v4"></path>
                <path d="M16 14v4"></path>
              </svg>
            </div>
          )
        };
      case 24:
        return {
          title: 'COMMERCIAL TAX',
          sub: 'DUTY & LEVY',
          accent: '#e11d48',
          icon: (
            <div className="corner-tax-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1 1.8-1"></path>
                <path d="M12 6v2"></path>
                <path d="M12 16v2"></path>
              </svg>
            </div>
          )
        };
      default:
        return {
          title: tile.name,
          sub: '',
          accent: '#475569',
          icon: null
        };
    }
  };

  const theme = getCornerTheme();

  return (
    <div
      className={`board-corner-wrapper corner-step-${tile.step}`}
      style={{
        gridColumn: tile.gridCol,
        gridRow: tile.gridRow,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible'
      }}
    >
      <div
        className={`board-cell board-corner-cell corner-step-${tile.step} ${isActiveTile ? 'tile-active' : ''} ${isDimmed ? 'tile-dimmed-on-hover' : ''} ${playersOnTile.length > 0 ? 'has-players' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          '--corner-accent': theme.accent
        } as React.CSSProperties}
        onClick={() => onClick?.(tile)}
      >
        <div className="corner-header-bar" style={{ backgroundColor: theme.accent }}>
          <span className="corner-header-label">{theme.title}</span>
        </div>

        <div className="corner-body-canvas">
          <img
            src={`/assets/images/cities/tile_${tile.step}.png`}
            alt={theme.title}
            className="corner-graphic-sprite"
            loading="eager"
          />
        </div>

        <div className="corner-footer-bar">
          <span className="corner-footer-label">{theme.sub}</span>
        </div>
      </div>

      {/* Player Car Tokens Dock - Positioned on the Perimeter Road Corner */}
      <BoardPlayerTokens
        players={playersOnTile}
        activePlayerId={activePlayerId}
        isHopping={isHopping}
        edge="corner"
        step={tile.step}
      />
    </div>
  );
};
