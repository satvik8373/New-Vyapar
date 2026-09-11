import { SERVER_CHANCE_CARDS, ServerChanceCard } from './GameConfig';

export class CardEngine {
  private deck: ServerChanceCard[] = [];

  constructor() {
    this.resetDeck();
  }

  public resetDeck(): void {
    this.deck = [...SERVER_CHANCE_CARDS].sort(() => Math.random() - 0.5);
  }

  public draw(): ServerChanceCard {
    if (this.deck.length === 0) {
      this.resetDeck();
    }
    return this.deck.pop()!;
  }

  public getCardById(id: string): ServerChanceCard | undefined {
    return SERVER_CHANCE_CARDS.find((c) => c.id === id);
  }
}
