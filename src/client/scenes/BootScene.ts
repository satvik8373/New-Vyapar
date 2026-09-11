import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.scale;

    // Candy warm progress box
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0xfef3c7, 1);
    progressBox.fillRoundedRect(width / 2 - 180, height / 2 - 20, 360, 40, 14);
    progressBox.lineStyle(2, 0xfbbf24, 1);
    progressBox.strokeRoundedRect(width / 2 - 180, height / 2 - 20, 360, 40, 14);

    const loadingText = this.add.text(width / 2, height / 2 - 56, 'NAVO VYAPAR', {
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#d97706'
    }).setOrigin(0.5);

    const subText = this.add.text(width / 2, height / 2 + 40, 'Loading Gujarat Trade Board...', {
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      fontSize: '14px',
      color: '#92400e'
    }).setOrigin(0.5);

    // ── Preload all Graphical Game Assets ──────────────────────────────────
    // Center board medallion artwork
    this.load.image('board_center_art', '/assets/images/board_center_art.jpg');

    // Candy Gujarat board (full board candy-theme reference)
    this.load.image('board_candy_theme', '/assets/images/board_candy_theme.jpg');

    // 3D Gujarat landmark miniature spritesheet (4x4 grid, 256x256 per frame)
    // Frame layout (row-major):
    //  0:Statue of Unity  1:Textile Mill   2:Diamond  3:Laxmi Vilas Palace
    //  4:Modhera Temple   5:Somnath        6:Gir Lion 7:GIFT City
    //  8:Bhavnagar Port   9:Dwarka Temple 10:Jamnagar Refinery 11:Rajkot Gear
    // 12:Bank Vault       13:Tax Barrier  14:START Arrow 15:Trade Gift Box
    this.load.spritesheet('landmark_icons', '/assets/images/landmark_icons.jpg', {
      frameWidth: 256,
      frameHeight: 256
    });

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xd97706, 1);
      progressBar.fillRoundedRect(width / 2 - 175, height / 2 - 15, 350 * value, 30, 10);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      subText.destroy();
    });
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
