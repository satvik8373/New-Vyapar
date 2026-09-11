import React from 'react';

interface CurrencyCoinProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Premium Golden Tabletop Currency Coin (Indian Rupee ₹)
 * Crisp vector coin with bevel edge, concentric rim, and embossed ₹ glyph.
 */
export const CurrencyCoin: React.FC<CurrencyCoinProps> = ({
  size = 16,
  className = '',
  style = {}
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`currency-coin-svg ${className}`}
      style={{
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    >
      <defs>
        {/* Outer gold rim gradient */}
        <linearGradient id="coinGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Inner coin face gradient */}
        <radialGradient id="coinGoldFace" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#eab308" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
      </defs>

      {/* Base contact shadow */}
      <circle cx="12" cy="12.5" r="11" fill="rgba(15, 23, 42, 0.2)" />

      {/* Outer Bevel Rim */}
      <circle cx="12" cy="12" r="11" fill="url(#coinGoldRim)" />

      {/* Inner Recessed Face */}
      <circle cx="12" cy="12" r="9.2" fill="url(#coinGoldFace)" stroke="#fef08a" strokeWidth="0.6" />

      {/* Embossed Inner Concentric Beaded Circle */}
      <circle
        cx="12"
        cy="12"
        r="7.6"
        fill="none"
        stroke="rgba(133, 77, 14, 0.4)"
        strokeWidth="0.75"
        strokeDasharray="1.2 0.8"
      />

      {/* Rupee Symbol ₹ */}
      <text
        x="12"
        y="15.8"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fontFamily='"Plus Jakarta Sans", "Inter", sans-serif'
        fill="#ffffff"
        style={{
          filter: 'drop-shadow(0 1px 1px rgba(113, 63, 18, 0.85))',
          pointerEvents: 'none'
        }}
      >
        ₹
      </text>
    </svg>
  );
};
