import assert from 'assert';
import { DEFAULT_BOARD_TILES, BOARD_TILES, COLOR_HEX_MAP } from '../src/shared/game-data/boardData';
import { GameEngine } from '../src/client/game-engine/GameEngine';

console.log('=== VERIFYING MONOPOLY & HOUSE BUILDING RULES ===\n');

// 1. Verify Board Structure & Geometry
assert.strictEqual(DEFAULT_BOARD_TILES.length, 32, 'Board must have exactly 32 tiles');

// 2. Verify Tile Types & Color Assignments
const properties = DEFAULT_BOARD_TILES.filter((t) => t.type === 'PROPERTY');
const ports = DEFAULT_BOARD_TILES.filter((t) => t.type === 'PORT');
const nonPurchasables = DEFAULT_BOARD_TILES.filter((t) => t.type !== 'PROPERTY' && t.type !== 'PORT');

assert.strictEqual(properties.length, 21, 'Must have exactly 21 city properties');
assert.strictEqual(ports.length, 3, 'Must have exactly 3 seaports');
assert.strictEqual(nonPurchasables.length, 8, 'Must have exactly 8 non-purchasable tiles (4 corners + 4 special)');

// Verify that all non-purchasables and ports have color: null
for (const t of nonPurchasables) {
  assert.strictEqual(t.color, null, `Tile ${t.step} (${t.name}) must have color: null`);
}
for (const t of ports) {
  assert.strictEqual(t.color, null, `Port ${t.step} (${t.name}) must have color: null`);
}
console.log('✔ Passed: Non-property tiles and ports have color: null.\n');

// 3. Verify Every Color Group has EXACTLY 3 Properties (Never 7 or 8!)
const uniqueColors = Array.from(new Set(properties.map((t) => t.color).filter((c): c is string => Boolean(c))));
assert.strictEqual(uniqueColors.length, 7, 'Must have exactly 7 color groups');

for (const color of uniqueColors) {
  const groupTiles = properties.filter((t) => t.color === color);
  console.log(`Checking ${color.toUpperCase()} group: ${groupTiles.map((t) => t.name).join(', ')} (${groupTiles.length} properties)`);
  assert.strictEqual(
    groupTiles.length,
    3,
    `Color group ${color} must contain exactly 3 properties, got ${groupTiles.length}`
  );
  // Verify color exists in COLOR_HEX_MAP
  assert.ok(COLOR_HEX_MAP[color], `Color ${color} must be mapped in COLOR_HEX_MAP`);
}
console.log('\n✔ Passed: Every single color group has strictly 3 properties (7 groups of 3 = 21 properties).\n');

// 4. Verify GameEngine Monopoly & Even-Building Rules
console.log('Testing GameEngine Monopoly & Building Logic...');
const engine = GameEngine.getInstance();
const state = engine.getState();
const p1 = state.players[0];

// Reset player state for clean test
p1.balance = 50000;
p1.ownedPropertyIds = [];
engine.getState().propertyHouses = {};

const tealTiles = BOARD_TILES.filter((t) => t.color === 'teal' && t.type === 'PROPERTY');
assert.strictEqual(tealTiles.length, 3);
const [stepA, stepB, stepC] = tealTiles.map((t) => t.step);

// Player owns 0 of 3
assert.strictEqual(engine.ownsColorGroup(p1.id, 'teal'), false);
assert.strictEqual(engine.buildHouse(stepA, p1.id), false, 'Cannot build with 0 properties owned');

// Player owns 1 of 3 (stepA)
p1.ownedPropertyIds = [stepA];
assert.strictEqual(engine.ownsColorGroup(p1.id, 'teal'), false);
assert.strictEqual(engine.buildHouse(stepA, p1.id), false, 'Cannot build with 1 of 3 owned');

// Player owns 2 of 3 (stepA, stepB)
p1.ownedPropertyIds = [stepA, stepB];
assert.strictEqual(engine.ownsColorGroup(p1.id, 'teal'), false);
assert.strictEqual(engine.buildHouse(stepA, p1.id), false, 'Cannot build with 2 of 3 owned');

// Player owns all 3 of 3 (stepA, stepB, stepC) -> MONOPOLY UNLOCKED!
p1.ownedPropertyIds = [stepA, stepB, stepC];
assert.strictEqual(engine.ownsColorGroup(p1.id, 'teal'), true, 'Monopoly must unlock when all 3 owned');

// Now building 1st house on stepA succeeds
assert.strictEqual(engine.buildHouse(stepA, p1.id), true, 'Building 1st house succeeds with monopoly');
assert.strictEqual(engine.getState().propertyHouses[stepA], 1);

// Even building rule: cannot build 2nd house on stepA while stepB or stepC have 0
assert.strictEqual(engine.buildHouse(stepA, p1.id), false, 'Must build evenly across group');

// Build 1st house on stepB and stepC
assert.strictEqual(engine.buildHouse(stepB, p1.id), true);
assert.strictEqual(engine.buildHouse(stepC, p1.id), true);
assert.strictEqual(engine.getState().propertyHouses[stepB], 1);
assert.strictEqual(engine.getState().propertyHouses[stepC], 1);

// Now all 3 properties have 1 house; building 2nd house on stepA is now allowed!
assert.strictEqual(engine.buildHouse(stepA, p1.id), true, '2nd house allowed after even building');
assert.strictEqual(engine.getState().propertyHouses[stepA], 2);

console.log('✔ Passed: Monopoly unlocking (requires all 3) and even building rules validated.\n');

console.log('🎉 ALL MONOPOLY & BUILDING RULES VERIFIED SUCCESSFULLY!\n');
