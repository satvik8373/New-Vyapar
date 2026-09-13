// ============================================================================
// NAVO VYAPAR — 32-TILE UNIFORM BOARD DATA & BALANCED ECONOMIC MODEL
// Calibrated economic balance:
// Starting Cash: ₹5,000 | GO Salary: ₹1,000 | Total 32 Tiles
// 4 Corners + 4 Symmetrical Center Special Tiles (1 per edge)
// 21 Properties across 7 color groups of 3 properties each + 3 Ports (₹1,000)
// Uniform purchase price, house development cost, and rent schedule per group.
// ============================================================================

export type TileType =
  | 'START'
  | 'PROPERTY'
  | 'PORT'
  | 'TAX'
  | 'JAIL'          // Corner: Just Visiting / In Jail
  | 'GO_TO_JAIL'    // Corner: Sends player to Jail
  | 'FREE_PARKING'  // Corner: Nothing happens (safe rest)
  | 'BANK'
  | 'SPECIAL'
  | 'CHANCE';

export type TileColor =
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | null;

export type BoardEdge = 'bottom' | 'right' | 'top' | 'left' | 'corner';

export interface BoardTileStep {
  step: number;
  name: string;
  gujaratiName?: string;
  type: TileType;
  price: number | null;
  color: TileColor;
  gridRow: number;
  gridCol: number;
  isCorner: boolean;
  edge: BoardEdge;
  imageUrl?: string;
  iconFrame?: number;
  description?: string;
}

export const COLOR_HEX_MAP: Record<string, string> = {
  teal: '#0d9488',
  blue: '#0284c7',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#ea580c',
  red: '#e11d48',
  yellow: '#d97706',
  green: '#059669'
};

export const COLOR_GROUP_NAMES: Record<string, string> = {
  teal: 'Heritage & Craft Hubs',
  blue: 'Northern Industrial Belt',
  purple: 'Saurashtra Hubs',
  orange: 'Central Commercial Belt',
  red: 'Royal & Metropolis',
  yellow: 'Landmarks & Cultural Hubs',
  green: 'Modern Mega Commercial'
};

export interface PropertyRentSchedule {
  siteRent: number;
  monopolyRent: number;
  rent1House: number;
  rent2Houses: number;
  rent3Houses: number;
  rent4Houses: number;
  rentHotel: number;
  houseCost: number;
  mortgageValue: number;
  unmortgageCost: number;
}

export interface PortRentSchedule {
  price: number;
  rent1Port: number;
  rent2Ports: number;
  rent3Ports: number;
  mortgageValue: number;
  unmortgageCost: number;
}

// ── ECONOMIC SCHEDULE BLUEPRINTS ──────────────────────────────────────────────
export const PROPERTY_RENT_SCHEDULES: Record<string, PropertyRentSchedule> = {
  teal: {
    siteRent: 50,
    monopolyRent: 100,
    rent1House: 150,
    rent2Houses: 400,
    rent3Houses: 900,
    rent4Houses: 1500,
    rentHotel: 2200,
    houseCost: 300,
    mortgageValue: 300,
    unmortgageCost: 330
  },
  blue: {
    siteRent: 70,
    monopolyRent: 140,
    rent1House: 220,
    rent2Houses: 600,
    rent3Houses: 1300,
    rent4Houses: 2100,
    rentHotel: 3000,
    houseCost: 400,
    mortgageValue: 400,
    unmortgageCost: 440
  },
  purple: {
    siteRent: 90,
    monopolyRent: 180,
    rent1House: 280,
    rent2Houses: 750,
    rent3Houses: 1700,
    rent4Houses: 2700,
    rentHotel: 3800,
    houseCost: 500,
    mortgageValue: 500,
    unmortgageCost: 550
  },
  orange: {
    siteRent: 110,
    monopolyRent: 220,
    rent1House: 350,
    rent2Houses: 950,
    rent3Houses: 2100,
    rent4Houses: 3300,
    rentHotel: 4600,
    houseCost: 600,
    mortgageValue: 600,
    unmortgageCost: 660
  },
  red: {
    siteRent: 140,
    monopolyRent: 280,
    rent1House: 450,
    rent2Houses: 1200,
    rent3Houses: 2700,
    rent4Houses: 4200,
    rentHotel: 5800,
    houseCost: 750,
    mortgageValue: 750,
    unmortgageCost: 825
  },
  yellow: {
    siteRent: 170,
    monopolyRent: 340,
    rent1House: 550,
    rent2Houses: 1500,
    rent3Houses: 3300,
    rent4Houses: 5100,
    rentHotel: 7000,
    houseCost: 900,
    mortgageValue: 900,
    unmortgageCost: 990
  },
  green: {
    siteRent: 220,
    monopolyRent: 440,
    rent1House: 700,
    rent2Houses: 1900,
    rent3Houses: 4200,
    rent4Houses: 6400,
    rentHotel: 8800,
    houseCost: 1100,
    mortgageValue: 1100,
    unmortgageCost: 1210
  }
};

