export interface PlayerData {
  id: string;
  name: string;
  tokenColor: string;
  tokenColorHex: number;
  avatar: string;
  currentTileIndex: number;
  balance: number;
  ownedPropertyIds: number[];
  isBankrupt: boolean;
  colorName: string;
  // Jail state
  isInJail: boolean;
  jailTurns: number;           // how many turns spent in jail (0–3)
  getOutOfJailCards: number;   // "Get Out of Jail Free" cards held
}

export type TurnPhase =
  | 'WAITING'
  | 'PLAYER_TURN'
  | 'ROLLING'
  | 'MOVING'
  | 'TILE_ACTION'
  | 'RESOLVING'
  | 'NEXT_TURN'
  | 'JAIL_DECISION'   // Player in jail choosing: roll / pay / use card
  | 'GAME_OVER';      // Winner determined
