import Phaser from 'phaser';
import { SoundEffects } from '../audio/SoundEffects';
import { GAME_CONFIG } from '@shared/constants/config';

export interface DiceRollCallback {
  (result: number): void;
}

export class DiceRenderer {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private diceBody: Phaser.GameObjects.Graphics;
  private pipsGraphics: Phaser.GameObjects.Graphics;
  private shadow: Phaser.GameObjects.Graphics;
  private isRolling: boolean = false;
  private isEnabled: boolean = false;
  private soundEffects: SoundEffects;
  private onRollCompleteCallback: DiceRollCallback | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.soundEffects = SoundEffects.getInstance();
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(30);

    // 1. Soft Warm Shadow for Dice
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0xd5cbbe, 0.6);
    this.shadow.fillEllipse(0, 32, 54, 18);
    this.container.add(this.shadow);

    // 2. Dice Cube Body & Pips
    this.diceBody = this.scene.add.graphics();
    this.pipsGraphics = this.scene.add.graphics();
    this.container.add([this.diceBody, this.pipsGraphics]);

    this.renderDiceFace(1);
    this.setupInteractions();
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public onRollComplete(cb: DiceRollCallback): void {
    this.onRollCompleteCallback = cb;
  }

  public setRollEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  private setupInteractions(): void {
    // Clickable dice cube
    this.diceBody.setInteractive(
      new Phaser.Geom.Rectangle(-28, -28, 56, 56),
      Phaser.Geom.Rectangle.Contains
    );
    this.diceBody.on('pointerdown', () => {
      if (this.isEnabled && !this.isRolling) {
        this.roll();
      }
    });

    this.scene.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isEnabled && !this.isRolling) {
        this.roll();
      }
    });
  }

  private renderDiceFace(value: number): void {
    this.diceBody.clear();
    this.pipsGraphics.clear();

    const size = 52;
    const half = size / 2;

    // 1. Cute 3D Bottom Bevel
    this.diceBody.fillStyle(0xe5ded3, 1);
    this.diceBody.fillRoundedRect(-half, -half + 3.5, size, size, 12);

    // 2. Pure Crisp White Dice Surface
    this.diceBody.fillStyle(0xffffff, 1);
    this.diceBody.fillRoundedRect(-half, -half, size, size, 12);

    // Crisp soft border
    this.diceBody.lineStyle(1.5, 0xeee7de, 1);
    this.diceBody.strokeRoundedRect(-half, -half, size, size, 12);

    // 3. Candy Coral Red or Deep Navy Pips
    const pipColor = value === 1 ? 0xff4757 : 0x1e293b;
    const pipRadius = value === 1 ? 6.5 : 4.5;
    this.pipsGraphics.fillStyle(pipColor, 1);

    const d = 14;
    const posMap: Record<number, [number, number][]> = {
      1: [[0, 0]],
      2: [[-d, -d], [d, d]],
      3: [[-d, -d], [0, 0], [d, d]],
      4: [[-d, -d], [d, -d], [-d, d], [d, d]],
      5: [[-d, -d], [d, -d], [0, 0], [-d, d], [d, d]],
      6: [[-d, -d], [d, -d], [-d, 0], [d, 0], [-d, d], [d, d]]
    };

    const pips = posMap[value] || [[0, 0]];
    pips.forEach(([px, py]) => {
      this.pipsGraphics.fillCircle(px, py, pipRadius);
    });
  }

  public roll(forcedResult?: number): void {
    if (this.isRolling) return;

    this.isRolling = true;
    this.setRollEnabled(false);
    this.soundEffects.playDiceRoll();

    const targetResult = forcedResult ?? Phaser.Math.Between(1, 6);

    const rollDuration = GAME_CONFIG.ANIMATION.DICE_ROLL_DURATION_MS;
    const totalCycles = 12;

    const cycleTimer = this.scene.time.addEvent({
      delay: rollDuration / totalCycles,
      repeat: totalCycles - 1,
      callback: () => {
        const tempFace = Phaser.Math.Between(1, 6);
        this.renderDiceFace(tempFace);
      }
    });

    this.scene.tweens.add({
      targets: [this.diceBody, this.pipsGraphics],
      y: -32,
      angle: 360,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: rollDuration * 0.5,
      yoyo: true,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        cycleTimer.destroy();
        this.renderDiceFace(targetResult);
        this.soundEffects.playDiceLand();

        this.scene.tweens.add({
          targets: [this.diceBody, this.pipsGraphics],
          y: 5,
          scaleX: 1.2,
          scaleY: 0.82,
          duration: 65,
          yoyo: true,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.diceBody.setY(0);
            this.pipsGraphics.setY(0);
            this.diceBody.setScale(1.0);
            this.pipsGraphics.setScale(1.0);
            this.diceBody.setAngle(0);
            this.pipsGraphics.setAngle(0);

            this.isRolling = false;
            if (this.onRollCompleteCallback) {
              this.onRollCompleteCallback(targetResult);
            }
          }
        });
      }
    });
  }
}
