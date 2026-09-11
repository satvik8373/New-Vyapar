import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOARD_TILES, BoardTileStep } from '@shared/game-data/boardData';
import { HUDPlayerData } from '../components/hud/CornerPlayerHUD';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { CityDeedStack } from '../components/cards/CityDeedStack';
import CloseIcon from '@mui/icons-material/Close';
import StyleIcon from '@mui/icons-material/Style';
import './TitleDeedPopupModal.css';

interface TitleDeedPopupModalProps {
  open: boolean;
  player: HUDPlayerData | null;
  highlightStep?: number;
  onClose: () => void;
  onInspectTile?: (tile: BoardTileStep) => void;
}

export const TitleDeedPopupModal: React.FC<TitleDeedPopupModalProps> = ({
  open,
  player,
  highlightStep,
  onClose,
  onInspectTile
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !player) return null;

  const colorHex =
    typeof (player.tokenColorHex || player.tokenColor) === 'number'
      ? `#${Number(player.tokenColorHex || player.tokenColor).toString(16).padStart(6, '0')}`
      : String(player.tokenColorHex || player.tokenColor || '#2563eb');

  const ownedTiles: BoardTileStep[] = BOARD_TILES.filter((t) =>
    player.ownedPropertyIds?.includes(t.step)
  );

  return (
    <AnimatePresence>
      <div className="deed-popup-overlay" onClick={onClose}>
        {/* Floating Top Control Bar (Minimal pill above the card) */}
        <div className="deed-pure-top-pill" onClick={(e) => e.stopPropagation()}>
          <PlayerAvatar
            avatar={player.avatar}
            name={player.name}
            color={colorHex}
            size={30}
          />
          <div className="deed-pure-title-group">
            <span className="deed-pure-player-title">{player.name}'s Title Deeds</span>
            <span className="deed-pure-subtitle">{ownedTiles.length} {ownedTiles.length === 1 ? 'Property' : 'Properties'}</span>
          </div>
          <button
            className="deed-pure-close-btn"
            onClick={onClose}
            title="Close Preview (Esc)"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* PURE FLOATING 3D CARD (No enclosing container box!) */}
        <motion.div
          className="deed-pure-card-stage"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.72, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.72, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        >
          {ownedTiles.length > 0 ? (
            <CityDeedStack
              tiles={ownedTiles}
              highlightStep={highlightStep}
              sensitivity={140}
              isBig={true}
              sendToBackOnClick={true}
            />
          ) : (
            <div className="deed-popup-empty">
              <p>No commercial properties acquired yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
