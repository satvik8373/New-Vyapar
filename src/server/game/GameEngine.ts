import { GameState } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';
import { PropertyState } from '../state/PropertyState';
import { DiceEngine } from './DiceEngine';
import { MovementEngine } from './MovementEngine';
import { PropertyEngine } from './PropertyEngine';
import { CardEngine } from './CardEngine';
import { TurnEngine } from './TurnEngine';
import {
  BOARD_SIZE,
  GO_SALARY,
  JAIL_FINE,
  JAIL_TILE_STEP,
  MAX_JAIL_TURNS,
  STARTING_BALANCE
} from './GameConfig';
import { BOARD_TILES } from '../../shared/game-data/boardData';

export class GameEngine {
  private state: GameState;
  private cardEngine: CardEngine;

  constructor(state: GameState) {
    this.state = state;
    this.cardEngine = new CardEngine();
  }

  public initializeBoard(): void {
    // Populate property states
    BOARD_TILES.forEach((tile) => {
      if (tile.type === 'PROPERTY' || tile.type === 'PORT') {
        const prop = new PropertyState();
        prop.step = tile.step;
        prop.ownerId = '';
        prop.houses = 0;
        prop.isMortgaged = false;
        prop.baseRent = PropertyEngine.getBaseRent(tile.price);
        prop.currentRent = prop.baseRent;
        this.state.properties.set(tile.step.toString(), prop);
      }
    });
  }

  public startGame(): void {
    this.state.phase = 'playing';
    const ordered = TurnEngine.getOrderedPlayers(this.state);
    if (ordered.length > 0) {
      this.state.turnIndex = 0;
      this.state.turnNumber = 1;
      this.state.currentPlayerId = ordered[0].id;
      this.state.turnPhase = 'waiting';
      this.state.statusMessage = `Match started! ${ordered[0].name} goes first.`;
    }
  }

  public rollDice(playerId: string): { success: boolean; error?: string } {
    if (this.state.phase !== 'playing') {
      return { success: false, error: 'Match is not in playing phase' };
    }
    if (this.state.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' };
    }
    if (this.state.turnPhase !== 'waiting') {
      return { success: false, error: 'Cannot roll in current phase' };
    }

    const player = this.state.players.get(playerId);
    if (!player || player.isBankrupt) {
      return { success: false, error: 'Player invalid or bankrupt' };
    }

    // Handle jail turn check
    if (player.isInJail) {
      player.jailTurns += 1;
      if (player.jailTurns >= MAX_JAIL_TURNS) {
        // Forced to pay bail on turn 3
        if (player.balance >= JAIL_FINE) {
          player.balance -= JAIL_FINE;
          this.state.statusMessage = `${player.name} forced to pay ₹${JAIL_FINE} jail fine after ${MAX_JAIL_TURNS} turns. Released!`;
        }
        player.isInJail = false;
        player.jailTurns = 0;
      } else {
        this.state.statusMessage = `${player.name} is in Jail (Turn ${player.jailTurns}/${MAX_JAIL_TURNS}). Pay ₹${JAIL_FINE} or use a card to escape.`;
        this.state.turnPhase = 'ending';
        return { success: true };
      }
    }

    // Server-authoritative roll
    const rollResult = DiceEngine.roll(1);
    this.state.dice1 = rollResult.dice1;
    this.state.dice2 = rollResult.dice2;
    this.state.lastRoll = rollResult.total;
    this.state.turnPhase = 'rolling';
    this.state.statusMessage = `${player.name} rolled a ${rollResult.total}!`;

    // Process Movement
    const move = MovementEngine.calculateMove(player.position, rollResult.total);
    player.position = move.toPosition;

    if (move.salaryBonus > 0) {
      player.balance += move.salaryBonus;
      player.netWorth += move.salaryBonus;
      if (move.landedOnStart) {
        this.state.statusMessage = `🎯 ${player.name} landed exactly on START! ₹${move.salaryBonus.toLocaleString()} bonus credited.`;
      } else {
        this.state.statusMessage = `💰 ${player.name} passed START and collected ₹${move.salaryBonus.toLocaleString()}.`;
      }
    }

    this.state.turnPhase = 'moving';
    // Resolve landing tile
    this.resolveTileLanding(player, move.toPosition);

    return { success: true };
  }

