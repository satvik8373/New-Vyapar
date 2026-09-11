import Phaser from 'phaser';
import { PlayerToken } from '../player/PlayerToken';
import { BoardRenderer } from '../board/BoardRenderer';
import { SoundEffects } from '../audio/SoundEffects';
import { GAME_CONFIG } from '@shared/constants/config';

export class TokenAnimator {
  private scene: Phaser.Scene;
  private soundEffects: SoundEffects;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.soundEffects = SoundEffects.getInstance();
  }

  /**
   * Animates a token tile-by-tile along the board perimeter.
   * Does NOT teleport directly.
   */
  public moveTokenSteps(
    token: PlayerToken,
    startTile: number,
    steps: number,
    boardRenderer: BoardRenderer,
    onStepPassed: (tileIndex: number) => void,
    onPassedStart: () => void,
    onComplete: (finalTileIndex: number) => void
  ): void {
    const totalTiles = GAME_CONFIG.TOTAL_TILES;
    const path: number[] = [];
    let current = startTile;

    for (let i = 0; i < steps; i++) {
      current = (current + 1) % totalTiles;
      path.push(current);
    }

    this.executeNextHop(
      token,
      path,
      0,
      boardRenderer,
      onStepPassed,
      onPassedStart,
      () => {
        const finalTile = path[path.length - 1];
        token.getPlayerData().currentTileIndex = finalTile;
        onComplete(finalTile);
      }
    );
  }

  private executeNextHop(
    token: PlayerToken,
    path: number[],
    stepIndex: number,
    boardRenderer: BoardRenderer,
    onStepPassed: (tileIndex: number) => void,
    onPassedStart: () => void,
    onAllComplete: () => void
  ): void {
    if (stepIndex >= path.length) {
      onAllComplete();
      return;
    }

    const tileIdx = path[stepIndex];
    const playerIdx = token.getPlayerIndex();
    const targetPos = boardRenderer.getTokenPosition(tileIdx, playerIdx);
    const container = token.getContainer();

    // Check if player passed or landed on START (tile 0)
    if (tileIdx === 0) {
      onPassedStart();
    }

    const duration = GAME_CONFIG.ANIMATION.TOKEN_HOP_DURATION_MS;
    const startX = container.x;
    const startY = container.y;

    // Linear translation with vertical arc hop
    this.scene.tweens.add({
      targets: container,
      x: targetPos.x,
      y: targetPos.y,
      duration: duration,
      ease: 'Sine.easeInOut',
      onUpdate: (_tween, target) => {
        // Compute parabolic jump arc
        const progress = _tween.progress;
        const arcY = -Math.sin(progress * Math.PI) * GAME_CONFIG.ANIMATION.TOKEN_HOP_HEIGHT_PX;
        target.y = Phaser.Math.Linear(startY, targetPos.y, progress) + arcY;
      },
      onComplete: () => {
        // Step sound effect
        this.soundEffects.playTokenStep();
        onStepPassed(tileIdx);

        // Tactile landing squash & stretch
        this.scene.tweens.add({
          targets: container,
          scaleX: 1.15,
          scaleY: 0.85,
          duration: 45,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => {
            container.setScale(1.0);
            // Delay before taking next step
            this.scene.time.delayedCall(GAME_CONFIG.ANIMATION.STEP_DELAY_MS, () => {
              this.executeNextHop(
                token,
                path,
                stepIndex + 1,
                boardRenderer,
                onStepPassed,
                onPassedStart,
                onAllComplete
              );
            });
          }
        });
      }
    });
  }
}
