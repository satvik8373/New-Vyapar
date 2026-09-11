import assert from 'assert';
import { Client } from 'colyseus.js';
import { GameState } from '../src/server/state/GameState';

console.log('=== NAVO VYAPAR COLYSEUS MULTIPLAYER TEST ===\n');

async function runTests() {
  const client1 = new Client('ws://localhost:2567');
  const client2 = new Client('ws://localhost:2567');

  // Test 1: MatchQueue Joining & State Sync
  console.log('Test 1: Joining Matchmaking Queue (Quick Match)...');
  const queue1 = await client1.joinOrCreate('match_queue', { name: 'Satvik', avatar: 'crown' });
  assert.ok(queue1.sessionId, 'Client 1 should have a session ID');

  const queue2 = await client2.joinOrCreate('match_queue', { name: 'Rohan', avatar: 'diamond' });
  assert.ok(queue2.sessionId, 'Client 2 should have a session ID');

  console.log('✔ Passed: 2 players queued in MatchQueue successfully.\n');

  // Wait a moment for queue synchronization
  await new Promise((r) => setTimeout(r, 1500));
  const count = queue1.state.players.size ?? queue1.state.players.length;
  assert.strictEqual(count, 2, 'Queue should have 2 players');
  console.log(`✔ Passed: MatchQueue state synchronized: ${count} players found.\n`);

  // Leave queue
  queue1.leave();
  queue2.leave();

  // Test 2: NavoVyaparRoom Direct Creation & Bot Fill
  console.log('Test 2: Authoritative NavoVyaparRoom Creation & Bot Filling...');
  const room1 = await client1.create<GameState>('navo_vyapar', { name: 'Satvik', avatar: 'crown' });
  assert.ok(room1.sessionId, 'Room 1 created with session ID');

  const room2 = await client2.joinById<GameState>(room1.roomId, { name: 'Rohan', avatar: 'diamond' });
  assert.ok(room2.sessionId, 'Client 2 joined game room');

  // Fill remaining seats with bots & start match
  room1.send('start_game');
  await new Promise((r) => setTimeout(r, 1200));

  assert.strictEqual(room1.state.players.size, 4, 'Room should have exactly 4 players (2 human + 2 bots)');
  assert.strictEqual(room1.state.phase, 'playing', 'Room phase should be "playing"');
  assert.ok(room1.state.boardSeed > 0, `Board seed should be non-zero (received: ${room1.state.boardSeed})`);
  assert.strictEqual(room2.state.boardSeed, room1.state.boardSeed, 'Board seed must be identical across both clients');
  console.log(`✔ Passed: Dynamic match boardSeed synchronized: ${room1.state.boardSeed}\n`);

  let botCount = 0;
  let humanCount = 0;
  room1.state.players.forEach((p) => {
    if (p.isBot) botCount++;
    else humanCount++;
    assert.strictEqual(p.balance, 5000, `${p.name} starts with ₹5,000 balance`);
    assert.strictEqual(p.position, 0, `${p.name} starts at Tile 0 (START)`);
  });

  assert.strictEqual(humanCount, 2, 'Should have 2 human players');
  assert.strictEqual(botCount, 2, 'Should have 2 bot players');
  console.log('✔ Passed: 4-player seat matrix initialized with 2 humans + 2 bots.\n');

  // Test 3: Server-Authoritative Dice Roll & Movement
  console.log('Test 3: Server-Authoritative Turn & Dice Validation...');
  const activeId = room1.state.currentPlayerId;
  const activeClient = room1.sessionId === activeId ? room1 : room2;
  const nonActiveClient = room1.sessionId === activeId ? room2 : room1;

  // Non-active client tries to roll -> Server should reject
  nonActiveClient.send('roll');
  await new Promise((r) => setTimeout(r, 400));
  // Active player rolls
  activeClient.send('roll');
  await new Promise((r) => setTimeout(r, 800));

  assert.ok(room1.state.lastRoll >= 1 && room1.state.lastRoll <= 6, `Last roll (${room1.state.lastRoll}) must be 1..6`);
  const rolledPlayer = room1.state.players.get(activeId);
  assert.ok(rolledPlayer && rolledPlayer.position > 0, `Player should have moved to position ${rolledPlayer?.position}`);
  console.log(`✔ Passed: Server generated roll ${room1.state.lastRoll}, moved ${rolledPlayer?.name} to Tile ${rolledPlayer?.position}.\n`);

  // Test 4: Property Action / Pass & End Turn
  console.log('Test 4: Action & Turn End...');
  if (room1.state.turnPhase === 'action') {
    activeClient.send('pass_property');
    await new Promise((r) => setTimeout(r, 500));
  }
  activeClient.send('end_turn');
  await new Promise((r) => setTimeout(r, 600));

  const newActiveId = room1.state.currentPlayerId;
  assert.notStrictEqual(newActiveId, activeId, 'Turn must advance to the next player');
  console.log(`✔ Passed: Turn advanced to player ${room1.state.players.get(newActiveId)?.name}.\n`);

  // Test 5: Reconnection Token Availability
  console.log('Test 5: Reconnection Token Generation...');
  assert.ok(room1.reconnectionToken, 'Client 1 should possess a reconnection token');
  console.log(`✔ Passed: Reconnection token generated: ${room1.reconnectionToken.slice(0, 12)}...\n`);

  room1.leave();
  room2.leave();
  console.log('🎉 ALL COLYSEUS MULTIPLAYER TESTS PASSED!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
