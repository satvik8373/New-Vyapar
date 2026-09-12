import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import {
  COLOR_HEX_MAP,
  DEFAULT_BOARD_TILES,
  COLOR_GROUP_NAMES,
  getPropertyRentSchedule,
  PORT_RENT_SCHEDULE
} from '@shared/game-data/boardData';
import { CurrencyCoin } from '../components/common/CurrencyCoin';
import { GreenHouseIcon, RedHotelIcon } from '../components/common/HouseHotelIcons';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { CandyButton } from '../components/common/CandyButton';
import { CandyPill } from '../components/common/CandyPill';
import './PropertySheet.css';

// Scenic City & Landmark Background Photographic Map by City Name
const LANDMARK_SCENIC_BY_NAME: Record<string, string> = {
  'DWARKA': '/assets/images/landmarks/dwarka.jpg',
  'GIFT CITY': '/assets/images/landmarks/gift_city.jpg',
  'SURAT': '/assets/images/landmarks/surat_diamond.jpg',
  'SURAT DIAMOND': '/assets/images/landmarks/surat_diamond.jpg',
  'SOMNATH': '/assets/images/landmarks/somnath.jpg',
  'AMBAJI': '/assets/images/landmarks/ambaji.jpg',
  'STATUE OF UNITY': '/assets/images/landmarks/statue_of_unity.jpg',
  'KANDLA PORT': '/assets/images/landmarks/kandla_port.jpg',
  'KANDLA': '/assets/images/landmarks/kandla_port.jpg'
};

