import React, { useEffect, useRef, useState } from 'react';
import { CurrencyCoin } from '../common/CurrencyCoin';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { COLOR_HEX_MAP } from '@shared/game-data/boardData';
import { RentTransaction, GameAnnouncement } from '../../../game-engine/GameEngine';
import './CenterBoardStageCard.css';

export interface CenterBoardStageCardProps {
  rentTransaction?: RentTransaction | null;
  announcement?: GameAnnouncement | null;
  onDismiss: () => void;
}

export const CenterBoardStageCard: React.FC<CenterBoardStageCardProps> = ({
  rentTransaction,
  announcement,
  onDismiss
}) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const [isClosing, setIsClosing] = useState(false);

  const isRent = Boolean(rentTransaction);
  const durationMs = isRent ? 2000 : (announcement?.durationMs || 2200);
  const activeId = isRent ? rentTransaction?.id : announcement?.id;

  // Auto-dismiss settlement timer
  useEffect(() => {
    if (!activeId) return;
    setIsClosing(false);

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onDismissRef.current();
      }, 160);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [activeId, durationMs]);

  if (!rentTransaction && !announcement) return null;

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismissRef.current();
    }, 90);
  };

  const tileHex = (isRent && rentTransaction?.tileColor)
    ? COLOR_HEX_MAP[rentTransaction.tileColor] || rentTransaction.tileColor
    : '#059669';

  return (
    <div
      className={`board-center-notice ${isClosing ? 'is-fading-out' : ''}`}
      onClick={handleManualClose}
      role="region"
      aria-live="polite"
      aria-label="Board Announcement"
    >
      {/* ── 1. CLEAN PILL HEADER ── */}
      <div className="notice-header-row">
        <span className="notice-type-pill">
          {isRent ? 'RENT PAID' : (announcement?.title || 'NOTICE')}
        </span>
        {isRent && rentTransaction?.tileName && (
          <span className="notice-city-name" style={{ color: tileHex }}>
            <span className="notice-dot">·</span>
            <span className="notice-city-title">{rentTransaction.tileName}</span>
          </span>
        )}
      </div>

      {/* ── 2. SIMPLE & PERFECT SOLID BODY ── */}
      {isRent && rentTransaction ? (
        <div className="notice-rent-row">
          {/* Tenant (Payer) */}
          <div className="notice-user-profile">
            <div
              className="notice-avatar-wrap"
              style={{ borderColor: rentTransaction.payerColor }}
            >
              <PlayerAvatar
                avatar={rentTransaction.payerAvatar || 'merchant'}
                name={rentTransaction.payerName}
                color={rentTransaction.payerColor}
                size={28}
              />
            </div>
            <span className="notice-user-name" style={{ color: rentTransaction.payerColor }}>
              {rentTransaction.payerName}
            </span>
            <span className="notice-val-pill is-minus">
              -₹{rentTransaction.amount.toLocaleString()}
            </span>
          </div>

          {/* Gliding Coin Bridge */}
          <div className="notice-coin-bridge">
            <CurrencyCoin size={18} />
          </div>

          {/* Landlord (Receiver) */}
          <div className="notice-user-profile">
            <div
              className="notice-avatar-wrap"
              style={{ borderColor: rentTransaction.ownerColor }}
            >
              <PlayerAvatar
                avatar={rentTransaction.ownerAvatar || 'crown'}
                name={rentTransaction.ownerName}
                color={rentTransaction.ownerColor}
                size={28}
              />
            </div>
            <span className="notice-user-name" style={{ color: rentTransaction.ownerColor }}>
              {rentTransaction.ownerName}
            </span>
            <span className="notice-val-pill is-plus">
              +₹{rentTransaction.amount.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="notice-announcement-body">
          {announcement?.amount !== undefined && (
            <div className="notice-amount-row">
              <CurrencyCoin size={18} />
              <span
                className={`notice-amount-val ${
                  announcement.amountType === 'plus' ? 'is-plus' : 'is-minus'
                }`}
              >
                {announcement.amountType === 'plus' ? '+' : '-'}₹{announcement.amount.toLocaleString()}
              </span>
            </div>
          )}
          <p className="notice-msg-text">{announcement?.message}</p>
        </div>
      )}
    </div>
  );
};
