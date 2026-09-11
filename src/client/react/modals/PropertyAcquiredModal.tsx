import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import CloseIcon from '@mui/icons-material/Close';
import { BoardTileStep } from '@shared/game-data/boardData';
import { CityDeedStack } from '../components/cards/CityDeedStack';
import { CandyButton } from '../components/common';
import './PropertyAcquiredModal.css';

export interface PropertyAcquiredModalProps {
  open: boolean;
  tile: BoardTileStep | null;
  allOwnedTiles: BoardTileStep[];
  playerName: string;
  mode?: 'acquisition' | 'portfolio';
  onClose: () => void;
}

export const PropertyAcquiredModal: React.FC<PropertyAcquiredModalProps> = ({
  open,
  tile,
  allOwnedTiles,
  playerName,
  mode = 'acquisition',
  onClose
}) => {
  const isAcquisition = mode === 'acquisition';

  useEffect(() => {
    if (open && tile && isAcquisition) {
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.62 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [open, tile, isAcquisition]);

  if (!open || !tile) return null;

  return (
    <div className="acquired-modal-overlay" onClick={onClose}>
      <div className="acquired-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Quick Close Button */}
        <button className="acquired-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Top Header Badge */}
        <div className="acquired-header-badge">
          <span className={`acquired-tag-pill ${!isAcquisition ? 'tag-portfolio' : ''}`}>
            {isAcquisition ? 'ACQUISITION COMPLETE' : 'PORTFOLIO HOLDINGS'}
          </span>
          <h2 className="acquired-title">
            {isAcquisition ? `Congratulations, ${playerName}!` : `${playerName}'s Deeds`}
          </h2>
          <p className="acquired-subtitle">
            {isAcquisition ? (
              <>
                You now own the commercial rights to <strong>{tile.name}</strong>. Swipe cards to inspect your portfolio!
              </>
            ) : (
              <>
                Total <strong>{allOwnedTiles.length}</strong> commercial {allOwnedTiles.length === 1 ? 'deed' : 'deeds'} in possession. Drag or tap cards to flip.
              </>
            )}
          </p>
        </div>

        {/* 3D Draggable City Deed Stack */}
        <div className="acquired-stack-stage">
          <CityDeedStack
            tiles={allOwnedTiles.length > 0 ? allOwnedTiles : [tile]}
            highlightStep={isAcquisition ? tile.step : undefined}
            sendToBackOnClick={true}
            sensitivity={180}
          />
        </div>

        {/* Bottom Actions */}
        <div className="acquired-footer-actions">
          <CandyButton
            variant={isAcquisition ? 'mint' : 'primary'}
            size="md"
            fullWidth
            onClick={onClose}
          >
            {isAcquisition ? 'Collect Deed & Continue' : 'Done Viewing'}
          </CandyButton>
        </div>
      </div>
    </div>
  );
};
