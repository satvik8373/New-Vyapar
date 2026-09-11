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
    if (diceState.rolling || isHopping) {
      return;
    }
    const initialDuration = phase === 'TILE_ACTION' || phase === 'RESOLVING' ? 15 : 30;
    setSecondsLeft(initialDuration);

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
  }, [activePlayerIndex, phase, diceState.rolling, isHopping]);

  // When timer hits 0: auto-execute so game never hangs
  useEffect(() => {
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
  }, [secondsLeft, isHumanTurn, canRoll, canEndTurn, phase, diceState.rolling, isHopping, engine]);

  const handleRollClick = () => {
    if (canRoll) {
      engine.requestRoll();
    }
  };

  const handleEndTurnClick = () => {
    if (canEndTurn) {
      engine.endTurn();
    }
  };

  return (
    <div className={`board-center-canvas ${isDimmed ? 'center-dimmed-on-hover' : ''}`}>
      {/* 1. Center Gujarat Heritage & Progress Diorama (Clean & Proportional) */}
      <img
        src="/assets/images/board_center_element.png"
        alt="Gujarat Heritage & Progress Diorama"
        className={`board-center-diorama ${activeAnnouncement ? 'diorama-hidden' : ''}`}
        loading="eager"
      />

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
            <span className="center-announcement-msg">{activeAnnouncement.message}</span>
            {activeAnnouncement.amount !== undefined && (
              <span className={`center-announcement-amount ${activeAnnouncement.amountType === 'plus' ? 'is-plus' : ''}`}>
                {activeAnnouncement.amountType === 'plus' ? '+' : ''}₹{activeAnnouncement.amount.toLocaleString()}
              </span>
            )}
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
          canRoll={canRoll}
          onClick={handleRollClick}
        />

        {/* State 1: Ready to Roll */}
        {canRoll && !isInJail && (
          <button
            type="button"
            className="board-center-action-btn btn-roll pulse-roll"
            onClick={handleRollClick}
          >
            <CasinoIcon sx={{ fontSize: isDesktop ? 18 : 15 }} />
            <span>Roll ({secondsLeft}s)</span>
          </button>
        )}

        {/* State 1b: In Jail Actions */}
        {canRoll && isInJail && (
          <div className="center-jail-actions">
            <button
              type="button"
              className="board-center-action-btn btn-roll"
              onClick={handleRollClick}
            >
              <CasinoIcon sx={{ fontSize: 14 }} />
              <span>Roll Doubles ({secondsLeft}s)</span>
            </button>
            <button
              type="button"
              className="board-center-action-btn btn-jail-pay"
              disabled={(activePlayer?.balance ?? 0) < 500}
              onClick={() => engine.payJailFine()}
            >
              <MonetizationOnIcon sx={{ fontSize: 13 }} />
              <span>Pay ₹500</span>
            </button>
            {hasJailCard && (
              <button
                type="button"
                className="board-center-action-btn btn-jail-card"
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
          >
            <span>End Turn ({secondsLeft}s)</span>
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
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.82)',
              color: '#ffffff',
              fontSize: isDesktop ? '11px' : '10px',
              fontWeight: 700,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activePlayer.tokenColor,
                boxShadow: `0 0 8px ${activePlayer.tokenColor}`
              }}
            />
            <span>{activePlayer.name}'s Turn ({secondsLeft}s)</span>
          </div>
        )}
      </div>
    </div>
  );
};
