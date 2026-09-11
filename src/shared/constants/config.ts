export const GAME_CONFIG = {
  STARTING_BALANCE: 10000,
  SALARY_AMOUNT: 2000,
  MAX_PLAYERS: 4,
  TOTAL_TILES: 16,
  CURRENCY_SYMBOL: '₹',
  
  // Cute & Candy Pastel Palette
  CATEGORY_COLORS: {
    TEXTILE: '#ff7f50',  // Coral Pink
    DIAMOND: '#00d2d3',  // Bright Cyan Aqua
    HERITAGE: '#a29bfe', // Soft Lilac Purple
    INDUSTRY: '#ff9f43', // Warm Candy Tangerine
    PORT: '#10ac84',     // Mint Sea Green
    TECH: '#54a0ff',     // Bubblegum Sky Blue
    SPECIAL: '#8395a7'   // Soft Pastel Slate
  },

  PLAYER_DEFAULTS: [
    {
      id: 'p1',
      name: 'P1 - Rajesh',
      tokenColor: '#ff4757', // Candy Coral Red
      tokenColorHex: 0xff4757,
      avatar: 'crown',
      colorName: 'Coral Red'
    },
    {
      id: 'p2',
      name: 'P2 - Bhavna',
      tokenColor: '#1e90ff', // Candy Sky Blue
      tokenColorHex: 0x1e90ff,
      avatar: 'diamond',
      colorName: 'Sky Blue'
    },
    {
      id: 'p3',
      name: 'P3 - Jignesh',
      tokenColor: '#2ed573', // Candy Mint Green
      tokenColorHex: 0x2ed573,
      avatar: 'leaf',
      colorName: 'Mint Green'
    },
    {
      id: 'p4',
      name: 'P4 - Dipti',
      tokenColor: '#ffa502', // Candy Honey Gold
      tokenColorHex: 0xffa502,
      avatar: 'star',
      colorName: 'Honey Gold'
    }
  ],

  ANIMATION: {
    DICE_ROLL_DURATION_MS: 650,
    TOKEN_HOP_DURATION_MS: 240,
    TOKEN_HOP_HEIGHT_PX: 28,
    STEP_DELAY_MS: 70
  }
};
