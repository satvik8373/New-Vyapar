import React from 'react';

export const GreenHouseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`green-house-icon ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* House shadow */}
    <path d="M4 11L12 4L20 11V21H4V11Z" fill="#15803d" />
    {/* Roof and body */}
    <path
      d="M3 11.5L12 3.5L21 11.5"
      stroke="#14532d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 10.5V20.5H19V10.5"
      fill="#22c55e"
      stroke="#14532d"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Chimney */}
    <path d="M16 5V8.5" stroke="#14532d" strokeWidth="2" strokeLinecap="round" />
    {/* Door */}
    <rect x="10" y="14" width="4" height="6.5" rx="0.5" fill="#14532d" />
    {/* Window */}
    <rect x="6.5" y="12" width="2.5" height="2.5" fill="#dcfce7" />
  </svg>
);

export const RedHotelIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`red-hotel-icon ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* Hotel building */}
    <rect x="4" y="5" width="16" height="16" rx="1" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />
    {/* Rooftop tower / cornice */}
    <path d="M8 5V3H16V5" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
    {/* Windows grid */}
    <rect x="6.5" y="7.5" width="2.5" height="2.5" fill="#fee2e2" />
    <rect x="10.8" y="7.5" width="2.5" height="2.5" fill="#fee2e2" />
    <rect x="15" y="7.5" width="2.5" height="2.5" fill="#fee2e2" />

    <rect x="6.5" y="11.5" width="2.5" height="2.5" fill="#fee2e2" />
    <rect x="10.8" y="11.5" width="2.5" height="2.5" fill="#fee2e2" />
    <rect x="15" y="11.5" width="2.5" height="2.5" fill="#fee2e2" />

    {/* Grand double door */}
    <rect x="9.5" y="16" width="5" height="5" fill="#7f1d1d" />
  </svg>
);