export const PropertySheet: React.FC = () => {
  const engine = GameEngine.getInstance();
  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());

  useEffect(() => {
    return engine.subscribe((state) => setEngineState(state));
  }, [engine]);

  const { selectedProperty, players, activePlayerIndex, phase, propertyHouses, mortgagedProperties } = engineState;
  const activePlayer = players[activePlayerIndex];
  const heroPlayer = players.find((p) => p.isHuman) || players[0];
  const isMyTurn = activePlayer?.id === heroPlayer?.id;

  const canAfford = Boolean(heroPlayer && selectedProperty?.price && heroPlayer.balance >= selectedProperty.price);

  // Keyboard shortcut support: 'B' for Buy, 'P' or 'Escape' for Pass/Close
  useEffect(() => {
    if (!selectedProperty) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'TILE_ACTION' && isMyTurn) {
          engine.passProperty();
        } else {
          engine.closePropertyModal();
        }
      } else if ((e.key === 'p' || e.key === 'P') && phase === 'TILE_ACTION' && isMyTurn) {
        engine.passProperty();
      } else if ((e.key === 'b' || e.key === 'B') && canAfford && phase === 'TILE_ACTION' && isMyTurn) {
        engine.buyProperty(selectedProperty.step);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProperty, canAfford, phase, isMyTurn, engine]);

  if (!selectedProperty || !heroPlayer) return null;

  // Suppress buy modal for non-active players (e.g. opponent taking their turn)
  if (phase === 'TILE_ACTION' && !isMyTurn) {
    return null;
  }

  const tile = selectedProperty;
  const tileStep = tile.step;
  const isPropertyTile = tile.type === 'PROPERTY' || tile.type === 'PORT' || tile.price !== null;
  const isPort = tile.type === 'PORT';
  const owner = players.find((p) => p.ownedPropertyIds?.includes(tileStep));
  const isOwnedByHero = owner?.id === heroPlayer.id;
  const isOwnedByOther = Boolean(owner && owner.id !== heroPlayer.id);

  const isSpecialTile =
    tile.type === 'TAX' ||
    tile.type === 'BANK' ||
    tile.type === 'SPECIAL' ||
    tile.type === 'CHANCE';

  const tileColor = isPort
    ? '#0284c7'
    : (tile.color ? COLOR_HEX_MAP[tile.color] || '#3b82f6' : (
        tile.type === 'TAX' ? '#e11d48' :
        tile.type === 'BANK' ? '#0284c7' :
        tile.type === 'SPECIAL' ? '#d97706' :
        tile.type === 'CHANCE' ? '#8b5cf6' : '#3b82f6'
      ));
  const regionName = isPort
    ? 'Maritime Seaport'
    : (tile.color ? COLOR_GROUP_NAMES[tile.color] || 'Gujarat Commercial' : 'Gujarat Commercial');
  const tileGujarati = tile.gujaratiName || 'ગુજરાત સનદ';

  const propSchedule = getPropertyRentSchedule(tile.color || tileStep);
  const portSchedule = PORT_RENT_SCHEDULE;

  const price = tile.price || (isPort ? portSchedule.price : 0);
  const baseRent = isPort ? portSchedule.rent1Port : propSchedule.siteRent;
  const houseCost = isPort ? 0 : propSchedule.houseCost;
  const mortgageValue = isPort ? portSchedule.mortgageValue : propSchedule.mortgageValue;
  const unmortgageCost = isPort ? portSchedule.unmortgageCost : propSchedule.unmortgageCost;

  const currentHouses = propertyHouses[tileStep] || 0;
  const isMortgaged = mortgagedProperties.includes(tileStep);

  const rent1 = propSchedule.rent1House;
  const rent2 = propSchedule.rent2Houses;
  const rent3 = propSchedule.rent3Houses;
  const rent4 = propSchedule.rent4Houses;
  const rentHotel = propSchedule.rentHotel;

  const currentRent = isPropertyTile ? engine.calculateRent(tileStep) : { amount: 0, tier: 'None', isDoubled: false };
  const hasMonopoly = owner && tile.color ? engine.ownsColorGroup(owner.id, tile.color) : false;

  const canBuildHouse = !isPort && isOwnedByHero && hasMonopoly && !isMortgaged && currentHouses < 5 && heroPlayer.balance >= houseCost;
  const canSellHouse = !isPort && isOwnedByHero && currentHouses > 0;
  const sellHouseValue = Math.round(houseCost * 0.5);
  const sellPropertyValue = Math.round(price * 0.5);

  // Find original tile blueprint for photo/art assets
  const originalCityTile = DEFAULT_BOARD_TILES.find(
    (t) => t.name.trim().toUpperCase() === tile.name.trim().toUpperCase() || t.step === tileStep
  );
  const originalStep = originalCityTile ? originalCityTile.step : tileStep;

  // Background scenic photograph resolution
  const cityBgImage =
    tile.imageUrl ||
    LANDMARK_SCENIC_BY_NAME[tile.name.trim().toUpperCase()] ||
    `/assets/images/cities/tile_${originalStep}_card.jpg` ||
    `/assets/images/landmarks/statue_of_unity.jpg`;

  const handleBuy = () => {
    engine.buyProperty(tileStep);
  };

  const handleCancel = () => {
    if (phase === 'TILE_ACTION' && isMyTurn) {
      engine.passProperty();
    } else {
      engine.closePropertyModal();
    }
  };

  const handleBuild = () => {
    engine.buildHouse(tileStep, heroPlayer.id);
  };

  const handleSellHouse = () => {
    engine.sellHouse(tileStep, heroPlayer.id);
  };

  const handleSellProperty = () => {
    engine.sellProperty(tileStep, heroPlayer.id);
  };

  const handleMortgage = () => {
    if (isMortgaged) {
      engine.unmortgageProperty(tileStep, heroPlayer.id);
    } else {
      engine.mortgageProperty(tileStep, heroPlayer.id);
    }
  };

  // Determine whether turn action buttons should render in left column
  const hasTurnActions =
    (!owner && isPropertyTile && phase === 'TILE_ACTION' && isMyTurn) ||
    (owner && isOwnedByHero && isPropertyTile);

  const actionButtonsContent = hasTurnActions ? (
    <div className="candy-deed-actions">
      {!owner && isPropertyTile && phase === 'TILE_ACTION' && isMyTurn && (
        <div className="deed-dual-actions">
          <CandyButton
            variant="glass"
            size="md"
            onClick={handleCancel}
            style={{ flex: 1 }}
          >
            Pass (P)
          </CandyButton>
          <CandyButton
            variant="mint"
            size="md"
            disabled={!canAfford}
            onClick={handleBuy}
            style={{ flex: 1.4 }}
          >
            Buy ₹{price.toLocaleString()} (B)
          </CandyButton>
        </div>
      )}

      {isOwnedByHero && isPropertyTile && (
        <div className="candy-owner-actions">
          {!isPort && currentHouses < 5 && (
            <>
              <CandyButton
                fullWidth
                variant="mint"
                size="sm"
                disabled={!canBuildHouse}
                onClick={handleBuild}
              >
                {currentHouses === 4
                  ? `Build Hotel (+₹${houseCost.toLocaleString()})`
                  : `Build House (+₹${houseCost.toLocaleString()})`}
              </CandyButton>
              {!hasMonopoly && (
                <div style={{ fontSize: '10.5px', color: '#64748b', textAlign: 'center', marginTop: '4px', fontWeight: 600 }}>
                  Own all 3 {tile.color?.toUpperCase()} properties to build
                </div>
              )}
            </>
          )}

          {!isPort && currentHouses > 0 && (
            <CandyButton
              fullWidth
              variant="honey"
              size="sm"
              onClick={handleSellHouse}
              icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
            >
              Sell Building (+₹{sellHouseValue.toLocaleString()})
            </CandyButton>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            {isMortgaged ? (
              <CandyButton
                fullWidth
                variant="azure"
                size="sm"
                onClick={handleMortgage}
                disabled={heroPlayer.balance < unmortgageCost}
              >
                Redeem (-₹{unmortgageCost.toLocaleString()})
              </CandyButton>
            ) : (
              <CandyButton
                fullWidth
                variant="glass"
                size="sm"
                onClick={handleMortgage}
                disabled={currentHouses > 0}
              >
                Mortgage (+₹{mortgageValue.toLocaleString()})
              </CandyButton>
            )}

            {currentHouses === 0 && !isMortgaged && (
              <CandyButton
                fullWidth
                variant="danger"
                size="sm"
                onClick={handleSellProperty}
              >
                Sell (+₹{sellPropertyValue.toLocaleString()})
              </CandyButton>
            )}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      className="candy-deed-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div className="candy-deed-modal">
        {/* ── 1. UNIFIED FULL-WIDTH TOP COLOR BAND ── */}
        <div className="candy-deed-top-band" style={{ backgroundColor: tileColor }}>
          <div className="candy-deed-band-left">
            <div className="candy-deed-badge-row">
              <span className="candy-deed-badge-text">
                {isPort ? 'MARITIME HARBOR DEED' : (isPropertyTile ? 'TITLE DEED' : 'LANDMARK')}
              </span>
              <span className="candy-deed-slot-pill">SLOT #{tileStep}</span>
            </div>
            <span className="candy-deed-band-region">{regionName}</span>
          </div>

          {/* Single, Unified Close Button in Top Corner */}
          <button
            className="candy-deed-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 17 }} />
          </button>
        </div>

        {/* ── 2. TWO-COLUMN SPLIT CONTAINER ── */}
        <div className="candy-deed-columns">
          {/* Left Column: Seamless Scenic Photography & Turn Action Buttons */}
          <div className={`candy-deed-left-pane ${hasTurnActions ? 'with-actions' : 'photo-only'}`}>
            <div
              className="candy-deed-scenic-header"
              style={
                isSpecialTile
                  ? { backgroundColor: tileColor, backgroundImage: `linear-gradient(135deg, ${tileColor}, #0f172a)` }
                  : { backgroundImage: `url("${cityBgImage}")` }
              }
            >
              <div className="candy-deed-scenic-overlay" />

              {isSpecialTile && tile.imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '110px', position: 'relative', zIndex: 2 }}>
                  <img
                    src={tile.imageUrl}
                    alt={tile.name}
                    style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
                  />
                </div>
              )}

              <div className="candy-deed-header-bottom">
                <div className="candy-deed-title-group">
                  <h2 className="candy-deed-title">{tile.name}</h2>
                  <div className="candy-deed-gujarati">{tileGujarati}</div>
                </div>

                {isPropertyTile && (
                  <div className="candy-deed-price-badge">
                    <CurrencyCoin size={14} /> ₹{price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Turn Action Buttons (Buy, Pass, Mortgage) */}
            {actionButtonsContent}
          </div>

          {/* Right Column: Financial Ledger & Rent Schedule */}
          <div className="candy-deed-right-pane">
          <div className="candy-deed-body">
          {isPropertyTile ? (
            isPort ? (
              <>
                {/* Seaport Status Bar */}
                <div className="candy-deed-base-rent-row">
                  <div className="base-rent-label">
                    <span className="base-rent-dot" style={{ backgroundColor: '#0284c7' }} />
                    <span>Single Port Berth Tariff</span>
                  </div>
                  <div className="base-rent-val">
                    <CurrencyCoin size={15} />
                    <span>₹{portSchedule.rent1Port.toLocaleString()}</span>
                  </div>
                </div>

                {/* Port Rent Schedule */}
                <div className="candy-rent-schedule">
                  {(() => {
                    const ownedPortCount = owner
                      ? DEFAULT_BOARD_TILES.filter((t) => t.type === 'PORT' && owner.ownedPropertyIds?.includes(t.step)).length
                      : 0;
                    return (
                      <>
                        <div className={`candy-schedule-row ${ownedPortCount === 1 ? 'tier-active' : ''}`}>
                          <div className="schedule-left">
                            <span style={{ fontSize: 13, marginRight: 6 }}>⚓</span>
                            <span>With 1 Seaport owned</span>
                            {ownedPortCount === 1 && <span className="current-tier-badge">ACTIVE</span>}
                          </div>
                          <span className="schedule-val">₹{portSchedule.rent1Port.toLocaleString()}</span>
                        </div>

                        <div className={`candy-schedule-row ${ownedPortCount === 2 ? 'tier-active' : ''}`}>
                          <div className="schedule-left">
                            <span style={{ fontSize: 13, marginRight: 6 }}>⚓⚓</span>
                            <span>With 2 Seaports owned</span>
                            {ownedPortCount === 2 && <span className="current-tier-badge">ACTIVE</span>}
                          </div>
                          <span className="schedule-val">₹{portSchedule.rent2Ports.toLocaleString()}</span>
                        </div>

                        <div className={`candy-schedule-row hotel-row ${ownedPortCount >= 3 ? 'tier-active' : ''}`}>
                          <div className="schedule-left">
                            <span style={{ fontSize: 13, marginRight: 6 }}>⚓⚓⚓</span>
                            <span style={{ fontWeight: 800 }}>With all 3 Seaports owned</span>
                            {ownedPortCount >= 3 && <span className="current-tier-badge">ACTIVE</span>}
                          </div>
                          <span className="schedule-val hotel-val">₹{portSchedule.rent3Ports.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Economic Ledger Grid for Ports */}
                <div className="candy-deed-ledger-grid">
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Asset Type</span>
                    <span className="ledger-val">Maritime Port</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Rent Multiplier</span>
                    <span className="ledger-val">2× / 4×</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Mortgage Value</span>
                    <span className="ledger-val">₹{mortgageValue.toLocaleString()}</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Redeem (+10%)</span>
                    <span className="ledger-val">₹{unmortgageCost.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Regional Monopoly Highlight Banner */}
                {hasMonopoly && (
                  <div className="candy-deed-monopoly-banner">
                    <span>Regional Monopoly Active • 2× Rent</span>
                  </div>
                )}

                {/* Base Rent Highlight Bar */}
                <div className="candy-deed-base-rent-row">
                  <div className="base-rent-label">
                    <span className="base-rent-dot" style={{ backgroundColor: tileColor }} />
                    <span>Base Rent (Site Rent)</span>
                  </div>
                  <div className="base-rent-val">
                    <CurrencyCoin size={15} />
                    <span>₹{baseRent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Rent Schedule */}
                <div className="candy-rent-schedule">
                  <div className={`candy-schedule-row ${currentHouses === 1 ? 'tier-active' : ''}`}>
                    <div className="schedule-left">
                      <GreenHouseIcon size={14} />
                      <span>With 1 House</span>
                      {currentHouses === 1 && <span className="current-tier-badge">ACTIVE</span>}
                    </div>
                    <span className="schedule-val">₹{rent1.toLocaleString()}</span>
                  </div>

                  <div className={`candy-schedule-row ${currentHouses === 2 ? 'tier-active' : ''}`}>
                    <div className="schedule-left">
                      <GreenHouseIcon size={14} />
                      <span>With 2 Houses</span>
                      {currentHouses === 2 && <span className="current-tier-badge">ACTIVE</span>}
                    </div>
                    <span className="schedule-val">₹{rent2.toLocaleString()}</span>
                  </div>

                  <div className={`candy-schedule-row ${currentHouses === 3 ? 'tier-active' : ''}`}>
                    <div className="schedule-left">
                      <GreenHouseIcon size={14} />
                      <span>With 3 Houses</span>
                      {currentHouses === 3 && <span className="current-tier-badge">ACTIVE</span>}
                    </div>
                    <span className="schedule-val">₹{rent3.toLocaleString()}</span>
                  </div>

                  <div className={`candy-schedule-row ${currentHouses === 4 ? 'tier-active' : ''}`}>
                    <div className="schedule-left">
                      <GreenHouseIcon size={14} />
                      <span>With 4 Houses</span>
                      {currentHouses === 4 && <span className="current-tier-badge">ACTIVE</span>}
                    </div>
                    <span className="schedule-val">₹{rent4.toLocaleString()}</span>
                  </div>

                  <div className={`candy-schedule-row hotel-row ${currentHouses === 5 ? 'tier-active' : ''}`}>
                    <div className="schedule-left">
                      <RedHotelIcon size={15} />
                      <span style={{ fontWeight: 800 }}>With Hotel</span>
                      {currentHouses === 5 && <span className="current-tier-badge">ACTIVE</span>}
                    </div>
                    <span className="schedule-val hotel-val">₹{rentHotel.toLocaleString()}</span>
                  </div>
                </div>

                {/* Economic Ledger Grid */}
                <div className="candy-deed-ledger-grid">
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">House Cost</span>
                    <span className="ledger-val">₹{houseCost.toLocaleString()}</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Hotel Cost</span>
                    <span className="ledger-val">₹{houseCost.toLocaleString()} + 4 Houses</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Mortgage Value</span>
                    <span className="ledger-val">₹{mortgageValue.toLocaleString()}</span>
                  </div>
                  <div className="deed-ledger-cell">
                    <span className="ledger-label">Redeem (+10%)</span>
                    <span className="ledger-val">₹{unmortgageCost.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )
          ) : (
            /* Non-property tile: Authentic Gujarat Landmark / Rule Description */
            <div style={{ padding: '8px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <InfoOutlinedIcon sx={{ color: tileColor, fontSize: 24 }} />
                <span style={{ fontWeight: 900, fontSize: '15px', color: '#0f172a' }}>
                  Official Board Rules & Function
                </span>
              </div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0', fontWeight: 600 }}>
                {tile.description || originalCityTile?.description || 'Strategic landmark in the Gujarat commerce expedition.'}
              </p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Tile Effect
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: tileColor }}>
                  {tile.type === 'START' && 'Collect ₹1,000 subsidy every time you pass or land here.'}
                  {tile.type === 'TAX' && 'Pay commercial trade duties and statutory revenue to the Gujarat State Treasury.'}
                  {tile.type === 'CHANCE' && 'Draw an opportunistic Chance Card with real financial rewards or tariffs.'}
                  {tile.type === 'FREE_PARKING' && 'Safe Rest Oasis: Rest peacefully without any rental charges.'}
                  {tile.type === 'BANK' && 'Central Bank: Take liquidity loans and collect ₹250 universal interest dividends.'}
                  {tile.type === 'JAIL' && 'State Jail / Customs Detention: Rest here or pay bail fee to exit.'}
                  {tile.type === 'GO_TO_JAIL' && 'Sent immediately to State Detention without passing GO.'}
                  {tile.type === 'SPECIAL' && 'State Gold Reserve: Collect ₹500 Sovereign Gold Bullion Dividend!'}
                </span>
              </div>
            </div>
          )}

          {/* Ownership Status Strip */}
          {owner && (
            <div className="candy-owner-strip" style={{ borderColor: `${owner.tokenColor}40` }}>
              <div className="owner-left">
                <PlayerAvatar avatar={owner.avatar} name={owner.name} color={owner.tokenColor} size={28} />
                <div className="owner-info">
                  <span className="owner-status-label">
                    {isOwnedByHero ? 'Proprietor (You)' : 'Owned by Opponent'}
                  </span>
                  <span className="owner-name" style={{ color: owner.tokenColor }}>
                    {owner.name}
                  </span>
                </div>
              </div>

              {isOwnedByOther && (
                <div className="owner-rent-due">
                  <span className="rent-due-label">Rent Due</span>
                  <span className="rent-due-val">
                    {isMortgaged ? '₹0 (MTG)' : `₹${currentRent.amount.toLocaleString()}`}
                  </span>
                </div>
              )}

              {isOwnedByHero && isMortgaged && (
                <CandyPill variant="honey" size="xs">
                  MORTGAGED
                </CandyPill>
              )}
            </div>
          )}

          {/* Turn Action Buyer Bar */}
          {!owner && phase === 'TILE_ACTION' && isMyTurn && isPropertyTile && (
            <div className="candy-buyer-bar">
              <div className="buyer-left">
                <PlayerAvatar avatar={heroPlayer.avatar} name={heroPlayer.name} color={heroPlayer.tokenColor} size={28} />
                <div className="buyer-info">
                  <span className="buyer-name">{heroPlayer.name} (Merchant)</span>
                  <span className="buyer-balance">Treasury: ₹{heroPlayer.balance.toLocaleString()}</span>
                </div>
              </div>

              {canAfford ? (
                <CandyPill variant="mint" size="xs" icon={<CheckCircleOutlineIcon sx={{ fontSize: 13, mr: 0.2 }} />}>
                  Can Afford
                </CandyPill>
              ) : (
                <CandyPill variant="berry" size="xs" icon={<ErrorOutlineIcon sx={{ fontSize: 13, mr: 0.2 }} />}>
                  Need ₹{(price - heroPlayer.balance).toLocaleString()}
                </CandyPill>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  </div>
</div>
);
};