export const PORT_RENT_SCHEDULE: PortRentSchedule = {
  price: 1000,
  rent1Port: 250,
  rent2Ports: 500,
  rent3Ports: 1000,
  mortgageValue: 500,
  unmortgageCost: 550
};

/**
 * Returns the balanced rent schedule for a property by its color or step
 */
export function getPropertyRentSchedule(colorOrStep: string | number): PropertyRentSchedule {
  let color: string | null = null;
  if (typeof colorOrStep === 'number') {
    const tile = DEFAULT_BOARD_TILES.find((t) => t.step === colorOrStep);
    color = tile?.color || null;
  } else {
    color = colorOrStep;
  }

  if (color && PROPERTY_RENT_SCHEDULES[color]) {
    return PROPERTY_RENT_SCHEDULES[color];
  }

  // Fallback default formula if custom color
  return {
    siteRent: 100,
    monopolyRent: 200,
    rent1House: 300,
    rent2Houses: 800,
    rent3Houses: 1800,
    rent4Houses: 2800,
    rentHotel: 4000,
    houseCost: 500,
    mortgageValue: 500,
    unmortgageCost: 550
  };
}

/**
 * Returns the house / hotel development cost for a given board tile step
 */
export function getHouseCostByStep(step: number): number {
  const tile = DEFAULT_BOARD_TILES.find((t) => t.step === step);
  if (tile && tile.color && PROPERTY_RENT_SCHEDULES[tile.color]) {
    return PROPERTY_RENT_SCHEDULES[tile.color].houseCost;
  }
  return tile?.price ? Math.round(tile.price * 0.5) : 500;
}

