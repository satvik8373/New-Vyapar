import React, { useEffect, useRef, useState } from 'react';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { CurrencyCoin } from '../common/CurrencyCoin';
import { COLOR_HEX_MAP } from '@shared/game-data/boardData';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DomainIcon from '@mui/icons-material/Domain';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RentTransaction } from '../../../game-engine/GameEngine';
import './RentPaymentGraphic.css';

interface RentPaymentGraphicProps {
  transaction: RentTransaction | null;
  onDismiss: () => void;
}

export const RentPaymentGraphic: React.FC<RentPaymentGraphicProps> = ({
  transaction,
  onDismiss
}) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const [isClosing, setIsClosing] = useState(false);

  // Automatically close transaction animation after 2.1s without requiring any user taps
  useEffect(() => {
    if (!transaction) return;
    setIsClosing(false);

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onDismissRef.current();
      }, 250);
    }, 2100);

    return () => clearTimeout(timer);
  }, [transaction?.id]);

  if (!transaction) return null;

  const {
    payerName,
    payerColor,
    payerAvatar,
    ownerName,
    ownerColor,
    ownerAvatar,
    tileName,
    tileGujarati,
    tileColor,
    amount,
    tier,
    isDoubled
  } = transaction;

  const hexColor = tileColor ? COLOR_HEX_MAP[tileColor] || tileColor : '#3b82f6';

  const handleManualClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onDismissRef.current();
    }, 150);
  };

  return (
    <div
      className={`rent-graphic-overlay ${isClosing ? 'is-fading-out' : ''}`}
      aria-live="polite"
      aria-label="Rent Transaction Notification"
    >
      <div className="rent-graphic-card">
        {/* Top color strip matching property color */}
        <div
          className="rent-graphic-top-stripe"
          style={{ backgroundColor: hexColor }}
        />

        {/* Quick Close Button */}
        <button
          type="button"
          className="rent-graphic-close-btn"
          onClick={handleManualClose}
          aria-label="Close rent notice"
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </button>

        {/* Header Pill */}
        <div className="rent-graphic-header">
          <span className="rent-badge-title">
            <CurrencyCoin size={14} />
            <span>RENT TRANSACTION</span>
          </span>
          <span className="rent-gujarati-sub">ભાડું વ્યવહાર</span>
        </div>

        {/* Center Transfer Stage: Tenant -> Flow -> Landlord */}
        <div className="rent-graphic-stage">
          {/* 1. Tenant (Payer) */}
          <div className="rent-party-box rent-payer">
            <div
              className="rent-avatar-wrap"
              style={{ borderColor: payerColor }}
            >
              <PlayerAvatar
                avatar={payerAvatar || 'merchant'}
                name={payerName}
                color={payerColor}
                size={44}
              />
            </div>
            <div className="rent-party-info">
              <span className="rent-party-role">Tenant</span>
              <span className="rent-party-name" style={{ color: payerColor }}>
                {payerName}
              </span>
              <span className="rent-amount-pill minus-pill">
                -₹{amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. Middle Dynamic Beam & Property Snapshot */}
          <div className="rent-beam-center">
            {/* Property Deed Tag */}
            <div className="rent-property-tag">
              <div
                className="rent-prop-bar"
                style={{ backgroundColor: hexColor }}
              />
              <div className="rent-prop-text">
                <div className="rent-prop-name">
                  <DomainIcon sx={{ fontSize: 13, mr: 0.3, color: hexColor }} />
                  <span>{tileName}</span>
                </div>
                {tileGujarati && (
                  <span className="rent-prop-gujarati">{tileGujarati}</span>
                )}
              </div>
            </div>

            {/* Directional Flow Beam */}
            <div className="rent-flow-indicator">
              <div className="rent-flow-line" />
              <div className="rent-flow-coin">
                <CurrencyCoin size={18} />
              </div>
              <ArrowForwardIcon className="rent-flow-arrow" sx={{ fontSize: 18 }} />
            </div>

            {/* Tier & Doubled Badges */}
            <div className="rent-tier-badges">
              <span className="rent-tier-pill">{tier}</span>
              {isDoubled && (
                <span className="rent-monopoly-pill">Monopoly 2×</span>
              )}
            </div>
          </div>

          {/* 3. Landlord (Receiver) */}
          <div className="rent-party-box rent-owner">
            <div
              className="rent-avatar-wrap"
              style={{ borderColor: ownerColor }}
            >
              <PlayerAvatar
                avatar={ownerAvatar || 'crown'}
                name={ownerName}
                color={ownerColor}
                size={44}
              />
            </div>
            <div className="rent-party-info">
              <span className="rent-party-role">Proprietor</span>
              <span className="rent-party-name" style={{ color: ownerColor }}>
                {ownerName}
              </span>
              <span className="rent-amount-pill plus-pill">
                +₹{amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar: Displays transaction settled */}
        <div className="rent-graphic-footer-status">
          <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
          <span>Rent Settled Automatically</span>
        </div>

        {/* Automatic Exit Progress Line */}
        <div className="rent-progress-track">
          <div className="rent-progress-bar" />
        </div>
      </div>
    </div>
  );
};
