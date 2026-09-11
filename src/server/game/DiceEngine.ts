export interface DiceRollResult {
  dice1: number;
  dice2: number;
  total: number;
  isDouble: boolean;
}

export class DiceEngine {
  /**
   * Authoritative server dice roll.
   * Generates a single 6-sided die roll (1..6) or two dice.
   * Navo Vyapar board uses single die 1..6 with rapid movement across 32 tiles.
   */
  public static roll(numDice: number = 1): DiceRollResult {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = numDice > 1 ? Math.floor(Math.random() * 6) + 1 : 0;
    const total = numDice > 1 ? dice1 + dice2 : dice1;
    const isDouble = numDice > 1 && dice1 === dice2;

    return { dice1, dice2, total, isDouble };
  }
}
