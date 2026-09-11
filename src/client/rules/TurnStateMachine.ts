import { TurnPhase, PlayerData } from '@shared/types/player';

export type StateChangeCallback = (newPhase: TurnPhase, activePlayer: PlayerData) => void;

export class TurnStateMachine {
  private currentPhase: TurnPhase = 'WAITING';
  private players: PlayerData[] = [];
  private activePlayerIndex: number = 0;
  private onStateChangeCallbacks: StateChangeCallback[] = [];

  constructor(players: PlayerData[]) {
    this.players = [...players];
    this.activePlayerIndex = 0;
  }

  public getPhase(): TurnPhase {
    return this.currentPhase;
  }

  public getActivePlayer(): PlayerData {
    return this.players[this.activePlayerIndex];
  }

  public getActivePlayerIndex(): number {
    return this.activePlayerIndex;
  }

  public getAllPlayers(): PlayerData[] {
    return this.players;
  }

  public onStateChange(callback: StateChangeCallback): void {
    this.onStateChangeCallbacks.push(callback);
  }

  private setPhase(newPhase: TurnPhase): void {
    this.currentPhase = newPhase;
    const activePlayer = this.getActivePlayer();
    this.onStateChangeCallbacks.forEach(cb => cb(newPhase, activePlayer));
  }

  /**
   * Start the initial game loop with Player 1
   */
  public startGame(): void {
    this.activePlayerIndex = 0;
    this.setPhase('PLAYER_TURN');
  }

  /**
   * Request to start rolling dice
   */
  public startRoll(): boolean {
    if (this.currentPhase !== 'PLAYER_TURN') {
      console.warn(`[TurnStateMachine] Cannot roll during phase: ${this.currentPhase}`);
      return false;
    }
    this.setPhase('ROLLING');
    return true;
  }

  /**
   * Called when dice result is finalized and token starts moving
   */
  public startMoving(): boolean {
    if (this.currentPhase !== 'ROLLING') {
      console.warn(`[TurnStateMachine] Cannot move during phase: ${this.currentPhase}`);
      return false;
    }
    this.setPhase('MOVING');
    return true;
  }

  /**
   * Called when token completes movement and lands on tile
   */
  public landOnTile(): boolean {
    if (this.currentPhase !== 'MOVING') {
      console.warn(`[TurnStateMachine] Cannot trigger tile action during phase: ${this.currentPhase}`);
      return false;
    }
    this.setPhase('TILE_ACTION');
    return true;
  }

  /**
   * Called while modal/actions are resolving
   */
  public startResolving(): boolean {
    if (this.currentPhase !== 'TILE_ACTION') {
      return false;
    }
    this.setPhase('RESOLVING');
    return true;
  }

  /**
   * Complete turn and transition to next player
   */
  public advanceToNextPlayer(): void {
    this.setPhase('NEXT_TURN');
    
    // Find next non-bankrupt player
    let nextIdx = (this.activePlayerIndex + 1) % this.players.length;
    let loopCount = 0;
    while (this.players[nextIdx].isBankrupt && loopCount < this.players.length) {
      nextIdx = (nextIdx + 1) % this.players.length;
      loopCount++;
    }

    this.activePlayerIndex = nextIdx;
    this.setPhase('PLAYER_TURN');
  }
}