  private resolveTileLanding(player: PlayerState, step: number): void {
    const tile = PropertyEngine.getTile(step);
    if (!tile) {
      this.state.turnPhase = 'ending';
      return;
    }

    switch (tile.type) {
      case 'PROPERTY':
      case 'PORT': {
        const prop = this.state.properties.get(step.toString());
        if (!prop || !prop.ownerId) {
          // Unowned property: prompt player to buy or pass
          this.state.selectedTileStep = step;
          this.state.turnPhase = 'action';
          this.state.statusMessage = `${player.name} landed on ${tile.name} (₹${tile.price?.toLocaleString()}). Buy or Pass?`;
        } else if (prop.ownerId === player.id) {
          // Own property
          this.state.selectedTileStep = step;
          this.state.turnPhase = 'ending';
          this.state.statusMessage = `${player.name} rests on their own property: ${tile.name}.`;
        } else {
          // Opponent property: Pay rent
          const owner = this.state.players.get(prop.ownerId);
          if (owner && !prop.isMortgaged) {
            const rent = PropertyEngine.calculateRent(step, this.state.properties);
            const actualRent = Math.min(player.balance, rent);
            player.balance -= actualRent;
            owner.balance += actualRent;
            this.recalculateNetWorth(player);
            this.recalculateNetWorth(owner);

            this.state.statusMessage = `${player.name} paid ₹${actualRent.toLocaleString()} rent to ${owner.name} at ${tile.name}.`;

            if (player.balance <= 0) {
              this.handleBankruptcy(player, owner.id);
            }
          }
          this.state.turnPhase = 'ending';
        }
        break;
      }

      case 'TAX': {
        const tax = 500;
        player.balance -= tax;
        this.recalculateNetWorth(player);
        this.state.statusMessage = `🏛️ ${player.name} paid ₹${tax} in State Commercial Taxes.`;
        if (player.balance <= 0) {
          this.handleBankruptcy(player, null);
        }
        this.state.turnPhase = 'ending';
        break;
      }

      case 'GO_TO_JAIL': {
        player.position = JAIL_TILE_STEP;
        player.isInJail = true;
        player.jailTurns = 0;
        this.state.statusMessage = `🚨 Police arrested ${player.name}! Sent directly to Jail.`;
        this.state.turnPhase = 'ending';
        break;
      }

      case 'CHANCE': {
        const card = this.cardEngine.draw();
        this.state.activeCardId = card.id;
        this.state.statusMessage = `🎴 Chance: ${card.title} - ${card.description}`;

        if (card.amount) {
          player.balance += card.amount;
          this.recalculateNetWorth(player);
          if (player.balance <= 0) {
            this.handleBankruptcy(player, null);
          }
        }
        if (card.isGetOutOfJailFree) {
          player.getOutOfJailCards += 1;
        }
        if (card.isGoToJail) {
          player.position = JAIL_TILE_STEP;
          player.isInJail = true;
          player.jailTurns = 0;
        }
        if (card.moveToTile !== undefined) {
          player.position = card.moveToTile;
          if (card.moveToTile === 0) {
            player.balance += GO_SALARY;
            this.recalculateNetWorth(player);
          }
        }
        if (card.payEachPlayer) {
          const delta = card.payEachPlayer;
          this.state.players.forEach((other) => {
            if (other.id !== player.id && !other.isBankrupt) {
              player.balance += delta;
              other.balance -= delta;
              this.recalculateNetWorth(other);
            }
          });
          this.recalculateNetWorth(player);
        }
        this.state.turnPhase = 'ending';
        break;
      }

      default: {
        // START, FREE_PARKING, JAIL (Visiting)
        this.state.turnPhase = 'ending';
        break;
      }
    }
  }

