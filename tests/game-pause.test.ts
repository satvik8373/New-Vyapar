import { GameEngine } from '../src/client/game-engine/GameEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✔ PASS: ${msg}`);
  }
}

console.log('=== NAVO VYAPAR GAME ENGINE PAUSE TEST ===\n');

const engine = GameEngine.getInstance();
engine.resetGame();

// Test 1: Initial state is not paused
assert(engine.isGamePaused() === false, 'Initial state: isGamePaused() is false');

// Test 2: pauseGame() pauses the game
engine.pauseGame();
assert(engine.isGamePaused() === true, 'After pauseGame(): isGamePaused() is true');

// Test 3: Actions are blocked while paused
engine.requestRoll();
assert(engine.getState().diceState.rolling === false, 'requestRoll() is blocked while paused');
assert(engine.getState().phase === 'PLAYER_TURN', 'Phase remains unchanged while paused');

// Test 4: resumeGame() resumes the game
engine.resumeGame();
assert(engine.isGamePaused() === false, 'After resumeGame(): isGamePaused() is false');

console.log('\n=== ALL PAUSE TESTS PASSED! ===');
