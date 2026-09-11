import { PlayerData } from '@shared/types/player';
import { TileData } from '@shared/types/board';
import { TransactionRecord, TransactionType } from '@shared/types/economy';
import { GAME_CONFIG } from '@shared/constants/config';
import { SoundEffects } from '../audio/SoundEffects';

export interface BankTransactionCallback {
  (record: TransactionRecord): void;
}

/**
 * NAVO BANK - The central financial institution of Navo Vyapar.
 * Encapsulates all integer-safe monetary transfers, property acquisition,
 * rent clearing, and tax settlements.
 */
export class BankClient {
  private players: Map<string, PlayerData> = new Map();
  private tiles: Map<number, TileData> = new Map();
  private transactionHistory: TransactionRecord[] = [];
  private onTransactionCallbacks: BankTransactionCallback[] = [];
  private soundEffects: SoundEffects;

  constructor() {
    this.soundEffects = SoundEffects.getInstance();
  }

  public registerPlayer(player: PlayerData): void {
    this.players.set(player.id, player);
  }

  public registerTiles(tiles: TileData[]): void {
    tiles.forEach(tile => this.tiles.set(tile.id, tile));
  }

  public onTransaction(cb: BankTransactionCallback): void {
    this.onTransactionCallbacks.push(cb);
  }

  private recordTransaction(
    type: TransactionType,
    amount: number,
    from: string | 'BANK',
    to: string | 'BANK',
    description: string
  ): TransactionRecord {
    const record: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      amount: Math.round(amount),
      fromPlayerId: from,
      toPlayerId: to,
      description,
      timestamp: Date.now()
    };
    this.transactionHistory.push(record);
    this.onTransactionCallbacks.forEach(cb => cb(record));
    return record;
  }

  /**
   * Check if player has sufficient funds (integer safe)
   */
  public canAfford(playerId: string, amount: number): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;
    return player.balance >= Math.round(amount);
  }

  /**
   * Add money from NAVO BANK to player
   */
  public addMoney(playerId: string, amount: number, description: string, type: TransactionType = 'EVENT_REWARD'): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    const rounded = Math.max(0, Math.round(amount));
    player.balance += rounded;
    this.recordTransaction(type, rounded, 'BANK', playerId, description);
    this.soundEffects.playMoneyChime();
    return true;
  }

  /**
   * Deduct money from player to NAVO BANK
   */
  public removeMoney(playerId: string, amount: number, description: string, type: TransactionType = 'PAY_TAX'): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    const rounded = Math.max(0, Math.round(amount));
    player.balance = Math.max(0, player.balance - rounded);
    if (player.balance === 0) {
      player.isBankrupt = true;
    }
    this.recordTransaction(type, rounded, playerId, 'BANK', description);
    this.soundEffects.playTaxDeduct();
    return true;
  }

  /**
   * Direct transfer between two players (e.g. Rent)
   */
  public transferMoney(fromPlayerId: string, toPlayerId: string, amount: number, description: string): boolean {
    const fromPlayer = this.players.get(fromPlayerId);
    const toPlayer = this.players.get(toPlayerId);
    if (!fromPlayer || !toPlayer) return false;

    const rounded = Math.max(0, Math.round(amount));
    const actualPay = Math.min(fromPlayer.balance, rounded);
    
    fromPlayer.balance -= actualPay;
    toPlayer.balance += actualPay;

    if (fromPlayer.balance <= 0) {
      fromPlayer.isBankrupt = true;
    }

    this.recordTransaction('PAY_RENT', actualPay, fromPlayerId, toPlayerId, description);
    this.soundEffects.playMoneyChime();
    return true;
  }

  /**
   * Purchase property from NAVO BANK
   */
  public purchaseProperty(playerId: string, tileId: number): { success: boolean; message: string } {
    const player = this.players.get(playerId);
    const tile = this.tiles.get(tileId);

    if (!player || !tile) {
      return { success: false, message: 'Invalid player or property' };
    }
    if (tile.type !== 'PROPERTY') {
      return { success: false, message: 'This tile cannot be purchased' };
    }
    if (tile.ownerId) {
      return { success: false, message: 'Property is already owned' };
    }
    if (!this.canAfford(playerId, tile.price)) {
      return { success: false, message: 'Insufficient funds in Navo Bank account' };
    }

    // Execute transaction
    player.balance -= tile.price;
    tile.ownerId = playerId;
    if (!player.ownedPropertyIds.includes(tileId)) {
      player.ownedPropertyIds.push(tileId);
    }

    this.recordTransaction(
      'BUY_PROPERTY',
      tile.price,
      playerId,
      'BANK',
      `${player.name} bought ${tile.name} for ${GAME_CONFIG.CURRENCY_SYMBOL}${tile.price}`
    );

    this.soundEffects.playPurchaseJingle();
    return { success: true, message: `Successfully purchased ${tile.name}!` };
  }

  /**
   * Collect salary for passing or landing on START
   */
  public paySalary(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.addMoney(
      playerId,
      GAME_CONFIG.SALARY_AMOUNT,
      `${player.name} received Shree Ganesh salary of ${GAME_CONFIG.CURRENCY_SYMBOL}${GAME_CONFIG.SALARY_AMOUNT}`,
      'SALARY'
    );
  }

  /**
   * Pay rent to property owner
   */
  public payRent(payerId: string, tileId: number): { success: boolean; rentPaid: number; ownerName: string } {
    const payer = this.players.get(payerId);
    const tile = this.tiles.get(tileId);

    if (!payer || !tile || !tile.ownerId || tile.ownerId === payerId) {
      return { success: false, rentPaid: 0, ownerName: '' };
    }

    const owner = this.players.get(tile.ownerId);
    if (!owner) return { success: false, rentPaid: 0, ownerName: '' };

    const rent = tile.baseRent;
    this.transferMoney(
      payerId,
      owner.id,
      rent,
      `${payer.name} paid ${GAME_CONFIG.CURRENCY_SYMBOL}${rent} rent to ${owner.name} for ${tile.name}`
    );

    return { success: true, rentPaid: rent, ownerName: owner.name };
  }

  public getPlayer(id: string): PlayerData | undefined {
    return this.players.get(id);
  }

  public getTile(id: number): TileData | undefined {
    return this.tiles.get(id);
  }

  public getTransactionHistory(): TransactionRecord[] {
    return [...this.transactionHistory];
  }
}
