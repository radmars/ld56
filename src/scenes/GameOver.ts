import { WINDOW_CENTER } from '@/config';
import Phaser, { Time } from 'phaser';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  preload(): void {
    this.load.image('lose-screen', 'assets/game/lose-screen.png');
    this.load.image('lose-screen-text', 'assets/game/lose-screen-text.png');

    this.load.audio('industrial', [
      'assets/audio/industrial.m4a',
      'assets/audio/industrial.ogg',
    ]);
  }

  create() {
    const cx = WINDOW_CENTER.x;
    const cy = WINDOW_CENTER.y;

    this.add.image(cx, cy, 'lose-screen');
    const text = this.add.image(cx, cy, 'lose-screen-text');

    const toggleText = new Time.TimerEvent({
      delay: 1000,
      repeat: -1,
      callback: function () {
        text.setVisible(!text.visible);
      },
    });
    this.time.addEvent(toggleText);

    this.cameras.main.fadeIn(1000);
    this.sound.play('industrial', { volume: 0.5 });

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
      () => {
        this.input.once('pointerdown', () => {
          this.cameras.main.fadeOut(1000);
        });
      },
    );

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.sound.stopByKey('industrial');
        this.scene.start('PlayScene');
      },
    );
  }
}
