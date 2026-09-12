import React, { useEffect, useState } from 'react';
import { Realistic3DDice } from '../common/Realistic3DDice';
import { GameEngine, GameEngineState } from '../../../game-engine/GameEngine';
import CasinoIcon from '@mui/icons-material/Casino';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface BoardCenterProps {
  isDimmed?: boolean;
}

export const BoardCenter: React.FC<BoardCenterProps> = ({ isDimmed = false }) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((state) => {
      setEngineState(state);
    });
  }, [engine]);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 && window.innerHeight >= 600 : false
  );

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024 && window.innerHeight >= 600);
    };
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const {
    players,
    activePlayerIndex,
    phase,
    diceState,
    hoppingState,
    activeAnnouncement
  } = engineState;

  const activePlayer = players[activePlayerIndex] || null;
  const isHumanTurn = activePlayer?.isHuman ?? true;
  const isHopping = Boolean(hoppingState);
  const isInJail = activePlayer?.isInJail ?? false;
  const hasJailCard = (activePlayer?.getOutOfJailCards ?? 0) > 0;

  const canRoll =
    (phase === 'PLAYER_TURN' || phase === 'WAITING') &&
    !diceState.rolling &&
    !isHopping &&
    isHumanTurn;

  const canEndTurn =
    (phase === 'RESOLVING' || (phase === 'PLAYER_TURN' && Boolean(diceState.value))) &&
    !diceState.rolling &&
    !isHopping &&
    isHumanTurn;

  // Turn Countdown Timer (30s to roll, 15s to resolve/act)
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  useEffect(() => {
    const initialDuration = phase === 'TILE_ACTION' || phase === 'RESOLVING' ? 15 : 30;
    setSecondsLeft(initialDuration);
  }, [activePlayerIndex, phase]);

  useEffect(() => {
    if (diceState.rolling || isHopping || engineState.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [diceState.rolling, isHopping, engineState.isPaused]);

  // When timer hits 0: auto-execute so game never hangs (never when paused)
  useEffect(() => {
    if (engineState.isPaused) return;
    if (secondsLeft === 0 && !diceState.rolling && !isHopping) {
      if (isHumanTurn) {
        if (canRoll) {
          engine.requestRoll();
        } else if (phase === 'TILE_ACTION') {
          engine.passProperty();
        } else if (canEndTurn) {
          engine.endTurn();
        }
      }
    }
  }, [secondsLeft, isHumanTurn, canRoll, canEndTurn, phase, diceState.rolling, isHopping, engine, engineState.isPaused]);

  const handleRollClick = () => {
    if (canRoll && !engineState.isPaused) {
      engine.requestRoll();
    }
  };

  const handleEndTurnClick = () => {
    if (canEndTurn && !engineState.isPaused) {
      engine.endTurn();
    }
  };

  return (
    <div className={`board-center-canvas ${isDimmed ? 'center-dimmed-on-hover' : ''}`}>
      {/* 1. Clean, Elegant Board Center Brand Emblem */}
      <div className={`board-center-brand ${activeAnnouncement ? 'brand-hidden' : ''}`}>
        <div className="brand-logo-text">NAVO VYAPAR</div>
        <div className="brand-tagline">GUJARAT BUSINESS BOARD</div>
      </div>

      {/* 2. Center Stage In-Game Announcement Card (Not a notification toast) */}
      {activeAnnouncement && (
        <div
          className={`board-center-announcement-card announcement-type-${activeAnnouncement.type || 'info'}`}
          onClick={() => engine.clearAnnouncement()}
          title="Click to dismiss"
        >
          <span className="center-announcement-badge">
            {activeAnnouncement.title}
          </span>
          <div className="center-announcement-body">
            {activeAnnouncement.amount !== undefined && (
              <span className={`center-announcement-amount ${activeAnnouncement.amountType === 'plus' ? 'is-plus' : 'is-minus'}`}>
                {activeAnnouncement.amountType === 'plus' ? '+' : '-'}₹{activeAnnouncement.amount.toLocaleString()}
              </span>
            )}
            <span className="center-announcement-msg">{activeAnnouncement.message}</span>
            <span className="center-announcement-dismiss-hint">tap to dismiss</span>
          </div>
        </div>
      )}

      {/* 3. Direct Floating Dice & Action Area (No Heavy Container Box, Simple & Clean) */}
      <div className="center-actions-simple">
        {/* The 3D Dice directly on tabletop */}
        <Realistic3DDice
          size={isDesktop ? 44 : 36}
          value={diceState.value}
          isRolling={diceState.rolling}
          canRoll={canRoll && !engineState.isPaused}
          onClick={handleRollClick}
        />

        {/* State 1: Ready to Roll */}
        {canRoll && !isInJail && (
          <button
            type="button"
            className={`board-center-action-btn btn-roll ${engineState.isPaused ? '' : 'pulse-roll'}`}
            onClick={handleRollClick}
            disabled={Boolean(engineState.isPaused)}
          >
            <CasinoIcon sx={{ fontSize: isDesktop ? 18 : 15 }} />
            <span>{engineState.isPaused ? `Paused (${secondsLeft}s)` : `Roll (${secondsLeft}s)`}</span>
          </button>
        )}

        {/* State 1b: In Jail Actions */}
        {canRoll && isInJail && (
          <div className="center-jail-actions">
            <button
              type="button"
              className="board-center-action-btn btn-roll"
              onClick={handleRollClick}
              disabled={Boolean(engineState.isPaused)}
            >
              <CasinoIcon sx={{ fontSize: 14 }} />
              <span>{engineState.isPaused ? 'Paused' : `Roll 6 to Escape (${secondsLeft}s)`}</span>
            </button>
            <button
              type="button"
              className="board-center-action-btn btn-jail-pay"
              disabled={(activePlayer?.balance ?? 0) < 500 || Boolean(engineState.isPaused)}
              onClick={() => engine.payJailFine()}
            >
              <MonetizationOnIcon sx={{ fontSize: 13 }} />
              <span>Pay ₹500</span>
            </button>
            {hasJailCard && (
              <button
                type="button"
                className="board-center-action-btn btn-jail-card"
                disabled={Boolean(engineState.isPaused)}
                onClick={() => engine.useGetOutOfJailCard()}
              >
                <span>Use Card</span>
              </button>
            )}
          </div>
        )}

        {/* State 3: Ready to End Turn */}
        {canEndTurn && (
          <button
            type="button"
            className="board-center-action-btn btn-end-turn"
            onClick={handleEndTurnClick}
            disabled={Boolean(engineState.isPaused)}
          >
            <span>{engineState.isPaused ? `Paused (${secondsLeft}s)` : `End Turn (${secondsLeft}s)`}</span>
            <SkipNextIcon sx={{ fontSize: isDesktop ? 18 : 15 }} />
          </button>
        )}

        {/* State 4: Opponent Turn Indicator */}
        {!isHumanTurn && activePlayer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '16px',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: isDesktop ? '11px' : '10px',
              fontWeight: 800,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activePlayer.tokenColor,
              }}
            />
            <span>{activePlayer.name}'s Turn {engineState.isPaused ? '(Paused)' : `(${secondsLeft}s)`}</span>
          </div>
        )}
      </div>
    </div>
  );
};
