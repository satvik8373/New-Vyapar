import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerState } from './PlayerState';
import { PropertyState } from './PropertyState';

export type GamePhase = 'waiting' | 'starting' | 'playing' | 'finished';
export type TurnPhase = 'waiting' | 'rolling' | 'moving' | 'resolving' | 'action' | 'auction' | 'ending';

export class GameState extends Schema {
  @type('string') phase: GamePhase = 'waiting';
  @type('string') turnPhase: TurnPhase = 'waiting';
  @type('number') turnIndex: number = 0;
  @type('number') turnNumber: number = 0;
  @type('string') currentPlayerId: string = '';
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: PropertyState }) properties = new MapSchema<PropertyState>();
  @type('number') dice1: number = 0;
  @type('number') dice2: number = 0;
  @type('number') lastRoll: number = 0;
  @type('number') selectedTileStep: number = -1;
  @type('string') activeCardId: string = '';
  @type('string') statusMessage: string = 'Welcome to Navo Vyapar!';
  @type('string') winner: string = '';
  @type('number') countdown: number = 0;
  @type('number') boardSeed: number = 0;
}
