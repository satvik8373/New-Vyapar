import React, { useState, useEffect, useMemo } from 'react';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { CurrencyCoin } from '../components/common/CurrencyCoin';
import { CandyButton } from '../components/common/CandyButton';
import {
  BOARD_TILES,
  DEFAULT_BOARD_TILES,
  COLOR_HEX_MAP,
  COLOR_GROUP_NAMES,
  getPropertyRentSchedule,
  PORT_RENT_SCHEDULE
} from '@shared/game-data/boardData';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import './AuctionModal.css';

// Rich cultural and economic descriptions for Gujarat landmarks & commercial hubs
const TILE_DESCRIPTIONS: Record<string, string> = {
  'Morbi': 'World-class ceramics and clockwork manufacturing hub on the Machhu River.',
  'Patan': 'Ancient capital famed for UNESCO Rani ki Vav and GI-tagged Patola textiles.',
  'Bharuch': 'Historic Narmada seaport town and bustling chemical manufacturing corridor.',
  'Mehsana': 'Flourishing northern hub of Asia’s largest Dudhsagar dairy and solar energy.',
  'Nadiad': 'Charotar commercial center, cultural heart, and birthplace of Sardar Patel.',
  'Vapi': 'Southern chemical and paper manufacturing powerhouse of Gujarat.',
  'Junagadh': 'Historic fortress citadel beneath Girnar and gateway to Asiatic lions.',
  'Rajkot': 'Vibrant Saurashtra engineering powerhouse and jewelry trading capital.',
  'Jamnagar': 'Global petrochemical refining center and brass parts manufacturing hub.',
  'Ankleshwar': 'Asia’s premier chemical industrial estate and vibrant manufacturing hub.',
  'Himatnagar': 'Sabarkantha trade center renowned for Sabar dairy and ceramics.',
  'Anand': 'The White Revolution capital and global epicenter of AMUL dairy enterprise.',
  'Gandhinagar': 'Planned green capital city, administrative center, and tech corridor.',
  'Vadodara': 'The cultural capital of fine arts, academic institutions, and pharma.',
  'Navsari': 'Twin city of Surat, historic diamond cutting center, and birthplace of Jamshedji Tata.',
  'Ahmedabad': 'Mega financial metropolis and India’s first UNESCO World Heritage City.',
  'Statue of Unity': 'Colossal 182-meter world-record monument on the Narmada River.',
  'Bhuj': 'Handicraft, textile, and cultural jewel of the Kutch desert landscape.',
  'Dholera': 'India’s premier Greenfield smart city, international airport, and semiconductor hub.',
  'GIFT City': 'India’s premier international smart financial tech metropolis (IFSC).',
  'Surat': 'The global diamond cutting and silk textile trade capital.',
  'Bhavnagar': 'Historic maritime port with tidal lock-gates and traditional trade.',
  'Kandla': 'Major national deep-water seaport handling premier global cargo traffic.',
  'Porbandar': 'Historic coastal seaport, marine trade center, and Arabian sea harbor.'
};