// ── 32 CANONICAL BOARD TILES (Continuous Color Groups — Seamless Board Feel) ──
// Properties are arranged in contiguous color blocks of 3 properties each, matching
// classic board game neighborhood cohesion and calibrated economic tiers.
export const DEFAULT_BOARD_TILES: BoardTileStep[] = [
  // ── Bottom row — Steps 0–8 (Left → Right) ──────────────────────────────────
  {
    step: 0,
    name: "START",
    gujaratiName: "પ્રારંભ",
    type: "START",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 1,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/corners/corner_start.png",
    iconFrame: 14,
    description: "Start point of the Gujarat trade expedition. Collect ₹1,000 every time you pass or land here."
  },
  {
    step: 1,
    name: "MORBI",
    gujaratiName: "મોરબી",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 2,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/morbi.png",
    iconFrame: 5,
    description: "World capital of ceramic tiles and clock manufacturing on the banks of Machhu River."
  },
  {
    step: 2,
    name: "PATAN",
    gujaratiName: "પાટણ",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 3,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/patan.png",
    iconFrame: 9,
    description: "Ancient capital of Gujarat, famed for GI-tagged double-ikat Patola weaving and Solanki heritage."
  },
  {
    step: 3,
    name: "BHARUCH",
    gujaratiName: "ભરૂચ",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 4,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/bharuch.png",
    iconFrame: 9,
    description: "Historic seaport town on the sacred Narmada River, thriving chemical and industrial corridor."
  },
  {
    step: 4,
    name: "TAX",
    gujaratiName: "વાણિજ્ય કર",
    type: "TAX",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 5,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_tax.png",
    iconFrame: 13,
    description: "Commercial trade duties and statutory revenue levied by the Government of Gujarat."
  },
  {
    step: 5,
    name: "MEHSANA",
    gujaratiName: "મહેસાણા",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 6,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/mehsana.png",
    iconFrame: 9,
    description: "North Gujarat commerce hub, home to Asia's largest Dudhsagar Cooperative Dairy and solar projects."
  },
  {
    step: 6,
    name: "NADIAD",
    gujaratiName: "નડિયાદ",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 7,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/nadiad.png",
    iconFrame: 9,
    description: "Charotar commercial center, cultural town, and agricultural trading hub of central Gujarat."
  },
  {
    step: 7,
    name: "VAPI",
    gujaratiName: "વાપી",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 8,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/vapi.png",
    iconFrame: 4,
    description: "Southern Gujarat manufacturing powerhouse, one of India's largest chemical and paper industrial hubs."
  },
  {
    step: 8,
    name: "JAIL",
    gujaratiName: "જેલ",
    type: "JAIL",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 9,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/corners/corner_jail.png",
    iconFrame: 15,
    description: "Central Jail — Just Visiting if landing normally, or In Jail if arrested. Roll doubles, pay ₹500 bail, or use a Get Out of Jail Free card."
  },

  // ── Right side — Steps 9–15 (Bottom → Top) ─────────────────────────────────
  {
    step: 9,
    name: "JUNAGADH",
    gujaratiName: "જૂનાગઢ",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 8,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/junagadh.png",
    iconFrame: 6,
    description: "Historic citadel beneath Mount Girnar and historic gateway to the Asiatic Lion sanctuary."
  },
  {
    step: 10,
    name: "RAJKOT",
    gujaratiName: "રાજકોટ",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 7,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/rajkot.png",
    iconFrame: 11,
    description: "Vibrant capital of Saurashtra, thriving hub of engineering, auto components, and jewelry."
  },
  {
    step: 11,
    name: "JAMNAGAR",
    gujaratiName: "જામનગર",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 6,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/jamnagar.png",
    iconFrame: 10,
    description: "Brass City of India and world's largest oil refining and petrochemical manufacturing complex."
  },
  {
    step: 12,
    name: "CENTRAL BANK",
    gujaratiName: "સેન્ટ્રલ બેંક",
    type: "BANK",
    price: null,
    color: null,
    gridRow: 5,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_bank.png",
    iconFrame: 12,
    description: "Central Bank of Gujarat — Universal liquidity reserve paying ₹250 interest dividend to all merchants."
  },
  {
    step: 13,
    name: "ANKLESHWAR",
    gujaratiName: "અંકલેશ્વર",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 4,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/ankleshwar.png",
    iconFrame: 4,
    description: "Asia's leading chemical industrial estate and vital commercial manufacturing center."
  },
  {
    step: 14,
    name: "HIMATNAGAR",
    gujaratiName: "હિંમતનગર",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 3,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/himatnagar.png",
    iconFrame: 4,
    description: "Vibrant capital of Sabarkantha, renowned for Sabar Dairy, ceramics, and river trade."
  },
  {
    step: 15,
    name: "ANAND",
    gujaratiName: "આણંદ",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 2,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/anand.png",
    iconFrame: 15,
    description: "Milk Capital of India, birthplace of AMUL and epicenter of India's White Revolution."
  },
  {
    step: 16,
    name: "REST OASIS",
    gujaratiName: "રેસ્ટ ઓએસિસ",
    type: "FREE_PARKING",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 9,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/corners/corner_oasis.png",
    iconFrame: 12,
    description: "Rest Oasis — safe resting haven. No rent, no fines, relax peacefully."
  },

  // ── Top row — Steps 17–23 (Right → Left) ───────────────────────────────────
  {
    step: 17,
    name: "GANDHINAGAR",
    gujaratiName: "ગાંધીનગર",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 8,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/gandhinagar.png",
    iconFrame: 3,
    description: "Capital of Gujarat, famed for green architecture, governance, and tech corridors."
  },
  {
    step: 18,
    name: "VADODARA",
    gujaratiName: "વડોદરા",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 7,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/vadodara.png",
    iconFrame: 3,
    description: "Cultural capital of Gujarat, renowned for heritage, arts, academia, and pharmaceutical giants."
  },
  {
    step: 19,
    name: "LAXMI VILAS",
    gujaratiName: "લક્ષ્મી વિલાસ",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 6,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/laxmi_vilas.png",
    iconFrame: 3,
    description: "Grand Indo-Saracenic royal palace of the Gaekwads, four times the size of Buckingham Palace."
  },
  {
    step: 20,
    name: "GOLD RESERVE",
    gujaratiName: "સુવર્ણ ભંડાર",
    type: "SPECIAL",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 5,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_gold.png",
    iconFrame: 15,
    description: "Sovereign treasury holding pure gold bullion reserves for commerce liquidity."
  },
  {
    step: 21,
    name: "AHMEDABAD",
    gujaratiName: "અમદાવાદ",
    type: "PROPERTY",
    price: 1800,
    color: "yellow",
    gridRow: 1,
    gridCol: 4,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/ahmedabad.png",
    iconFrame: 1,
    description: "India's first UNESCO World Heritage City, world center of textiles and vibrant commerce."
  },
  {
    step: 22,
    name: "STATUE OF UNITY",
    gujaratiName: "સ્ટેચ્યુ ઓફ યુનિટી",
    type: "PROPERTY",
    price: 1800,
    color: "yellow",
    gridRow: 1,
    gridCol: 3,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/statue_of_unity.png",
    iconFrame: 0,
    description: "The world's tallest monument standing 182 meters tall on the Narmada river."
  },
  {
    step: 23,
    name: "BHUJ",
    gujaratiName: "ભુજ",
    type: "PROPERTY",
    price: 1800,
    color: "yellow",
    gridRow: 1,
    gridCol: 2,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/bhuj.png",
    iconFrame: 11,
    description: "Heart of Kutch, famed for the White Desert, ancient palaces, handloom embroidery, and crafts."
  },
  {
    step: 24,
    name: "GO TO JAIL",
    gujaratiName: "જેલ જાઓ",
    type: "GO_TO_JAIL",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 1,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/corners/corner_gotojail.png",
    iconFrame: 13,
    description: "Police Detainment — Go directly to Central Jail! Do not pass START, do not collect ₹1,000."
  },

  // ── Left side — Steps 25–31 (Top → Bottom) ─────────────────────────────────
  {
    step: 25,
    name: "DHOLERA",
    gujaratiName: "ધોલેરા",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 2,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/dholera.png",
    iconFrame: 4,
    description: "India's premier Greenfield smart city, international airport, and global semiconductor manufacturing hub."
  },
  {
    step: 26,
    name: "GIFT CITY",
    gujaratiName: "ગિફ્ટ સિટી",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 3,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/gift_city.png",
    iconFrame: 7,
    description: "India's premier operational smart city and International Financial Services Centre (IFSC)."
  },
  {
    step: 27,
    name: "SURAT",
    gujaratiName: "સુરત",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 4,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/surat.png",
    iconFrame: 2,
    description: "Global epicenter for diamond cutting, silk commerce, and India's fastest-growing business hub."
  },
  {
    step: 28,
    name: "CHANCE",
    gujaratiName: "નસીબ / ચાન્સ",
    type: "CHANCE",
    price: null,
    color: null,
    gridRow: 5,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_chance.png",
    iconFrame: 15,
    description: "Draw an auspicious fortune or contingency card altering your business fortunes."
  },
  {
    step: 29,
    name: "BHAVNAGAR",
    gujaratiName: "ભાવનગર",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 6,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/bhavnagar.png",
    iconFrame: 8,
    description: "Historic maritime port, tidal lock-gate harbor, and traditional trading gateway of Saurashtra."
  },
  {
    step: 30,
    name: "KANDLA",
    gujaratiName: "કંડલા",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 7,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/kandla.png",
    iconFrame: 8,
    description: "India's highest cargo volume port, crucial commercial maritime gateway for western India."
  },
  {
    step: 31,
    name: "PORBANDAR",
    gujaratiName: "પોરબંદર",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 8,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/porbandar.png",
    iconFrame: 8,
    description: "Historic seaport of Saurashtra, birthplace of Mahatma Gandhi and active maritime harbor."
  }
];

// Active match board tiles initialized from default layout
export let BOARD_TILES: BoardTileStep[] = DEFAULT_BOARD_TILES.map((t) => ({ ...t }));

/**
 * Resets or synchronizes board tiles while strictly preserving canonical economic balance.
 * Guaranteed to keep color group integrity, calibrated tier prices, and port parameters intact.
 * 
 * @param _seed Optional seed for synchronized multiplayer consistency
 */
export function shuffleMatchTiles(_seed?: number): BoardTileStep[] {
  // Preserve canonical calibrated board layout to ensure balance and group cohesion
  const newTiles: BoardTileStep[] = DEFAULT_BOARD_TILES.map((t) => ({ ...t }));
  BOARD_TILES.splice(0, BOARD_TILES.length, ...newTiles);
  return BOARD_TILES;
}

/**
 * Resets board to default classic layout
 */
export function resetToDefaultTiles(): BoardTileStep[] {
  const defaults = DEFAULT_BOARD_TILES.map((t) => ({ ...t }));
  BOARD_TILES.splice(0, BOARD_TILES.length, ...defaults);
  return BOARD_TILES;
}
