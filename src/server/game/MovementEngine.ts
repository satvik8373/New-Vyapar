import { BOARD_SIZE, GO_SALARY, GO_EXACT_BONUS } from './GameConfig';

export interface MovementResult {
  fromPosition: number;
  toPosition: number;
  steps: number;
  passedStart: boolean;
  landedOnStart: boolean;
  salaryBonus: number;
}

export class MovementEngine {
  public static calculateMove(currentPosition: number, steps: number): MovementResult {
    const rawTarget = currentPosition + steps;
    const toPosition = rawTarget % BOARD_SIZE;
    const passedStart = rawTarget >= BOARD_SIZE && toPosition !== 0;
    const landedOnStart = toPosition === 0 && steps > 0;

    let salaryBonus = 0;
    if (landedOnStart) {
      salaryBonus = GO_SALARY + GO_EXACT_BONUS; // Exact start bonus ₹2000 total
    } else if (passedStart) {
      salaryBonus = GO_SALARY; // Passed start ₹1000
    }

    return {
      fromPosition: currentPosition,
      toPosition,
      steps,
      passedStart,
      landedOnStart,
      salaryBonus
    };
  }
}
