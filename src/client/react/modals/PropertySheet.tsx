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

// Scenic City & Landmark Background Map by City Name (Secular Commercial Cities)
const LANDMARK_SCENIC_BY_NAME: Record<string, string> = {
  'MORBI': '/assets/images/cities/morbi.png',
  'PATAN': '/assets/images/cities/patan.png',
  'BHARUCH': '/assets/images/cities/bharuch.png',
  'MEHSANA': '/assets/images/cities/mehsana.png',
  'NADIAD': '/assets/images/cities/nadiad.png',
  'VAPI': '/assets/images/cities/vapi.png',
  'JUNAGADH': '/assets/images/cities/junagadh.png',
  'RAJKOT': '/assets/images/cities/rajkot.png',
  'JAMNAGAR': '/assets/images/cities/jamnagar.png',
  'ANKLESHWAR': '/assets/images/cities/ankleshwar.png',
  'HIMATNAGAR': '/assets/images/cities/himatnagar.png',
  'ANAND': '/assets/images/cities/anand.png',
  'GANDHINAGAR': '/assets/images/cities/gandhinagar.png',
  'VADODARA': '/assets/images/cities/vadodara.png',
  'LAXMI VILAS': '/assets/images/cities/laxmi_vilas.png',
  'LAXMI VILAS PALACE': '/assets/images/cities/laxmi_vilas.png',
  'NAVSARI': '/assets/images/cities/laxmi_vilas.png',
  'AHMEDABAD': '/assets/images/cities/ahmedabad.png',
  'STATUE OF UNITY': '/assets/images/cities/statue_of_unity.png',
  'BHUJ': '/assets/images/cities/bhuj.png',
  'KUTCH': '/assets/images/cities/bhuj.png',
  'DHOLERA': '/assets/images/cities/dholera.png',
  'DHOLERA SIR': '/assets/images/cities/dholera.png',
  'GIFT CITY': '/assets/images/cities/gift_city.png',
  'SURAT': '/assets/images/cities/surat.png',
  'BHAVNAGAR': '/assets/images/cities/bhavnagar.png',
  'BHAVNAGAR PORT': '/assets/images/cities/bhavnagar.png',
  'KANDLA': '/assets/images/cities/kandla.png',
  'KANDLA PORT': '/assets/images/cities/kandla.png',
  'PORBANDAR': '/assets/images/cities/porbandar.png',
  'PORBANDAR PORT': '/assets/images/cities/porbandar.png'
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
      } else if ((e.key === 'a' || e.key === 'A') && phase === 'TILE_ACTION' && isMyTurn) {
        engine.startAuction(selectedProperty.step);
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

  const isCornerTile =
    tile.type === 'START' ||
    tile.type === 'JAIL' ||
    tile.type === 'FREE_PARKING' ||
    tile.type === 'GO_TO_JAIL';

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
        tile.type === 'CHANCE' ? '#7c3aed' :
        tile.type === 'START' ? '#059669' :
        tile.type === 'JAIL' ? '#475569' :
        tile.type === 'FREE_PARKING' ? '#0284c7' :
        tile.type === 'GO_TO_JAIL' ? '#e11d48' : '#3b82f6'
      ));
  const regionName = isPort
    ? 'Maritime Seaport'
    : (tile.color ? COLOR_GROUP_NAMES[tile.color] || 'Gujarat Commercial' : (
        tile.type === 'START' ? 'Expedition Origin' :
        tile.type === 'JAIL' ? 'State Detention & Bail' :
        tile.type === 'FREE_PARKING' ? 'Safe Rest Oasis' :
        tile.type === 'GO_TO_JAIL' ? 'Police Jurisdiction' :
        tile.type === 'TAX' ? 'State Commercial Duty' :
        tile.type === 'BANK' ? 'Central Banking Authority' :
        tile.type === 'SPECIAL' ? 'Sovereign Bullion Reserve' :
        tile.type === 'CHANCE' ? 'Fortune & Contingency' : 'Gujarat Landmark'
      ));
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
    originalCityTile?.imageUrl ||
    LANDMARK_SCENIC_BY_NAME[tile.name.trim().toUpperCase()] ||
    '/assets/images/corners/corner_start.jpg';

  const handleBuy = () => {
    engine.buyProperty(tileStep);
  };

  const handleStartAuction = () => {
    engine.startAuction(tileStep);
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
                {isPort
                  ? 'MARITIME HARBOR DEED'
                  : isPropertyTile
                  ? 'TITLE DEED'
                  : isCornerTile
                  ? 'CORNER STAGE'
                  : 'SPECIAL STAGE'}
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
          {/* Left Column: Dedicated Landmark Showcase Card */}
          <div className="candy-deed-left-pane" style={{ backgroundColor: tileColor }}>
            {cityBgImage && (
              isSpecialTile || isCornerTile ? (
                <div className="candy-deed-special-card">
                  <img
                    src={cityBgImage}
                    alt={tile.name}
                    className="candy-deed-special-img"
                  />
                </div>
              ) : (
                <img
                  src={cityBgImage}
                  alt={tile.name}
                  className="candy-deed-scenic-img"
                  loading="eager"
                />
              )
            )}
            <div className="candy-deed-scenic-overlay" />

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
                  {tile.type === 'START' && 'Expedition Starting Point: Collect ₹1,000 subsidy every time you pass or land here.'}
                  {tile.type === 'TAX' && 'State Commercial Tax: Pay ₹500 statutory trade duties and revenue to Gujarat State Treasury.'}
                  {tile.type === 'CHANCE' && 'Fortune Contingency: Draw an auspicious Gujarat Chance Card with real financial rewards or tariffs.'}
                  {tile.type === 'FREE_PARKING' && 'Safe Haven: Rest peacefully without any rental charges, statutory duties, or fines.'}
                  {tile.type === 'BANK' && 'Central Bank of Gujarat: Universal liquidity reserve paying ₹250 interest dividend to all merchants!'}
                  {tile.type === 'JAIL' && 'Central Jail: Just Visiting with zero penalty if landing normally, or detained if sent here.'}
                  {tile.type === 'GO_TO_JAIL' && 'Police Detainment: Sent immediately to Central Jail without passing START and without collecting ₹1,000.'}
                  {tile.type === 'SPECIAL' && 'State Gold Reserve: Collect ₹500 Sovereign Gold Bullion Dividend!'}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* ── 3. FULL-WIDTH RESPONSIVE FOOTER CONSOLE ── */}
    {/* Case 1: Unowned property on Hero's turn -> Buyer balance + Pass / Auction / Buy */}
    {!owner && phase === 'TILE_ACTION' && isMyTurn && isPropertyTile && (
      <div className="candy-deed-footer-console">
        <div className="footer-status-zone">
          <PlayerAvatar avatar={heroPlayer.avatar} name={heroPlayer.name} color={heroPlayer.tokenColor} size={32} />
          <div className="footer-player-info">
            <span className="footer-player-name">{heroPlayer.name} (Merchant)</span>
            <span className="footer-player-balance">Treasury: ₹{heroPlayer.balance.toLocaleString()}</span>
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

        <div className="footer-actions-zone">
          <CandyButton
            variant="glass"
            size="md"
            onClick={handleCancel}
            className="deed-footer-btn"
            title="Pass on buying this property"
          >
            Pass (P)
          </CandyButton>
          <CandyButton
            variant="azure"
            size="md"
            onClick={handleStartAuction}
            className="deed-footer-btn"
            title="Send this property to public auction"
          >
            Auction (A)
          </CandyButton>
          <CandyButton
            variant="mint"
            size="md"
            disabled={!canAfford}
            onClick={handleBuy}
            className="deed-footer-btn deed-footer-btn-primary"
            title="Purchase directly at market price"
          >
            Buy ₹{price.toLocaleString()} (B)
          </CandyButton>
        </div>
      </div>
    )}

    {/* Case 2: Hero-owned property -> Owner status + Build / Mortgage / Sell */}
    {owner && isOwnedByHero && isPropertyTile && (
      <div className="candy-deed-footer-console">
        <div className="footer-status-zone">
          <PlayerAvatar avatar={owner.avatar} name={owner.name} color={owner.tokenColor} size={32} />
          <div className="footer-player-info">
            <span className="footer-player-name">Proprietor: {owner.name} (You)</span>
            <span className="footer-player-balance">
              {isMortgaged ? 'Status: Mortgaged' : `Houses: ${currentHouses >= 5 ? 'Hotel' : currentHouses}`}
            </span>
          </div>
          {isMortgaged && (
            <CandyPill variant="honey" size="xs">
              MORTGAGED
            </CandyPill>
          )}
        </div>

        <div className="footer-actions-zone footer-owner-zone">
          {!isPort && currentHouses < 5 && (
            <CandyButton
              variant="mint"
              size="sm"
              disabled={!canBuildHouse}
              onClick={handleBuild}
              className="deed-footer-btn"
            >
              {currentHouses === 4
                ? `Build Hotel (+₹${houseCost.toLocaleString()})`
                : `Build House (+₹${houseCost.toLocaleString()})`}
            </CandyButton>
          )}

          {!isPort && currentHouses > 0 && (
            <CandyButton
              variant="honey"
              size="sm"
              onClick={handleSellHouse}
              icon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />}
              className="deed-footer-btn"
            >
              Sell (+₹{sellHouseValue.toLocaleString()})
            </CandyButton>
          )}

          {isMortgaged ? (
            <CandyButton
              variant="azure"
              size="sm"
              onClick={handleMortgage}
              disabled={heroPlayer.balance < unmortgageCost}
              className="deed-footer-btn"
            >
              Redeem (-₹{unmortgageCost.toLocaleString()})
            </CandyButton>
          ) : (
            <CandyButton
              variant="glass"
              size="sm"
              onClick={handleMortgage}
              disabled={currentHouses > 0}
              className="deed-footer-btn"
            >
              Mortgage (+₹{mortgageValue.toLocaleString()})
            </CandyButton>
          )}

          {currentHouses === 0 && !isMortgaged && (
            <CandyButton
              variant="danger"
              size="sm"
              onClick={handleSellProperty}
              className="deed-footer-btn"
            >
              Sell (+₹{sellPropertyValue.toLocaleString()})
            </CandyButton>
          )}
        </div>
      </div>
    )}

    {/* Case 3: Opponent-owned property -> Opponent info + Rent Due */}
    {owner && isOwnedByOther && (
      <div className="candy-deed-footer-console">
        <div className="footer-status-zone">
          <PlayerAvatar avatar={owner.avatar} name={owner.name} color={owner.tokenColor} size={32} />
          <div className="footer-player-info">
            <span className="footer-player-name" style={{ color: owner.tokenColor }}>
              {owner.name}
            </span>
            <span className="footer-player-balance">Proprietor (Opponent)</span>
          </div>
        </div>

        <div className="footer-actions-zone">
          <div className="owner-rent-due-pill">
            <span className="rent-due-label">Rent Due:</span>
            <span className="rent-due-val">
              {isMortgaged ? '₹0 (Mortgaged)' : `₹${currentRent.amount.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    )}

    </div>

  </div>
);
};
