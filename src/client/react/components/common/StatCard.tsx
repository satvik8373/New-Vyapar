import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accentColor = '#10ac84'
}) => {
  return (
    <Box
      sx={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#64748b',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '11px',
            display: 'block',
            mb: 0.3
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            color: '#1e293b',
            fontWeight: 900,
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
      </Box>

      {icon && (
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '12px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
};
