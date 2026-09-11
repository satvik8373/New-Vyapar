import Phaser from 'phaser';
import { TileData } from '@shared/types/board';
import { TileRenderer, TileBounds } from './TileRenderer';

/**
 * BoardRenderer — Renders the Navo Vyapar candy board.
 *
 * Architecture:
 * 1. The `board_candy_theme.jpg` image (1024×1024) is the COMPLETE visual board.
 *    It is scaled to fill the entire 880×880 Phaser canvas.
 * 2. Game tile hit-zones are transparent overlays mapped to the candy image regions.
 * 3. Ownership chips, price labels, and player tokens are layered on top.
 *
 * Candy board pixel mapping (in 1024-px source space):
 *   Wooden frame border: ~40px each side
 *   Corner tile size: ~145×160px
 *   Edge tiles: 6 per side × ~110px wide (or tall) = 660px
 *   Our 16-tile game uses 3 edge tiles per side (each covering ~220px source pixels)
 *
 * At display scale (1024→880): scale = 880/1024 = 0.859375
 *   Frame: ~34px | Corner: ~125px | EdgeTile: ~189px | Board: 880px
 */

// ── Candy board geometry constants (in display-space pixels) ──────────────
const BOARD_PX = 880;          // Full canvas size
const FRAME = 34;              // Wooden frame border
const CORNER = 125;            // Corner tile size
const EDGE = (BOARD_PX - 2 * FRAME - 2 * CORNER) / 3; // ≈ 189px per edge tile

export class BoardRenderer {
  private scene: Phaser.Scene;
  private tiles: TileData[];
  private tileRenderers: Map<number, TileRenderer> = new Map();
  private boardContainer: Phaser.GameObjects.Container;
  private boardWidth: number = BOARD_PX;
  private boardHeight: number = BOARD_PX;
  private originX: number;
  private originY: number;

  constructor(scene: Phaser.Scene, tiles: TileData[], centerX: number, centerY: number) {
    this.scene = scene;
    this.tiles = tiles;
    this.originX = centerX - this.boardWidth / 2;
    this.originY = centerY - this.boardHeight / 2;
    this.boardContainer = this.scene.add.container(this.originX, this.originY);
    this.renderCandyBoardFull();
    this.renderTiles();
  }

  public getBoardContainer(): Phaser.GameObjects.Container {
    return this.boardContainer;
  }

  public getTileRenderer(tileId: number): TileRenderer | undefined {
    return this.tileRenderers.get(tileId);
  }

  public getTokenPosition(tileIndex: number, playerIndex: number): { x: number; y: number } {
    const tileRenderer = this.tileRenderers.get(tileIndex);
    if (!tileRenderer) {
      return { x: this.originX + FRAME + CORNER / 2, y: this.originY + BOARD_PX - FRAME - CORNER / 2 };
    }

    const bounds = tileRenderer.getBounds();
    // Tight 4-player offsets within each tile
    const offsets = [
      { dx: -22, dy: -20 },
      { dx: 22, dy: -20 },
      { dx: -22, dy: 20 },
      { dx: 22, dy: 20 }
    ];
    const offset = offsets[playerIndex % offsets.length];

    return {
      x: this.originX + bounds.centerX + offset.dx,
      y: this.originY + bounds.centerY + offset.dy
    };
  }

  /**
   * Render the full candy board image as the complete visual board.
   * The image fills the entire 880×880 canvas — no extra background needed.
   */
  private renderCandyBoardFull(): void {
    if (this.scene.textures.exists('board_candy_theme')) {
      const board = this.scene.add.image(BOARD_PX / 2, BOARD_PX / 2, 'board_candy_theme');
      // Scale from 1024×1024 source to 880×880 display
      board.setDisplaySize(BOARD_PX, BOARD_PX);
      board.setDepth(0);
      this.boardContainer.add(board);
    } else {
      // Fallback: cream background
      const fallback = this.scene.add.graphics();
      fallback.fillStyle(0xf5f0e8, 1);
      fallback.fillRect(0, 0, BOARD_PX, BOARD_PX);
      this.boardContainer.add(fallback);
    }
  }

