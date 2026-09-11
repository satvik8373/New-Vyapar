import React from 'react';

export type CandyPillVariant =
  | 'berry'
  | 'mint'
  | 'azure'
  | 'honey'
  | 'grape'
  | 'slate'
  | 'neutral';

export type CandyPillSize = 'xs' | 'sm' | 'md';

export interface CandyPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: CandyPillVariant;
  size?: CandyPillSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const pillColorMap: Record<
  CandyPillVariant,
  {
    bg: string;
    text: string;
    border: string;
    dotColor: string;
  }
> = {
  berry: {
    bg: '#fff1f2',
    text: '#e11d48',
    border: 'rgba(251, 113, 133, 0.35)',
    dotColor: '#f43f5e',
  },
  mint: {
    bg: '#ecfdf5',
    text: '#047857',
    border: 'rgba(52, 211, 153, 0.35)',
    dotColor: '#10b981',
  },
  azure: {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: 'rgba(96, 165, 250, 0.35)',
    dotColor: '#3b82f6',
  },
  honey: {
    bg: '#fffbeb',
    text: '#b45309',
    border: 'rgba(251, 191, 36, 0.4)',
    dotColor: '#f59e0b',
  },
  grape: {
    bg: '#f5f3ff',
    text: '#6d28d9',
    border: 'rgba(167, 139, 250, 0.35)',
    dotColor: '#8b5cf6',
  },
  slate: {
    bg: '#0f172a',
    text: '#f8fafc',
    border: 'rgba(255, 255, 255, 0.1)',
    dotColor: '#38bdf8',
  },
  neutral: {
    bg: '#f1f5f9',
    text: '#475569',
    border: 'rgba(203, 213, 225, 0.8)',
    dotColor: '#94a3b8',
  },
};

const pillSizeMap: Record<CandyPillSize, { padding: string; fontSize: string; dotSize: string; gap: string }> = {
  xs: { padding: '2px 7px', fontSize: '10px', dotSize: '5px', gap: '4px' },
  sm: { padding: '3px 10px', fontSize: '11px', dotSize: '6px', gap: '5px' },
  md: { padding: '5px 13px', fontSize: '12px', dotSize: '7px', gap: '6px' },
};

export const CandyPill: React.FC<CandyPillProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  pulse = false,
  icon,
  children,
  style,
  className = '',
  ...rest
}) => {
  const c = pillColorMap[variant];
  const s = pillSizeMap[size];

  return (
    <span
      className={`candy-pill candy-pill-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 700,
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        lineHeight: 1.2,
        borderRadius: '9999px',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        letterSpacing: '0.01em',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: s.dotSize,
            height: s.dotSize,
            borderRadius: '50%',
            background: c.dotColor,
            display: 'inline-block',
            boxShadow: `0 0 6px ${c.dotColor}`,
            animation: pulse ? 'candyDotPulse 1.8s infinite ease-in-out' : 'none',
          }}
        />
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
