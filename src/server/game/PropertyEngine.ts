import {
  BOARD_TILES,
  BoardTileStep,
  getPropertyRentSchedule,
  PORT_RENT_SCHEDULE,
  getHouseCostByStep
} from '../../shared/game-data/boardData';
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

  public static getBaseRent(price: number | null, color?: string | null): number {
    if (!price || price <= 0) return 0;
    if (color) {
      return getPropertyRentSchedule(color).siteRent;
    }
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

    if (tile.type === 'PORT') {
      const portSteps = BOARD_TILES.filter((t) => t.type === 'PORT').map((t) => t.step);
      const ownedCount = portSteps.filter((s) => {
        const p = properties.get(s.toString());
        return p && p.ownerId === prop.ownerId && !p.isMortgaged;
      }).length;

      if (ownedCount === 1) return PORT_RENT_SCHEDULE.rent1Port;
      if (ownedCount === 2) return PORT_RENT_SCHEDULE.rent2Ports;
      if (ownedCount >= 3) return PORT_RENT_SCHEDULE.rent3Ports;
      return PORT_RENT_SCHEDULE.rent1Port;
    }

    const schedule = getPropertyRentSchedule(tile.color || step);
    const monopoly = this.hasMonopoly(prop.ownerId, tile.color, properties);

    if (prop.houses === 0) {
      return monopoly ? schedule.monopolyRent : schedule.siteRent;
    }
    if (prop.houses === 1) return schedule.rent1House;
    if (prop.houses === 2) return schedule.rent2Houses;
    if (prop.houses === 3) return schedule.rent3Houses;
    if (prop.houses === 4) return schedule.rent4Houses;
    if (prop.houses === 5) return schedule.rentHotel;

    return schedule.siteRent;
  }

  public static getHouseCost(step: number): number {
    return getHouseCostByStep(step);
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
