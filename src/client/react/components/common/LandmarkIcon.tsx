import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

/**
 * LandmarkIcon — CSS-based spritesheet component for the Gujarat 3D landmark
 * miniature figurine grid (landmark_icons.jpg, 4x4 @ 256x256 each = 1024x1024).
 *
 * Frame layout (row-major 0–15):
 *  0:Statue of Unity  1:Textile Mill   2:Diamond  3:Laxmi Vilas Palace
 *  4:Modhera Temple   5:Somnath        6:Gir Lion 7:GIFT City
 *  8:Bhavnagar Port   9:Dwarka Temple 10:Jamnagar 11:Rajkot Gear
 * 12:Bank Vault       13:Tax Barrier  14:START    15:Trade Gift Box
 */

interface LandmarkIconProps {
  /** Frame index 0–15 into the landmark_icons 4x4 spritesheet */
  frame: number;
  /** Rendered size in pixels (same for width & height). Default: 72 */
  size?: number;
  sx?: SxProps<Theme>;
}

const SHEET_COLS = 4;
const FRAME_PX = 256; // actual px per frame in the source image

export const LandmarkIcon: React.FC<LandmarkIconProps> = ({ frame, size = 72, sx }) => {
  const col = frame % SHEET_COLS;
  const row = Math.floor(frame / SHEET_COLS);

  // Scale: size / 256
  const scale = size / FRAME_PX;
  const sheetRenderedW = FRAME_PX * SHEET_COLS * scale; // = size * 4
  const sheetRenderedH = FRAME_PX * SHEET_COLS * scale; // = size * 4

  const offsetX = -(col * size);
  const offsetY = -(row * size);

  return (
    <Box
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundImage: 'url(/assets/images/landmark_icons.jpg)',
        backgroundSize: `${sheetRenderedW}px ${sheetRenderedH}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'auto',
        flexShrink: 0,
        ...sx
      }}
    />
  );
};

/** Convenience frame constants for readable code */
export const LANDMARK_FRAMES = {
  STATUE_OF_UNITY: 0,
  TEXTILE_MILL: 1,
  DIAMOND: 2,
  LAXMI_VILAS_PALACE: 3,
  MODHERA_TEMPLE: 4,
  SOMNATH: 5,
  GIR_LION: 6,
  GIFT_CITY: 7,
  BHAVNAGAR_PORT: 8,
  DWARKA_TEMPLE: 9,
  JAMNAGAR_REFINERY: 10,
  RAJKOT_GEAR: 11,
  BANK_VAULT: 12,
  TAX_BARRIER: 13,
  START_ARROW: 14,
  TRADE_GIFT_BOX: 15
} as const;