  public buyProperty(playerId: string): { success: boolean; error?: string } {
    if (this.state.currentPlayerId !== playerId || this.state.turnPhase !== 'action') {
      return { success: false, error: 'Cannot buy in current turn phase' };
    }

    const player = this.state.players.get(playerId);
    const step = this.state.selectedTileStep;
    const tile = PropertyEngine.getTile(step);

    if (!player || !tile || !tile.price) {
      return { success: false, error: 'Invalid tile or player' };
    }

    if (player.balance < tile.price) {
      return { success: false, error: 'Insufficient funds' };
    }

    const prop = this.state.properties.get(step.toString());
    if (prop && prop.ownerId) {
      return { success: false, error: 'Property is already owned' };
    }

    player.balance -= tile.price;
    if (prop) {
      prop.ownerId = player.id;
      prop.currentRent = prop.baseRent;
    }

    this.recalculateNetWorth(player);
    this.state.statusMessage = `🎉 ${player.name} bought ${tile.name} for ₹${tile.price.toLocaleString()}!`;
    this.state.selectedTileStep = -1;
    this.state.turnPhase = 'ending';

    return { success: true };
  }

  public passProperty(playerId: string): { success: boolean; error?: string } {
    if (this.state.currentPlayerId !== playerId || this.state.turnPhase !== 'action') {
      return { success: false, error: 'Cannot pass in current turn phase' };
    }

    const player = this.state.players.get(playerId);
    const step = this.state.selectedTileStep;
    const tile = PropertyEngine.getTile(step);

    this.state.statusMessage = `${player?.name || 'Player'} passed on purchasing ${tile?.name || 'property'}.`;
    this.state.selectedTileStep = -1;
    this.state.turnPhase = 'ending';

    return { success: true };
  }

  public payJailFine(playerId: string): { success: boolean; error?: string } {
    if (this.state.currentPlayerId !== playerId) return { success: false, error: 'Not your turn' };
    const player = this.state.players.get(playerId);
    if (!player || !player.isInJail) return { success: false, error: 'Not in jail' };
    if (player.balance < JAIL_FINE) return { success: false, error: 'Cannot afford jail fine' };

    player.balance -= JAIL_FINE;
    player.isInJail = false;
    player.jailTurns = 0;
    this.recalculateNetWorth(player);

    this.state.statusMessage = `${player.name} paid ₹${JAIL_FINE} bail and is free! Roll the dice.`;
    this.state.turnPhase = 'waiting';

    return { success: true };
  }

  public useJailCard(playerId: string): { success: boolean; error?: string } {
    if (this.state.currentPlayerId !== playerId) return { success: false, error: 'Not your turn' };
    const player = this.state.players.get(playerId);
    if (!player || !player.isInJail || player.getOutOfJailCards <= 0) {
      return { success: false, error: 'No jail card available' };
    }

    player.getOutOfJailCards -= 1;
    player.isInJail = false;
    player.jailTurns = 0;

    this.state.statusMessage = `${player.name} used a Get Out of Jail Free card! Roll the dice.`;
    this.state.turnPhase = 'waiting';

    return { success: true };
  }

  public endTurn(playerId: string): { success: boolean; error?: string } {
    if (this.state.currentPlayerId !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    TurnEngine.advanceTurn(this.state);
    return { success: true };
  }

  private recalculateNetWorth(player: PlayerState): void {
    let propertyValue = 0;
    this.state.properties.forEach((prop) => {
      if (prop.ownerId === player.id) {
        const tile = PropertyEngine.getTile(prop.step);
        if (tile?.price) {
          propertyValue += prop.isMortgaged ? tile.price * 0.5 : tile.price;
        }
      }
    });
    player.netWorth = Math.max(0, player.balance + propertyValue);
  }

  private handleBankruptcy(player: PlayerState, creditorId: string | null): void {
    player.isBankrupt = true;
    player.balance = 0;

    // Release or transfer properties
    this.state.properties.forEach((prop) => {
      if (prop.ownerId === player.id) {
        if (creditorId) {
          prop.ownerId = creditorId;
        } else {
          prop.ownerId = '';
          prop.houses = 0;
          prop.isMortgaged = false;
        }
      }
    });

    this.state.statusMessage = `💥 ${player.name} declared bankruptcy!`;
  }
}
