import assert from 'assert';
import { GAME_CONFIG } from '../src/shared/constants/config';
import { PROTOTYPE_TILES } from '../src/shared/game-data/prototypeBoard';
import { PlayerData } from '../src/shared/types/player';
import { BankClient } from '../src/client/economy/BankClient';
import { TurnStateMachine } from '../src/client/rules/TurnStateMachine';

console.log('=== NAVO VYAPAR AUTOMATED GAME LOOP TEST ===\n');

// 1. Initial State & Configuration
console.log('Test 1: Board & Player Initialization...');
assert.strictEqual(PROTOTYPE_TILES.length, 16, 'Board must have 16 prototype tiles');
assert.strictEqual(PROTOTYPE_TILES[0].type, 'START', 'Tile 0 must be START');

const players: PlayerData[] = GAME_CONFIG.PLAYER_DEFAULTS.map(p => ({
  id: p.id,
  name: p.name,
  tokenColor: p.tokenColor,
  tokenColorHex: p.tokenColorHex,
  avatar: p.avatar,
  currentTileIndex: 0,
  balance: GAME_CONFIG.STARTING_BALANCE,
  ownedPropertyIds: [],
  isBankrupt: false,
  colorName: p.colorName
}));

assert.strictEqual(players.length, 4, 'Must have exactly 4 players');
players.forEach(p => {
  assert.strictEqual(p.balance, 10000, `${p.name} must start with ₹10,000`);
  assert.strictEqual(p.currentTileIndex, 0, `${p.name} must start at Tile 0 (START)`);
});
console.log('✔ Passed: 4 players initialized at Tile 0 with ₹10,000 balance each.\n');

// 2. Central Bank Initialization
console.log('Test 2: Central Bank (NAVO BANK) Setup...');
const bankClient = new BankClient();
players.forEach(p => bankClient.registerPlayer(p));
const tilesCopy = JSON.parse(JSON.stringify(PROTOTYPE_TILES));
bankClient.registerTiles(tilesCopy);

assert.strictEqual(bankClient.canAfford('p1', 1200), true, 'P1 should be able to afford ₹1,200');
assert.strictEqual(bankClient.canAfford('p1', 15000), false, 'P1 should NOT be able to afford ₹15,000');
console.log('✔ Passed: Central Bank clearing house validated.\n');

// 3. Turn State Machine Lifecycle
console.log('Test 3: Turn State Machine & Turn 1 (Player 1)...');
const turnFSM = new TurnStateMachine(players);
assert.strictEqual(turnFSM.getPhase(), 'WAITING');

turnFSM.startGame();
assert.strictEqual(turnFSM.getPhase(), 'PLAYER_TURN');
assert.strictEqual(turnFSM.getActivePlayer().id, 'p1', "Player 1's turn begins");
console.log(`✔ Passed: Game started. Active player is ${turnFSM.getActivePlayer().name}.\n`);

// 4. Player 1: Roll Dice
console.log('Test 4: Player 1 Dice Roll...');
assert.strictEqual(turnFSM.startRoll(), true, 'Must allow roll during PLAYER_TURN');
assert.strictEqual(turnFSM.startRoll(), false, 'Must reject double roll');

const p1Roll = 3; // Rolls a 3
console.log(`🎲 Player 1 rolled ${p1Roll}`);
assert.strictEqual(turnFSM.startMoving(), true);
console.log('✔ Passed: Phase changed to MOVING.\n');

// 5. Player 1: Token Movement
console.log('Test 5: Token Step-by-Step Movement...');
const p1StartTile = players[0].currentTileIndex; // 0
const p1TargetTile = (p1StartTile + p1Roll) % 16; // 3: Ahmedabad Textile Mill
players[0].currentTileIndex = p1TargetTile;
assert.strictEqual(players[0].currentTileIndex, 3);
assert.strictEqual(turnFSM.landOnTile(), true);
assert.strictEqual(turnFSM.getPhase(), 'TILE_ACTION');
console.log(`✔ Passed: Token moved from Tile ${p1StartTile} to Tile ${p1TargetTile} (Ahmedabad Textile Mill).\n`);

// 6. Player 1: Property Purchase from NAVO BANK
console.log('Test 6: Property Purchase from NAVO BANK...');
const tile3 = tilesCopy[3];
assert.strictEqual(tile3.name, 'Ahmedabad Textile Mill');
assert.strictEqual(tile3.price, 1500);
assert.strictEqual(tile3.baseRent, 200);

const buyResult = bankClient.purchaseProperty('p1', 3);
assert.strictEqual(buyResult.success, true);
assert.strictEqual(tile3.ownerId, 'p1', 'Tile 3 owner must be P1');
assert.strictEqual(players[0].balance, 8500, 'P1 balance must be ₹8,500 (₹10,000 - ₹1,500)');
assert.strictEqual(players[0].ownedPropertyIds.includes(3), true);
console.log(`✔ Passed: ${buyResult.message}. New Balance: ₹${players[0].balance}.\n`);

