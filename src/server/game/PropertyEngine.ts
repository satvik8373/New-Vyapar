import { BOARD_TILES, BoardTileStep } from '../../shared/game-data/boardData';
import { PropertyState } from '../state/PropertyState';
import { MapSchema } from '@colyseus/schema';

export class PropertyEngine {
  public static getTile(step: number): BoardTileStep | undefined {
    return BOARD_TILES.find((t) => t.step === step);
  }

  public static getColorGroupSteps(color: string): number[] {
    return BOARD_TILES
      .filter((t) => t.color === color && (t.type === 'PROPERTY' || t.type === 'PORT'))
      .map((t) => t.step);
  }

  public static getBaseRent(price: number | null): number {
    if (!price || price <= 0) return 0;
    // Standard Navo Vyapar base rent is 10% of purchase price rounded
    return Math.max(50, Math.round(price * 0.10));
  }

  public static hasMonopoly(
    playerId: string,
    color: string | null,
    properties: MapSchema<PropertyState>
  ): boolean {
    if (!color) return false;
    const group = this.getColorGroupSteps(color);
    if (!group || group.length === 0) return false;

    return group.every((step) => {
      const prop = properties.get(step.toString());
      return prop && prop.ownerId === playerId && !prop.isMortgaged;
    });
  }

  public static calculateRent(
    step: number,
    properties: MapSchema<PropertyState>
  ): number {
    const tile = this.getTile(step);
    if (!tile || !tile.price) return 0;

    const prop = properties.get(step.toString());
    if (!prop || !prop.ownerId || prop.isMortgaged) return 0;

    const base = this.getBaseRent(tile.price);
    const monopoly = this.hasMonopoly(prop.ownerId, tile.color, properties);

    if (prop.houses === 0) {
      return monopoly ? base * 2 : base;
    }

    // House multiplier: 1 house = 3x, 2 = 6x, 3 = 9x, 4 = 12x
    const multiplier = 3 * prop.houses;
    return base * multiplier;
  }

  public static getMortgageValue(price: number | null): number {
    if (!price) return 0;
    return Math.floor(price * 0.5);
  }

  public static getUnmortgageCost(price: number | null): number {
    if (!price) return 0;
    return Math.floor(price * 0.55); // 50% + 10% interest
  }
}
