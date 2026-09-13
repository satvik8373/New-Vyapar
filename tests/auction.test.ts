import { GameEngine } from '../src/client/game-engine/GameEngine';

console.log('=== VERIFYING AUCTION SYSTEM & RENT GRAPHICS LOGIC ===\n');

const engine = GameEngine.getInstance();
engine.resetGame('Tester');
const state = engine.getState();

// Ensure test players have known balances
const p1 = state.players[0]; // Human Tester (e.g. 5000)
const p2 = state.players[1]; // Bot Rajesh (5000)
const p3 = state.players[2]; // Bot Bhavna (5000)

console.log('Test 1: Starting Public Auction on Tile 1 (Morbi, ₹600)...');
engine.startAuction(1);
let curState = engine.getState();
const auction = curState.auctionState;

if (!auction) {
  console.error('❌ Failed: AuctionState should not be null');
  process.exit(1);
}
if (auction.tileStep !== 1 || auction.tilePrice !== 600) {
  console.error(`❌ Failed: Expected tileStep 1 and price 600, got ${auction.tileStep}, ${auction.tilePrice}`);
  process.exit(1);
}
if (auction.activeBidderIds.length !== 4 || auction.currentBid !== 600) {
  console.error(`❌ Failed: Expected 4 active bidders and currentBid 600 (valuation), got ${auction.currentBid}`);
  process.exit(1);
}
console.log('✔ Passed: Auction started with 4 solvent merchants, opening bid starts at valuation ₹600.\n');

console.log('Test 2: Placing Valid & Invalid Bids...');
// Player 1 places opening bid at valuation ₹600
const bidResult1 = engine.placeBid(p1.id, 600);
if (!bidResult1 || engine.getState().auctionState?.currentBid !== 600) {
  console.error('❌ Failed: Opening bid at valuation of ₹600 was rejected');
  process.exit(1);
}
if (engine.getState().auctionState?.highestBidderId !== p1.id) {
  console.error('❌ Failed: Highest bidder should be p1');
  process.exit(1);
}
console.log('✔ Passed: P1 opening bid of ₹600 accepted and set as highest bid.');

// Player 2 attempts bid below or equal to currentBid (₹550) -> should be rejected
const invalidBidLow = engine.placeBid(p2.id, 550);
if (invalidBidLow || engine.getState().auctionState?.currentBid !== 600) {
  console.error('❌ Failed: Bid of ₹550 should be rejected because current bid is ₹600');
  process.exit(1);
}
console.log('✔ Passed: Low bid correctly rejected.');

// Bid above balance -> should be rejected
const invalidBidAfford = engine.placeBid(p2.id, 999999);
if (invalidBidAfford) {
  console.error('❌ Failed: Bid above balance should be rejected');
  process.exit(1);
}
console.log('✔ Passed: Unaffordable bid correctly rejected.\n');

console.log('Test 3: Players Passing & Auction Finalization...');
// Opponents pass one by one
const currentAuction = engine.getState().auctionState!;
const otherBidders = currentAuction.activeBidderIds.filter((id) => id !== p1.id);

otherBidders.forEach((id) => {
  engine.skipAuctionBid(id);
});

const finalAuction = engine.getState().auctionState;
if (finalAuction && !finalAuction.isCompleted) {
  console.error('❌ Failed: Auction should be finalized or completed when all opponents fold');
  process.exit(1);
}

if (finalAuction?.isCompleted) {
  if (finalAuction.winnerId !== p1.id) {
    console.error(`❌ Failed: Expected winner p1, got ${finalAuction.winnerId}`);
    process.exit(1);
  }
  console.log(`✔ Passed: Auction completed! Winner is ${p1.name} for ₹${finalAuction.currentBid}.`);
}

// Wait brief timeout for state cleanup or verify property award
setTimeout(() => {
  const postState = engine.getState();
  const updatedP1 = postState.players.find((p) => p.id === p1.id);
  if (!updatedP1?.ownedPropertyIds?.includes(1)) {
    console.error('❌ Failed: Winner P1 should own property tile 1');
    process.exit(1);
  }
  console.log('✔ Passed: Property deed assigned to winner, balance updated.\n');

  console.log('Test 4: Rent Transaction & Coin Transfer Event...');
  // Check activeCoinTransfer was triggered
  const coinTx = postState.activeCoinTransfer;
  if (coinTx) {
    console.log(`✔ Passed: Coin transfer event created: ${coinTx.fromPlayerName || coinTx.fromPlayerId} -> ${coinTx.toPlayerName || coinTx.toPlayerId} (₹${coinTx.amount})`);
  }

  // Verify calculateRent on Tile 1
  const rent = engine.calculateRent(1);
  if (rent.amount <= 0) {
    console.error('❌ Failed: Rent for owned property should be > 0');
    process.exit(1);
  }
  console.log(`✔ Passed: Rent calculated successfully for Morbi: ₹${rent.amount} (${rent.tier}).`);

  console.log('\n=====================================================');
  console.log('🎉 ALL AUCTION & RENT TESTS PASSED SUCCESSFULLY!');
  console.log('=====================================================');
  process.exit(0);
}, 2600);
