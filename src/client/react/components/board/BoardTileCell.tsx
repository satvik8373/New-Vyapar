import React from 'react';
import { BoardTileStep, COLOR_HEX_MAP, DEFAULT_BOARD_TILES } from '@shared/game-data/boardData';
import { PlayerData } from '@shared/types/player';
import { BoardPlayerTokens } from './BoardPlayerTokens';
import { GreenHouseIcon, RedHotelIcon } from '../common/HouseHotelIcons';

interface BoardTileCellProps {
  tile: BoardTileStep;
  owner?: PlayerData & { isHuman?: boolean };
  playersOnTile: PlayerData[];
  isActiveTile: boolean;
  activePlayerId?: string;
  isHopping?: boolean;
  houses?: number;
  isMortgaged?: boolean;
  isOwnerHovered?: boolean;
  isDimmed?: boolean;
  rentAmount?: number;
  onClick?: (tile: BoardTileStep) => void;
}

export const BoardTileCell: React.FC<BoardTileCellProps> = ({
  tile,
  owner,
  playersOnTile,
  isActiveTile,
  activePlayerId,
  isHopping = false,
  houses = 0,
  isMortgaged = false,
  isOwnerHovered = false,
  isDimmed = false,
  rentAmount,
  onClick
}) => {
  const accentHex = tile.color ? COLOR_HEX_MAP[tile.color] || '#334155' : '#475569';

  const ownerColorHex = owner
    ? (typeof (owner.tokenColorHex || owner.tokenColor) === 'number'
        ? `#${Number(owner.tokenColorHex || owner.tokenColor).toString(16).padStart(6, '0')}`
        : String(owner.tokenColorHex || owner.tokenColor || '#e11d48'))
    : null;

  const footerText =
    tile.price !== null
      ? `${tile.price.toLocaleString()}`
      : tile.type === 'TAX'
      ? 'DUTY & LEVY'
      : tile.type === 'BANK'
      ? 'BANK LOANS'
      : tile.type === 'CHANCE'
      ? 'CHANCE ?'
      : tile.type === 'SPECIAL'
      ? 'RESERVE'
      : 'SPECIAL';

  const isVerticalEdge = tile.edge === 'left' || tile.edge === 'right';

  // Sub-component for the 25px inner header (touching center border)
  const headerContent = (
    <div className="tile-header-bar" style={{ backgroundColor: accentHex }}>
      <span className="tile-header-label">
        {tile.name}
      </span>
      {/* Development houses / hotel strip */}
      {houses > 0 && (
        <div className="tile-house-indicator-strip">
          {houses === 5 ? (
            <span className="tile-hotel-pip" title="Vyapar Hotel">
              <RedHotelIcon size={11} />
            </span>
          ) : (
            Array.from({ length: houses }).map((_, idx) => (
              <span key={idx} className="tile-house-pip" title={`${houses} Houses`}>
                <GreenHouseIcon size={10} />
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Sub-component for the outer footer bar
  // Simple, clean price or owner name directly without unwanted divs, containers, or coin icons
  const shortOwnerName = owner
    ? owner.isHuman
      ? 'YOU'
      : `AI ${owner.name.match(/\d+/)?.[0] || owner.colorName?.slice(0, 3) || '1'}`
    : '';

  const footerContent = (
    <div className="tile-footer-bar">
      {owner && ownerColorHex ? (
        <span className="tile-footer-owner-text" style={{ color: ownerColorHex }}>
          {shortOwnerName}
        </span>
      ) : tile.price !== null ? (
        <span className="tile-footer-price-text">₹{tile.price.toLocaleString()}</span>
      ) : (
        <span className="tile-footer-badge-text">{footerText}</span>
      )}
    </div>
  );

  const hoverTitle = owner
    ? `${tile.name} (${tile.gujaratiName || ''}) • Owned by: ${owner.name} (${owner.colorName}) • Rent: ₹${rentAmount?.toLocaleString() || 0}${houses > 0 ? ` (${houses === 5 ? 'Hotel' : `${houses} Houses`})` : ''}`
    : tile.price !== null
    ? `${tile.name} (${tile.gujaratiName || ''}) • For Sale: ₹${tile.price.toLocaleString()} • Click to view deed`
    : `${tile.name} (${tile.gujaratiName || ''})`;

  return (
    <div
      className={`board-tile-wrapper tile-edge-${tile.edge}`}
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
        className={`board-cell tile-edge-${tile.edge} ${isActiveTile ? 'tile-active' : ''} ${isMortgaged ? 'tile-mortgaged' : ''} ${owner ? 'tile-is-owned' : ''} ${isOwnerHovered ? 'tile-owner-highlighted' : ''} ${isDimmed ? 'tile-dimmed-on-hover' : ''} ${playersOnTile.length > 0 ? 'has-players' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          '--accent': accentHex,
          '--owner-color': ownerColorHex || undefined,
          ...(ownerColorHex
            ? {
                border: `1.5px solid ${ownerColorHex}`,
                boxShadow: isOwnerHovered
                  ? `0 0 16px 3px ${ownerColorHex}99, inset 0 0 0 1px ${ownerColorHex}`
                  : `inset 0 0 0 1px ${ownerColorHex}44`
              }
            : {})
        } as React.CSSProperties}
        onClick={() => onClick?.(tile)}
        title={hoverTitle}
      >
        {/* Mortgaged Stamp Badge */}
        {isMortgaged && (
          <div className="tile-mortgage-badge">
            MTG
          </div>
        )}

        {/* Unified 3-Layer Card Anatomy: Outer edge -> Middle Graphic -> Inner edge */}
        {/* Outer edge is FIRST for Top & Left; Inner edge is FIRST for Bottom & Right */}
        {(tile.edge === 'top' || tile.edge === 'left') ? footerContent : headerContent}

        {/* Middle Graphic Stage (Cute Transparent 3D Isometric Game Figurine - Completely Unobstructed) */}
        <div className="tile-graphic-stage">
          {(() => {
            const originalTile = DEFAULT_BOARD_TILES.find(
              (t) => t.name.trim().toUpperCase() === tile.name.trim().toUpperCase()
            );
            const spriteStep = originalTile ? originalTile.step : tile.step;
            const spriteSrc = tile.imageUrl || `/assets/images/cities/tile_${spriteStep}.png`;
            return (
              <img
                src={spriteSrc}
                alt={tile.name}
                className="tile-graphic-sprite"
                loading="eager"
              />
            );
          })()}
        </div>

        {/* Inner edge is LAST for Top & Left; Outer edge is LAST for Bottom & Right */}
        {(tile.edge === 'top' || tile.edge === 'left') ? headerContent : footerContent}
      </div>

      {/* Player Car Tokens Dock - Positioned on the Perimeter Road Track */}
      <BoardPlayerTokens
        players={playersOnTile}
        activePlayerId={activePlayerId}
        isHopping={isHopping}
        edge={tile.edge}
        step={tile.step}
      />
    </div>
  );
};
