import React, { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { LayoutGroup } from 'framer-motion';
import { PlayerData } from '@shared/types/player';
import { BOARD_TILES, BoardTileStep } from '@shared/game-data/boardData';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { BoardTileCell } from './board/BoardTileCell';
import { BoardCornerCell } from './board/BoardCornerCell';
import { BoardCenter } from './board/BoardCenter';
import './BoardDivSheet.css';

export type { BoardTileStep };

export interface BoardDivSheetHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleSize: () => void;
  getScale: () => number;
}

interface BoardDivSheetProps {
  onTileClick?: (tile: BoardTileStep) => void;
  onScaleChange?: (scale: number) => void;
}

export const BoardDivSheet = forwardRef<BoardDivSheetHandle, BoardDivSheetProps>(({ onTileClick, onScaleChange }, ref) => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  // ── Mobile Pan & Zoom State ──
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    initialScale: number;
    initialDistance: number;
  }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    initialScale: 1,
    initialDistance: 0
  });

  const hasDraggedRef = useRef<boolean>(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });

  useEffect(() => {
    return engine.subscribe((state) => {
      setEngineState(state);
    });
  }, [engine]);

  const { players, activePlayerIndex, phase, diceState, hoppingState } = engineState;
  const activePlayer = players[activePlayerIndex] || null;
  const isHopping = Boolean(hoppingState);

  // ── Clamping helpers ──
  const clampPan = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1.02) return { x: 0, y: 0 };
    const boardEl = boardRef.current;
    const w = boardEl ? boardEl.offsetWidth : 360;
    const h = boardEl ? boardEl.offsetHeight : 360;
    const maxPanX = ((currentScale - 1) * w) / 2;
    const maxPanY = ((currentScale - 1) * h) / 2;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y))
    };
  }, []);

  // ── Touch Event Handlers for Mobile Pinch & Pan ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: pan.x,
        initialPanY: pan.y,
        initialScale: scale,
        initialDistance: 0
      };
      hasDraggedRef.current = false;
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = {
        startX: (t1.clientX + t2.clientX) / 2,
        startY: (t1.clientY + t2.clientY) / 2,
        initialPanX: pan.x,
        initialPanY: pan.y,
        initialScale: scale,
        initialDistance: dist
      };
      hasDraggedRef.current = true;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    if (e.touches.length === 2 && touchStartRef.current.initialDistance > 0) {
      // 2-finger Pinch to Zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchStartRef.current.initialDistance;
      const targetScale = Math.max(1, Math.min(2.5, touchStartRef.current.initialScale * ratio));

      setScale(targetScale);
      if (targetScale <= 1.02) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((prev) => clampPan(prev.x, prev.y, targetScale));
      }
      hasDraggedRef.current = true;
    } else if (e.touches.length === 1) {
      // 1-finger Drag to Pan (active when zoomed in)
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.startX;
      const dy = touch.clientY - touchStartRef.current.startY;

      if (Math.hypot(dx, dy) > 8) {
        hasDraggedRef.current = true;
      }

      if (scale > 1.05) {
        const nextX = touchStartRef.current.initialPanX + dx;
        const nextY = touchStartRef.current.initialPanY + dy;
        setPan(clampPan(nextX, nextY, scale));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(false);

    // If scaled back to near 1x, reset completely
    if (scale <= 1.05) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }

    // Double tap detector
    if (e.changedTouches.length === 1 && !hasDraggedRef.current) {
      const now = Date.now();
      const touch = e.changedTouches[0];
      const timeDiff = now - lastTapRef.current.time;
      const dist = Math.hypot(touch.clientX - lastTapRef.current.x, touch.clientY - lastTapRef.current.y);

      if (timeDiff < 320 && dist < 24) {
        // Double-tap toggle: 1x <-> 1.85x
        if (scale > 1.1) {
          setScale(1);
          setPan({ x: 0, y: 0 });
        } else {
          const targetScale = 1.85;
          setScale(targetScale);
          // Gently shift focus towards tap position
          const stageEl = stageRef.current;
          if (stageEl) {
            const rect = stageEl.getBoundingClientRect();
            const tapOffsetX = touch.clientX - (rect.left + rect.width / 2);
            const tapOffsetY = touch.clientY - (rect.top + rect.height / 2);
            setPan(clampPan(-tapOffsetX * 0.7, -tapOffsetY * 0.7, targetScale));
          }
        }
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        return;
      }
      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
    }
  };

  // ── Floating Zoom Button Controls ──
  const handleZoomStep = (delta: number) => {
    setScale((prev) => {
      const next = Math.max(1, Math.min(2.5, +(prev + delta).toFixed(2)));
      if (next <= 1.02) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((p) => clampPan(p.x, p.y, next));
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoomStep(0.35),
    zoomOut: () => handleZoomStep(-0.35),
    resetZoom: handleResetZoom,
    toggleSize: () => {
      if (scale > 1.1) {
        handleResetZoom();
      } else {
        setScale(1.75);
        setPan({ x: 0, y: 0 });
      }
    },
    getScale: () => scale
  }), [scale, clampPan]);

  const handleTileClickSafe = (tile: BoardTileStep) => {
    if (hasDraggedRef.current) return;
    onTileClick?.(tile);
  };

  return (
    <div
      ref={stageRef}
      className="board-stage-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (engineState.hoveredOwnerId) {
          engine.setHoveredOwner(null);
        }
      }}
    >
      <div
        ref={boardRef}
        className="board-outer-frame"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform'
        }}
      >
        <LayoutGroup id="board-player-tokens">
          <div className="board-grid-9x9">
            {/* 32 Perimeter Tiles (4 Corners + 28 Edge Properties) */}
            {BOARD_TILES.map((tile) => {
              const owner = players.find((p) => p.ownedPropertyIds?.includes(tile.step));
              const playersOnTile = players.filter((p) => p.currentTileIndex === tile.step);
              const isActiveTile = activePlayer?.currentTileIndex === tile.step;

              const hasHoveredOwner = Boolean(engineState.hoveredOwnerId);
              const isOwnerHovered = Boolean(hasHoveredOwner && owner && engineState.hoveredOwnerId === owner.id);
              const isTileDimmed = hasHoveredOwner && !isOwnerHovered;

              if (tile.isCorner) {
                return (
                  <BoardCornerCell
                    key={tile.step}
                    tile={tile}
                    playersOnTile={playersOnTile}
                    isActiveTile={isActiveTile}
                    activePlayerId={activePlayer?.id}
                    isHopping={isHopping}
                    isDimmed={hasHoveredOwner}
                    onClick={handleTileClickSafe}
                  />
                );
              }

              return (
                <BoardTileCell
                  key={`${tile.step}-${tile.name}`}
                  tile={tile}
                  owner={owner}
                  playersOnTile={playersOnTile}
                  isActiveTile={isActiveTile}
                  activePlayerId={activePlayer?.id}
                  isHopping={isHopping}
                  houses={engineState.propertyHouses[tile.step] || 0}
                  isMortgaged={engineState.mortgagedProperties.includes(tile.step)}
                  isOwnerHovered={isOwnerHovered}
                  isDimmed={isTileDimmed}
                  rentAmount={owner ? engine.calculateRent(tile.step).amount : undefined}
                  onClick={handleTileClickSafe}
                />
              );
            })}

            {/* Central 7x7 Play Canvas — Integrated Dice & Action Console */}
            <BoardCenter isDimmed={Boolean(engineState.hoveredOwnerId)} />
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
});
