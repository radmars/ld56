import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.sound.stopAll();
    this.add.text(200, 200, 'GAME OVER', {
      fontSize: '64px',
    });

    this.cameras.main.fadeIn(1_000);

    this.time.delayedCall(5_000, () => {
      this.cameras.main.fadeOut(1_000);
    });

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start('PlayScene');
      },
    );
  }
}
