import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export type AppBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AppBadgeProps extends Omit<ChipProps, 'variant' | 'color'> {
  badgeVariant?: AppBadgeVariant;
}

const BADGE_STYLES: Record<AppBadgeVariant, { bg: string; color: string; border: string }> = {
  primary: { bg: '#f8fafc', color: '#0f172a', border: '#e2e8f0' },
  success: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  warning: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  danger:  { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  info:    { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  neutral: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' }
};

export const AppBadge: React.FC<AppBadgeProps> = ({
  badgeVariant = 'neutral',
  label,
  icon,
  sx,
  ...rest
}) => {
  const style = BADGE_STYLES[badgeVariant];

  return (
    <Chip
      label={label}
      icon={icon}
      sx={{
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 650,
        fontSize: '11px',
        height: 24,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '4px',
        '& .MuiChip-icon': {
          color: 'inherit',
          fontSize: 14
        },
        ...sx
      }}
      {...rest}
    />
  );
};
