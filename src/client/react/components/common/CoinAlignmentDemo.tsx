import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CurrencyCoin } from './CurrencyCoin';

/**
 * Demo component showing perfect vertical alignment of coin + number
 */
export const CoinAlignmentDemo: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f8fb 0%, #e8eef5 100%)',
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={6} alignItems="center">
        <Typography variant="h2" textAlign="center">
          Coin Position Alignment Demo
        </Typography>

        {/* Vertical Stack (Like on board tiles) */}
        <Box
          sx={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            p: 4,
            minWidth: 300,
          }}
        >
          <Typography variant="h4" gutterBottom textAlign="center" mb={3}>
            Vertical Stack (Board Tiles)
          </Typography>
          
          <Stack spacing={4} alignItems="center">
            {[
              { size: 10, price: '200' },
              { size: 12, price: '1,500' },
              { size: 14, price: '2,800' },
              { size: 16, price: '3,500' },
            ].map(({ size, price }) => (
              <Box
                key={size}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  p: 2,
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  minWidth: 100,
                }}
              >
                <CurrencyCoin size={size} />
                <Typography
                  sx={{
                    fontSize: `${size * 0.8}px`,
                    fontWeight: 850,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {price}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Horizontal Stack (Like in headers) */}
        <Box
          sx={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            p: 4,
            minWidth: 300,
          }}
        >
          <Typography variant="h4" gutterBottom textAlign="center" mb={3}>
            Horizontal Stack (Headers/Badges)
          </Typography>
          
          <Stack spacing={3}>
            {[
              { size: 11, price: '200' },
              { size: 13, price: '1,500' },
              { size: 15, price: '2,800' },
              { size: 17, price: '3,500' },
            ].map(({ size, price }) => (
              <Box
                key={size}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  p: 2,
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                }}
              >
                <CurrencyCoin size={size} />
                <Typography
                  sx={{
                    fontSize: `${size * 0.85}px`,
                    fontWeight: 850,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {price}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Board Tile Realistic Preview */}
        <Box
          sx={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            p: 4,
            minWidth: 300,
          }}
        >
          <Typography variant="h4" gutterBottom textAlign="center" mb={3}>
            Realistic Board Tile Footer
          </Typography>
          
          {/* Vertical (Left/Right edge tiles) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" display="block" mb={1} textAlign="center" color="text.secondary">
              Vertical Edge Tiles (Left/Right)
            </Typography>
            <Box
              sx={{
                width: 24,
                height: 100,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                margin: '0 auto',
              }}
            >
              <CurrencyCoin size={10} />
              <Typography
                sx={{
                  fontSize: '7.8px',
                  fontWeight: 850,
                  color: '#0f172a',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                200
              </Typography>
            </Box>
          </Box>

          {/* Horizontal (Top/Bottom edge tiles) */}
          <Box>
            <Typography variant="caption" display="block" mb={1} textAlign="center" color="text.secondary">
              Horizontal Edge Tiles (Top/Bottom)
            </Typography>
            <Box
              sx={{
                height: 24,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
              }}
            >
              <CurrencyCoin size={11} />
              <Typography
                sx={{
                  fontSize: '8.5px',
                  fontWeight: 850,
                  color: '#0f172a',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                200
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Player Card Balance Display */}
        <Box
          sx={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%)',
            border: '1.5px solid rgba(226, 232, 240, 0.9)',
            borderRadius: '16px',
            p: 3,
            minWidth: 300,
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Typography variant="h4" gutterBottom textAlign="center" mb={3}>
            Player Balance Display
          </Typography>
          
          <Stack spacing={2}>
            {[
              { name: 'Satvik', balance: '12,500', color: '#3b82f6' },
              { name: 'Priya', balance: '8,750', color: '#8b5cf6' },
              { name: 'Raj', balance: '15,200', color: '#10b981' },
            ].map((player) => (
              <Box
                key={player.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: player.color,
                    }}
                  />
                  <Typography variant="body2" fontWeight={700}>
                    {player.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CurrencyCoin size={13} />
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 850,
                      color: '#0f172a',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    {player.balance}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={600}>
          All coin and number combinations use <code>display: flex</code> with{' '}
          <code>align-items: center</code> for horizontal layouts and{' '}
          <code>flex-direction: column</code> with <code>align-items: center</code>{' '}
          for vertical stacking. The coin SVG uses <code>display: block</code> to{' '}
          avoid any baseline alignment issues.
        </Typography>
      </Stack>
    </Box>
  );
};
