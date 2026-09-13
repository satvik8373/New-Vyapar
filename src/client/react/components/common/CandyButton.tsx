import React from 'react';

export type CandyButtonVariant =
  | 'primary'
  | 'berry'
  | 'mint'
  | 'azure'
  | 'honey'
  | 'grape'
  | 'glass'
  | 'ghost'
  | 'danger'
  | 'red';

export type CandyButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CandyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CandyButtonVariant;
  size?: CandyButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<
  CandyButtonVariant,
  {
    bg: string;
    color: string;
    border: string;
    bottomLip: string;
    ambient: string;
    hoverBg: string;
  }
> = {
  primary: {
    bg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.12)',
    bottomLip: '#020617',
    ambient: 'rgba(15, 23, 42, 0.28)',
    hoverBg: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
  },
  berry: {
    bg: 'linear-gradient(180deg, #fb7185 0%, #f43f5e 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.25)',
    bottomLip: '#e11d48',
    ambient: 'rgba(244, 63, 94, 0.35)',
    hoverBg: 'linear-gradient(180deg, #fda4af 0%, #fb7185 100%)',
  },
  mint: {
    bg: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.25)',
    bottomLip: '#059669',
    ambient: 'rgba(16, 185, 129, 0.32)',
    hoverBg: 'linear-gradient(180deg, #6ee7b7 0%, #34d399 100%)',
  },
  azure: {
    bg: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.25)',
    bottomLip: '#2563eb',
    ambient: 'rgba(59, 130, 246, 0.35)',
    hoverBg: 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)',
  },
  honey: {
    bg: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.3)',
    bottomLip: '#d97706',
    ambient: 'rgba(245, 158, 11, 0.32)',
    hoverBg: 'linear-gradient(180deg, #fcd34d 0%, #fbbf24 100%)',
  },
  grape: {
    bg: 'linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.25)',
    bottomLip: '#7c3aed',
    ambient: 'rgba(139, 92, 246, 0.32)',
    hoverBg: 'linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%)',
  },
  glass: {
    bg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.88) 100%)',
    color: '#0f172a',
    border: 'rgba(226, 232, 240, 0.9)',
    bottomLip: '#cbd5e1',
    ambient: 'rgba(148, 163, 184, 0.18)',
    hoverBg: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
  },
  ghost: {
    bg: 'transparent',
    color: '#475569',
    border: 'transparent',
    bottomLip: 'transparent',
    ambient: 'transparent',
    hoverBg: 'rgba(241, 245, 249, 0.8)',
  },
  danger: {
    bg: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.25)',
    bottomLip: '#dc2626',
    ambient: 'rgba(239, 68, 68, 0.32)',
    hoverBg: 'linear-gradient(180deg, #fca5a5 0%, #f87171 100%)',
  },
  red: {
    bg: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    border: 'rgba(255, 255, 255, 0.28)',
    bottomLip: '#991b1b',
    ambient: 'rgba(220, 38, 38, 0.42)',
    hoverBg: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
  },
};

const sizeStyles: Record<
  CandyButtonSize,
  {
    padding: string;
    fontSize: string;
    borderRadius: string;
    minHeight: string;
    gap: string;
  }
> = {
  xs: {
    padding: '4px 10px',
    fontSize: '11px',
    borderRadius: '8px',
    minHeight: '26px',
    gap: '4px',
  },
  sm: {
    padding: '6px 13px',
    fontSize: '12px',
    borderRadius: '10px',
    minHeight: '32px',
    gap: '6px',
  },
  md: {
    padding: '8px 18px',
    fontSize: '13px',
    borderRadius: '12px',
    minHeight: '38px',
    gap: '8px',
  },
  lg: {
    padding: '12px 24px',
    fontSize: '15px',
    borderRadius: '14px',
    minHeight: '48px',
    gap: '10px',
  },
};

export const CandyButton: React.FC<CandyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  active = false,
  disabled = false,
  children,
  style,
  className = '',
  ...rest
}) => {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const isTactile = variant !== 'ghost';
  const bottomLipOffset = isPressed ? '1px' : '3px';

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`candy-btn candy-btn-${variant} candy-btn-${size} ${active ? 'candy-btn-active' : ''} ${className}`}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        minWidth: 0,
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 700,
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        letterSpacing: '-0.01em',
        borderRadius: s.borderRadius,
        minHeight: s.minHeight,
        background: isHovered && !disabled ? v.hoverBg : v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease, background 0.15s ease',
        transform: disabled
          ? 'none'
          : isPressed
          ? 'translateY(2px)'
          : isHovered
          ? 'translateY(-1px)'
          : 'none',
        boxShadow:
          disabled || !isTactile
            ? 'none'
            : isPressed
            ? `0 ${bottomLipOffset} 0 ${v.bottomLip}, 0 2px 4px ${v.ambient}`
            : isHovered
            ? `0 4px 0 ${v.bottomLip}, 0 8px 18px ${v.ambient}`
            : `0 ${bottomLipOffset} 0 ${v.bottomLip}, 0 4px 10px ${v.ambient}`,
        ...style,
      }}
      {...rest}
    >
      {icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.15em', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
      {iconRight && (
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.15em', flexShrink: 0 }}>
          {iconRight}
        </span>
      )}
    </button>
  );
};
