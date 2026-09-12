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
  teal: 'Sacred Heritage',
  blue: 'Pilgrimage Corridor',
  purple: 'Saurashtra Hubs',
  orange: 'North & Central Commerce',
  red: 'Royal & Metropolis',
  yellow: 'Mega Landmarks & Crafts',
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

// ── 32 CANONICAL BOARD TILES ───────────────────────────────────────────────────
// Symmetric 4-line layout:
// Bottom edge: Teal Group (3) + TAX (Center) + Blue Group (3)
// Right edge: Purple Group (3) + CENTRAL BANK (Center) + Orange Group (3)
// Top edge: Red Group (3) + GOLD RESERVE (Center) + Yellow Group (3)
// Left edge: Green Group (3) + CHANCE (Center) + 3 Seaports
export const DEFAULT_BOARD_TILES: BoardTileStep[] = [
  // ── Bottom row — Steps 0–8 (Left → Right) ──────────────────────────────────
  {
    step: 0,
    name: "START / GO",
    gujaratiName: "પ્રારંભ",
    type: "START",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 1,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/cities/tile_0.png",
    iconFrame: 14,
    description: "Start point of the Gujarat trade expedition. Collect ₹1,000 every time you pass."
  },
  {
    step: 1,
    name: "SOMNATH",
    gujaratiName: "સોમનાથ જ્યોતિર્લિંગ",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 2,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_1.png",
    iconFrame: 5,
    description: "The first among the twelve holy Jyotirlinga shrines of Lord Shiva on the Arabian Sea coast."
  },
  {
    step: 2,
    name: "PALITANA",
    gujaratiName: "પાલીતાણા તીર્થ",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 3,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_2.png",
    iconFrame: 9,
    description: "World-renowned sacred mountain sanctuary with over 800 marble temples atop Shatrunjaya hills."
  },
  {
    step: 3,
    name: "AMBAJI",
    gujaratiName: "અંબાજી શક્તિપીઠ",
    type: "PROPERTY",
    price: 600,
    color: "teal",
    gridRow: 9,
    gridCol: 4,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_3.png",
    iconFrame: 9,
    description: "Major Shakti Peeth pilgrimage sanctuary nestled in the scenic Aravalli mountain ranges."
  },
  {
    step: 4,
    name: "TAX",
    gujaratiName: "વાણિજ્યિક કર",
    type: "TAX",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 5,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_5.png",
    iconFrame: 13,
    description: "Commercial trade duties and statutory revenue levied by the Government of Gujarat."
  },
  {
    step: 5,
    name: "DWARKA",
    gujaratiName: "દ્વારકાધીશ",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 6,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_4.png",
    iconFrame: 9,
    description: "Sacred kingdom of Lord Krishna and premier spiritual pilgrimage destination of western India."
  },
  {
    step: 6,
    name: "DAKOR",
    gujaratiName: "ડાકોર રણછોડરાય",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 7,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_7.png",
    iconFrame: 9,
    description: "Sacred pilgrimage shrine dedicated to Lord Ranchhodraiji on the banks of Gomti Lake."
  },
  {
    step: 7,
    name: "RANI KI VAV",
    gujaratiName: "રાણકી વાવ પાટણ",
    type: "PROPERTY",
    price: 800,
    color: "blue",
    gridRow: 9,
    gridCol: 8,
    isCorner: false,
    edge: "bottom",
    imageUrl: "/assets/images/cities/tile_9.png",
    iconFrame: 4,
    description: "UNESCO World Heritage subterranean stepwell displaying sublime Solanki dynasty architecture."
  },
  {
    step: 8,
    name: "JAIL",
    gujaratiName: "કારાગૃહ",
    type: "JAIL",
    price: null,
    color: null,
    gridRow: 9,
    gridCol: 9,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/cities/tile_8.png",
    iconFrame: 15,
    description: "Just Visiting — or In Jail. Roll doubles to escape, pay ₹500 fine, or use a Get Out of Jail Free card."
  },

  // ── Right side — Steps 9–15 (Bottom → Top) ─────────────────────────────────
  {
    step: 9,
    name: "JUNAGADH",
    gujaratiName: "જૂનાગઢ ગિરનાર",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 8,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_10.png",
    iconFrame: 6,
    description: "Historic citadel beneath Mount Girnar and historic gateway to the Asiatic Lion sanctuary."
  },
  {
    step: 10,
    name: "RAJKOT",
    gujaratiName: "રાજકોટ રંગીલું",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 7,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_11.png",
    iconFrame: 11,
    description: "Vibrant capital of Saurashtra, thriving hub of engineering, auto components, and jewelry."
  },
  {
    step: 11,
    name: "JAMNAGAR",
    gujaratiName: "જામનગર બ્રાસ સિટી",
    type: "PROPERTY",
    price: 1000,
    color: "purple",
    gridRow: 6,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_12.png",
    iconFrame: 10,
    description: "Brass City of India and world's largest oil refining and petrochemical manufacturing complex."
  },
  {
    step: 12,
    name: "CENTRAL BANK",
    gujaratiName: "ગુજરાત સેન્ટ્રલ બેંક",
    type: "BANK",
    price: null,
    color: null,
    gridRow: 5,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_14.png",
    iconFrame: 12,
    description: "Branch banking authority providing enterprise loans and liquidity reserves."
  },
  {
    step: 13,
    name: "MODHERA SUN",
    gujaratiName: "મોઢેરા સૂર્ય મંદિર",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 4,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_13.png",
    iconFrame: 4,
    description: "Exquisite 11th-century solar temple and stepped Sabha Mandap tank architecture."
  },
  {
    step: 14,
    name: "HIMATNAGAR",
    gujaratiName: "હિંમતનગર સાબરકાંઠા",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 3,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_15.png",
    iconFrame: 4,
    description: "Vibrant capital of Sabarkantha, renowned for Sabar Dairy, ceramics, and river trade."
  },
  {
    step: 15,
    name: "ANAND",
    gujaratiName: "આણંદ અમૂલ ડેરી",
    type: "PROPERTY",
    price: 1200,
    color: "orange",
    gridRow: 2,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    imageUrl: "/assets/images/cities/tile_17.png",
    iconFrame: 15,
    description: "Milk Capital of India, birthplace of AMUL and epicenter of India's White Revolution."
  },

  // ── Top row — Steps 16–23 (Right → Left) ───────────────────────────────────
  {
    step: 16,
    name: "FREE PARKING",
    gujaratiName: "મફત વિશ્રામ",
    type: "FREE_PARKING",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 9,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/cities/tile_16.png",
    iconFrame: 12,
    description: "Free Parking — a safe rest spot. No rent, no fines, nothing happens here."
  },
  {
    step: 17,
    name: "GANDHINAGAR",
    gujaratiName: "ગાંધીનગર સચિવાલય",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 8,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_19.png",
    iconFrame: 3,
    description: "Capital of Gujarat, famed for green architecture, governance, and tech corridors."
  },
  {
    step: 18,
    name: "VADODARA",
    gujaratiName: "વડોદરા સંસ્કારી નગરી",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 7,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_20.png",
    iconFrame: 3,
    description: "Cultural capital of Gujarat, renowned for heritage, arts, academia, and pharmaceutical giants."
  },
  {
    step: 19,
    name: "LAXMI VILAS",
    gujaratiName: "લક્ષ્મી વિલાસ મહેલ",
    type: "PROPERTY",
    price: 1500,
    color: "red",
    gridRow: 1,
    gridCol: 6,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_21.png",
    iconFrame: 3,
    description: "Grand Indo-Saracenic royal palace of the Gaekwads, four times the size of Buckingham Palace."
  },
  {
    step: 20,
    name: "GOLD RESERVE",
    gujaratiName: "રાજ્ય સુવર્ણ ભંડાર",
    type: "SPECIAL",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 5,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_18.png",
    iconFrame: 15,
    description: "Sovereign treasury holding pure gold bullion reserves for commerce liquidity."
  },
  {
    step: 21,
    name: "AHMEDABAD",
    gujaratiName: "અમદાવાદ હેરિટેજ",
    type: "PROPERTY",
    price: 1800,
    color: "yellow",
    gridRow: 1,
    gridCol: 4,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_23.png",
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
    imageUrl: "/assets/images/cities/tile_25.png",
    iconFrame: 0,
    description: "The world's tallest monument standing 182 meters tall on the Narmada river."
  },
  {
    step: 23,
    name: "BHUJ KUTCH",
    gujaratiName: "ભુજ કચ્છ ક્રાફ્ટ",
    type: "PROPERTY",
    price: 1800,
    color: "yellow",
    gridRow: 1,
    gridCol: 2,
    isCorner: false,
    edge: "top",
    imageUrl: "/assets/images/cities/tile_26.png",
    iconFrame: 11,
    description: "Heart of Kutch, famed for the White Desert, ancient palaces, handloom embroidery, and crafts."
  },

  // ── Left side — Steps 24–31 (Top → Bottom) ─────────────────────────────────
  {
    step: 24,
    name: "GO TO JAIL",
    gujaratiName: "કારાગૃહ જાઓ",
    type: "GO_TO_JAIL",
    price: null,
    color: null,
    gridRow: 1,
    gridCol: 1,
    isCorner: true,
    edge: "corner",
    imageUrl: "/assets/images/cities/tile_24.png",
    iconFrame: 13,
    description: "Go directly to Jail. Do not pass START, do not collect ₹1,000."
  },
  {
    step: 25,
    name: "AKSHARDHAM",
    gujaratiName: "અક્ષરધામ મંદિર",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 2,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_27.png",
    iconFrame: 4,
    description: "Magnificent sandstone temple monument honoring ancient Indian spiritual architecture."
  },
  {
    step: 26,
    name: "GIFT CITY",
    gujaratiName: "ગિફ્ટ સિટી ગાંધીનગર",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 3,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_28.png",
    iconFrame: 7,
    description: "India's premier operational smart city and International Financial Services Centre (IFSC)."
  },
  {
    step: 27,
    name: "SURAT DIAMOND",
    gujaratiName: "સુરત ડાયમંડ બુર્સ",
    type: "PROPERTY",
    price: 2200,
    color: "green",
    gridRow: 4,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_31.png",
    iconFrame: 2,
    description: "World's largest office building and global epicenter for diamond cutting and trading."
  },
  {
    step: 28,
    name: "CHANCE",
    gujaratiName: "ભાગ્ય અને નસીબ",
    type: "CHANCE",
    price: null,
    color: null,
    gridRow: 5,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_22.png",
    iconFrame: 15,
    description: "Draw an auspicious fortune or contingency card altering your business fortunes."
  },
  {
    step: 29,
    name: "BHAVNAGAR PORT",
    gujaratiName: "ભાવનગર બંદર",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 6,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_6.png",
    iconFrame: 8,
    description: "Historic maritime port, tidal lock-gate harbor, and traditional trading gateway of Saurashtra."
  },
  {
    step: 30,
    name: "KANDLA PORT",
    gujaratiName: "કંડલા મહાબંદર",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 7,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_29.png",
    iconFrame: 8,
    description: "India's highest cargo volume port, crucial commercial maritime gateway for western India."
  },
  {
    step: 31,
    name: "PORBANDAR PORT",
    gujaratiName: "પોરબંદર બંદર",
    type: "PORT",
    price: 1000,
    color: null,
    gridRow: 8,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    imageUrl: "/assets/images/cities/tile_30.png",
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