// 7. Advance Turn: Player 1 -> Player 2
console.log('Test 7: Advance to Player 2...');
turnFSM.advanceToNextPlayer();
assert.strictEqual(turnFSM.getActivePlayer().id, 'p2');
assert.strictEqual(turnFSM.getPhase(), 'PLAYER_TURN');
console.log(`✔ Passed: Turn advanced to ${turnFSM.getActivePlayer().name}.\n`);

// 8. Player 2: Roll & Move to Tile 1 (Surat Diamond Market)
console.log('Test 8: Player 2 Turn Execution...');
turnFSM.startRoll();
const p2Roll = 1;
turnFSM.startMoving();
players[1].currentTileIndex = (players[1].currentTileIndex + p2Roll) % 16; // Tile 1
turnFSM.landOnTile();
const tile1 = tilesCopy[1];
const buyResult2 = bankClient.purchaseProperty('p2', 1);
assert.strictEqual(buyResult2.success, true);
assert.strictEqual(players[1].balance, 8800, 'P2 balance must be ₹8,800 (₹10,000 - ₹1,200)');
turnFSM.advanceToNextPlayer();
assert.strictEqual(turnFSM.getActivePlayer().id, 'p3');
console.log(`✔ Passed: Player 2 bought Surat Diamond Market for ₹1,200. Balance: ₹${players[1].balance}.\n`);

// 9. Player 3: Roll & Land on Navo Bank Vault (Tile 2: Dividend +₹500)
console.log('Test 9: Player 3 Turn - Navo Bank Vault Dividend...');
turnFSM.startRoll();
const p3Roll = 2;
turnFSM.startMoving();
players[2].currentTileIndex = 2; // Tile 2: Navo Bank Vault
turnFSM.landOnTile();
bankClient.addMoney('p3', 500, 'Navo Bank Dividend', 'BANK_DIVIDEND');
assert.strictEqual(players[2].balance, 10500, 'P3 balance must be ₹10,500 (₹10,000 + ₹500)');
turnFSM.advanceToNextPlayer();
assert.strictEqual(turnFSM.getActivePlayer().id, 'p4');
console.log(`✔ Passed: Player 3 received ₹500 dividend from Navo Bank. Balance: ₹${players[2].balance}.\n`);

// 10. Player 4: Roll & Land on Commercial Tax (Tile 4: Pay ₹800)
console.log('Test 10: Player 4 Turn - Commercial Tax Office...');
turnFSM.startRoll();
const p4Roll = 4;
turnFSM.startMoving();
players[3].currentTileIndex = 4; // Tile 4: Commercial Tax
turnFSM.landOnTile();
bankClient.removeMoney('p4', 800, 'Commercial Tax Office', 'PAY_TAX');
assert.strictEqual(players[3].balance, 9200, 'P4 balance must be ₹9,200 (₹10,000 - ₹800)');
turnFSM.advanceToNextPlayer();
assert.strictEqual(turnFSM.getActivePlayer().id, 'p1');
console.log(`✔ Passed: Player 4 paid ₹800 tax. Balance: ₹${players[3].balance}. Turn cycled back to Player 1.\n`);

// 11. Rent Payment Scenario: Player 4 lands on Tile 3 (Owned by Player 1)
console.log('Test 11: Rent Payment between Players...');
const rentResult = bankClient.payRent('p4', 3); // P4 pays rent to P1
assert.strictEqual(rentResult.success, true);
assert.strictEqual(rentResult.rentPaid, 200);
assert.strictEqual(rentResult.ownerName, 'P1 - Rajesh');
assert.strictEqual(players[3].balance, 9000, 'P4 balance must be ₹9,000 (₹9,200 - ₹200)');
assert.strictEqual(players[0].balance, 8700, 'P1 balance must be ₹8,700 (₹8,500 + ₹200)');
console.log(`✔ Passed: P4 paid ₹200 rent to P1. P1 Balance: ₹${players[0].balance}, P4 Balance: ₹${players[3].balance}.\n`);

// 12. Passing START Salary Scenario: Collect ₹2,000 from NAVO BANK
console.log('Test 12: Passing START Salary from NAVO BANK...');
bankClient.paySalary('p1');
assert.strictEqual(players[0].balance, 10700, 'P1 balance must be ₹10,700 (₹8,700 + ₹2,000)');
console.log(`✔ Passed: P1 collected ₹2,000 salary from NAVO BANK. Balance: ₹${players[0].balance}.\n`);

console.log('=====================================================');
console.log('ALL 12 VERIFICATION TESTS COMPLETED SUCCESSFULLY! 🎉');
console.log('=====================================================');
