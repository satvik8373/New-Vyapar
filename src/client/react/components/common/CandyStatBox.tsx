import React from 'react';

export type CandyStatTint = 'default' | 'mint' | 'berry' | 'azure' | 'honey' | 'grape';

export interface CandyStatBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  tint?: CandyStatTint;
  compact?: boolean;
}

const tintStyles: Record<
  CandyStatTint,
  {
    bg: string;
    border: string;
    labelColor: string;
    valueColor: string;
  }
> = {
  default: {
    bg: '#f8fafc',
    border: '#e2e8f0',
    labelColor: '#64748b',
    valueColor: '#0f172a',
  },
  mint: {
    bg: 'linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%)',
    border: 'rgba(52, 211, 153, 0.3)',
    labelColor: '#047857',
    valueColor: '#065f46',
  },
  berry: {
    bg: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)',
    border: 'rgba(251, 113, 133, 0.3)',
    labelColor: '#be123c',
    valueColor: '#9f1239',
  },
  azure: {
    bg: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
    border: 'rgba(96, 165, 250, 0.3)',
    labelColor: '#1d4ed8',
    valueColor: '#1e40af',
  },
  honey: {
    bg: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
    border: 'rgba(251, 191, 36, 0.35)',
    labelColor: '#b45309',
    valueColor: '#92400e',
  },
  grape: {
    bg: 'linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)',
    border: 'rgba(167, 139, 250, 0.3)',
    labelColor: '#6d28d9',
    valueColor: '#5b21b6',
  },
};

export const CandyStatBox: React.FC<CandyStatBoxProps> = ({
  label,
  value,
  subtitle,
  icon,
  tint = 'default',
  compact = false,
  style,
  className = '',
  ...rest
}) => {
  const t = tintStyles[tint];

  return (
    <div
      className={`candy-stat-box ${className}`}
      style={{
        borderRadius: compact ? '10px' : '12px',
        background: t.bg,
        border: `1px solid ${t.border}`,
        padding: compact ? '6px 10px' : '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <span
          style={{
            fontSize: compact ? '10px' : '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: t.labelColor,
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ fontSize: '12px', opacity: 0.85, display: 'inline-flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: compact ? '14px' : '17px',
          fontWeight: 800,
          color: t.valueColor,
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
        }}
      >
        {value}
      </div>

      {subtitle && (
        <span
          style={{
            fontSize: '10px',
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