  /**
   * Build the 16 transparent game-tile overlays mapped to the candy board image regions.
   *
   * Tile layout (positions are in display-space, relative to board origin):
   *
   *   Tile 0  (START, BL corner):  x=FRAME,               y=BOARD_PX-FRAME-CORNER
   *   Tile 1  (bottom row 1):      x=FRAME+CORNER,         y=BOARD_PX-FRAME-CORNER
   *   Tile 2  (bottom row 2):      x=FRAME+CORNER+EDGE,    y=BOARD_PX-FRAME-CORNER
   *   Tile 3  (bottom row 3):      x=FRAME+CORNER+EDGE*2,  y=BOARD_PX-FRAME-CORNER
   *   Tile 4  (BR corner):         x=BOARD_PX-FRAME-CORNER,y=BOARD_PX-FRAME-CORNER
   *   Tile 5  (right col 1):       x=BOARD_PX-FRAME-CORNER,y=BOARD_PX-FRAME-CORNER-EDGE
   *   Tile 6  (right col 2):       x=BOARD_PX-FRAME-CORNER,y=BOARD_PX-FRAME-CORNER-EDGE*2
   *   Tile 7  (right col 3):       x=BOARD_PX-FRAME-CORNER,y=BOARD_PX-FRAME-CORNER-EDGE*3
   *   Tile 8  (TR corner):         x=BOARD_PX-FRAME-CORNER,y=FRAME
   *   Tile 9  (top row 1):         x=BOARD_PX-FRAME-CORNER-EDGE,   y=FRAME
   *   Tile 10 (top row 2):         x=BOARD_PX-FRAME-CORNER-EDGE*2, y=FRAME
   *   Tile 11 (top row 3):         x=BOARD_PX-FRAME-CORNER-EDGE*3, y=FRAME
   *   Tile 12 (TL corner):         x=FRAME,                y=FRAME
   *   Tile 13 (left col 1):        x=FRAME,                y=FRAME+CORNER
   *   Tile 14 (left col 2):        x=FRAME,                y=FRAME+CORNER+EDGE
   *   Tile 15 (left col 3):        x=FRAME,                y=FRAME+CORNER+EDGE*2
   */
  private renderTiles(): void {
    const B = BOARD_PX;
    const F = FRAME;
    const C = CORNER;
    const E = EDGE;

    const boundsList: TileBounds[] = [];

    // ── TILE 0: Bottom-Left Corner (START / GO) ───────────────────────────
    boundsList[0] = {
      x: F, y: B - F - C,
      width: C, height: C,
      centerX: F + C / 2, centerY: B - F - C / 2,
      isCorner: true, orientation: 'corner-bl'
    };

    // ── TILES 1–3: Bottom Row (left → right) ─────────────────────────────
    for (let i = 0; i < 3; i++) {
      const tx = F + C + i * E;
      boundsList[1 + i] = {
        x: tx, y: B - F - C,
        width: E, height: C,
        centerX: tx + E / 2, centerY: B - F - C / 2,
        isCorner: false, orientation: 'bottom'
      };
    }

    // ── TILE 4: Bottom-Right Corner ───────────────────────────────────────
    boundsList[4] = {
      x: B - F - C, y: B - F - C,
      width: C, height: C,
      centerX: B - F - C / 2, centerY: B - F - C / 2,
      isCorner: true, orientation: 'corner-br'
    };

    // ── TILES 5–7: Right Column (bottom → top) ────────────────────────────
    for (let i = 0; i < 3; i++) {
      const ty = B - F - C - (i + 1) * E;
      boundsList[5 + i] = {
        x: B - F - C, y: ty,
        width: C, height: E,
        centerX: B - F - C / 2, centerY: ty + E / 2,
        isCorner: false, orientation: 'right'
      };
    }

    // ── TILE 8: Top-Right Corner ──────────────────────────────────────────
    boundsList[8] = {
      x: B - F - C, y: F,
      width: C, height: C,
      centerX: B - F - C / 2, centerY: F + C / 2,
      isCorner: true, orientation: 'corner-tr'
    };

    // ── TILES 9–11: Top Row (right → left) ───────────────────────────────
    for (let i = 0; i < 3; i++) {
      const tx = B - F - C - (i + 1) * E;
      boundsList[9 + i] = {
        x: tx, y: F,
        width: E, height: C,
        centerX: tx + E / 2, centerY: F + C / 2,
        isCorner: false, orientation: 'top'
      };
    }

    // ── TILE 12: Top-Left Corner ──────────────────────────────────────────
    boundsList[12] = {
      x: F, y: F,
      width: C, height: C,
      centerX: F + C / 2, centerY: F + C / 2,
      isCorner: true, orientation: 'corner-tl'
    };

    // ── TILES 13–15: Left Column (top → bottom) ───────────────────────────
    for (let i = 0; i < 3; i++) {
      const ty = F + C + i * E;
      boundsList[13 + i] = {
        x: F, y: ty,
        width: C, height: E,
        centerX: F + C / 2, centerY: ty + E / 2,
        isCorner: false, orientation: 'left'
      };
    }

    this.tiles.forEach(tile => {
      const b = boundsList[tile.position];
      if (b) {
        const tr = new TileRenderer(this.scene, tile, b);
        this.boardContainer.add(tr.getContainer());
        this.tileRenderers.set(tile.position, tr);
      }
    });
  }

  public updatePropertyOwner(tileId: number, ownerId: string | null, ownerColor: string, ownerName: string): void {
    const tr = this.tileRenderers.get(tileId);
    if (tr) {
      tr.updateOwner(ownerId, ownerColor, ownerName);
    }
  }
}
