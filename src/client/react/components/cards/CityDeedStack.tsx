import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  BoardTileStep,
  COLOR_HEX_MAP,
  DEFAULT_BOARD_TILES,
  getPropertyRentSchedule,
  PORT_RENT_SCHEDULE
} from '@shared/game-data/boardData';
import { CurrencyCoin } from '../common/CurrencyCoin';
import './CityDeedStack.css';

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity?: number;
  disableDrag?: boolean;
  isTopCard?: boolean;
}

function CardRotate({
  children,
  onSendToBack,
  sensitivity = 140,
  disableDrag = false,
  isTopCard = true
}: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [50, -50]);
  const rotateY = useTransform(x, [-100, 100], [-50, 50]);

  function handleDragEnd(_: any, info: any) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity ||
      Math.abs(info.velocity.x) > 350 ||
      Math.abs(info.velocity.y) > 350
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  // Cards underneath should not intercept pointer/drag events
  if (disableDrag || !isTopCard) {
    return (
      <div
        className="card-rotate-disabled"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: isTopCard ? 'auto' : 'none'
        }}
        onClick={isTopCard ? onSendToBack : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="card-rotate"
      style={{
        x,
        y,
        rotateX,
        rotateY,
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      whileTap={{ scale: 0.985 }}
      onDragEnd={handleDragEnd}
      onTap={onSendToBack}
    >
      {children}
    </motion.div>
  );
}

export interface CityDeedStackProps {
  tiles: BoardTileStep[];
  highlightStep?: number;
  randomRotation?: boolean;
  sensitivity?: number;
  animationConfig?: { stiffness: number; damping: number };
  sendToBackOnClick?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
  compact?: boolean;
  isBig?: boolean;
  onCardClick?: (tile: BoardTileStep) => void;
}

export const CityDeedStack: React.FC<CityDeedStackProps> = ({
  tiles = [],
  highlightStep,
  randomRotation = false,
  sensitivity = 140,
  animationConfig = { stiffness: 280, damping: 22 },
  sendToBackOnClick = true,
  autoplay = false,
  autoplayDelay = 3200,
  pauseOnHover = true,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
  compact = false,
  isBig = false,
  onCardClick
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isFlippingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const shouldDisableDrag = mobileClickOnly && isMobile;

  // Build stack array: items are placed such that the last element is the top card
  const [stack, setStack] = useState<{ id: number; tile: BoardTileStep }[]>(() => {
    const sorted = [...tiles];
    if (highlightStep !== undefined) {
      const hIdx = sorted.findIndex((t) => t.step === highlightStep);
      if (hIdx >= 0) {
        const [hTile] = sorted.splice(hIdx, 1);
        sorted.push(hTile); // Last in array = top card shown to user
      }
    }
    return sorted.map((t, index) => ({ id: t.step ?? index + 1, tile: t }));
  });

  useEffect(() => {
    const sorted = [...tiles];
    if (highlightStep !== undefined) {
      const hIdx = sorted.findIndex((t) => t.step === highlightStep);
      if (hIdx >= 0) {
        const [hTile] = sorted.splice(hIdx, 1);
        sorted.push(hTile);
      }
    }
    setStack(sorted.map((t, index) => ({ id: t.step ?? index + 1, tile: t })));
  }, [tiles, highlightStep]);

  // Robust, debounced send-to-back prevents duplicate click/tap triggers
  const sendToBack = (id: number) => {
    if (isFlippingRef.current) return;
    isFlippingRef.current = true;
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 220);

    setStack((prev) => {
      const newStack = [...prev];
      const index = newStack.findIndex((card) => card.id === id);
      if (index === -1) return prev;
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card); // Move to bottom of stack
      return newStack;
    });
  };

  const nextCard = () => {
    if (stack.length <= 1) return;
    const topCardId = stack[stack.length - 1].id;
    sendToBack(topCardId);
  };

  const prevCard = () => {
    if (stack.length <= 1) return;
    if (isFlippingRef.current) return;
    isFlippingRef.current = true;
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 220);

    setStack((prev) => {
      const newStack = [...prev];
      const bottomCard = newStack.shift();
      if (bottomCard) newStack.push(bottomCard);
      return newStack;
    });
  };

  // Keyboard navigation for card stack
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevCard();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stack]);

  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1].id;
        sendToBack(topCardId);
      }, autoplayDelay);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused]);

  if (!tiles || tiles.length === 0) {
    return (
      <div className={`city-deed-stack-empty ${compact ? 'is-compact' : ''}`}>
        <p>No city deeds acquired yet.</p>
      </div>
    );
  }

  const topCard = stack[stack.length - 1];
  const currentCardIndex = tiles.findIndex((t) => t.step === topCard?.tile.step);
  const currentNum = currentCardIndex >= 0 ? currentCardIndex + 1 : stack.length;

  return (
    <div
      className={`city-deed-stack-container ${compact ? 'is-compact' : ''} ${isBig ? 'is-big' : ''}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const tile = card.tile;
        const isPort = tile.type === 'PORT';
        const colorHex = isPort
          ? '#0284c7'
          : (tile.color ? COLOR_HEX_MAP[tile.color] || '#334155' : '#475569');
        const isTopCard = index === stack.length - 1;
        const isJustAcquired = highlightStep !== undefined && tile.step === highlightStep;
        const randomRotate = randomRotation ? ((index * 9) % 10) - 5 : 0;

        const propSchedule = getPropertyRentSchedule(tile.color || tile.step);
        const portSchedule = PORT_RENT_SCHEDULE;

        const baseRent = isPort ? portSchedule.rent1Port : propSchedule.siteRent;
        const mortgageValue = isPort ? portSchedule.mortgageValue : propSchedule.mortgageValue;
        const purchasePrice = tile.price || (isPort ? portSchedule.price : 1000);

        // Resolve high-resolution city figurine/landmark sprite safely
        const defaultMatch = DEFAULT_BOARD_TILES.find(
          (t) => t.name.trim().toUpperCase() === tile.name.trim().toUpperCase()
        );
        const spriteSrc =
          tile.imageUrl || defaultMatch?.imageUrl || '/assets/images/corners/corner_start.jpg';

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
            isTopCard={isTopCard}
          >
            <motion.div
              className={`city-deed-card ${isTopCard ? 'is-top-card' : ''}`}
              animate={{
                rotateZ: (stack.length - index - 1) * 3.5 + randomRotate,
                scale: 1 + index * 0.055 - stack.length * 0.055,
                transformOrigin: '85% 85%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
              style={{
                '--deed-color': colorHex
              } as React.CSSProperties}
            >
              {/* Header Ribbon with authentic Gujarat styling */}
              <div className="deed-card-header-band" style={{ backgroundColor: colorHex }}>
                <div className="deed-header-top-row">
                  <span className="deed-header-sub">
                    {isPort ? 'MARITIME HARBOR DEED' : 'TITLE DEED OF GUJARAT'}
                  </span>
                  {isJustAcquired && (
                    <span className="deed-just-acquired-pill">NEW</span>
                  )}
                </div>
                <h3 className="deed-city-name" title={tile.name}>{tile.name}</h3>
                {tile.gujaratiName && (
                  <span className="deed-city-gujarati">{tile.gujaratiName}</span>
                )}
              </div>

              {/* High-Resolution Figurine Stage */}
              <div className="deed-card-art-stage">
                <img
                  src={spriteSrc}
                  alt={tile.name}
                  className="deed-art-sprite"
                  loading="eager"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (tile.imageUrl && img.src !== tile.imageUrl) {
                      img.src = tile.imageUrl;
                    }
                  }}
                />
              </div>

              {/* Rent Schedule Table */}
              <div className="deed-card-body">
                {isPort ? (
                  <>
                    <div className="deed-stat-row main-rent">
                      <span className="deed-label">Single Berth Tariff</span>
                      <span className="deed-value font-emerald">
                        <CurrencyCoin size={13} />
                        {portSchedule.rent1Port.toLocaleString()}
                      </span>
                    </div>

                    <div className="deed-schedule-mini">
                      <div className="schedule-row">
                        <span>With 1 Seaport owned</span>
                        <span>₹{portSchedule.rent1Port.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row">
                        <span>With 2 Seaports owned</span>
                        <span>₹{portSchedule.rent2Ports.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row hotel-row">
                        <span style={{ fontWeight: 800 }}>With all 3 Seaports</span>
                        <span className="font-emerald">₹{portSchedule.rent3Ports.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row" style={{ color: '#64748b', fontSize: '9px', fontStyle: 'italic', paddingTop: '3px' }}>
                        <span>Tariff scales 2× &amp; 4× across ports</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="deed-stat-row main-rent">
                      <span className="deed-label">Base Commercial Rent</span>
                      <span className="deed-value font-emerald">
                        <CurrencyCoin size={13} />
                        {propSchedule.siteRent.toLocaleString()}
                      </span>
                    </div>

                    <div className="deed-schedule-mini">
                      <div className="schedule-row">
                        <span>With 1 Commercial House</span>
                        <span>₹{propSchedule.rent1House.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row">
                        <span>With 2 Commercial Houses</span>
                        <span>₹{propSchedule.rent2Houses.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row">
                        <span>With 3 Commercial Houses</span>
                        <span>₹{propSchedule.rent3Houses.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row">
                        <span>With 4 Commercial Houses</span>
                        <span>₹{propSchedule.rent4Houses.toLocaleString()}</span>
                      </div>
                      <div className="schedule-row hotel-row">
                        <span>With Luxury Hotel Complex</span>
                        <span className="font-emerald">₹{propSchedule.rentHotel.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Footer Price & Mortgage */}
                <div className="deed-card-footer">
                  <div className="deed-footer-col">
                    <span className="deed-footer-label">MORTGAGE VALUE</span>
                    <span className="deed-footer-val">
                      ₹{mortgageValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="deed-footer-col text-right">
                    <span className="deed-footer-label">PURCHASE VALUE</span>
                    <span className="deed-footer-val font-bold">
                      ₹{purchasePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drag / Flip Guidance Bar */}
              {isTopCard && (
                <div className="deed-drag-hint">
                  {stack.length > 1
                    ? `Tap card or swipe to flip • (${currentNum}/${tiles.length})`
                    : '1 Deed Owned'}
                </div>
              )}
            </motion.div>
          </CardRotate>
        );
      })}

      {/* Floating Prev / Next Quick Controls */}
      {stack.length > 1 && (
        <div className="deed-floating-nav-bar" onClick={(e) => e.stopPropagation()}>
          <button
            className="deed-nav-arrow-btn"
            onClick={(e) => {
              e.stopPropagation();
              prevCard();
            }}
            title="Previous Card (←)"
          >
            ‹
          </button>
          <span className="deed-nav-counter-pill">
            Card {currentNum} of {tiles.length} • Tap Card to Flip
          </span>
          <button
            className="deed-nav-arrow-btn"
            onClick={(e) => {
              e.stopPropagation();
              nextCard();
            }}
            title="Next Card (→ / Space)"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

