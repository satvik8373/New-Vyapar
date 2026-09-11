import React from 'react';
import { Typography, TypographyProps, Box } from '@mui/material';
import { CurrencyCoin } from './CurrencyCoin';

interface MoneyDisplayProps extends Omit<TypographyProps, 'children'> {
  amount: number;
  showPrefix?: boolean;
  prefix?: string;
  positiveColor?: string;
  negativeColor?: string;
  showCoin?: boolean;
  coinSize?: number;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  showPrefix = false,
  prefix = '+',
  positiveColor = '#15803d',
  negativeColor = '#dc2626',
  showCoin = true,
  coinSize,
  sx,
  ...props
}) => {
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = absAmount.toLocaleString('en-IN');

  let color = '#0f172a'; // High contrast deep slate
  if (showPrefix && isPositive) color = positiveColor;
  if (showPrefix && isNegative) color = negativeColor;

  return (
    <Typography
      component="span"
      sx={{
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        fontWeight: 800,
        letterSpacing: '0.2px',
        color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...sx
      }}
      {...props}
    >
      {showPrefix && isPositive && prefix}
      {showPrefix && isNegative && '-'}
      {showCoin && <CurrencyCoin size={coinSize || 15} />}
      {!showCoin && '₹'}
      {formatted}
    </Typography>
  );
};
