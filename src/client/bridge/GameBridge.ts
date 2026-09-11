import { PlayerData, TurnPhase } from '@shared/types/player';
import { TileData } from '@shared/types/board';
import { TransactionRecord } from '@shared/types/economy';

export interface PropertyModalState {
  open: boolean;
  tile: TileData | null;
  player: PlayerData | null;
  canAfford: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

type Listener<T> = (data: T) => void;

/**
 * GameBridge - High performance bidirectional event bridge
 * connecting Phaser 3 (tabletop board rendering) and React (premium UI layer).
 */
export class GameBridge {
  private static instance: GameBridge;

  // Listeners for React to subscribe to
  private turnListeners: Listener<{ activePlayer: PlayerData; activeIndex: number; phase: TurnPhase }>[] = [];
  private playerUpdateListeners: Listener<PlayerData[]>[] = [];
  private diceRollListeners: Listener<{ rolling: boolean; value: number | null }>[] = [];
  private propertyModalListeners: Listener<PropertyModalState>[] = [];
  private toastListeners: Listener<ToastMessage>[] = [];
  private soundListeners: Listener<boolean>[] = [];
  private bankHistoryListeners: Listener<TransactionRecord[]>[] = [];

  // Callbacks registered by Phaser GameScene for React actions
  public onRollRequested: ((forcedResult?: number) => void) | null = null;
  public onPropertyAction: ((action: 'BUY' | 'PASS') => void) | null = null;
  public onToggleSound: (() => boolean) | null = null;

  // Cached state for instant React hydration
  public activePlayer: PlayerData | null = null;
  public activeIndex: number = 0;
  public phase: TurnPhase = 'WAITING';
  public players: PlayerData[] = [];
  public isRolling: boolean = false;
  public lastDiceValue: number | null = null;
  public isSoundMuted: boolean = false;
  public propertyModal: PropertyModalState = {
    open: false,
    tile: null,
    player: null,
    canAfford: false
  };

  private constructor() {}

  public static getInstance(): GameBridge {
    if (!GameBridge.instance) {
      GameBridge.instance = new GameBridge();
    }
    return GameBridge.instance;
  }

  // --- Subscriptions for React ---

  public subscribeTurn(cb: Listener<{ activePlayer: PlayerData; activeIndex: number; phase: TurnPhase }>): () => void {
    this.turnListeners.push(cb);
    if (this.activePlayer) {
      cb({ activePlayer: this.activePlayer, activeIndex: this.activeIndex, phase: this.phase });
    }
    return () => {
      this.turnListeners = this.turnListeners.filter(l => l !== cb);
    };
  }

  public subscribePlayers(cb: Listener<PlayerData[]>): () => void {
    this.playerUpdateListeners.push(cb);
    if (this.players.length > 0) {
      cb(this.players);
    }
    return () => {
      this.playerUpdateListeners = this.playerUpdateListeners.filter(l => l !== cb);
    };
  }

  public subscribeDice(cb: Listener<{ rolling: boolean; value: number | null }>): () => void {
    this.diceRollListeners.push(cb);
    cb({ rolling: this.isRolling, value: this.lastDiceValue });
    return () => {
      this.diceRollListeners = this.diceRollListeners.filter(l => l !== cb);
    };
  }

  public subscribePropertyModal(cb: Listener<PropertyModalState>): () => void {
    this.propertyModalListeners.push(cb);
    cb(this.propertyModal);
    return () => {
      this.propertyModalListeners = this.propertyModalListeners.filter(l => l !== cb);
    };
  }

  public subscribeToasts(cb: Listener<ToastMessage>): () => void {
    this.toastListeners.push(cb);
    return () => {
      this.toastListeners = this.toastListeners.filter(l => l !== cb);
    };
  }

  public subscribeSound(cb: Listener<boolean>): () => void {
    this.soundListeners.push(cb);
    cb(this.isSoundMuted);
    return () => {
      this.soundListeners = this.soundListeners.filter(l => l !== cb);
    };
  }

  public subscribeBankHistory(cb: Listener<TransactionRecord[]>): () => void {
    this.bankHistoryListeners.push(cb);
    return () => {
      this.bankHistoryListeners = this.bankHistoryListeners.filter(l => l !== cb);
    };
  }

  // --- Dispatch methods called by Phaser ---

  public emitTurnChanged(activePlayer: PlayerData, activeIndex: number, phase: TurnPhase): void {
    this.activePlayer = activePlayer;
    this.activeIndex = activeIndex;
    this.phase = phase;
    this.turnListeners.forEach(cb => cb({ activePlayer, activeIndex, phase }));
  }

  public emitPlayersUpdated(players: PlayerData[]): void {
    this.players = [...players];
    this.playerUpdateListeners.forEach(cb => cb(this.players));
  }

  public emitDiceState(rolling: boolean, value: number | null): void {
    this.isRolling = rolling;
    if (value !== null) this.lastDiceValue = value;
    this.diceRollListeners.forEach(cb => cb({ rolling, value: this.lastDiceValue }));
  }

  public emitShowPropertyModal(tile: TileData, player: PlayerData, canAfford: boolean): void {
    this.propertyModal = { open: true, tile, player, canAfford };
    this.propertyModalListeners.forEach(cb => cb(this.propertyModal));
  }

  public emitHidePropertyModal(): void {
    this.propertyModal = { open: false, tile: null, player: null, canAfford: false };
    this.propertyModalListeners.forEach(cb => cb(this.propertyModal));
  }

  public emitToast(message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const toast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      message,
      severity
    };
    this.toastListeners.forEach(cb => cb(toast));
  }

  public emitBankHistory(records: TransactionRecord[]): void {
    this.bankHistoryListeners.forEach(cb => cb(records));
  }

  // --- Actions called from React UI ---

  public requestRoll(forcedResult?: number): void {
    if (this.onRollRequested) {
      this.onRollRequested(forcedResult);
    }
  }

  public submitPropertyAction(action: 'BUY' | 'PASS'): void {
    this.emitHidePropertyModal();
    if (this.onPropertyAction) {
      this.onPropertyAction(action);
    }
  }

  public toggleMute(): boolean {
    if (this.onToggleSound) {
      this.isSoundMuted = this.onToggleSound();
      this.soundListeners.forEach(cb => cb(this.isSoundMuted));
    }
    return this.isSoundMuted;
  }
}
