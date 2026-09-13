import React, { useEffect, useState, useMemo } from 'react';
import { CurrencyCoin } from './CurrencyCoin';
import { SoundEffects } from '../../../audio/SoundEffects';
import './CoinTransferAnimation.css';

export interface CoinTransferAnimationProps {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  fromPlayerName?: string;
  fromPlayerColor?: string;
  toPlayerName?: string;
  toPlayerColor?: string;
  onComplete?: () => void;
}

interface FlyingCoin {
  id: number;
  delay: number;
  duration: number;
  curveX: number;
  curveY: number;
  scale: number;
  rotateDeg: number;
}

// Fallback screen coordinates for player corners and center bank
const getPlayerScreenCoords = (playerId: string): { x: number; y: number } => {
  if (typeof window === 'undefined') return { x: 50, y: 50 };

  // If targeting Navo Central Bank
  if (playerId === 'BANK') {
    return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  }

  // Check if player element exists in DOM (e.g. HUD avatar)
  const el = document.querySelector(`[data-player-hud="${playerId}"]`) ||
             document.querySelector(`[data-player-id="${playerId}"]`);
  if (el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // Standard corner defaults based on typical 4-corner HUD layout
  const w = window.innerWidth;
  const h = window.innerHeight;

  switch (playerId) {
    case 'p1': // Bottom-Right / Bottom-Center (Hero player)
      return { x: w * 0.82, y: h * 0.84 };
    case 'p2': // Top-Left
      return { x: w * 0.16, y: h * 0.16 };
    case 'p3': // Top-Right
      return { x: w * 0.84, y: h * 0.16 };
    case 'p4': // Bottom-Left
      return { x: w * 0.16, y: h * 0.84 };
    default:
      return { x: w * 0.5, y: h * 0.5 };
  }
};

export const CoinTransferAnimation: React.FC<CoinTransferAnimationProps> = ({
  fromPlayerId,
  toPlayerId,
  amount,
  fromPlayerName,
  fromPlayerColor = '#e11d48',
  toPlayerName,
  toPlayerColor = '#059669',
  onComplete
}) => {
  const [active, setActive] = useState(true);

  // Compute source & destination coordinates
  const { start, end } = useMemo(() => {
    return {
      start: getPlayerScreenCoords(fromPlayerId),
      end: getPlayerScreenCoords(toPlayerId)
    };
  }, [fromPlayerId, toPlayerId]);

  // Generate 10 flying coins with randomized arc parameters
  const coins = useMemo<FlyingCoin[]>(() => {
    const count = Math.min(12, Math.max(7, Math.floor(amount / 100)));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: i * 75,
      duration: 750 + Math.random() * 180,
      curveX: (Math.random() - 0.5) * 120,
      curveY: -60 - Math.random() * 80,
      scale: 0.85 + Math.random() * 0.35,
      rotateDeg: Math.floor(Math.random() * 720) - 360
    }));
  }, [amount]);

  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const soundPlayedRef = React.useRef(false);

  useEffect(() => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      try {
        SoundEffects.getInstance().playMoneyChime();
      } catch {
        // Audio autoplay policy fallback
      }
    }

    const totalDuration = 1800;
    const timer = setTimeout(() => {
      setActive(false);
      onCompleteRef.current?.();
    }, totalDuration);

    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return (
    <div className="coin-transfer-overlay-layer" aria-hidden="true">
      {/* Payer deduction floating tag */}
      <div
        className="coin-floating-pill deduction-pill"
        style={{
          left: start.x,
          top: start.y,
          borderColor: fromPlayerColor
        }}
      >
        <span className="pill-sign">-</span>₹{amount.toLocaleString()}
      </div>

      {/* Recipient credit floating tag */}
      <div
        className="coin-floating-pill credit-pill"
        style={{
          left: end.x,
          top: end.y,
          borderColor: toPlayerColor
        }}
      >
        <span className="pill-sign">+</span>₹{amount.toLocaleString()}
      </div>

      {/* Flying golden coins */}
      {coins.map((coin) => {
        // Trajectory CSS variables
        const style: React.CSSProperties = {
          '--start-x': `${start.x}px`,
          '--start-y': `${start.y}px`,
          '--delta-x': `${dx}px`,
          '--delta-y': `${dy}px`,
          '--arc-x': `${dx * 0.45 + coin.curveX}px`,
          '--arc-y': `${dy * 0.45 + coin.curveY}px`,
          '--spin-deg': `${coin.rotateDeg}deg`,
          animationDelay: `${coin.delay}ms`,
          animationDuration: `${coin.duration}ms`,
          transform: `scale(${coin.scale})`
        } as React.CSSProperties;

        return (
          <div
            key={coin.id}
            className="flying-gold-coin"
            style={style}
          >
            <CurrencyCoin size={24} />
          </div>
        );
      })}

      {/* Destination arrival shimmer pulse */}
      <div
        className="coin-arrival-impact"
        style={{
          left: end.x,
          top: end.y,
          boxShadow: `0 0 35px 12px ${toPlayerColor}70`
        }}
      />
    </div>
  );
};
