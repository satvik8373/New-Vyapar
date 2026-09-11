import { PlayerData } from '@shared/types/player';
import { TileData } from '@shared/types/board';
import { TransactionRecord, TransactionType } from '@shared/types/economy';
import { GAME_CONFIG } from '@shared/constants/config';

/**
 * Server-side authoritative Central Bank (NAVO BANK).
 * Handles server-validated financial operations in real-time multiplayer.
 */
export class CentralBank {
  private balances: Map<string, number> = new Map();
  private propertyOwners: Map<number, string> = new Map();

  public initializePlayer(playerId: string, startingBalance: number = GAME_CONFIG.STARTING_BALANCE): void {
    this.balances.set(playerId, startingBalance);
  }

  public getBalance(playerId: string): number {
    return this.balances.get(playerId) ?? 0;
  }

  public canAfford(playerId: string, amount: number): boolean {
    return this.getBalance(playerId) >= Math.round(amount);
  }

  public addMoney(playerId: string, amount: number): number {
    const current = this.getBalance(playerId);
    const updated = current + Math.max(0, Math.round(amount));
    this.balances.set(playerId, updated);
    return updated;
  }

  public removeMoney(playerId: string, amount: number): number {
    const current = this.getBalance(playerId);
    const updated = Math.max(0, current - Math.max(0, Math.round(amount)));
    this.balances.set(playerId, updated);
    return updated;
  }

  public transferMoney(fromPlayerId: string, toPlayerId: string, amount: number): boolean {
    const fromBal = this.getBalance(fromPlayerId);
    const actualAmount = Math.min(fromBal, Math.max(0, Math.round(amount)));
    this.removeMoney(fromPlayerId, actualAmount);
    this.addMoney(toPlayerId, actualAmount);
    return true;
  }

  public setOwner(tileId: number, playerId: string): void {
    this.propertyOwners.set(tileId, playerId);
  }

  public getOwner(tileId: number): string | undefined {
    return this.propertyOwners.get(tileId);
  }
}
