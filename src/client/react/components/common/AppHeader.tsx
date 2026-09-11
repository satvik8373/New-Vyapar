import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2.5, sm: 3.5 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {onBack && (
          <IconButton
            onClick={onBack}
            sx={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              color: '#334155',
              width: 42,
              height: 42,
              borderRadius: '12px',
              '&:hover': {
                background: '#f8fafc',
                borderColor: '#94a3b8',
                transform: 'translateX(-2px)'
              }
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 900,
              color: '#1e293b',
              fontSize: { xs: '20px', sm: '24px' },
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                color: '#64748b',
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '13px' }
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {rightAction && <Box>{rightAction}</Box>}
    </Box>
  );
};
