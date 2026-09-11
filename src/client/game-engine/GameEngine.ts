import { BOARD_TILES, BoardTileStep, shuffleMatchTiles } from '@shared/game-data/boardData';
import { PlayerData, TurnPhase } from '@shared/types/player';
import { SoundEffects } from '../audio/SoundEffects';

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'roll' | 'buy' | 'rent' | 'tax' | 'chance' | 'pass' | 'info' | 'jail' | 'auction';
  timestamp: number;
}

export interface ChanceCard {
  id: string;
  title: string;
  description: string;
  amount?: number;
  moveToTile?: number;
  isReward: boolean;
  isGetOutOfJailFree?: boolean;
  isGoToJail?: boolean;
  payEachPlayer?: number; // positive = collect from each, negative = pay each
}

export const CHANCE_CARDS: ChanceCard[] = [
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

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const JAIL_TILE_STEP    = 8;
const JAIL_FINE         = 500;
const MAX_JAIL_TURNS    = 3;
const GO_SALARY         = 1000;
const GO_EXACT_BONUS    = 1000;  // extra bonus for landing EXACTLY on GO (total = 2000)
const STARTING_BALANCE  = 5000;
const BOARD_SIZE        = 32;

export interface AuctionState {
  tileStep: number;
  tileName: string;
  tilePrice: number;
  currentBid: number;
  highestBidderId: string | null;
  biddingOrder: string[];   // player ids in order, excluding bankrupt
  currentBidderIndex: number;
}

export interface GameAnnouncement {
  id: string;
  type: 'rent' | 'tax' | 'salary' | 'jail' | 'buy' | 'loan' | 'chance' | 'info';
  title: string;
  message: string;
  amount?: number;
  amountType?: 'plus' | 'minus';
  playerName?: string;
  playerColor?: string;
  targetPlayerName?: string;
  targetPlayerColor?: string;
  timestamp: number;
  durationMs?: number;
  tileStep?: number;
  tileName?: string;
  tileColor?: string;
}

export interface GameEngineState {
  players: (PlayerData & { isHuman: boolean; netWorth: number })[];
  activePlayerIndex: number;
  phase: TurnPhase;
  diceState: { rolling: boolean; value: number | null };
  hoppingState: { playerId: string; currentStep: number; targetStep: number } | null;
  logs: GameLogEntry[];
  selectedProperty: BoardTileStep | null;
  activeChanceCard: ChanceCard | null;
  propertyHouses: Record<number, number>;
  mortgagedProperties: number[];
  winner: string | null;
  auctionState: AuctionState | null;
  monopolyAchieved: { color: string; colorName: string; tiles: number[]; playerId: string } | null;
  bankLoanTaken: Record<string, boolean>;
  bankLoanBalance: Record<string, number>;
  hoveredOwnerId: string | null;
  activeAnnouncement: GameAnnouncement | null;
}

type Listener<T> = (val: T) => void;

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface MultiplayerAdapter {
  isMultiplayerActive(): boolean;
  roll(): void;
  buyProperty(): void;
  passProperty(): void;
  endTurn(): void;
  payJailFine(): void;
  useJailCard(): void;
}

export class GameEngine {
  private static instance: GameEngine;

  private state: GameEngineState;
  private listeners: Set<Listener<GameEngineState>> = new Set();
  private turnTimer: any = null;
  private mpAdapter: MultiplayerAdapter | null = null;
  private lastServerStatus: string = '';
  private currentBoardSeed: number = 0;
  private aiDifficulty: AIDifficulty = 'MEDIUM';

  public getBoardSeed(): number {
    return this.currentBoardSeed;
  }

  public setAIDifficulty(diff: AIDifficulty): void {
    this.aiDifficulty = diff;
  }

  public getAIDifficulty(): AIDifficulty {
    return this.aiDifficulty;
  }

  public setMultiplayerAdapter(adapter: MultiplayerAdapter | null): void {
    this.mpAdapter = adapter;
  }

  public getMultiplayerAdapter(): MultiplayerAdapter | null {
    return this.mpAdapter;
  }

  public syncWithColyseus(serverState: any, mySessionId?: string | null): void {
    if (!serverState) return;

    // 0. Board layout synchronization
    if (serverState.boardSeed && serverState.boardSeed !== this.currentBoardSeed) {
      this.currentBoardSeed = serverState.boardSeed;
      shuffleMatchTiles(serverState.boardSeed);
    }

    // 1. Map players
    const playerList: (PlayerData & { isHuman: boolean; netWorth: number })[] = [];
    serverState.players.forEach((p: any) => {
      const ownedSteps: number[] = [];
      if (serverState.properties) {
        serverState.properties.forEach((prop: any) => {
          if (prop.ownerId === p.id) ownedSteps.push(prop.step);
        });
      }

      const isHuman = mySessionId ? (p.id === mySessionId && !p.isBot) : !p.isBot;
      playerList.push({
        id: p.id,
        name: p.name,
        avatar: p.avatar || 'crown',
        tokenColor: p.tokenColor || '#e11d48',
        tokenColorHex: parseInt((p.tokenColor || '#e11d48').replace('#', '0x'), 16) || 0xe11d48,
        colorName: p.colorName || 'Ruby Crimson',
        balance: p.balance ?? 5000,
        currentTileIndex: p.position ?? 0,
        ownedPropertyIds: ownedSteps,
        isBankrupt: p.isBankrupt ?? false,
        isHuman,
        netWorth: p.netWorth ?? (p.balance ?? 5000),
        isInJail: p.isInJail ?? false,
        jailTurns: p.jailTurns ?? 0,
        getOutOfJailCards: p.getOutOfJailCards ?? 0
      });
    });

    if (playerList.length > 0) {
      this.state.players = playerList;
    }

    // 2. Active player index
    const activeIdx = playerList.findIndex((p) => p.id === serverState.currentPlayerId);
    if (activeIdx !== -1) {
      this.state.activePlayerIndex = activeIdx;
    }

    // 3. Phase mapping
    if (serverState.turnPhase === 'rolling') {
      this.state.phase = 'ROLLING';
      this.state.diceState = { rolling: true, value: null };
    } else if (serverState.turnPhase === 'moving') {
      this.state.phase = 'MOVING';
      this.state.diceState = { rolling: false, value: serverState.lastRoll || 1 };
    } else if (serverState.turnPhase === 'action') {
      this.state.phase = 'TILE_ACTION';
      this.state.selectedProperty = BOARD_TILES.find((t) => t.step === serverState.selectedTileStep) || null;
    } else if (serverState.turnPhase === 'ending') {
      this.state.phase = 'RESOLVING';
    } else if (serverState.turnPhase === 'waiting') {
      this.state.phase = 'PLAYER_TURN';
      this.state.diceState = { rolling: false, value: null };
      this.state.selectedProperty = null;
    }

    // 4. Log sync
    if (serverState.statusMessage && serverState.statusMessage !== this.lastServerStatus) {
      this.lastServerStatus = serverState.statusMessage;
      this.addLog(serverState.statusMessage, 'info');
    }

    // 5. Winner sync
    if (serverState.phase === 'finished' && serverState.winner) {
      this.state.winner = serverState.winner;
    }

    this.emit();
  }

  public syncWithFirebase(gameState: any, myUid: string): void {
    if (!gameState) return;

    // 0. Board layout synchronization
    if (gameState.boardSeed && gameState.boardSeed !== this.currentBoardSeed) {
      this.currentBoardSeed = gameState.boardSeed;
      shuffleMatchTiles(gameState.boardSeed);
    }

    // 1. Players mapping
    const localName = localStorage.getItem('navo_player_name') || '';
    const currentUid = localStorage.getItem('navo_user_uid') || localStorage.getItem('navo_guest_id') || '';

    if (gameState.players) {
      const pList = Array.isArray(gameState.players)
        ? gameState.players
        : Object.values(gameState.players || {});
      if (pList.length > 0) {
        this.state.players = pList.map((p: any) => {
          let isMe = false;
          if (myUid && p.id) {
            isMe = p.id === myUid;
          } else if (currentUid && p.id) {
            isMe = p.id === currentUid;
          } else if (localName && p.name) {
            isMe = p.name.trim().toLowerCase() === localName.trim().toLowerCase();
          }
          return {
            ...p,
            ownedPropertyIds: Array.isArray(p.ownedPropertyIds) ? p.ownedPropertyIds : [],
            isHuman: Boolean(isMe)
          };
        });
      }
    }

    // 2. Active player index
    if (typeof gameState.activePlayerIndex === 'number') {
      this.state.activePlayerIndex = gameState.activePlayerIndex;
    }

    // 3. Phase mapping
    if (gameState.phase) {
      this.state.phase = gameState.phase;
    }

    // Audio sync when observing opponent's turn in multiplayer
    const pListForAudio = Array.isArray(gameState.players)
      ? gameState.players
      : Object.values(gameState.players || {});
    const activeP = pListForAudio[gameState.activePlayerIndex];
    const isOpponent =
      activeP &&
      activeP.id !== myUid &&
      activeP.id !== currentUid &&
      (!localName || activeP.name?.trim().toLowerCase() !== localName.trim().toLowerCase());

    if (isOpponent) {
      const prevDiceRolling = this.state.diceState?.rolling;
      const prevHopping = Boolean(this.state.hoppingState);
      const prevStep = this.state.hoppingState?.currentStep;

      // Opponent started rolling
      if (!prevDiceRolling && gameState.diceState?.rolling) {
        SoundEffects.getInstance().playDiceRoll();
      }
      // Opponent dice landed
      if (prevDiceRolling && !gameState.diceState?.rolling && gameState.diceState?.value) {
        SoundEffects.getInstance().playDiceLand();
      }
      // Opponent car began moving
      if (!prevHopping && gameState.hoppingState) {
        SoundEffects.getInstance().startCarMoving();
      }
      // Opponent car took a step
      if (gameState.hoppingState && (!prevHopping || gameState.hoppingState.currentStep !== prevStep)) {
        SoundEffects.getInstance().playCarDriveStep();
      }
      // Opponent car arrived at destination & braked
      if (prevHopping && !gameState.hoppingState) {
        SoundEffects.getInstance().stopCarMoving();
        SoundEffects.getInstance().playCarBrake();
      }
    }

    // 4. Dice & Hopping State
    if (gameState.diceState) {
      this.state.diceState = {
        rolling: Boolean(gameState.diceState.rolling),
        value: typeof gameState.diceState.value === 'number' ? gameState.diceState.value : null
      };
    }
    if (gameState.hoppingState) {
      this.state.hoppingState = {
        playerId: gameState.hoppingState.playerId,
        currentStep: gameState.hoppingState.currentStep ?? gameState.hoppingState.toIndex ?? 0,
        targetStep: gameState.hoppingState.targetStep ?? gameState.hoppingState.toIndex ?? 0
      };
    } else {
      this.state.hoppingState = null;
    }

    // 5. Selected property
    this.state.selectedProperty = gameState.selectedProperty || null;

    // 6. Logs sync
    if (gameState.logs && Array.isArray(gameState.logs)) {
      this.state.logs = gameState.logs;
    }

    // 7. Winner sync
    if (gameState.winner) {
      this.state.winner = gameState.winner;
    }

    this.emit();
  }

  public resetGame(localPlayerName: string = 'Satvik'): void {
    if (this.announcementTimer) {
      clearTimeout(this.announcementTimer);
      this.announcementTimer = null;
    }

    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    this.currentBoardSeed = newSeed;
    shuffleMatchTiles(newSeed);

    const makePlayer = (
      id: string, name: string, avatar: string,
      tokenColor: string, tokenColorHex: number, colorName: string,
      isHuman: boolean
    ) => ({
      id, name, avatar, tokenColor, tokenColorHex, colorName,
      balance: STARTING_BALANCE,
      currentTileIndex: 0,
      ownedPropertyIds: [],
      isBankrupt: false,
      isHuman,
      netWorth: STARTING_BALANCE,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
    });

    this.state = {
      players: [
        makePlayer('p1', localPlayerName, 'crown',   '#e11d48', 0xe11d48, 'Ruby Crimson',   true),
        makePlayer('p2', 'Computer 1 (AI)',  'bot', '#059669', 0x059669, 'Emerald Green', false),
        makePlayer('p3', 'Computer 2 (AI)',  'bot', '#0284c7', 0x0284c7, 'Sapphire Blue', false),
        makePlayer('p4', 'Computer 3 (AI)',  'bot', '#d97706', 0xd97706, 'Amber Gold',    false),
      ],
      activePlayerIndex: 0,
      phase: 'PLAYER_TURN',
      diceState: { rolling: false, value: null },
      hoppingState: null,
      logs: [{
        id: 'log_init',
        text: `Gujarat Business Board ready. ₹${STARTING_BALANCE.toLocaleString()} capital given to each merchant.`,
        type: 'info',
        timestamp: Date.now()
      }],
      selectedProperty: null,
      activeChanceCard: null,
      propertyHouses: {},
      mortgagedProperties: [],
      winner: null,
      auctionState: null,
      monopolyAchieved: null,
      bankLoanTaken: {},
      bankLoanBalance: {},
      hoveredOwnerId: null,
      activeAnnouncement: null,
    };
    this.emit();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  private constructor() {
    const initialSeed = Math.floor(Math.random() * 900000) + 100000;
    this.currentBoardSeed = initialSeed;
    shuffleMatchTiles(initialSeed);

    const makePlayer = (
      id: string, name: string, avatar: string,
      tokenColor: string, tokenColorHex: number, colorName: string,
      isHuman: boolean
    ) => ({
      id, name, avatar, tokenColor, tokenColorHex, colorName,
      balance: STARTING_BALANCE,
      currentTileIndex: 0,
      ownedPropertyIds: [],
      isBankrupt: false,
      isHuman,
      netWorth: STARTING_BALANCE,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
    });

    this.state = {
      players: [
        makePlayer('p1', 'Player 1', 'crown',   '#e11d48', 0xe11d48, 'Ruby Crimson',   true),
        makePlayer('p2', 'Computer 1 (AI)',  'bot', '#059669', 0x059669, 'Emerald Green', false),
        makePlayer('p3', 'Computer 2 (AI)',  'bot', '#0284c7', 0x0284c7, 'Sapphire Blue', false),
        makePlayer('p4', 'Computer 3 (AI)',  'bot', '#d97706', 0xd97706, 'Amber Gold',    false),
      ],
      activePlayerIndex: 0,
      phase: 'PLAYER_TURN',
      diceState: { rolling: false, value: null },
      hoppingState: null,
      logs: [{
        id: 'log_init',
        text: `Gujarat Business Board ready. ₹${STARTING_BALANCE.toLocaleString()} capital given to each merchant.`,
        type: 'info',
        timestamp: Date.now()
      }],
      selectedProperty: null,
      activeChanceCard: null,
      propertyHouses: {},
      mortgagedProperties: [],
      winner: null,
      auctionState: null,
      monopolyAchieved: null,
      bankLoanTaken: {},
      bankLoanBalance: {},
      hoveredOwnerId: null,
      activeAnnouncement: null,
    };
  }

  private announcementTimer: any = null;

  public triggerAnnouncement(announcement: Omit<GameAnnouncement, 'id' | 'timestamp'>, durationMs = 2400): void {
    if (this.announcementTimer) {
      clearTimeout(this.announcementTimer);
      this.announcementTimer = null;
    }
    const full: GameAnnouncement = {
      ...announcement,
      durationMs,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now()
    };
    this.state.activeAnnouncement = full;
    this.emit();

    this.announcementTimer = setTimeout(() => {
      if (this.state.activeAnnouncement?.id === full.id) {
        this.state.activeAnnouncement = null;
        this.emit();
      }
    }, durationMs);
  }

  public clearAnnouncement(): void {
    if (this.announcementTimer) {
      clearTimeout(this.announcementTimer);
      this.announcementTimer = null;
    }
    if (this.state.activeAnnouncement) {
      this.state.activeAnnouncement = null;
      this.emit();
    }
  }

  public setHoveredOwner(playerId: string | null): void {
    if (this.state.hoveredOwnerId === playerId) return;
    this.state.hoveredOwnerId = playerId;
    this.emit();
  }

  public getState(): GameEngineState { return this.state; }

  public subscribe(listener: Listener<GameEngineState>): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.state.players = this.state.players.map((p) => {
      const propertyValue = (p.ownedPropertyIds || []).reduce((sum, step) => {
        const tile = BOARD_TILES.find((t) => t.step === step);
        const houseCount = this.state.propertyHouses[step] || 0;
        const houseCost  = tile?.price ? Math.round(tile.price * 0.5) : 0;
        const isMortgaged = this.state.mortgagedProperties.includes(step);
        const baseVal = isMortgaged
          ? (tile?.price ? Math.round(tile.price * 0.5) : 0)
          : (tile?.price || 0);
        return sum + baseVal + houseCount * houseCost;
      }, 0);
      return { ...p, netWorth: p.balance + propertyValue };
    });
    for (const l of this.listeners) l({ ...this.state });
  }

  private addLog(text: string, type: GameLogEntry['type']): void {
    const entry: GameLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text, type, timestamp: Date.now()
    };
    this.state.logs = [entry, ...this.state.logs.slice(0, 49)];
  }

  public getActivePlayer() {
    return this.state.players[this.state.activePlayerIndex];
  }

  // ── JAIL ────────────────────────────────────────────────────────────────────

  public sendToJail(playerId: string): void {
    this.state.players = this.state.players.map((p) =>
      p.id === playerId
        ? { ...p, isInJail: true, jailTurns: 0, currentTileIndex: JAIL_TILE_STEP }
        : p
    );
    const player = this.state.players.find((p) => p.id === playerId);
    SoundEffects.getInstance().playTaxDeduct();
    this.addLog(`${player?.name} sent to Jail! Do not pass START.`, 'jail');
    this.state.phase = 'RESOLVING';
    this.emit();
  }

  /** Pay ₹500 to leave jail immediately — player then rolls this turn */
  public payJailFine(): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.payJailFine();
      return;
    }
    const active = this.getActivePlayer();
    if (!active?.isInJail) return;
    if (active.balance < JAIL_FINE) {
      this.addLog(`${active.name} cannot afford the ₹${JAIL_FINE} jail fine.`, 'info');
      return;
    }
    this.updatePlayerBalance(active.id, -JAIL_FINE);
    SoundEffects.getInstance().playTaxDeduct();
    this.state.players = this.state.players.map((p) =>
      p.id === active.id ? { ...p, isInJail: false, jailTurns: 0 } : p
    );
    this.addLog(`${active.name} paid ₹${JAIL_FINE} fine and is free. Now roll!`, 'jail');
    this.triggerAnnouncement({
      type: 'jail',
      title: 'JAIL BAIL PAID',
      message: `${active.name} paid ₹${JAIL_FINE} bail and was released!`,
      amount: JAIL_FINE,
      amountType: 'minus',
      playerName: active.name,
      playerColor: active.tokenColor
    });
    this.state.phase = 'PLAYER_TURN';
    this.emit();
  }

  /** Use a Get Out of Jail Free card */
  public useGetOutOfJailCard(): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.useJailCard();
      return;
    }
    const active = this.getActivePlayer();
    if (!active?.isInJail || active.getOutOfJailCards < 1) return;
    this.state.players = this.state.players.map((p) =>
      p.id === active.id
        ? { ...p, isInJail: false, jailTurns: 0, getOutOfJailCards: p.getOutOfJailCards - 1 }
        : p
    );
    this.addLog(`${active.name} used a Get Out of Jail Free card!`, 'jail');
    this.triggerAnnouncement({
      type: 'jail',
      title: 'OUT OF JAIL CARD',
      message: `${active.name} used a Get Out of Jail Card!`,
      playerName: active.name,
      playerColor: active.tokenColor
    });
    this.state.phase = 'PLAYER_TURN';
    this.emit();
  }

  // ── SINGLE DIE ROLL ─────────────────────────────────────────────────────────

  public requestRoll(forcedValue?: number): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.roll();
      return;
    }
    this.clearAnnouncement();
    const validPhases: TurnPhase[] = ['PLAYER_TURN', 'WAITING'];
    if (!validPhases.includes(this.state.phase)) return;
    if (this.state.diceState.rolling) return;

    const active = this.getActivePlayer();
    if (!active || active.isBankrupt) return;

    // If player is in jail — they miss the turn (skipped), jailTurns increments
    if (active.isInJail) {
      const newJailTurns = active.jailTurns + 1;
      if (newJailTurns >= MAX_JAIL_TURNS) {
        // Force-pay fine on 3rd turn and release
        if (active.balance >= JAIL_FINE) {
          this.updatePlayerBalance(active.id, -JAIL_FINE);
          this.addLog(`${active.name} forced to pay ₹${JAIL_FINE} fine after ${MAX_JAIL_TURNS} turns in jail.`, 'jail');
        }
        this.state.players = this.state.players.map((p) =>
          p.id === active.id ? { ...p, isInJail: false, jailTurns: 0 } : p
        );
        SoundEffects.getInstance().playTaxDeduct();
        // Now roll normally
      } else {
        this.state.players = this.state.players.map((p) =>
          p.id === active.id ? { ...p, jailTurns: newJailTurns } : p
        );
        this.addLog(`${active.name} is in Jail — turn skipped (${newJailTurns}/${MAX_JAIL_TURNS}). Pay ₹${JAIL_FINE} or use a card to escape.`, 'jail');
        this.state.phase = 'RESOLVING';
        this.emit();
        this.checkBotEndTurn(active);
        return;
      }
    }

    const diceValue = forcedValue ?? (Math.floor(Math.random() * 6) + 1);

    this.state.phase = 'ROLLING';
    this.state.diceState = { rolling: true, value: null };
    SoundEffects.getInstance().playDiceRoll();
    this.emit();

    setTimeout(() => {
      this.state.diceState = { rolling: false, value: diceValue };
      SoundEffects.getInstance().playDiceLand();
      this.addLog(`${active.name} rolled a ${diceValue}.`, 'roll');
      this.emit();

      setTimeout(() => {
        this.startHopSequence(active.id, active.currentTileIndex, diceValue);
      }, 400);
    }, 1400);
  }

  // ── HOPPING ─────────────────────────────────────────────────────────────────

  private startHopSequence(playerId: string, startStep: number, totalSteps: number): void {
    let currentStep = startStep;
    let stepsLeft = totalSteps;
    let passedGo = false;

    // Start minimal continuous car moving purr
    SoundEffects.getInstance().startCarMoving();

    const hopInterval = setInterval(() => {
      currentStep = (currentStep + 1) % BOARD_SIZE;
      stepsLeft--;
      const stepIndex = totalSteps - stepsLeft;
      SoundEffects.getInstance().playCarDriveStep(stepIndex, totalSteps);

      // Passed GO (tile 0)
      if (currentStep === 0) {
        passedGo = true;
        const isExactLanding = stepsLeft === 0;
        const salary = isExactLanding ? GO_SALARY + GO_EXACT_BONUS : GO_SALARY;
        this.updatePlayerBalance(playerId, salary);
        const player = this.state.players.find((p) => p.id === playerId);
        const isHuman = player?.isHuman ?? false;
        if (isHuman) {
          SoundEffects.getInstance().playMoneyChime();
        }
        if (isExactLanding) {
          this.addLog(
            isHuman
              ? `🎯 You landed exactly on START — double commercial dividend: +₹${salary.toLocaleString()}!`
              : `${player?.name} landed exactly on START — double salary: +₹${salary.toLocaleString()}!`,
            'info'
          );
          this.triggerAnnouncement({
            type: 'salary',
            title: '🎯 EXACT START BONUS!',
            message: isHuman
              ? 'You landed directly on START! Double salary credited!'
              : `${player?.name} landed on START! Double salary credited!`,
            amount: salary,
            amountType: 'plus',
            playerName: player?.name,
            playerColor: player?.tokenColor
          }, 2200);
        } else {
          this.addLog(
            isHuman
              ? `💰 You passed START — collected commercial dividend: +₹${salary.toLocaleString()}`
              : `${player?.name} passed START — salary: +₹${salary.toLocaleString()}`,
            'info'
          );
          this.triggerAnnouncement({
            type: 'salary',
            title: isHuman ? '💰 START DIVIDEND COLLECTED!' : '💰 START SALARY',
            message: isHuman
              ? 'You passed START and collected your commercial dividend!'
              : `${player?.name} passed START and collected commercial dividend!`,
            amount: salary,
            amountType: 'plus',
            playerName: player?.name,
            playerColor: player?.tokenColor
          }, 2000);
        }
      }

      this.state.players = this.state.players.map((p) =>
        p.id === playerId ? { ...p, currentTileIndex: currentStep } : p
      );
      this.state.hoppingState = {
        playerId, currentStep,
        targetStep: (startStep + totalSteps) % BOARD_SIZE
      };
      this.emit();

      if (stepsLeft <= 0) {
        clearInterval(hopInterval);
        SoundEffects.getInstance().stopCarMoving();
        SoundEffects.getInstance().playCarBrake();
        this.state.hoppingState = null;
        this.emit();
        setTimeout(() => {
          this.evaluateLandedTile(playerId, currentStep);
        }, 500);
      }
    }, 500);
  }

  // ── EVALUATE TILE ────────────────────────────────────────────────────────────

  private evaluateLandedTile(playerId: string, step: number): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile) return;

    // GO TO JAIL
    if (tile.type === 'GO_TO_JAIL') {
      this.triggerAnnouncement({
        type: 'jail',
        title: 'POLICE DETAINMENT',
        message: `${player.name} was sent directly to Central Jail!`,
        playerName: player.name,
        playerColor: player.tokenColor
      });
      this.sendToJail(playerId);
      setTimeout(() => this.checkBotEndTurn(player), 1000);
      return;
    }

    // JAIL CORNER (Just Visiting)
    if (tile.type === 'JAIL') {
      if (!player.isInJail) {
        this.addLog(`${player.name} is Just Visiting the Jail — no penalty.`, 'info');
        this.triggerAnnouncement({
          type: 'info',
          title: 'JUST VISITING',
          message: `${player.name} is Just Visiting the Jail (safe).`,
          playerName: player.name,
          playerColor: player.tokenColor
        }, 1600);
      }
      this.state.phase = 'RESOLVING';
      this.emit();
      this.checkBotEndTurn(player);
      return;
    }

    // FREE PARKING
    if (tile.type === 'FREE_PARKING') {
      this.addLog(`${player.name} rests at Free Parking — nothing happens.`, 'info');
      this.triggerAnnouncement({
        type: 'info',
        title: 'FREE PARKING',
        message: `${player.name} rests at Free Parking (safe haven).`,
        playerName: player.name,
        playerColor: player.tokenColor
      }, 1600);
      this.state.phase = 'RESOLVING';
      this.emit();
      this.checkBotEndTurn(player);
      return;
    }

    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    this.addLog(`${player.name} landed on ${tile.name}.`, 'info');

    // PROPERTY / PORT
    if ((tile.type === 'PROPERTY' || tile.type === 'PORT') && tile.price) {
      if (!owner) {
        if (player.isHuman) {
          // Offer purchase to human player
          this.state.phase = 'TILE_ACTION';
          this.state.selectedProperty = tile;
          this.emit();
          return;
        } else {
          // Opponent (AI) turn: evaluate decision based on AI Mind difficulty
          this.state.phase = 'TILE_ACTION';
          this.state.selectedProperty = null;
          this.emit();

          const delay = this.aiDifficulty === 'HARD' ? 800 : this.aiDifficulty === 'MEDIUM' ? 1200 : 1600;

          setTimeout(() => {
            let shouldBuy = false;
            const price = tile.price!;

            if (this.aiDifficulty === 'EASY') {
              // Casual Trader: large buffer (₹1,200), passive 45% purchase rate
              const canAfford = player.balance >= price + 1200;
              shouldBuy = canAfford && Math.random() < 0.45;
            } else if (this.aiDifficulty === 'MEDIUM') {
              // Smart Merchant: balanced buffer (₹600), 85% purchase rate
              const canAfford = player.balance >= price + 600;
              shouldBuy = canAfford && Math.random() < 0.85;
            } else {
              // Gujarat Tycoon (HARD): aggressive, evaluates color monopoly & blocking
              const humanPlayer = this.state.players.find((p) => p.isHuman);
              const colorGroupTiles = BOARD_TILES.filter((t) => t.color && t.color === tile.color);
              const humanOwnsInColor = colorGroupTiles.some((t) => humanPlayer?.ownedPropertyIds?.includes(t.step));
              const botOwnsInColor = colorGroupTiles.some((t) => player.ownedPropertyIds?.includes(t.step));

              // If completing bot monopoly or blocking human from getting monopoly:
              if (humanOwnsInColor || botOwnsInColor) {
                shouldBuy = player.balance >= price + 50;
              } else {
                shouldBuy = player.balance >= price + 180 && Math.random() < 0.95;
              }
            }

            if (shouldBuy) {
              this.buyProperty(tile.step, true);
            } else {
              this.passProperty(true);
            }
          }, delay);
          return;
        }
      } else if (owner.id === player.id) {
        this.addLog(
          player.isHuman
            ? `🏰 You visited your own ${tile.name}. Relax and rest!`
            : `${player.name} visited their own ${tile.name}.`,
          'info'
        );
        if (player.isHuman) {
          SoundEffects.getInstance().playMoneyChime();
          this.triggerAnnouncement({
            type: 'info',
            title: 'HOME ESTATE VISIT',
            message: `You landed safely on your own ${tile.name}. No fees!`,
            playerName: player.name,
            playerColor: player.tokenColor
          });
        }
        this.state.phase = 'RESOLVING';
        this.emit();
        this.checkBotEndTurn(player);
        return;
      } else {
        // Pay rent
        const rentDetails = this.calculateRent(tile.step);
        if (rentDetails.amount > 0) {
          const actualPay = Math.min(rentDetails.amount, player.balance);
          this.updatePlayerBalance(player.id, -actualPay);
          this.updatePlayerBalance(owner.id, actualPay);

          const isOwnerHuman = owner.isHuman;
          const isPlayerHuman = player.isHuman;

          // Sound effect: Positive money chime if human owner receives profit!
          if (isOwnerHuman) {
            SoundEffects.getInstance().playMoneyChime();
          } else if (isPlayerHuman) {
            SoundEffects.getInstance().playTaxDeduct();
          }

          this.addLog(
            isOwnerHuman
              ? `🎉 ${player.name} entered your ${tile.name} and paid you ₹${actualPay.toLocaleString()} rent (${rentDetails.tier})!`
              : isPlayerHuman
              ? `💸 You entered ${owner.name}'s ${tile.name} and paid ₹${actualPay.toLocaleString()} rent (${rentDetails.tier}).`
              : `${player.name} paid ₹${actualPay.toLocaleString()} rent (${rentDetails.tier}) to ${owner.name} for ${tile.name}.`,
            'rent'
          );

          if (isOwnerHuman) {
            // High-visibility celebratory positive announcement when someone lands on your property!
            this.triggerAnnouncement({
              type: 'rent',
              title: '🎉 RENT COLLECTED!',
              message: `${player.name} entered your property (${tile.name}) and paid you rent!`,
              amount: actualPay,
              amountType: 'plus',
              playerName: player.name,
              playerColor: player.tokenColor,
              targetPlayerName: owner.name,
              targetPlayerColor: owner.tokenColor,
              tileStep: tile.step,
              tileName: tile.name,
              tileColor: tile.color || undefined
            }, 2500);
          } else if (isPlayerHuman) {
            this.triggerAnnouncement({
              type: 'rent',
              title: 'RENT PAID',
              message: `You entered ${owner.name}'s property (${tile.name}) and paid ₹${actualPay.toLocaleString()} rent.`,
              amount: actualPay,
              amountType: 'minus',
              playerName: player.name,
              playerColor: player.tokenColor,
              targetPlayerName: owner.name,
              targetPlayerColor: owner.tokenColor,
              tileStep: tile.step,
              tileName: tile.name,
              tileColor: tile.color || undefined
            }, 2500);
          } else {
            // Bot pays Bot: clear announcement so human player understands why balances changed!
            this.triggerAnnouncement({
              type: 'rent',
              title: 'RENT TRANSACTION',
              message: `${player.name} paid ₹${actualPay.toLocaleString()} rent to ${owner.name} for ${tile.name}.`,
              amount: actualPay,
              amountType: 'minus',
              playerName: player.name,
              playerColor: player.tokenColor,
              targetPlayerName: owner.name,
              targetPlayerColor: owner.tokenColor,
              tileStep: tile.step,
              tileName: tile.name,
              tileColor: tile.color || undefined
            }, 2000);
          }

          this.checkBankruptcy(player.id, owner.id);
        } else {
          this.addLog(`${tile.name} is mortgaged — no rent for ${owner.name}.`, 'info');
          this.triggerAnnouncement({
            type: 'info',
            title: 'MORTGAGED PROPERTY',
            message: `${tile.name} is mortgaged — no rent owed!`,
            playerName: player.name,
            playerColor: player.tokenColor
          }, 1800);
        }
        this.state.phase = 'RESOLVING';
        this.emit();
        this.checkBotEndTurn(player);
        return;
      }
    }

    // TAX
    if (tile.type === 'TAX') {
      const taxAmount = tile.step === 5 ? 500 : 800;
      const actualPay = Math.min(taxAmount, player.balance);
      this.updatePlayerBalance(player.id, -actualPay);
      SoundEffects.getInstance().playTaxDeduct();
      this.addLog(`${player.name} paid ₹${actualPay.toLocaleString()} Gujarat Commercial Tax.`, 'tax');
      this.triggerAnnouncement({
        type: 'tax',
        title: 'COMMERCIAL TAX PAID',
        message: `${player.name} paid ₹${actualPay.toLocaleString()} State Duty & Tax.`,
        amount: actualPay,
        amountType: 'minus',
        playerName: player.name,
        playerColor: player.tokenColor
      });
      this.checkBankruptcy(player.id, null);
      this.state.phase = 'RESOLVING';
      this.emit();
      this.checkBotEndTurn(player);
      return;
    }

    // CHANCE
    if (tile.type === 'CHANCE') {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      // Only set activeChanceCard modal for human player — keep opponent cards in center announcement!
      if (player.isHuman) {
        this.state.activeChanceCard = card;
      } else {
        this.state.activeChanceCard = null;
      }

      if (card.isGoToJail) {
        this.addLog(`CHANCE: ${card.title} — ${player.name} goes to Jail!`, 'chance');
        this.triggerAnnouncement({
          type: 'jail',
          title: 'CHANCE: GO TO JAIL',
          message: `${player.name} drew "${card.title}" and goes directly to Jail!`,
          playerName: player.name,
          playerColor: player.tokenColor
        }, 2600);
        this.state.activeChanceCard = null;
        setTimeout(() => {
          this.sendToJail(player.id);
          setTimeout(() => this.checkBotEndTurn(player), 1000);
        }, 1500);
        this.emit();
        return;
      }

      if (card.isGetOutOfJailFree) {
        this.state.players = this.state.players.map((p) =>
          p.id === player.id ? { ...p, getOutOfJailCards: p.getOutOfJailCards + 1 } : p
        );
        this.addLog(`CHANCE: ${card.title} — ${player.name} received a Get Out of Jail Free card!`, 'chance');
        SoundEffects.getInstance().playMoneyChime();
        this.triggerAnnouncement({
          type: 'chance',
          title: 'OUT OF JAIL CARD',
          message: `${player.name} received a Get Out of Jail Free card!`,
          playerName: player.name,
          playerColor: player.tokenColor
        }, 2200);
      } else if (card.payEachPlayer !== undefined) {
        // Collect from / pay to each other player
        const amount = card.payEachPlayer;
        const others = this.state.players.filter((p) => !p.isBankrupt && p.id !== player.id);
        if (amount > 0) {
          // Collect from each
          let totalCollected = 0;
          others.forEach((other) => {
            const paid = Math.min(amount, other.balance);
            this.updatePlayerBalance(other.id, -paid);
            this.updatePlayerBalance(player.id, paid);
            totalCollected += paid;
          });
          SoundEffects.getInstance().playMoneyChime();
          this.addLog(`CHANCE: ${card.title} — ${player.name} collected ₹${amount} from each player (total ₹${totalCollected.toLocaleString()}).`, 'chance');
          this.triggerAnnouncement({
            type: 'chance',
            title: 'COMMERCIAL DIVIDEND',
            message: `${player.name} collected ₹${amount} from each merchant!`,
            amount: totalCollected,
            amountType: 'plus',
            playerName: player.name,
            playerColor: player.tokenColor
          }, 2500);
        } else {
          // Pay each player
          const absPay = Math.abs(amount);
          others.forEach((other) => {
            const paid = Math.min(absPay, player.balance);
            this.updatePlayerBalance(player.id, -paid);
            this.updatePlayerBalance(other.id, paid);
          });
          SoundEffects.getInstance().playTaxDeduct();
          this.addLog(`CHANCE: ${card.title} — ${player.name} paid ₹${absPay} to each player.`, 'chance');
          this.triggerAnnouncement({
            type: 'chance',
            title: 'ASSESSMENT LEVY',
            message: `${player.name} paid ₹${absPay} to each merchant.`,
            amount: absPay,
            amountType: 'minus',
            playerName: player.name,
            playerColor: player.tokenColor
          }, 2500);
          this.checkBankruptcy(player.id, null);
        }
      } else if (card.amount) {
        const amt = card.amount > 0
          ? card.amount
          : -Math.min(Math.abs(card.amount), player.balance);
        this.updatePlayerBalance(player.id, amt);
        if (amt > 0) SoundEffects.getInstance().playMoneyChime();
        else SoundEffects.getInstance().playTaxDeduct();
        this.addLog(`CHANCE: ${card.title} — ${amt > 0 ? '+' : ''}₹${amt.toLocaleString()}`, 'chance');

        this.triggerAnnouncement({
          type: 'chance',
          title: amt > 0 ? '✨ CHANCE REWARD!' : 'CHANCE LEVY PAID',
          message: `${player.name}: ${card.title} — ${card.description}`,
          amount: Math.abs(amt),
          amountType: amt > 0 ? 'plus' : 'minus',
          playerName: player.name,
          playerColor: player.tokenColor
        }, 2600);

        this.checkBankruptcy(player.id, null);
      }

      if (card.moveToTile !== undefined) {
        const dest = card.moveToTile;
        const targetTile = BOARD_TILES.find((t) => t.step === dest);
        this.triggerAnnouncement({
          type: 'chance',
          title: 'EXPRESS VOYAGE',
          message: `${player.name} departs on express charter to ${targetTile?.name || 'destination'}!`,
          playerName: player.name,
          playerColor: player.tokenColor
        }, 2400);
        setTimeout(() => {
          this.state.activeChanceCard = null;
          const steps = (dest - player.currentTileIndex + BOARD_SIZE) % BOARD_SIZE || BOARD_SIZE;
          this.startHopSequence(player.id, player.currentTileIndex, steps);
        }, 2500);
        this.emit();
        return;
      }

      this.state.phase = 'RESOLVING';
      this.emit();
      setTimeout(() => {
        this.state.activeChanceCard = null;
        this.emit();
        this.checkBotEndTurn(player);
      }, 3500);
      return;
    }

    // BANK BONUS — everyone collects ₹250 dividend
    if (tile.type === 'BANK') {
      const bankBonus = 250;
      const activePlayers = this.state.players.filter((p) => !p.isBankrupt);
      activePlayers.forEach((p) => this.updatePlayerBalance(p.id, bankBonus));
      SoundEffects.getInstance().playMoneyChime();
      this.addLog(`Central Bank pays ₹${bankBonus} interest to all merchants! ${player.name} triggered it.`, 'info');
      this.triggerAnnouncement({
        type: 'info',
        title: 'BANK DIVIDEND PAID',
        message: `Central Bank paid ₹${bankBonus} interest to all merchants!`,
        amount: bankBonus,
        amountType: 'plus'
      });
      this.state.phase = 'RESOLVING';
      this.emit();
      this.checkBotEndTurn(player);
      return;
    }

    // Default (START, SPECIAL, etc.)
    this.state.phase = 'RESOLVING';
    this.emit();
    this.checkBotEndTurn(player);
  }

  // ── AUCTION ──────────────────────────────────────────────────────────────────

  private startAuction(tileStep: number): void {
    const tile = BOARD_TILES.find((t) => t.step === tileStep);
    if (!tile || !tile.price) return;

    const biddingOrder = this.state.players
      .filter((p) => !p.isBankrupt)
      .map((p) => p.id);

    this.state.auctionState = {
      tileStep,
      tileName: tile.name,
      tilePrice: tile.price,
      currentBid: 0,
      highestBidderId: null,
      biddingOrder,
      currentBidderIndex: 0,
    };
    this.state.phase = 'TILE_ACTION';
    this.addLog(`Auction started for ${tile.name} (min. ₹1). Bidding begins!`, 'auction');
    this.emit();

    // Bot players bid automatically
    this.processBotBids();
  }

  private processBotBids(): void {
    if (this.mpAdapter?.isMultiplayerActive()) return;
    const auction = this.state.auctionState;
    if (!auction) return;

    const currentBidderId = auction.biddingOrder[auction.currentBidderIndex];
    const currentBidder = this.state.players.find((p) => p.id === currentBidderId);
    if (!currentBidder) { this.nextAuctionBidder(); return; }

    if (currentBidder.isHuman) return; // Wait for human input

    const delay = this.aiDifficulty === 'HARD' ? 700 : this.aiDifficulty === 'MEDIUM' ? 1200 : 1600;

    setTimeout(() => {
      if (!this.state.auctionState) return;
      let multiplier = 0.8;
      if (this.aiDifficulty === 'EASY') multiplier = 0.5;
      else if (this.aiDifficulty === 'HARD') multiplier = 1.3;

      const maxWilling = Math.round(auction.tilePrice * multiplier);
      const minBid = auction.currentBid + 100;
      if (minBid <= maxWilling && minBid <= currentBidder.balance) {
        this.placeBid(currentBidderId, minBid);
      } else {
        this.skipAuctionBid(currentBidderId);
      }
    }, delay);
  }

  public placeBid(bidderId: string, amount: number): void {
    const auction = this.state.auctionState;
    if (!auction) return;
    const bidder = this.state.players.find((p) => p.id === bidderId);
    if (!bidder) return;
    if (amount <= auction.currentBid) {
      this.addLog(`Bid of ₹${amount.toLocaleString()} by ${bidder.name} is too low (current: ₹${auction.currentBid.toLocaleString()}).`, 'auction');
      return;
    }
    if (amount > bidder.balance) {
      this.addLog(`${bidder.name} cannot afford ₹${amount.toLocaleString()}.`, 'auction');
      return;
    }
    this.state.auctionState = { ...auction, currentBid: amount, highestBidderId: bidderId };
    this.addLog(`${bidder.name} bids ₹${amount.toLocaleString()} for ${auction.tileName}.`, 'auction');
    this.emit();
    this.nextAuctionBidder();
  }

  public skipAuctionBid(bidderId: string): void {
    const auction = this.state.auctionState;
    if (!auction) return;
    const bidder = this.state.players.find((p) => p.id === bidderId);
    this.addLog(`${bidder?.name} passes on ${auction.tileName}.`, 'auction');
    this.nextAuctionBidder();
  }

  private nextAuctionBidder(): void {
    const auction = this.state.auctionState;
    if (!auction) return;

    const nextIdx = auction.currentBidderIndex + 1;

    if (nextIdx >= auction.biddingOrder.length) {
      // All players have had a chance — finalize
      this.finalizeAuction();
    } else {
      this.state.auctionState = { ...auction, currentBidderIndex: nextIdx };
      this.emit();
      this.processBotBids();
    }
  }

  private finalizeAuction(): void {
    const auction = this.state.auctionState;
    if (!auction) return;

    if (!auction.highestBidderId || auction.currentBid <= 0) {
      this.addLog(`No bids placed. ${auction.tileName} remains with the bank.`, 'auction');
      this.state.auctionState = null;
      this.state.phase = 'RESOLVING';
      this.emit();
      const active = this.getActivePlayer();
      this.checkBotEndTurn(active);
      return;
    }

    const winner = this.state.players.find((p) => p.id === auction.highestBidderId);
    if (!winner) return;

    this.updatePlayerBalance(winner.id, -auction.currentBid);
    const updatedWinnerProps = [...(winner.ownedPropertyIds || []), auction.tileStep];
    this.state.players = this.state.players.map((p) =>
      p.id === winner.id
        ? { ...p, ownedPropertyIds: updatedWinnerProps }
        : p
    );
    SoundEffects.getInstance().playPurchaseJingle();
    this.triggerAnnouncement({
      type: 'buy',
      title: 'AUCTION WON',
      message: winner.isHuman ? `You won auction for ${auction.tileName}!` : `${winner.name} won auction for ${auction.tileName}!`,
      amount: auction.currentBid,
      amountType: 'minus',
      playerName: winner.name,
      playerColor: winner.tokenColor,
      tileStep: auction.tileStep,
      tileName: auction.tileName
    }, 2400);

    const wonTile = BOARD_TILES.find((t) => t.step === auction.tileStep);
    if (wonTile?.color) {
      const groupTiles = BOARD_TILES.filter((t) => t.color === wonTile.color && (t.type === 'PROPERTY' || t.type === 'PORT'));
      const fullGroupOwned = groupTiles.every((t) => updatedWinnerProps.includes(t.step));
      const prevOwnedCount = groupTiles.filter((t) => winner.ownedPropertyIds?.includes(t.step)).length;
      if (fullGroupOwned && prevOwnedCount === groupTiles.length - 1) {
        this.state.monopolyAchieved = {
          color: wonTile.color,
          colorName: wonTile.color.toUpperCase(),
          tiles: groupTiles.map((t) => t.step),
          playerId: winner.id
        };
        this.addLog(`MONOPOLY UNLOCKED! ${winner.name} now owns all ${wonTile.color.toUpperCase()} properties. Upgrades unlocked!`, 'info');
        this.triggerAnnouncement({
          type: 'info',
          title: '👑 MONOPOLY UNLOCKED!',
          message: `${winner.name} now controls all ${wonTile.color.toUpperCase()} properties!`,
          playerName: winner.name,
          playerColor: winner.tokenColor
        }, 3000);
      }
    }

    this.state.auctionState = null;
    this.state.phase = 'RESOLVING';
    this.emit();
    const active = this.getActivePlayer();
    this.checkBotEndTurn(active);
  }

  // ── BUY & PASS ──────────────────────────────────────────────────────────────

  public buyProperty(step: number, isBot = false): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.buyProperty();
      return;
    }
    const active = this.getActivePlayer();
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!active || !tile || !tile.price) return;
    // Keep hands off opponent's turn
    if (!active.isHuman && !isBot) return;

    if (active.balance < tile.price) {
      this.addLog(`${active.name} can't afford ${tile.name} (₹${tile.price.toLocaleString()}).`, 'info');
      this.state.selectedProperty = null;
      this.state.phase = 'RESOLVING';
      this.emit();
      this.startAuction(step);
      return;
    }

    this.updatePlayerBalance(active.id, -tile.price);
    const updatedOwned = [...(active.ownedPropertyIds || []), step];
    this.state.players = this.state.players.map((p) =>
      p.id === active.id ? { ...p, ownedPropertyIds: updatedOwned } : p
    );
    this.addLog(`${active.name} purchased ${tile.name} for ₹${tile.price.toLocaleString()}.`, 'buy');
    SoundEffects.getInstance().playPurchaseJingle();
    this.triggerAnnouncement({
      type: 'buy',
      title: active.isHuman ? 'DEED PURCHASED' : 'PROPERTY ACQUIRED',
      message: active.isHuman ? `You bought ${tile.name}!` : `${active.name} acquired ${tile.name}!`,
      amount: tile.price,
      amountType: 'minus',
      playerName: active.name,
      playerColor: active.tokenColor,
      tileStep: tile.step,
      tileName: tile.name,
      tileColor: tile.color || undefined
    }, 2400);

    // Check if monopoly set completed
    if (tile.color) {
      const groupTiles = BOARD_TILES.filter((t) => t.color === tile.color && (t.type === 'PROPERTY' || t.type === 'PORT'));
      const fullGroupOwned = groupTiles.every((t) => updatedOwned.includes(t.step));
      const prevOwnedCount = groupTiles.filter((t) => active.ownedPropertyIds?.includes(t.step)).length;
      if (fullGroupOwned && prevOwnedCount === groupTiles.length - 1) {
        this.state.monopolyAchieved = {
          color: tile.color,
          colorName: tile.color.toUpperCase(),
          tiles: groupTiles.map((t) => t.step),
          playerId: active.id
        };
        this.addLog(`MONOPOLY UNLOCKED! ${active.name} now owns all ${tile.color.toUpperCase()} properties. Upgrades unlocked!`, 'info');
        this.triggerAnnouncement({
          type: 'info',
          title: '👑 MONOPOLY UNLOCKED!',
          message: `${active.name} now controls all ${tile.color.toUpperCase()} properties!`,
          playerName: active.name,
          playerColor: active.tokenColor
        }, 3000);
      }
    }

    this.state.selectedProperty = null;
    this.state.phase = 'RESOLVING';
    this.emit();
    this.checkBotEndTurn(active);
  }

  public clearMonopolyNotification(): void {
    this.state.monopolyAchieved = null;
    this.emit();
  }

  // ── BANK LOAN SYSTEM ────────────────────────────────────────────────────────
  public takeBankLoan(playerId: string): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.isBankrupt) return false;
    if (this.state.bankLoanTaken[playerId]) {
      this.addLog(`${player.name} has already taken the one-time bank loan.`, 'info');
      return false;
    }

    const loanPrincipal = 3000;
    const loanRepay = 3300; // 10% interest

    this.state.bankLoanTaken = { ...this.state.bankLoanTaken, [playerId]: true };
    this.state.bankLoanBalance = { ...this.state.bankLoanBalance, [playerId]: loanRepay };
    this.updatePlayerBalance(playerId, loanPrincipal);

    SoundEffects.getInstance().playMoneyChime();
    this.addLog(`${player.name} took a ₹${loanPrincipal.toLocaleString()} Emergency Loan from Central Bank (repay ₹${loanRepay.toLocaleString()}).`, 'info');
    this.triggerAnnouncement({
      type: 'loan',
      title: 'BANK LOAN APPROVED',
      message: `${player.name} borrowed ₹${loanPrincipal.toLocaleString()} from Central Bank!`,
      amount: loanPrincipal,
      amountType: 'plus',
      playerName: player.name,
      playerColor: player.tokenColor
    });
    this.emit();
    return true;
  }

  public repayBankLoan(playerId: string): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;
    const owed = this.state.bankLoanBalance[playerId] || 0;
    if (owed <= 0) {
      this.addLog(`${player.name} has no outstanding bank loan.`, 'info');
      return false;
    }
    if (player.balance < owed) {
      this.addLog(`${player.name} does not have enough balance (₹${owed.toLocaleString()} required) to repay the bank loan.`, 'info');
      return false;
    }

    this.updatePlayerBalance(playerId, -owed);
    this.state.bankLoanBalance = { ...this.state.bankLoanBalance, [playerId]: 0 };

    SoundEffects.getInstance().playTaxDeduct();
    this.addLog(`${player.name} repaid the bank loan of ₹${owed.toLocaleString()} in full! Debt cleared.`, 'info');
    this.triggerAnnouncement({
      type: 'loan',
      title: 'BANK LOAN SETTLED',
      message: `${player.name} repaid ₹${owed.toLocaleString()} loan in full!`,
      amount: owed,
      amountType: 'minus',
      playerName: player.name,
      playerColor: player.tokenColor
    });
    this.emit();
    return true;
  }

  /** Player declines → property remains with bank */
  public passProperty(isBot = false): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.passProperty();
      return;
    }
    const active = this.getActivePlayer();
    if (!active) return;
    // Keep hands off opponent's turn
    if (!active.isHuman && !isBot) return;

    const tile = this.state.selectedProperty || BOARD_TILES.find((t) => t.step === active.currentTileIndex);
    this.addLog(`${active.name} passed on ${tile?.name || 'property'}.`, 'pass');
    this.triggerAnnouncement({
      type: 'info',
      title: 'PROPERTY PASSED',
      message: `${active.name} passed on ${tile?.name || 'property'}.`,
      playerName: active.name,
      playerColor: active.tokenColor
    }, 1800);
    this.state.selectedProperty = null;
    this.state.phase = 'RESOLVING';
    this.emit();
    this.checkBotEndTurn(active);
  }

  public inspectProperty(step: number): void {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (tile) {
      this.state.selectedProperty = tile;
      this.emit();
    }
  }

  public closePropertyModal(): void {
    this.state.selectedProperty = null;
    this.emit();
  }

  // ── RENT CALCULATION ─────────────────────────────────────────────────────────

  public calculateRent(step: number): { amount: number; tier: string; isDoubled: boolean } {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return { amount: 0, tier: 'None', isDoubled: false };
    if (this.state.mortgagedProperties.includes(step)) {
      return { amount: 0, tier: 'Mortgaged (No Rent)', isDoubled: false };
    }

    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const houses  = this.state.propertyHouses[step] || 0;
    const baseRent = Math.round(tile.price * 0.1);

    if (tile.type === 'PORT' && owner) {
      // Port rent: doubles for each additional port owned
      const ownedPorts = BOARD_TILES
        .filter((t) => t.type === 'PORT' && owner.ownedPropertyIds?.includes(t.step))
        .length;
      const portMultipliers: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8 };
      const mult = portMultipliers[Math.min(ownedPorts, 4)] ?? 1;
      const portRent = baseRent * mult;
      return { amount: portRent, tier: `${ownedPorts} Port${ownedPorts > 1 ? 's' : ''} (×${mult})`, isDoubled: ownedPorts > 1 };
    }

    if (houses === 1) return { amount: baseRent * 3,  tier: '1 House',       isDoubled: false };
    if (houses === 2) return { amount: baseRent * 8,  tier: '2 Houses',      isDoubled: false };
    if (houses === 3) return { amount: baseRent * 18, tier: '3 Houses',      isDoubled: false };
    if (houses === 4) return { amount: baseRent * 28, tier: '4 Houses',      isDoubled: false };
    if (houses === 5) return { amount: baseRent * 40, tier: 'Vyapar Hotel',  isDoubled: false };

    // Monopoly unimproved: double rent
    if (owner && tile.color && this.ownsColorGroup(owner.id, tile.color)) {
      return { amount: baseRent * 2, tier: 'Monopoly (×2)', isDoubled: true };
    }
    return { amount: baseRent, tier: 'Site Rent', isDoubled: false };
  }

  public ownsColorGroup(playerId: string, color: string | null): boolean {
    if (!color) return false;
    const tiles = BOARD_TILES.filter((t) => t.color === color && (t.type === 'PROPERTY' || t.type === 'PORT'));
    if (tiles.length === 0) return false;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;
    return tiles.every((t) => player.ownedPropertyIds?.includes(t.step));
  }

  public getHouseCost(step: number): number {
    const tile = BOARD_TILES.find((t) => t.step === step);
    return tile?.price ? Math.round(tile.price * 0.5) : 500;
  }

  // ── BUILD HOUSE ──────────────────────────────────────────────────────────────

  public buildHouse(step: number, actingPlayerId?: string): boolean {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return false;
    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const active = actingPlayerId
      ? this.state.players.find((p) => p.id === actingPlayerId)
      : (owner || this.getActivePlayer());
    if (!active) return false;
    if (!active.ownedPropertyIds?.includes(step)) return false;
    if (this.state.mortgagedProperties.includes(step)) {
      this.addLog(`Cannot build on mortgaged ${tile.name}.`, 'info'); return false;
    }
    if (!tile.color || !this.ownsColorGroup(active.id, tile.color)) {
      this.addLog(`${active.name} must own the full color group first.`, 'info'); return false;
    }

    // Even building rule
    const groupTiles = BOARD_TILES.filter(
      (t) => t.color === tile.color && (t.type === 'PROPERTY' || t.type === 'PORT')
    );
    const thisHouses = this.state.propertyHouses[step] || 0;
    const minInGroup = Math.min(...groupTiles.map((t) => this.state.propertyHouses[t.step] || 0));
    if (thisHouses > minInGroup) {
      this.addLog(`Build evenly — build on properties with fewer houses first.`, 'info'); return false;
    }
    if (thisHouses >= 5) {
      this.addLog(`Max development (Hotel) reached on ${tile.name}!`, 'info'); return false;
    }

    const cost = this.getHouseCost(step);
    if (active.balance < cost) {
      this.addLog(`Not enough funds (need ₹${cost.toLocaleString()}).`, 'info'); return false;
    }

    this.updatePlayerBalance(active.id, -cost);
    SoundEffects.getInstance().playPurchaseJingle();
    const newCount = thisHouses + 1;
    this.state.propertyHouses = { ...this.state.propertyHouses, [step]: newCount };
    const label = newCount === 5 ? 'Vyapar Hotel' : `${newCount} House${newCount > 1 ? 's' : ''}`;
    this.addLog(`${active.name} built ${label} on ${tile.name} for ₹${cost.toLocaleString()}.`, 'buy');
    this.emit();
    return true;
  }

  // ── SELL HOUSE BACK ──────────────────────────────────────────────────────────

  public sellHouse(step: number, actingPlayerId?: string): boolean {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return false;
    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const active = actingPlayerId
      ? this.state.players.find((p) => p.id === actingPlayerId)
      : (owner || this.getActivePlayer());
    if (!active) return false;
    if (!active.ownedPropertyIds?.includes(step)) return false;
    const currentHouses = this.state.propertyHouses[step] || 0;
    if (currentHouses <= 0) {
      this.addLog(`No buildings to sell on ${tile.name}.`, 'info'); return false;
    }

    // Even selling rule: this property can't sell below sibling minimum
    const groupTiles = tile.color
      ? BOARD_TILES.filter((t) => t.color === tile.color && (t.type === 'PROPERTY' || t.type === 'PORT'))
      : [tile];
    const maxInGroup = Math.max(...groupTiles.map((t) => this.state.propertyHouses[t.step] || 0));
    if (currentHouses < maxInGroup) {
      this.addLog(`Sell evenly — sell on properties with more buildings first.`, 'info'); return false;
    }

    const saleValue = Math.round(this.getHouseCost(step) * 0.5);
    this.updatePlayerBalance(active.id, saleValue);
    SoundEffects.getInstance().playMoneyChime();
    this.state.propertyHouses = {
      ...this.state.propertyHouses,
      [step]: currentHouses - 1
    };
    const wasHotel = currentHouses === 5;
    const label = wasHotel ? 'Hotel' : 'House';
    this.addLog(`${active.name} sold a ${label} on ${tile.name} for ₹${saleValue.toLocaleString()}.`, 'info');
    this.emit();
    return true;
  }

  // ── SELL PROPERTY TO BANK ────────────────────────────────────────────────────

  public sellProperty(step: number, actingPlayerId?: string): boolean {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return false;
    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const active = actingPlayerId
      ? this.state.players.find((p) => p.id === actingPlayerId)
      : (owner || this.getActivePlayer());
    if (!active) return false;
    if (!active.ownedPropertyIds?.includes(step)) return false;
    if ((this.state.propertyHouses[step] || 0) > 0) {
      this.addLog(`Sell all buildings on ${tile.name} before selling the property.`, 'info'); return false;
    }
    if (this.state.mortgagedProperties.includes(step)) {
      // Remove from mortgaged list first (bank already owns it effectively)
      this.state.mortgagedProperties = this.state.mortgagedProperties.filter((s) => s !== step);
    }

    const saleValue = Math.round(tile.price * 0.5);
    this.updatePlayerBalance(active.id, saleValue);
    SoundEffects.getInstance().playMoneyChime();
    this.state.players = this.state.players.map((p) =>
      p.id === active.id
        ? { ...p, ownedPropertyIds: (p.ownedPropertyIds || []).filter((s) => s !== step) }
        : p
    );
    this.addLog(`${active.name} sold ${tile.name} back to the bank for ₹${saleValue.toLocaleString()}.`, 'info');
    this.emit();
    return true;
  }

  // ── MORTGAGE ────────────────────────────────────────────────────────────────

  public mortgageProperty(step: number, actingPlayerId?: string): boolean {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return false;
    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const active = actingPlayerId
      ? this.state.players.find((p) => p.id === actingPlayerId)
      : (owner || this.getActivePlayer());
    if (!active) return false;
    if (!active.ownedPropertyIds?.includes(step)) return false;
    if (this.state.mortgagedProperties.includes(step)) return false;
    if ((this.state.propertyHouses[step] || 0) > 0) {
      this.addLog(`Sell buildings on ${tile.name} before mortgaging.`, 'info'); return false;
    }
    const mortgageValue = Math.round(tile.price * 0.5);
    this.updatePlayerBalance(active.id, mortgageValue);
    SoundEffects.getInstance().playMoneyChime();
    this.state.mortgagedProperties = [...this.state.mortgagedProperties, step];
    this.addLog(`${active.name} mortgaged ${tile.name} for ₹${mortgageValue.toLocaleString()}.`, 'info');
    this.emit();
    return true;
  }

  public unmortgageProperty(step: number, actingPlayerId?: string): boolean {
    const tile = BOARD_TILES.find((t) => t.step === step);
    if (!tile || !tile.price) return false;
    const owner = this.state.players.find((p) => p.ownedPropertyIds?.includes(step));
    const active = actingPlayerId
      ? this.state.players.find((p) => p.id === actingPlayerId)
      : (owner || this.getActivePlayer());
    if (!active) return false;
    if (!active.ownedPropertyIds?.includes(step)) return false;
    if (!this.state.mortgagedProperties.includes(step)) return false;

    const cost = Math.round(tile.price * 0.55); // 50% + 10% interest
    if (active.balance < cost) {
      this.addLog(`Cannot redeem ${tile.name} (need ₹${cost.toLocaleString()}).`, 'info'); return false;
    }
    this.updatePlayerBalance(active.id, -cost);
    SoundEffects.getInstance().playPurchaseJingle();
    this.state.mortgagedProperties = this.state.mortgagedProperties.filter((s) => s !== step);
    this.addLog(`${active.name} redeemed ${tile.name} for ₹${cost.toLocaleString()} (+10% interest).`, 'info');
    this.emit();
    return true;
  }

  // ── BANKRUPTCY & WIN ─────────────────────────────────────────────────────────

  private checkBankruptcy(debtorId: string, creditorId: string | null): void {
    const debtor = this.state.players.find((p) => p.id === debtorId);
    if (!debtor || debtor.balance >= 0) return;

    if (creditorId) {
      // Transfer all assets to creditor
      this.state.players = this.state.players.map((p) => {
        if (p.id === creditorId) {
          return { ...p, ownedPropertyIds: [...(p.ownedPropertyIds || []), ...(debtor.ownedPropertyIds || [])] };
        }
        if (p.id === debtorId) {
          return { ...p, ownedPropertyIds: [], balance: 0, isBankrupt: true };
        }
        return p;
      });
      const creditor = this.state.players.find((p) => p.id === creditorId);
      this.addLog(`${debtor.name} is BANKRUPT! All assets go to ${creditor?.name}.`, 'info');
      this.triggerAnnouncement({
        type: 'tax',
        title: '⚠️ BANKRUPT!',
        message: `${debtor.name} went bankrupt! Assets surrendered to ${creditor?.name}.`,
        playerName: debtor.name,
        playerColor: debtor.tokenColor
      }, 3000);
    } else {
      this.state.players = this.state.players.map((p) =>
        p.id === debtorId
          ? { ...p, ownedPropertyIds: [], balance: 0, isBankrupt: true }
          : p
      );
      this.addLog(`${debtor.name} is BANKRUPT! Properties returned to bank.`, 'info');
      this.triggerAnnouncement({
        type: 'tax',
        title: '⚠️ BANKRUPT!',
        message: `${debtor.name} went bankrupt! Assets returned to the Bank.`,
        playerName: debtor.name,
        playerColor: debtor.tokenColor
      }, 3000);
    }

    // Remove their houses/hotels
    const newHouses = { ...this.state.propertyHouses };
    (debtor.ownedPropertyIds || []).forEach((s) => delete newHouses[s]);
    this.state.propertyHouses = newHouses;

    SoundEffects.getInstance().playTaxDeduct();
    this.checkWinCondition();
  }

  private checkWinCondition(): void {
    const active = this.state.players.filter((p) => !p.isBankrupt);
    if (active.length === 1) {
      this.state.winner = active[0].id;
      this.state.phase = 'GAME_OVER';
      SoundEffects.getInstance().playPurchaseJingle();
      this.addLog(`GAME OVER! ${active[0].name} wins with ₹${active[0].netWorth.toLocaleString()} net worth!`, 'info');
      this.emit();
    }
  }

  /**
   * Handle when an opponent forfeits or leaves the multiplayer match
   */
  public handleOpponentLeft(leavingPlayerId: string, leavingPlayerName: string): void {
    const player = this.state.players.find((p) => p.id === leavingPlayerId || p.name === leavingPlayerName);
    const displayName = player ? player.name : leavingPlayerName;

    // Mark player as bankrupt & return properties to bank
    const debtorProperties = player?.ownedPropertyIds || [];
    this.state.players = this.state.players.map((p) =>
      p.id === leavingPlayerId || p.name === leavingPlayerName
        ? { ...p, isBankrupt: true, balance: 0, ownedPropertyIds: [] }
        : p
    );

    // Clean up property ownership
    if (debtorProperties.length > 0) {
      const newHouses = { ...this.state.propertyHouses };
      debtorProperties.forEach((s) => delete newHouses[s]);
      this.state.propertyHouses = newHouses;
    }

    this.addLog(`🚪 ${displayName} has left the match.`, 'info');

    // If remaining active players is 1, remaining player wins!
    const active = this.state.players.filter((p) => !p.isBankrupt);
    if (active.length === 1) {
      this.state.winner = active[0].id;
      this.state.phase = 'GAME_OVER';
      SoundEffects.getInstance().playPurchaseJingle();
      this.addLog(`🏆 ${active[0].name} wins by forfeit!`, 'info');
    } else {
      // If it was the leaving player's turn, advance to next player
      const activeP = this.getActivePlayer();
      if (activeP && (activeP.id === leavingPlayerId || activeP.name === leavingPlayerName)) {
        this.endTurn();
      }
    }
    this.emit();
  }

  /**
   * Replace an opponent who left with an intelligent AI bot so player can continue playing
   */
  public replaceOpponentWithAI(opponentId: string): void {
    const opponent = this.state.players.find((p) => p.id === opponentId || p.isBankrupt);
    if (!opponent) return;

    this.state.players = this.state.players.map((p) => {
      if (p.id === opponent.id) {
        return {
          ...p,
          isHuman: false,
          isBankrupt: false,
          name: p.name.includes('(AI)') ? p.name : `${p.name} (AI)`,
          avatar: 'bot'
        };
      }
      return p;
    });

    this.setMultiplayerAdapter(null);
    this.state.phase = 'PLAYER_TURN';
    this.addLog(`🤖 ${opponent.name} replaced by AI. Game resumed!`, 'buy');
    this.emit();

    const current = this.getActivePlayer();
    if (!current.isHuman) {
      this.triggerBotTurn();
    }
  }

  // ── TURN MANAGEMENT ──────────────────────────────────────────────────────────

  public endTurn(): void {
    if (this.mpAdapter?.isMultiplayerActive()) {
      this.mpAdapter.endTurn();
      return;
    }
    this.clearAnnouncement();
    if (this.state.phase === 'ROLLING' || this.state.hoppingState) return;
    if (this.state.phase === 'GAME_OVER') return;

    let nextIdx = (this.state.activePlayerIndex + 1) % this.state.players.length;
    let attempts = 0;
    while (this.state.players[nextIdx].isBankrupt && attempts < 4) {
      nextIdx = (nextIdx + 1) % this.state.players.length;
      attempts++;
    }

    this.state.activePlayerIndex = nextIdx;
    this.state.phase = 'PLAYER_TURN';
    this.state.diceState = { rolling: false, value: null };
    this.state.selectedProperty = null;
    this.state.activeChanceCard = null;
    this.state.auctionState = null;
    this.state.monopolyAchieved = null;

    const next = this.state.players[nextIdx];
    this.addLog(`Turn passed to ${next.name} (${next.colorName}).`, 'info');
    this.emit();

    if (!next.isHuman && !this.mpAdapter?.isMultiplayerActive()) this.triggerBotTurn();
  }

  private triggerBotTurn(): void {
    if (this.mpAdapter?.isMultiplayerActive()) return;
    if (this.turnTimer) clearTimeout(this.turnTimer);
    const delay = this.aiDifficulty === 'HARD' ? 700 : this.aiDifficulty === 'MEDIUM' ? 1200 : 1800;
    this.turnTimer = setTimeout(() => {
      const current = this.getActivePlayer();
      if (!current.isHuman && this.state.phase === 'PLAYER_TURN' && !this.mpAdapter?.isMultiplayerActive()) {
        this.requestRoll();
      }
    }, delay);
  }

  private checkBotEndTurn(player: PlayerData & { isHuman: boolean }): void {
    if (!player.isHuman && !this.mpAdapter?.isMultiplayerActive()) {
      const delay = this.aiDifficulty === 'HARD' ? 800 : this.aiDifficulty === 'MEDIUM' ? 1400 : 2000;
      setTimeout(() => {
        if (this.state.phase === 'RESOLVING' && !this.mpAdapter?.isMultiplayerActive()) this.endTurn();
      }, delay);
    }
  }

  private updatePlayerBalance(playerId: string, delta: number): void {
    this.state.players = this.state.players.map((p) => {
      if (p.id !== playerId) return p;
      const newBal = p.balance + delta;
      return { ...p, balance: newBal, isBankrupt: newBal < 0 };
    });
  }
}
