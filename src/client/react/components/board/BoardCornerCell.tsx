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
          accent: '#059669',
          image: '/assets/images/corners/corner_start.png'
        };
      case 8:
        return {
          title: 'JAIL',
          accent: '#475569',
          image: '/assets/images/corners/corner_jail.png'
        };
      case 16:
        return {
          title: 'REST OASIS',
          accent: '#0284c7',
          image: '/assets/images/corners/corner_oasis.png'
        };
      case 24:
        return {
          title: 'GO TO JAIL',
          accent: '#e11d48',
          image: '/assets/images/corners/corner_gotojail.png'
        };
      default:
        return {
          title: tile.name,
          accent: '#475569',
          image: tile.imageUrl || '/assets/images/corners/corner_start.png'
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
        className={`board-cell board-corner-cell corner-seamless-cell corner-step-${tile.step} ${isActiveTile ? 'tile-active' : ''} ${isDimmed ? 'tile-dimmed-on-hover' : ''} ${playersOnTile.length > 0 ? 'has-players' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          '--corner-accent': theme.accent
        } as React.CSSProperties}
        onClick={() => onClick?.(tile)}
        title={theme.title}
      >
        {/* Full container graphic stage — title is embedded inside illustration bottom */}
        <div className="corner-seamless-canvas">
          <img
            src={theme.image}
            alt={theme.title}
            className="corner-seamless-graphic"
            loading="eager"
          />
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
