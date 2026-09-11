// ============================================================================
// NAVO VYAPAR — 32-TILE UNIFORM BOARD DATA SPECIFICATION
// Every single tile has a consistent Header touching the center border line,
// clean card body in the middle, and price/sub footer at the outer edge.
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
  | 'green'
  | 'blue'
  | 'yellow'
  | 'red'
  | 'pink'
  | 'orange'
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
  blue: '#0284c7',
  green: '#059669',
  yellow: '#d97706',
  red: '#e11d48',
  pink: '#8b5cf6',
  orange: '#ea580c'
};

export const DEFAULT_BOARD_TILES: BoardTileStep[] = [
  // ── Bottom row — Steps 0–8 (Left → Right) ──────────────────────────────────
  {
    step: 0,
    name: "START / GO",
    gujaratiName: "પ્રારંભ",
    type: "START",
    price: null,
    color: "green",
    gridRow: 9,
    gridCol: 1,
    isCorner: true,
    edge: "corner",
    iconFrame: 14,
    description: "Start point of the Gujarat trade expedition. Collect ₹1,000 every time you pass."
  },
  {
    step: 1,
    name: "DWARKA",
    gujaratiName: "દ્વારકાધીશ",
    type: "PROPERTY",
    price: 2000,
    color: "blue",
    gridRow: 9,
    gridCol: 2,
    isCorner: false,
    edge: "bottom",
    iconFrame: 9,
    description: "Sacred city of Lord Krishna and premier spiritual pilgrimage destination of western India."
  },
  {
    step: 2,
    name: "GIFT CITY",
    gujaratiName: "ગિફ્ટ સિટી ગાંધીનગર",
    type: "PROPERTY",
    price: 1500,
    color: "green",
    gridRow: 9,
    gridCol: 3,
    isCorner: false,
    edge: "bottom",
    iconFrame: 7,
    description: "India's first operational smart city and International Financial Services Centre (IFSC)."
  },
  {
    step: 3,
    name: "GANDHINAGAR",
    gujaratiName: "ગાંધીનગર સચિવાલય",
    type: "PROPERTY",
    price: 500,
    color: "green",
    gridRow: 9,
    gridCol: 4,
    isCorner: false,
    edge: "bottom",
    iconFrame: 3,
    description: "Capital of Gujarat, famed for green architecture, governance, and tech parks."
  },
  {
    step: 4,
    name: "SURAT DIAMOND",
    gujaratiName: "સુરત ડાયમંડ બુર્સ",
    type: "PROPERTY",
    price: 3000,
    color: "blue",
    gridRow: 9,
    gridCol: 5,
    isCorner: false,
    edge: "bottom",
    iconFrame: 2,
    description: "World's largest office building and global epicenter for diamond cutting and trading."
  },
  {
    step: 5,
    name: "TAX",
    gujaratiName: "વાણિજ્યિક કર",
    type: "TAX",
    price: null,
    color: "red",
    gridRow: 9,
    gridCol: 6,
    isCorner: false,
    edge: "bottom",
    iconFrame: 13,
    description: "State commercial tax and trade duties levied by the Government of Gujarat."
  },
  {
    step: 6,
    name: "BHAVNAGAR",
    gujaratiName: "ભાવનગર બંદર",
    type: "PORT",
    price: 500,
    color: "blue",
    gridRow: 9,
    gridCol: 7,
    isCorner: false,
    edge: "bottom",
    iconFrame: 8,
    description: "Historic port city, lock-gate harbor, and trading center of Saurashtra."
  },
  {
    step: 7,
    name: "AKSHARDHAM",
    gujaratiName: "અક્ષરધામ મંદિર",
    type: "PROPERTY",
    price: 500,
    color: "yellow",
    gridRow: 9,
    gridCol: 8,
    isCorner: false,
    edge: "bottom",
    iconFrame: 4,
    description: "Magnificent sandstone temple monument honoring ancient Indian spiritual architecture."
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
    iconFrame: 15,
    description: "Just Visiting — or In Jail. Roll doubles to escape, pay ₹500 fine, or use a Get Out of Jail Free card."
  },

  // ── Right side — Steps 9–15 (Bottom → Top) ─────────────────────────────────
  {
    step: 9,
    name: "PALITANA",
    gujaratiName: "પાલીતાણા તીર્થ",
    type: "PROPERTY",
    price: 200,
    color: "blue",
    gridRow: 8,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 9,
    description: "World-renowned sacred mountain sanctuary with over 800 marble temples."
  },
  {
    step: 10,
    name: "JUNAGADH",
    gujaratiName: "જૂનાગઢ ગિરનાર",
    type: "PROPERTY",
    price: 1000,
    color: "green",
    gridRow: 7,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 6,
    description: "Historic citadel beneath Mount Girnar and historic gateway to the Asiatic Lion reserve."
  },
  {
    step: 11,
    name: "RAJKOT",
    gujaratiName: "રાજકોટ રંગીલું",
    type: "PROPERTY",
    price: 1200,
    color: "green",
    gridRow: 6,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 11,
    description: "Vibrant capital of Saurashtra, thriving hub of engineering, auto components, gold jewelry, and trade."
  },
  {
    step: 12,
    name: "SOMNATH",
    gujaratiName: "સોમનાથ જ્યોતિર્લિંગ",
    type: "PROPERTY",
    price: 200,
    color: "blue",
    gridRow: 5,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 5,
    description: "The first among the twelve holy Jyotirlinga shrines of Lord Shiva on the Arabian Sea."
  },
  {
    step: 13,
    name: "RANI KI VAV",
    gujaratiName: "રાણકી વાવ પાટણ",
    type: "PROPERTY",
    price: 300,
    color: "green",
    gridRow: 4,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 4,
    description: "UNESCO World Heritage subterranean stepwell displaying sublime Solanki dynasty sculpture."
  },
  {
    step: 14,
    name: "CENTRAL BANK",
    gujaratiName: "ગુજરાત સેન્ટ્રલ બેંક",
    type: "BANK",
    price: null,
    color: "blue",
    gridRow: 3,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 12,
    description: "Branch banking authority providing enterprise loans and liquidity."
  },
  {
    step: 15,
    name: "AMBAJI",
    gujaratiName: "અંબાજી શક્તિપીઠ",
    type: "PROPERTY",
    price: 500,
    color: "green",
    gridRow: 2,
    gridCol: 9,
    isCorner: false,
    edge: "right",
    iconFrame: 9,
    description: "Major Shakti Peeth pilgrimage sanctuary nestled in the Aravalli hills."
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
    iconFrame: 12,
    description: "Free Parking — a safe rest spot. No rent, no fines, nothing happens here."
  },
  {
    step: 17,
    name: "MODHERA SUN",
    gujaratiName: "મોઢેરા સૂર્ય મંદિર",
    type: "PROPERTY",
    price: 1000,
    color: "green",
    gridRow: 1,
    gridCol: 8,
    isCorner: false,
    edge: "top",
    iconFrame: 4,
    description: "Exquisite 11th-century solar temple and stepped Sabha Mandap tank architecture."
  },
  {
    step: 18,
    name: "GOLD RESERVE",
    gujaratiName: "રાજ્ય સુવર્ણ ભંડાર",
    type: "SPECIAL",
    price: null,
    color: "yellow",
    gridRow: 1,
    gridCol: 7,
    isCorner: false,
    edge: "top",
    iconFrame: 15,
    description: "Sovereign treasury holding pure gold bullion reserves for commerce liquidity."
  },
  {
    step: 19,
    name: "LAXMI VILAS",
    gujaratiName: "લક્ષ્મી વિલાસ મહેલ",
    type: "PROPERTY",
    price: 2500,
    color: "yellow",
    gridRow: 1,
    gridCol: 6,
    isCorner: false,
    edge: "top",
    iconFrame: 3,
    description: "Grand Indo-Saracenic royal palace of the Gaekwads, four times the size of Buckingham Palace."
  },
  {
    step: 20,
    name: "VADODARA",
    gujaratiName: "વડોદરા સંસ્કારી નગરી",
    type: "PROPERTY",
    price: 3000,
    color: "blue",
    gridRow: 1,
    gridCol: 5,
    isCorner: false,
    edge: "top",
    iconFrame: 3,
    description: "Cultural capital of Gujarat, renowned for grand heritage, the Gaekwads, arts, and pharmaceutical giants."
  },
  {
    step: 21,
    name: "AHMEDABAD",
    gujaratiName: "અમદાવાદ હેરિટેજ",
    type: "PROPERTY",
    price: 2500,
    color: "pink",
    gridRow: 1,
    gridCol: 4,
    isCorner: false,
    edge: "top",
    iconFrame: 1,
    description: "India's first UNESCO World Heritage City, world center of textiles and vibrant commerce."
  },
  {
    step: 22,
    name: "CHANCE",
    gujaratiName: "ભાગ્ય અને નસીબ",
    type: "CHANCE",
    price: null,
    color: "pink",
    gridRow: 1,
    gridCol: 3,
    isCorner: false,
    edge: "top",
    iconFrame: 15,
    description: "Draw an auspicious fortune or contingency card altering your business fortunes."
  },
  {
    step: 23,
    name: "STATUE OF UNITY",
    gujaratiName: "સ્ટેચ્યુ ઓફ યુનિટી",
    type: "PROPERTY",
    price: 2000,
    color: "pink",
    gridRow: 1,
    gridCol: 2,
    isCorner: false,
    edge: "top",
    iconFrame: 0,
    description: "The world's tallest monument standing 182 meters tall on the Narmada river."
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
    iconFrame: 13,
    description: "Go directly to Jail. Do not pass START, do not collect ₹1,000."
  },
  {
    step: 25,
    name: "HIMATNAGAR",
    gujaratiName: "હિંમતનગર સાબરકાંઠા",
    type: "PROPERTY",
    price: 800,
    color: "orange",
    gridRow: 2,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 4,
    description: "Vibrant capital of Sabarkantha, renowned for Sabar Dairy, ceramics, and historic Hathmati river commerce."
  },
  {
    step: 26,
    name: "ANAND",
    gujaratiName: "આણંદ અમૂલ ડેરી",
    type: "PROPERTY",
    price: 800,
    color: "orange",
    gridRow: 3,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 15,
    description: "Milk Capital of India, birthplace of AMUL and epicenter of India's White Revolution."
  },
  {
    step: 27,
    name: "DAKOR",
    gujaratiName: "ડાકોર રણછોડરાય",
    type: "PROPERTY",
    price: 500,
    color: "orange",
    gridRow: 4,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 9,
    description: "Sacred pilgrimage shrine dedicated to Lord Ranchhodraiji in Kheda district."
  },
  {
    step: 28,
    name: "JAMNAGAR",
    gujaratiName: "જામનગર બ્રાસ સિટી",
    type: "PROPERTY",
    price: 1500,
    color: "blue",
    gridRow: 5,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 10,
    description: "Brass City of India and world's largest oil refining and petrochemical complex."
  },
  {
    step: 29,
    name: "KANDLA PORT",
    gujaratiName: "કંડલા મહાબંદર",
    type: "PORT",
    price: 700,
    color: "pink",
    gridRow: 6,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 8,
    description: "India's highest cargo volume port, crucial commercial gateway for western India."
  },
  {
    step: 30,
    name: "PORBANDAR",
    gujaratiName: "પોરબંદર બંદર",
    type: "PORT",
    price: 600,
    color: "pink",
    gridRow: 7,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 8,
    description: "Historic seaport of Saurashtra and birthplace of Mahatma Gandhi."
  },
  {
    step: 31,
    name: "BHUJ KUTCH",
    gujaratiName: "ભુજ કચ્છ ક્રાફ્ટ",
    type: "PROPERTY",
    price: 800,
    color: "green",
    gridRow: 8,
    gridCol: 1,
    isCorner: false,
    edge: "left",
    iconFrame: 11,
    description: "Heart of Kutch, famed for the White Desert, ancient palaces, handloom embroidery, and vibrant trade."
  }
];

