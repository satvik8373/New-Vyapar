import { GameState, TurnPhase } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';

export class TurnEngine {
  /**
   * Returns list of players ordered by turnOrder
   */
  public static getOrderedPlayers(state: GameState): PlayerState[] {
    const players: PlayerState[] = [];
    state.players.forEach((p) => players.push(p));
    return players.sort((a, b) => a.turnOrder - b.turnOrder);
  }

  /**
   * Returns the current active player
   */
  public static getActivePlayer(state: GameState): PlayerState | undefined {
    return state.players.get(state.currentPlayerId);
  }

  /**
   * Advances turn to the next non-bankrupt player
   */
  public static advanceTurn(state: GameState): PlayerState | undefined {
    const ordered = this.getOrderedPlayers(state);
    if (ordered.length === 0) return undefined;

    // Filter out active non-bankrupt players
    const activeCandidates = ordered.filter((p) => !p.isBankrupt);
    if (activeCandidates.length <= 1) {
      // Game over or single player remaining
      state.phase = 'finished';
      if (activeCandidates.length === 1) {
        state.winner = activeCandidates[0].id;
        state.statusMessage = `Game Finished! Winner: ${activeCandidates[0].name} 🏆`;
      }
      return undefined;
    }

    let nextIndex = (state.turnIndex + 1) % ordered.length;
    let attempts = 0;
    while (ordered[nextIndex].isBankrupt && attempts < ordered.length) {
      nextIndex = (nextIndex + 1) % ordered.length;
      attempts++;
    }

    state.turnIndex = nextIndex;
    state.turnNumber += 1;
    const nextPlayer = ordered[nextIndex];
    state.currentPlayerId = nextPlayer.id;
    state.turnPhase = 'waiting';
    state.selectedTileStep = -1;
    state.activeCardId = '';
    state.statusMessage = `${nextPlayer.name}'s turn.`;

    return nextPlayer;
  }
}
