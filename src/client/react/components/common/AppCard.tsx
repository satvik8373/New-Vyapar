import React from 'react';
import { Card, CardProps, Box } from '@mui/material';

export type AppCardVariant = 
  | 'standard'      // Clean minimal card
  | 'elevated'      // Subtle shadow lift
  | 'premium'       // Luxury floating card with gradient
  | 'glass'         // Glassmorphic frosted effect
  | 'outlined'      // Border emphasis
  | 'flat';         // No shadow, clean

interface AppCardProps extends Omit<CardProps, 'variant'> {
  variant?: AppCardVariant;
  interactive?: boolean;
  padded?: boolean;
  glow?: boolean;           // Add subtle glow effect
  shimmer?: boolean;        // Add shimmer animation on hover
}

const VARIANT_STYLES: Record<AppCardVariant, any> = {
  standard: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  
  elevated: {
    background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
    borderRadius: '14px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
  },
  
  premium: {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%)',
    borderRadius: '18px',
    border: '1.5px solid rgba(226, 232, 240, 0.9)',
    boxShadow: `
      0 20px 48px -12px rgba(15, 23, 42, 0.12),
      0 8px 24px -8px rgba(15, 23, 42, 0.08),
      0 2px 8px rgba(15, 23, 42, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9)
    `,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: `
      0 8px 32px rgba(15, 23, 42, 0.08),
      0 4px 16px rgba(15, 23, 42, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.5)
    `,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  },
  
  outlined: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '2px solid #e2e8f0',
    boxShadow: 'none',
  },
  
  flat: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    boxShadow: 'none',
  }
};

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'standard',
  interactive = false,
  padded = true,
  glow = false,
  shimmer = false,
  children,
  sx,
  ...rest
}) => {
  const baseStyle = VARIANT_STYLES[variant];
  
  // Premium interactive effects
  const interactiveStyles = interactive ? {
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative' as const,
    overflow: 'visible',
    
    '&::before': shimmer ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
      transition: 'left 0.5s ease',
      zIndex: 1,
      pointerEvents: 'none',
    } : {},
    
    '&:hover': {
      transform: variant === 'premium' || variant === 'glass' 
        ? 'translateY(-4px) scale(1.01)' 
        : 'translateY(-2px)',
      boxShadow: variant === 'premium' 
        ? `
          0 28px 64px -16px rgba(15, 23, 42, 0.16),
          0 12px 32px -12px rgba(15, 23, 42, 0.12),
          0 4px 16px rgba(15, 23, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 1)
        `
        : variant === 'glass'
        ? `
          0 12px 48px rgba(15, 23, 42, 0.12),
          0 6px 24px rgba(15, 23, 42, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.7)
        `
        : variant === 'elevated'
        ? '0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)'
        : '0 4px 12px rgba(15, 23, 42, 0.08)',
      borderColor: variant === 'premium' ? 'rgba(226, 232, 240, 1)' : '#cbd5e1',
      ...(shimmer && {
        '&::before': {
          left: '100%',
        }
      })
    },
    
    '&:active': {
      transform: variant === 'premium' || variant === 'glass'
        ? 'translateY(-1px) scale(0.99)'
        : 'translateY(0)',
      transition: 'all 0.1s ease',
    }
  } : {};

  // Glow effect styles
  const glowStyles = glow && (variant === 'premium' || variant === 'glass') ? {
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: '-2px',
      borderRadius: 'inherit',
      padding: '2px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3))',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
      zIndex: -1,
    },
    '&:hover::after': interactive ? {
      opacity: 1,
    } : {}
  } : {};

  return (
    <Card
      sx={{
        ...baseStyle,
        p: padded ? { xs: 2, sm: 2.5 } : 0,
        position: 'relative',
        overflow: 'visible',
        ...interactiveStyles,
        ...glowStyles,
        ...sx
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};
