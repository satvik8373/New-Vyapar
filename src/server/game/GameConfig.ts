export const BOARD_SIZE = 32;
export const STARTING_BALANCE = 5000;
export const GO_SALARY = 1000;
export const GO_EXACT_BONUS = 1000;
export const JAIL_TILE_STEP = 8;
export const JAIL_FINE = 500;
export const MAX_JAIL_TURNS = 3;

export interface ServerChanceCard {
  id: string;
  title: string;
  description: string;
  amount?: number;
  moveToTile?: number;
  isReward: boolean;
  isGetOutOfJailFree?: boolean;
  isGoToJail?: boolean;
  payEachPlayer?: number;
}

export const SERVER_CHANCE_CARDS: ServerChanceCard[] = [
  {
    id: 'c1',
    title: 'GIFT City FinTech Dividend',
    description: 'Special annual dividend from IFSC tech investment fund.',
    amount: 750,
    isReward: true
  },
  {
    id: 'c2',
    title: 'Kandla Port Customs Tariff',
    description: 'Maritime customs clearance and state logistics duty paid.',
    amount: -350,
    isReward: false
  },
  {
    id: 'c3',
    title: 'Surat Diamond Export Subsidy',
    description: 'Gems & jewelry export incentive from State Commerce Ministry.',
    amount: 1000,
    isReward: true
  },
  {
    id: 'c4',
    title: 'Heritage Restoration Levy',
    description: 'Contribution to Rani Ki Vav and Somnath corridor maintenance.',
    amount: -250,
    isReward: false
  },
  {
    id: 'c5',
    title: 'Solar Energy Incentive',
    description: 'Charanka Solar Park clean energy reward.',
    amount: 500,
    isReward: true
  },
  {
    id: 'c6',
    title: 'Highway Tollway Pass',
    description: 'Expressway toll taxes on Ahmedabad-Vadodara commercial artery.',
    amount: -200,
    isReward: false
  },
  {
    id: 'c7',
    title: 'Amul Dairy Cooperative Bonus',
    description: 'Annual patron dividend from Anand Dairy Milk Union.',
    amount: 500,
    isReward: true
  },
  {
    id: 'c8',
    title: 'Express Trade Voyage',
    description: 'Charter flight to Statue of Unity — advance to tile 23.',
    moveToTile: 23,
    isReward: true
  },
  {
    id: 'c9',
    title: 'Get Out of Jail Free',
    description: 'Keep this card until needed. Use it to leave Jail at no cost.',
    isReward: true,
    isGetOutOfJailFree: true
  },
  {
    id: 'c10',
    title: 'Gujarat Tourism Award',
    description: 'State Tourism Board recognition — cash prize awarded.',
    amount: 400,
    isReward: true
  },
  {
    id: 'c11',
    title: 'Import Duty Surcharge',
    description: 'Emergency import duty levied on foreign goods.',
    amount: -450,
    isReward: false
  },
  {
    id: 'c12',
    title: 'Advance to START / GO',
    description: 'Move directly to START and collect your salary.',
    moveToTile: 0,
    isReward: true
  },
  {
    id: 'c13',
    title: 'Police Investigation',
    description: 'Tax evasion detected — go directly to Jail.',
    isReward: false,
    isGoToJail: true
  },
  {
    id: 'c14',
    title: 'Festival Bonus — Collect from All!',
    description: 'Gujarat festival bonus! Collect ₹150 from each merchant.',
    payEachPlayer: 150,
    isReward: true
  },
  {
    id: 'c15',
    title: 'Street Repairs Assessment',
    description: 'Pay ₹200 road repair levy to each merchant.',
    payEachPlayer: -200,
    isReward: false
  },
  {
    id: 'c16',
    title: 'Ahmedabad Heritage Grant',
    description: 'UNESCO city heritage grant credited to your account.',
    amount: 300,
    isReward: true
  }
];
