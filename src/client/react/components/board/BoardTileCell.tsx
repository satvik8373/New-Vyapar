import React from 'react';
import { BoardTileStep, COLOR_HEX_MAP, DEFAULT_BOARD_TILES } from '@shared/game-data/boardData';
import { PlayerData } from '@shared/types/player';
import { BoardPlayerTokens } from './BoardPlayerTokens';
import { BoardHouseIcon } from './BoardHouseIcon';

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
  const isSpecialTile =
    tile.type === 'TAX' ||
    tile.type === 'BANK' ||
    tile.type === 'SPECIAL' ||
    tile.type === 'CHANCE';

  const specialClass =
    tile.type === 'TAX'
      ? 'tile-seamless-tax'
      : tile.type === 'BANK'
      ? 'tile-seamless-bank'
      : tile.type === 'SPECIAL'
      ? 'tile-seamless-gold'
      : tile.type === 'CHANCE'
      ? 'tile-seamless-chance'
      : '';

  const specialImageSrc =
    tile.imageUrl ||
    (tile.type === 'TAX'
      ? '/assets/images/cities/tile_5.png'
      : tile.type === 'BANK'
      ? '/assets/images/cities/tile_14.png'
      : tile.type === 'SPECIAL'
      ? '/assets/images/cities/tile_18.png'
      : tile.type === 'CHANCE'
      ? '/assets/images/cities/tile_22.png'
      : undefined);

  // Distinct theme accents for each of the 4 special tiles
  const accentHex = tile.color
    ? COLOR_HEX_MAP[tile.color] || '#334155'
    : tile.type === 'TAX'
    ? '#e11d48'        // Rose Crimson
    : tile.type === 'BANK'
    ? '#0284c7'        // Royal Azure Blue
    : tile.type === 'SPECIAL'
    ? '#d97706'        // Imperial Amber Gold
    : tile.type === 'CHANCE'
    ? '#7c3aed'        // Fortune Violet
    : '#475569';

  const ownerColorHex = owner
    ? (typeof (owner.tokenColorHex || owner.tokenColor) === 'number'
        ? `#${Number(owner.tokenColorHex || owner.tokenColor).toString(16).padStart(6, '0')}`
        : String(owner.tokenColorHex || owner.tokenColor || '#e11d48'))
    : null;

  const footerText =
    tile.price !== null
      ? `₹${tile.price.toLocaleString()}`
      : tile.type === 'TAX'
      ? '10% LEVY'
      : tile.type === 'BANK'
      ? 'BANK LOANS'
      : tile.type === 'CHANCE'
      ? 'DRAW CARD'
      : tile.type === 'SPECIAL'
      ? 'GOLD ASSET'
      : 'SPECIAL';

  const isVerticalEdge = tile.edge === 'left' || tile.edge === 'right';

  // Sub-component for the 25px inner header (touching center border)
  const headerContent = (
    <div
      className={`tile-header-bar ${isSpecialTile ? 'is-special-header' : ''}`}
      style={{ backgroundColor: accentHex }}
    >
      <span className="tile-header-label">
        {tile.name}
      </span>
    </div>
  );

  // Sub-component for the outer footer bar
  const shortOwnerName = owner
    ? owner.isHuman
      ? 'YOU'
      : `AI ${owner.name.match(/\d+/)?.[0] || owner.colorName?.slice(0, 3) || '1'}`
    : '';

  const footerContent = (
    <div className={`tile-footer-bar ${isSpecialTile ? 'is-special-footer' : ''}`}>
      {owner && ownerColorHex ? (
        <span className="tile-footer-owner-text" style={{ color: ownerColorHex }}>
          {shortOwnerName}
        </span>
      ) : tile.price !== null ? (
        <span className="tile-footer-price-text">₹{tile.price.toLocaleString()}</span>
      ) : (
        <span className="tile-footer-badge-text" style={{ color: accentHex }}>
          {footerText}
        </span>
      )}
    </div>
  );

  const hoverTitle = owner
    ? `${tile.name} (${tile.gujaratiName || ''}) • Owned by: ${owner.name} (${owner.colorName}) • Rent: ₹${rentAmount?.toLocaleString() || 0}${houses > 0 ? ` (${houses === 5 ? 'Hotel' : `${houses} Houses`})` : ''}`
    : tile.price !== null
    ? `${tile.name} (${tile.gujaratiName || ''}) • For Sale: ₹${tile.price.toLocaleString()} • Click to view deed`
    : `${tile.name} (${tile.gujaratiName || ''}) • ${footerText}`;

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
        className={`board-cell tile-edge-${tile.edge} ${isSpecialTile ? `tile-is-special tile-special-${tile.type.toLowerCase()}` : ''} ${isActiveTile ? 'tile-active' : ''} ${isMortgaged ? 'tile-mortgaged' : ''} ${owner ? 'tile-is-owned' : ''} ${isOwnerHovered ? 'tile-owner-highlighted' : ''} ${isDimmed ? 'tile-dimmed-on-hover' : ''} ${playersOnTile.length > 0 ? 'has-players' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          '--accent': accentHex,
          '--owner-color': ownerColorHex || undefined,
          ...(ownerColorHex
            ? {
                boxShadow: isOwnerHovered
                  ? `0 0 16px 3px ${ownerColorHex}99, inset 0 0 0 2px ${ownerColorHex}`
                  : `inset 0 0 0 2px ${ownerColorHex}`
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

        {/* If special tile: seamless card with same color background, image & minimal title */}
        {isSpecialTile ? (
          <div className={`tile-seamless-special ${specialClass}`}>
            <div className="tile-seamless-img-stage">
              {specialImageSrc && (
                <img
                  src={specialImageSrc}
                  alt={tile.name}
                  className="tile-seamless-img"
                  loading="lazy"
                  draggable={false}
                />
              )}
            </div>
            <span className="tile-seamless-name">{tile.name}</span>
          </div>
        ) : (
          <>
            {/* Unified 3-Layer Card Anatomy: Outer edge -> Middle Graphic -> Inner edge */}
            {/* Outer edge is FIRST for Top & Left; Inner edge is FIRST for Bottom & Right */}
            {(tile.edge === 'top' || tile.edge === 'left') ? footerContent : headerContent}

            {/* Middle Graphic Stage */}
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
          </>
        )}
      </div>

      {/* House Icon touching the road frame black border directly */}
      {owner && tile.type === 'PROPERTY' && (
        <div
          className={`tile-border-house-icon edge-${tile.edge} ${houses === 0 ? 'is-default-owned' : 'is-developed'}`}
          title={`${tile.name} • Owned by ${owner.name}${houses > 0 ? ` • ${houses === 5 ? 'Vyapar Hotel' : `${houses} Houses`}` : ''}`}
        >
          <BoardHouseIcon
            houses={houses}
            color={ownerColorHex || '#16a34a'}
            edge={tile.edge}
          />
        </div>
      )}

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
