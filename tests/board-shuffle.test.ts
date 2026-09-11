import assert from 'assert';
import { 
  DEFAULT_BOARD_TILES, 
  BOARD_TILES, 
  shuffleMatchTiles, 
  resetToDefaultTiles 
} from '../src/shared/game-data/boardData';

console.log('=== NAVO VYAPAR BOARD SHUFFLE & SEEDING TEST ===\n');

// 1. Check default layout
assert.strictEqual(DEFAULT_BOARD_TILES.length, 32, 'Default board must have 32 tiles');
assert.strictEqual(DEFAULT_BOARD_TILES[0].name, 'START / GO', 'Tile 0 is START');
assert.strictEqual(DEFAULT_BOARD_TILES[8].name, 'JAIL', 'Tile 8 is JAIL');
assert.strictEqual(DEFAULT_BOARD_TILES[16].name, 'FREE PARKING', 'Tile 16 is FREE PARKING');
assert.strictEqual(DEFAULT_BOARD_TILES[24].name, 'GO TO JAIL', 'Tile 24 is GO TO JAIL');

// Fixed non-property slots
assert.strictEqual(DEFAULT_BOARD_TILES[5].type, 'TAX', 'Tile 5 is TAX');
assert.strictEqual(DEFAULT_BOARD_TILES[14].type, 'BANK', 'Tile 14 is BANK');
assert.strictEqual(DEFAULT_BOARD_TILES[18].type, 'SPECIAL', 'Tile 18 is SPECIAL');
assert.strictEqual(DEFAULT_BOARD_TILES[22].type, 'CHANCE', 'Tile 22 is CHANCE');
console.log('✔ Passed: Default board geometry and fixed corners verified.\n');

// 2. Shuffle with Seed 12345
console.log('Test: Shuffling with Seed 12345...');
const seedA = 12345;
shuffleMatchTiles(seedA);

// Corners and special utility slots must remain fixed
assert.strictEqual(BOARD_TILES[0].name, 'START / GO', 'Tile 0 remains START');
assert.strictEqual(BOARD_TILES[8].name, 'JAIL', 'Tile 8 remains JAIL');
assert.strictEqual(BOARD_TILES[16].name, 'FREE PARKING', 'Tile 16 remains FREE PARKING');
assert.strictEqual(BOARD_TILES[24].name, 'GO TO JAIL', 'Tile 24 remains GO TO JAIL');
assert.strictEqual(BOARD_TILES[5].type, 'TAX', 'Tile 5 remains TAX');
assert.strictEqual(BOARD_TILES[14].type, 'BANK', 'Tile 14 remains BANK');
assert.strictEqual(BOARD_TILES[18].type, 'SPECIAL', 'Tile 18 remains SPECIAL');
assert.strictEqual(BOARD_TILES[22].type, 'CHANCE', 'Tile 22 remains CHANCE');

const layoutA_names = BOARD_TILES.map((t) => t.name);
console.log(`Shuffled Slot 1: ${layoutA_names[1]} (was ${DEFAULT_BOARD_TILES[1].name})`);
console.log(`Shuffled Slot 2: ${layoutA_names[2]} (was ${DEFAULT_BOARD_TILES[2].name})`);
console.log(`Shuffled Slot 3: ${layoutA_names[3]} (was ${DEFAULT_BOARD_TILES[3].name})`);
console.log(`Shuffled Slot 4: ${layoutA_names[4]} (was ${DEFAULT_BOARD_TILES[4].name})`);

// 3. Shuffle with identical seed must yield 100% identical layout
console.log('\nTest: Determinism check with identical seed...');
shuffleMatchTiles(seedA);
const layoutA2_names = BOARD_TILES.map((t) => t.name);
assert.deepStrictEqual(layoutA_names, layoutA2_names, 'Identical seed must yield identical city positions');
console.log('✔ Passed: Seed determinism confirmed.\n');

// 4. Shuffle with different seed must yield different arrangement
console.log('Test: Uniqueness check with different seed (99999)...');
const seedB = 99999;
shuffleMatchTiles(seedB);
const layoutB_names = BOARD_TILES.map((t) => t.name);
assert.notDeepStrictEqual(layoutA_names, layoutB_names, 'Different seeds must produce different city arrangements');
console.log('✔ Passed: Dynamic city rearrangement confirmed across matches.\n');

// 5. Reset to default
console.log('Test: Reset to default classic layout...');
resetToDefaultTiles();
assert.strictEqual(BOARD_TILES[1].name, 'DWARKA', 'Reset restored Tile 1 to DWARKA');
assert.strictEqual(BOARD_TILES[2].name, 'GIFT CITY', 'Reset restored Tile 2 to GIFT CITY');
console.log('✔ Passed: Reset successfully restored classic layout.\n');

console.log('🎉 ALL BOARD SHUFFLE TESTS PASSED!\n');
