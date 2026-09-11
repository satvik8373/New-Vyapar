import Phaser from 'phaser';
import { PlayerData } from '@shared/types/player';

export class PlayerToken {
  private scene: Phaser.Scene;
  private playerData: PlayerData;
  private playerIndex: number;
  private container: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Graphics;
  private bodyGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private activeGlow: Phaser.GameObjects.Graphics;
  private idleTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, playerData: PlayerData, playerIndex: number, initialX: number, initialY: number) {
    this.scene = scene;
    this.playerData = playerData;
    this.playerIndex = playerIndex;
    this.container = this.scene.add.container(initialX, initialY);
    this.container.setDepth(20 + playerIndex);

    // 1. Soft Warm Shadow
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0xc5b8a5, 0.5);
    this.shadow.fillEllipse(0, 14, 26, 11);
    this.container.add(this.shadow);

    // 2. Active Pulse Ring
    this.activeGlow = this.scene.add.graphics();
    this.activeGlow.lineStyle(3, 0xffa502, 1);
    this.activeGlow.strokeCircle(0, 0, 18);
    this.activeGlow.setVisible(false);
    this.container.add(this.activeGlow);

    // 3. Cute Candy Token Disc
    this.bodyGraphics = this.scene.add.graphics();
    this.renderCandyToken();
    this.container.add(this.bodyGraphics);

    // 4. Center Initial / Number (Clean, no emoji)
    const tokenLabel = String(playerIndex + 1);
    this.labelText = this.scene.add.text(0, 0, tokenLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(this.labelText);
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public getPlayerData(): PlayerData {
    return this.playerData;
  }

  public getPlayerIndex(): number {
    return this.playerIndex;
  }

  private renderCandyToken(): void {
    const colorHex = this.playerData.tokenColorHex;

    // 3D Bottom Bevel
    this.bodyGraphics.fillStyle(0x334155, 0.2);
    this.bodyGraphics.fillCircle(0, 2.5, 14.5);

    // Solid Candy Disc Body
    this.bodyGraphics.fillStyle(colorHex, 1);
    this.bodyGraphics.fillCircle(0, 0, 14);

    // Crisp White Rim
    this.bodyGraphics.lineStyle(2, 0xffffff, 1);
    this.bodyGraphics.strokeCircle(0, 0, 13);
  }

  public setActiveTurn(isActive: boolean): void {
    this.activeGlow.setVisible(isActive);
    if (isActive) {
      if (!this.idleTween) {
        this.idleTween = this.scene.tweens.add({
          targets: this.container,
          y: '-=6',
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      if (this.idleTween) {
        this.idleTween.stop();
        this.idleTween = null;
      }
    }
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
}
