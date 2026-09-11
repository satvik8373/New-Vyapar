import React from 'react';

export type CandyCardAccent = 'primary' | 'berry' | 'mint' | 'azure' | 'honey' | 'grape' | 'none';

export interface CandyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CandyCardAccent;
  accentPosition?: 'top' | 'left';
  interactive?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const accentColors: Record<CandyCardAccent, string> = {
  none: 'transparent',
  primary: '#0f172a',
  berry: '#f43f5e',
  mint: '#10b981',
  azure: '#3b82f6',
  honey: '#f59e0b',
  grape: '#8b5cf6',
};

const paddingMap = {
  none: '0',
  sm: '10px 12px',
  md: '16px 18px',
  lg: '22px 24px',
};

export const CandyCard: React.FC<CandyCardProps> = ({
  accent = 'none',
  accentPosition = 'top',
  interactive = false,
  glass = true,
  padding = 'md',
  children,
  style,
  className = '',
  ...rest
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const accentColor = accentColors[accent];

  return (
    <div
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      className={`candy-card ${interactive ? 'candy-card-interactive' : ''} ${className}`}
      style={{
        position: 'relative',
        borderRadius: '16px',
        background: glass
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)'
          : '#ffffff',
        backdropFilter: glass ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(16px)' : 'none',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: isHovered
          ? '0 12px 28px -4px rgba(15, 23, 42, 0.10), 0 4px 10px -2px rgba(15, 23, 42, 0.04)'
          : '0 4px 18px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        padding: paddingMap[padding],
        flexShrink: 0,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        transform: interactive && isHovered ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {accent !== 'none' && accentPosition === 'top' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: accentColor,
            borderRadius: '16px 16px 0 0',
          }}
        />
      )}
      {accent !== 'none' && accentPosition === 'left' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '4px',
            background: accentColor,
            borderRadius: '16px 0 0 16px',
          }}
        />
      )}
      {children}
    </div>
  );
};
