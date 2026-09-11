import Phaser from 'phaser';
import { TileData } from '@shared/types/board';
import { GAME_CONFIG } from '@shared/constants/config';

export type TileOrientation =
  | 'bottom' | 'top' | 'left' | 'right'
  | 'corner-bl' | 'corner-br' | 'corner-tr' | 'corner-tl';

export interface TileBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isCorner: boolean;
  orientation: TileOrientation;
}

/**
 * TileRenderer — transparent interactive overlay on top of the candy board image.
 *
 * Since the candy board image is the complete visual background, tiles are:
 * - Fully TRANSPARENT normally (showing the candy image underneath)
 * - Soft highlight glow on hover
 * - Show only: ownership chip, price (if no price label visible), active pulse
 *
 * The candy image already shows: tile name, landmark icon, price, colors.
 * We add: player tokens (via GameScene), ownership ribbon & chip, hover glow.
 */
export class TileRenderer {
  private scene: Phaser.Scene;
  private tileData: TileData;
  private bounds: TileBounds;
  private container: Phaser.GameObjects.Container;
  private ownerRibbon: Phaser.GameObjects.Graphics | null = null;
  private ownerChip: Phaser.GameObjects.Graphics | null = null;
  private ownerChipText: Phaser.GameObjects.Text | null = null;
  private hoverZone: Phaser.GameObjects.Zone | null = null;

  constructor(scene: Phaser.Scene, tileData: TileData, bounds: TileBounds) {
    this.scene = scene;
    this.tileData = tileData;
    this.bounds = bounds;
    this.container = this.scene.add.container(bounds.x, bounds.y);
    this.container.setDepth(5);
    this.render();
  }

  public getBounds(): TileBounds { return this.bounds; }
  public getTileData(): TileData { return this.tileData; }
  public getContainer(): Phaser.GameObjects.Container { return this.container; }

  private render(): void {
    const { width, height } = this.bounds;

    // ── Invisible interactive zone ────────────────────────────────────────
    // The tile is transparent — the candy board image shows through.
    // We ONLY add a hover glow — we don't block the center board area.

    const hoverG = this.scene.add.graphics();
    hoverG.setDepth(6);

    // Create an interactive Rectangle on the container
    // The Zone covers exactly the tile bounds — not the center board area
    const hitZone = this.scene.add.zone(width / 2, height / 2, width - 2, height - 2)
      .setInteractive({ useHandCursor: false });

    hitZone.on('pointerover', () => {
      hoverG.clear();
      hoverG.lineStyle(3, 0xffd700, 0.9);
      hoverG.strokeRect(1, 1, width - 2, height - 2);
      hoverG.fillStyle(0xffd700, 0.07);
      hoverG.fillRect(1, 1, width - 2, height - 2);
    });

    hitZone.on('pointerout', () => {
      hoverG.clear();
    });

    this.hoverZone = hitZone;
    this.container.add([hitZone, hoverG]);
  }

  /**
   * Called when a player buys this property.
   * Adds a colored ownership ribbon at the inner edge + player initials chip.
   */
  public updateOwner(ownerId: string | null, ownerColor: string, ownerName: string): void {
    // Clear previous owner indicators
    if (this.ownerRibbon) { this.ownerRibbon.destroy(); this.ownerRibbon = null; }
    if (this.ownerChip) { this.ownerChip.destroy(); this.ownerChip = null; }
    if (this.ownerChipText) { this.ownerChipText.destroy(); this.ownerChipText = null; }

    if (!ownerId) return;

    const { width, height, isCorner, orientation } = this.bounds;
    const color = Phaser.Display.Color.HexStringToColor(ownerColor).color;

    // ── Ownership ribbon: thick colored bar at the inner edge of the tile ──
    const ribbon = this.scene.add.graphics();
    ribbon.fillStyle(color, 1);

    const ribbonThick = isCorner ? 8 : 6;
    if (orientation === 'bottom') {
      ribbon.fillRect(0, 0, width, ribbonThick); // top edge (faces board interior)
    } else if (orientation === 'top') {
      ribbon.fillRect(0, height - ribbonThick, width, ribbonThick); // bottom edge
    } else if (orientation === 'right') {
      ribbon.fillRect(0, 0, ribbonThick, height); // left edge
    } else if (orientation === 'left') {
      ribbon.fillRect(width - ribbonThick, 0, ribbonThick, height); // right edge
    } else {
      // Corners: top + left ribbon (L-shape from interior corner)
      ribbon.fillRect(0, 0, width, ribbonThick);
      ribbon.fillRect(0, 0, ribbonThick, height);
    }

    // ── Ownership chip: colored circle with player initials at tile center ─
    const cx = width / 2;
    const cy = height / 2;
    const chipR = isCorner ? 14 : 12;

    const chip = this.scene.add.graphics();
    chip.fillStyle(color, 1);
    chip.fillCircle(cx, cy, chipR);
    chip.lineStyle(2.5, 0xffffff, 1);
    chip.strokeCircle(cx, cy, chipR);

    const initials = ownerName.slice(0, 2).toUpperCase();
    const chipTxt = this.scene.add.text(cx, cy, initials, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: isCorner ? '11px' : '9px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.container.add([ribbon, chip, chipTxt]);
    this.ownerRibbon = ribbon;
    this.ownerChip = chip;
    this.ownerChipText = chipTxt;
  }
}