export const AuctionModal: React.FC = () => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((s) => setEngineState(s));
  }, [engine]);

  const { auctionState, players } = engineState;

  // Track custom human bid amount
  const [customBid, setCustomBid] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(12);

  const heroPlayer = useMemo(() => {
    return players.find((p) => p.isHuman) || players[0];
  }, [players]);

  const currentBidder = useMemo(() => {
    if (!auctionState) return null;
    return players.find((p) => p.id === auctionState.currentBidderId) || null;
  }, [auctionState, players]);

  const highestBidder = useMemo(() => {
    if (!auctionState || !auctionState.highestBidderId) return null;
    return players.find((p) => p.id === auctionState.highestBidderId) || null;
  }, [auctionState, players]);

  const isHeroTurn = Boolean(
    auctionState &&
    !auctionState.isCompleted &&
    currentBidder &&
    currentBidder.id === heroPlayer?.id
  );

  const tile = useMemo(() => {
    if (!auctionState) return null;
    return (
      BOARD_TILES.find((t) => t.step === auctionState.tileStep) ||
      DEFAULT_BOARD_TILES.find((t) => t.step === auctionState.tileStep) ||
      null
    );
  }, [auctionState]);

  const isPort = tile?.type === 'PORT';
  const propSchedule = tile ? getPropertyRentSchedule(tile.color || tile.step) : null;
  const portSchedule = PORT_RENT_SCHEDULE;

  // Minimum next valid bid starts at valuation if nobody has bid yet
  const minNextBid = useMemo(() => {
    if (!auctionState) return 100;
    if (auctionState.highestBidderId === null) {
      return auctionState.tilePrice; // Opening bid starts from current valuation
    }
    return auctionState.currentBid + (auctionState.minIncrement || 50);
  }, [auctionState]);

  // Sync default custom bid whenever minimum next bid increases
  useEffect(() => {
    setCustomBid(minNextBid);
  }, [minNextBid]);

  // Turn countdown timer
  useEffect(() => {
    if (!isHeroTurn || !auctionState || auctionState.isCompleted) {
      setTimeLeft(12);
      return;
    }

    setTimeLeft(12);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          engine.skipAuctionBid(heroPlayer.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHeroTurn, auctionState?.currentBidderId, auctionState?.isCompleted, engine, heroPlayer?.id]);

  // Keyboard shortcuts: 'B' to bid, 'P' or 'Escape' to pass
  useEffect(() => {
    if (!isHeroTurn || !auctionState || auctionState.isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        engine.skipAuctionBid(heroPlayer.id);
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'Enter') {
        if (customBid <= heroPlayer.balance && customBid >= minNextBid) {
          engine.placeBid(heroPlayer.id, customBid);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHeroTurn, customBid, minNextBid, heroPlayer, auctionState, engine]);

  if (!auctionState) return null;

  const {
    tileName,
    tileGujarati,
    tileColor,
    tilePrice,
    currentBid,
    passedPlayerIds,
    isCompleted,
    winnerId
  } = auctionState;

  const colorHex = isPort
    ? '#0284c7'
    : (tileColor ? COLOR_HEX_MAP[tileColor] || '#059669' : '#059669');

  const groupName = isPort
    ? 'Maritime Harbor'
    : (tileColor ? COLOR_GROUP_NAMES[tileColor] || 'Commercial Hub' : 'Commercial Hub');

  const tileDescription =
    TILE_DESCRIPTIONS[tileName] || 'Prime Gujarat commercial center with high footfall and reliable trade potential.';

  const siteRent = propSchedule?.siteRent || (isPort ? portSchedule?.rent1Port : 70) || 70;
  const monopolyRent = propSchedule?.monopolyRent || siteRent * 2;
  const mortgageValue = propSchedule?.mortgageValue || Math.round(tilePrice / 2);

  const canAffordCustom = heroPlayer ? heroPlayer.balance >= customBid && customBid >= minNextBid : false;

  const handlePlaceBid = (amount: number) => {
    if (heroPlayer && amount <= heroPlayer.balance && amount >= minNextBid) {
      engine.placeBid(heroPlayer.id, amount);
    }
  };

  const handlePass = () => {
    if (heroPlayer) {
      engine.skipAuctionBid(heroPlayer.id);
    }
  };

  const winnerPlayer = winnerId ? players.find((p) => p.id === winnerId) : null;

  // Quick raise options based on valuation starting price
  const quickRaiseOptions =
    auctionState.highestBidderId === null
      ? [
          { label: `Valuation (₹${tilePrice.toLocaleString()})`, amount: tilePrice },
          { label: `+₹50`, amount: tilePrice + 50 },
          { label: `+₹100`, amount: tilePrice + 100 },
          { label: `+₹250`, amount: tilePrice + 250 },
        ]
      : [
          { label: `+₹50`, amount: currentBid + 50 },
          { label: `+₹100`, amount: currentBid + 100 },
          { label: `+₹250`, amount: currentBid + 250 },
          { label: `+₹500`, amount: currentBid + 500 },
        ];

  const spriteSrc = tile?.imageUrl || '/assets/images/corners/corner_start.jpg';

  return (
    <div className="auction-modal-backdrop" aria-modal="true" role="dialog">
      <div className="auction-modal-card">
        <div className="auction-modal-layout">
          {/* ── LEFT PANE: AUTHENTIC GUJARAT PROPERTY DEED ── */}
          <aside className="auction-deed-pane">
            <div className="deed-header-ribbon" style={{ backgroundColor: colorHex }}>
              <span className="deed-sub-label">
                {isPort ? 'MARITIME HARBOR DEED' : 'TITLE DEED OF GUJARAT'}
              </span>
              <h3 className="deed-city-heading">{tileName}</h3>
              {tileGujarati && <span className="deed-gujarati-heading">{tileGujarati}</span>}
            </div>

            <div className="deed-art-stage" style={{ backgroundColor: colorHex }}>
              <img
                src={spriteSrc}
                alt={tileName}
                className="deed-art-image"
                loading="eager"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (tile?.imageUrl && img.src !== tile.imageUrl) {
                    img.src = tile.imageUrl;
                  }
                }}
              />
            </div>

            <div className="deed-details-body">
              <div className="deed-group-pill" style={{ color: colorHex, borderColor: `${colorHex}40` }}>
                {groupName}
              </div>

              <div className="deed-rates-grid">
                <div className="deed-rate-item">
                  <span className="rate-lbl">Valuation</span>
                  <span className="rate-val">
                    <CurrencyCoin size={12} />
                    {tilePrice.toLocaleString()}
                  </span>
                </div>
                <div className="deed-rate-item">
                  <span className="rate-lbl">Base Rent</span>
                  <span className="rate-val text-emerald">
                    <CurrencyCoin size={12} />
                    {siteRent.toLocaleString()}
                  </span>
                </div>
                <div className="deed-rate-item">
                  <span className="rate-lbl">Monopoly</span>
                  <span className="rate-val">
                    <CurrencyCoin size={12} />
                    {monopolyRent.toLocaleString()}
                  </span>
                </div>
                <div className="deed-rate-item">
                  <span className="rate-lbl">Mortgage</span>
                  <span className="rate-val text-muted">
                    <CurrencyCoin size={12} />
                    {mortgageValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="deed-blurb-text">{tileDescription}</p>
            </div>
          </aside>

          {/* ── RIGHT PANE: AUCTION TRADING SHEET ── */}
          <section className="auction-sheet-pane">
            {/* Header Strip */}
            <div className="sheet-header-strip">
              <div className="sheet-header-left">
                <span className="sheet-auction-badge">AUCTION</span>
                <span className="sheet-round-badge">Round {auctionState.round || 1}</span>
                <span className="sheet-city-indicator">{tileName}</span>
              </div>

              <div className="sheet-header-right">
                {isHeroTurn && !isCompleted && (
                  <span className="sheet-timer-chip">
                    <HourglassEmptyIcon sx={{ fontSize: 14 }} />
                    <span>{timeLeft}s</span>
                  </span>
                )}
                <button
                  type="button"
                  className="sheet-close-btn"
                  onClick={handlePass}
                  aria-label="Pass / Close Auction"
                  title="Pass / Close (P)"
                >
                  <CloseIcon sx={{ fontSize: 17 }} />
                </button>
              </div>
            </div>

            {/* Current Bid Showcase */}
            <div className="sheet-current-bid-box">
              <div className="current-bid-left">
                <span className="bid-box-label">
                  {highestBidder ? 'CURRENT BID' : 'STARTING BID'}
                </span>
                <div className="bid-box-figure">
                  <CurrencyCoin size={22} />
                  <span>₹{currentBid.toLocaleString()}</span>
                </div>
              </div>

              <div className="current-bid-right">
                {highestBidder ? (
                  <div className="bid-leader-badge">
                    <PlayerAvatar
                      avatar={highestBidder.avatar}
                      name={highestBidder.name}
                      color={highestBidder.tokenColor}
                      size={22}
                    />
                    <span className="bid-leader-name">{highestBidder.name}</span>
                    {highestBidder.isHuman && <span className="bid-you-tag">YOU</span>}
                    <span className="bid-status-pill">Bidding</span>
                  </div>
                ) : (
                  <span className="bid-opening-hint">Opening at ₹{minNextBid.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Players Roster in Symmetrical 2x2 Grid */}
            <div className="sheet-players-grid">
              {players
                .filter((p) => !p.isBankrupt)
                .map((p) => {
                  const isHighest = p.id === auctionState.highestBidderId;
                  const hasPassed = passedPlayerIds.includes(p.id);
                  const isThinking = p.id === auctionState.currentBidderId && !hasPassed && !isCompleted;

                  const statusText = isHighest || isThinking ? 'Bidding' : hasPassed ? 'Folded' : 'In Play';
                  const statusClass = isHighest || isThinking ? 'status-bidding' : hasPassed ? 'status-folded' : 'status-inplay';

                  return (
                    <div key={p.id} className={`sheet-player-chip ${statusClass}`}>
                      <div className="player-chip-info">
                        <PlayerAvatar
                          avatar={p.avatar}
                          name={p.name}
                          color={p.tokenColor}
                          size={21}
                        />
                        <span className="player-chip-name" style={{ color: p.tokenColor }}>
                          {p.name}
                        </span>
                        {p.isHuman && <span className="player-chip-you">YOU</span>}
                      </div>

                      <div className="player-chip-right">
                        <span className="player-chip-amt">
                          <CurrencyCoin size={11} />
                          <span>{(isHighest ? currentBid : p.balance).toLocaleString()}</span>
                        </span>
                        <span className={`player-chip-tag ${statusClass}`}>{statusText}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Controls Deck / Outcomes */}
            {isCompleted ? (
              <div className="sheet-outcome-box">
                <CheckCircleIcon sx={{ fontSize: 22, color: '#059669' }} />
                <span>
                  {winnerPlayer?.isHuman
                    ? `Congratulations! You won ${tileName} for ₹${currentBid.toLocaleString()}!`
                    : `${winnerPlayer?.name || 'Winner'} won ${tileName} for ₹${currentBid.toLocaleString()}!`}
                </span>
              </div>
            ) : isHeroTurn ? (
              <div className="sheet-controls-deck">
                {/* Stepper + Quick Raise Chips Row */}
                <div className="sheet-bid-input-row">
                  <div className="sheet-stepper">
                    <button
                      type="button"
                      className="sheet-step-btn"
                      disabled={customBid <= minNextBid}
                      onClick={() => setCustomBid((prev) => Math.max(minNextBid, prev - 50))}
                      aria-label="Decrease bid"
                    >
                      −
                    </button>
                    <div className="sheet-step-val">
                      <CurrencyCoin size={14} />
                      <span>₹{customBid.toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      className="sheet-step-btn"
                      disabled={customBid + 50 > heroPlayer.balance}
                      onClick={() => setCustomBid((prev) => prev + 50)}
                      aria-label="Increase bid"
                    >
                      +
                    </button>
                  </div>

                  <div className="sheet-quick-chips">
                    {quickRaiseOptions.map((opt, idx) => {
                      const canAfford = heroPlayer.balance >= opt.amount;
                      const isSelected = customBid === opt.amount;
                      return (
                        <CandyButton
                          key={idx}
                          variant={isSelected ? 'mint' : 'glass'}
                          size="xs"
                          disabled={!canAfford}
                          onClick={() => setCustomBid(opt.amount)}
                          className="sheet-quick-btn"
                        >
                          {opt.label}
                        </CandyButton>
                      );
                    })}
                  </div>
                </div>

                {/* Theme-based Action Buttons using CandyButton */}
                <div className="sheet-actions-row">
                  <CandyButton
                    variant="glass"
                    size="md"
                    onClick={handlePass}
                    className="sheet-candy-pass"
                  >
                    Pass (P)
                  </CandyButton>
                  <CandyButton
                    variant="mint"
                    size="md"
                    fullWidth
                    disabled={!canAffordCustom}
                    onClick={() => handlePlaceBid(customBid)}
                    className="sheet-candy-bid"
                  >
                    Bid ₹{customBid.toLocaleString()} (B)
                  </CandyButton>
                </div>
              </div>
            ) : (
              <div className="sheet-waiting-box">
                <span className="sheet-waiting-spinner" />
                <span>Waiting for {currentBidder?.name || 'Opponent'} to bid...</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