// Active match board tiles initialized from default layout
export let BOARD_TILES: BoardTileStep[] = DEFAULT_BOARD_TILES.map((t) => ({ ...t }));

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles the Gujarat cities & properties across the board for a dynamic, exciting match layout.
 * Fixed structural elements (the 4 corners: START, JAIL, FREE PARKING, GO TO JAIL, and utility slots: TAX, CHANCE, SPECIAL)
 * remain in their strategic positions, while the 24 commercial cities and ports are randomized!
 * 
 * @param seed Optional seed to guarantee 100% synchronized board layouts across multiplayer clients
 */
export function shuffleMatchTiles(seed?: number): BoardTileStep[] {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;

  // Clone from immutable blueprint
  const newTiles: BoardTileStep[] = DEFAULT_BOARD_TILES.map((t) => ({ ...t }));

  // Identify all property and port slots (the cities of Gujarat)
  const propertyIndices = newTiles
    .map((t, idx) => (t.type === 'PROPERTY' || t.type === 'PORT' ? idx : -1))
    .filter((idx) => idx !== -1);

  // Extract the city attributes
  const cityPayloads = propertyIndices.map((idx) => {
    const t = newTiles[idx];
    return {
      name: t.name,
      gujaratiName: t.gujaratiName,
      type: t.type,
      price: t.price,
      color: t.color,
      iconFrame: t.iconFrame,
      description: t.description,
      imageUrl: t.imageUrl,
    };
  });

  // Fisher-Yates shuffle
  for (let i = cityPayloads.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = cityPayloads[i];
    cityPayloads[i] = cityPayloads[j];
    cityPayloads[j] = temp;
  }

  // Re-assign shuffled cities to property slots (preserving gridRow, gridCol, step, edge, isCorner)
  propertyIndices.forEach((tileIdx, i) => {
    newTiles[tileIdx] = {
      ...newTiles[tileIdx],
      ...cityPayloads[i],
    };
  });

  // Update exported BOARD_TILES in-place so all modules referencing it immediately see the new match layout
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

