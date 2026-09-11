import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') id: string = '';
  @type('string') sessionId: string = '';
  @type('string') name: string = '';
  @type('string') avatar: string = 'crown';
  @type('string') tokenColor: string = '#e11d48';
  @type('string') colorName: string = 'Ruby Crimson';
  @type('number') position: number = 0;
  @type('number') balance: number = 5000;
  @type('number') netWorth: number = 5000;
  @type('boolean') isBankrupt: boolean = false;
  @type('boolean') isInJail: boolean = false;
  @type('number') jailTurns: number = 0;
  @type('number') getOutOfJailCards: number = 0;
  @type('boolean') connected: boolean = true;
  @type('boolean') isBot: boolean = false;
  @type('number') turnOrder: number = 0;
}
