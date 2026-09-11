import { GameEngine } from './GameEngine';
import { GameState } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';
import { PropertyEngine } from './PropertyEngine';

export type BotDifficulty = 'easy' | 'normal' | 'hard';

export class BotEngine {
  private gameEngine: GameEngine;
  private state: GameState;
  private difficulty: BotDifficulty;
  private isProcessing: boolean = false;
  private pendingTimer: NodeJS.Timeout | null = null;

  constructor(gameEngine: GameEngine, state: GameState, difficulty: BotDifficulty = 'normal') {
    this.gameEngine = gameEngine;
    this.state = state;
    this.difficulty = difficulty;
  }

  public cleanup(): void {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.isProcessing = false;
  }

  /**
   * Called by the room update loop or turn change event.
   * If current player is a bot, triggers the bot turn sequence with natural delays.
   */
  public checkAndExecuteTurn(): void {
    if (this.isProcessing || this.state.phase !== 'playing') return;

    const currentPlayer = this.state.players.get(this.state.currentPlayerId);
    if (!currentPlayer || !currentPlayer.isBot || currentPlayer.isBankrupt) return;

    this.isProcessing = true;
    this.executeBotTurn(currentPlayer);
  }

  private executeBotTurn(bot: PlayerState): void {
    // 1. Natural thinking delay before rolling: 700ms
    this.pendingTimer = setTimeout(() => {
      // Check jail options
      if (bot.isInJail) {
        if (bot.getOutOfJailCards > 0) {
          this.gameEngine.useJailCard(bot.id);
        } else if (bot.balance > 2000) {
          this.gameEngine.payJailFine(bot.id);
        }
      }

      // Roll dice
      this.gameEngine.rollDice(bot.id);

      // 2. Wait for dice animation & movement resolution (1200ms)
      this.pendingTimer = setTimeout(() => {
        this.handlePostRollAction(bot);
      }, 1200);
    }, 700);
  }

  private handlePostRollAction(bot: PlayerState): void {
    if (this.state.turnPhase === 'action') {
      // Bot is deciding whether to buy property: 800ms thinking delay
      this.pendingTimer = setTimeout(() => {
        const step = this.state.selectedTileStep;
        const tile = PropertyEngine.getTile(step);

        if (tile && tile.price) {
          const shouldBuy = this.evaluatePropertyPurchase(bot, tile.price, tile.color);
          if (shouldBuy && bot.balance >= tile.price) {
            this.gameEngine.buyProperty(bot.id);
          } else {
            this.gameEngine.passProperty(bot.id);
          }
        } else {
          this.gameEngine.passProperty(bot.id);
        }

        // 3. Complete turn after 600ms
        this.pendingTimer = setTimeout(() => {
          this.finishBotTurn(bot);
        }, 600);
      }, 800);
    } else {
      // Non-action tile (Tax, Start, Jail visiting, Chance resolved): Complete turn
      this.pendingTimer = setTimeout(() => {
        this.finishBotTurn(bot);
      }, 600);
    }
  }

  private evaluatePropertyPurchase(bot: PlayerState, price: number, color: string | null): boolean {
    if (bot.balance < price) return false;

    if (this.difficulty === 'easy') {
      // Random purchase 70% of the time if affordable
      return Math.random() < 0.70;
    }

    if (this.difficulty === 'normal') {
      // Reserve 30% cash for safety
      const safetyReserve = bot.balance * 0.30;
      return (bot.balance - price) >= safetyReserve;
    }

    // Hard difficulty: considers monopoly potential & reserve
    if (this.difficulty === 'hard') {
      const safetyReserve = bot.balance * 0.20;
      // If buying completes monopoly, buy even with lower reserve
      if (color && PropertyEngine.hasMonopoly(bot.id, color, this.state.properties)) {
        return (bot.balance - price) >= 200;
      }
      return (bot.balance - price) >= safetyReserve;
    }

    return true;
  }

  private finishBotTurn(bot: PlayerState): void {
    this.gameEngine.endTurn(bot.id);
    this.isProcessing = false;
    this.pendingTimer = null;

    // Check if next player is also a bot
    const nextPlayer = this.state.players.get(this.state.currentPlayerId);
    if (nextPlayer && nextPlayer.isBot && !nextPlayer.isBankrupt && this.state.phase === 'playing') {
      setTimeout(() => {
        this.checkAndExecuteTurn();
      }, 400);
    }
  }
}
