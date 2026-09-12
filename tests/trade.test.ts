import { GameEngine } from '../src/client/game-engine/GameEngine';

console.log('=== VERIFYING TRADE ENGINE ===');

const engine = GameEngine.getInstance();
engine.resetGame();

const state = engine.getState();
const p1 = state.players[0]; // Human
const p2 = state.players[1]; // AI (Computer 1)

// Assign Tile 1 (Porbandar) to P1 and Tile 3 (Ahmedabad) to P2
p1.ownedPropertyIds = [1];
p2.ownedPropertyIds = [3];
p1.balance = 5000;
p2.balance = 5000;

console.log(`Initial: P1 (${p1.name}) owns [${p1.ownedPropertyIds}], Bal: ₹${p1.balance}`);
console.log(`Initial: P2 (${p2.name}) owns [${p2.ownedPropertyIds}], Bal: ₹${p2.balance}`);

// Test 1: Lowball offer (P1 offers only ₹100 cash for P2's property without giving anything)
const badOffer = engine.executeTrade({
  fromPlayerId: p1.id,
  toPlayerId: p2.id,
  offeredPropertySteps: [],
  offeredCash: 100,
  requestedPropertySteps: [3],
  requestedCash: 0
});

console.log('Lowball offer response:', badOffer);
if (badOffer.success) {
  throw new Error('Expected AI to decline lowball offer');
}
console.log('✔ Passed: AI properly evaluated and declined lowball offer.');

import { BOARD_TILES } from '../src/shared/game-data/boardData';

const t1 = BOARD_TILES.find(t => t.step === 1)!;
const t3 = BOARD_TILES.find(t => t.step === 3)!;
const cashNeeded = Math.max(0, (t3.price || 1000) - (t1.price || 600)) + 200;

// Test 2: Fair swap (P1 offers Tile 1 + sufficient cash to exceed Tile 3's valuation)
const fairOffer = engine.executeTrade({
  fromPlayerId: p1.id,
  toPlayerId: p2.id,
  offeredPropertySteps: [1],
  offeredCash: cashNeeded,
  requestedPropertySteps: [3],
  requestedCash: 0
});

console.log('Fair offer response:', fairOffer);
if (!fairOffer.success) {
  throw new Error('Expected AI to accept fair offer: ' + fairOffer.message);
}

const afterState = engine.getState();
const afterP1 = afterState.players.find(p => p.id === p1.id)!;
const afterP2 = afterState.players.find(p => p.id === p2.id)!;

console.log(`After Trade: P1 owns [${afterP1.ownedPropertyIds}], Bal: ₹${afterP1.balance}`);
console.log(`After Trade: P2 owns [${afterP2.ownedPropertyIds}], Bal: ₹${afterP2.balance}`);

if (!afterP1.ownedPropertyIds?.includes(3) || afterP1.ownedPropertyIds?.includes(1)) {
  throw new Error('P1 property swap failed!');
}
if (!afterP2.ownedPropertyIds?.includes(1) || afterP2.ownedPropertyIds?.includes(3)) {
  throw new Error('P2 property swap failed!');
}
if (afterP1.balance !== 5000 - cashNeeded || afterP2.balance !== 5000 + cashNeeded) {
  throw new Error('Cash balances incorrect after trade!');
}

console.log('✔ Passed: Fair trade executed and properties/cash transferred correctly!');
console.log('=== TRADE ENGINE VERIFICATION COMPLETE ===');
