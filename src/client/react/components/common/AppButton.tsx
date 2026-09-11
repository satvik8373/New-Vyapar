import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'info' | 'gold' | 'outlined' | 'neutral';

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppButtonVariant;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const VARIANT_STYLES: Record<AppButtonVariant, { bg: string; color: string; border?: string; hoverBg: string }> = {
  primary: {
    bg: '#0f172a',
    color: '#ffffff',
    hoverBg: '#1e293b'
  },
  secondary: {
    bg: '#2563eb',
    color: '#ffffff',
    hoverBg: '#1d4ed8'
  },
  danger: {
    bg: '#dc2626',
    color: '#ffffff',
    hoverBg: '#b91c1c'
  },
  info: {
    bg: '#0284c7',
    color: '#ffffff',
    hoverBg: '#0369a1'
  },
  gold: {
    bg: '#0f172a',
    color: '#ffffff',
    hoverBg: '#1e293b'
  },
  neutral: {
    bg: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    hoverBg: '#f1f5f9'
  },
  outlined: {
    bg: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    hoverBg: '#f8fafc'
  }
};

export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  sx,
  ...rest
}) => {
  const vStyle = VARIANT_STYLES[variant];

  const sizeStyles = {
    small: {
      py: 0.6,
      px: 1.4,
      fontSize: '12px',
      minHeight: 32,
      borderRadius: '6px'
    },
    medium: {
      py: 0.9,
      px: 2.2,
      fontSize: '13px',
      minHeight: 38,
      borderRadius: '6px'
    },
    large: {
      py: 1.2,
      px: 2.8,
      fontSize: '14px',
      minHeight: 44,
      borderRadius: '6px'
    }
  }[size];

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 700,
        textTransform: 'none',
        letterSpacing: '0.2px',
        background: disabled ? '#e2e8f0' : vStyle.bg,
        color: disabled ? '#94a3b8' : vStyle.color,
        border: vStyle.border || 'none',
        boxShadow: 'none',
        transition: 'background-color 0.15s ease, opacity 0.15s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...sizeStyles,
        '&:hover': {
          background: disabled ? '#e2e8f0' : vStyle.hoverBg,
          boxShadow: 'none'
        },
        '&:active': {
          transform: 'none',
          boxShadow: 'none'
        },
        ...sx
      }}
      {...rest}
    >
      {loading ? <CircularProgress size={18} color="inherit" /> : children}
    </Button>
  );
};
