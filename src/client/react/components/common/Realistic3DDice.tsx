import React, { useEffect, useRef } from 'react';
import { SoundEffects } from '../../../audio/SoundEffects';
import './Realistic3DDice.css';


const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

interface Realistic3DDiceProps {
  value: number | null;
  isRolling: boolean;
  size?: number;
  onClick?: () => void;
  canRoll?: boolean;
}

export const Realistic3DDice: React.FC<Realistic3DDiceProps> = ({
  value,
  isRolling,
  size = 52,
  onClick,
  canRoll = true,
}) => {
  const soundEffects = SoundEffects.getInstance();
  const prevRolling = useRef(false);
  const accumRef = useRef({ x: 0, y: 0 });

  const halfSize = Math.round(size / 2);

  // On each new roll: bump the accumulated spin so the cube always
  // tumbles forward and never snaps back.
  useEffect(() => {
    if (isRolling && !prevRolling.current) {
      soundEffects.playDiceRoll();
      accumRef.current.x += 360;
      accumRef.current.y += 360;
    } else if (!isRolling && prevRolling.current) {
      soundEffects.playDiceLand();
    }
    prevRolling.current = isRolling;
  }, [isRolling, soundEffects]);

  const targetFace = value && value >= 1 && value <= 6 ? value : 1;
  const baseRot = FACE_ROTATIONS[targetFace];

  // Settled rotation: add accumulated full rotations so the cube
  // doesn't snap back to zero between rolls.
  const rotX = baseRot.x + Math.round(accumRef.current.x / 360) * 360;
  const rotY = baseRot.y + Math.round(accumRef.current.y / 360) * 360;

  return (
    <div
      className={`dice-pair-container ${canRoll ? 'clickable' : ''}`}
      onClick={() => { if (canRoll && !isRolling) onClick?.(); }}
      title={canRoll ? 'Click to Roll' : isRolling ? 'Rolling…' : value ? `Rolled ${value}` : 'Dice'}
    >
      <div
        className="dice-3d-scene"
        style={{
          width: size,
          height: size,
          '--dice-size': `${size}px`,
          '--half-size': `${halfSize}px`,
        } as React.CSSProperties}
      >
        <div className={`dice-ground-shadow ${isRolling ? 'tumbling' : ''}`} />
        <div
          className={`dice-cube ${isRolling ? 'is-rolling' : ''}`}
          style={
            isRolling
              ? undefined
              : { transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)` }
          }
        >
          {/* Face 1 — Front: 1 red pip */}
          <div className="dice-face face-1">
            <div className="pip pip-center pip-red" />
          </div>

          {/* Face 2 — Right: 2 pips diagonal */}
          <div className="dice-face face-2">
            <div className="pip pip-top-right" />
            <div className="pip pip-bottom-left" />
          </div>

          {/* Face 3 — Top: 3 pips diagonal */}
          <div className="dice-face face-3">
            <div className="pip pip-top-right" />
            <div className="pip pip-center" />
            <div className="pip pip-bottom-left" />
          </div>

          {/* Face 4 — Bottom: 4 corner pips */}
          <div className="dice-face face-4">
            <div className="pip pip-top-left" />
            <div className="pip pip-top-right" />
            <div className="pip pip-bottom-left" />
            <div className="pip pip-bottom-right" />
          </div>

          {/* Face 5 — Left: 5 pips */}
          <div className="dice-face face-5">
            <div className="pip pip-top-left" />
            <div className="pip pip-top-right" />
            <div className="pip pip-center" />
            <div className="pip pip-bottom-left" />
            <div className="pip pip-bottom-right" />
          </div>

          {/* Face 6 — Back: 6 pips */}
          <div className="dice-face face-6">
            <div className="pip pip-top-left" />
            <div className="pip pip-top-right" />
            <div className="pip pip-mid-left" />
            <div className="pip pip-mid-right" />
            <div className="pip pip-bottom-left" />
            <div className="pip pip-bottom-right" />
          </div>
        </div>
      </div>
    </div>
  );
};
