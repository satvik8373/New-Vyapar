import { Schema, type } from '@colyseus/schema';

export class PropertyState extends Schema {
  @type('number') step: number = 0;
  @type('string') ownerId: string = '';
  @type('number') houses: number = 0;
  @type('boolean') isMortgaged: boolean = false;
  @type('number') baseRent: number = 0;
  @type('number') currentRent: number = 0;
}
