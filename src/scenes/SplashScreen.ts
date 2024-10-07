import Phaser, { Time } from 'phaser';
import { WINDOW_CENTER } from '@/config';

export default class SplashScreen extends Phaser.Scene {
  constructor() {
    super('SplashScreen');
  }

  preload(): void {
    this.load.image('splash-screen', 'assets/intro/splash-screen.png');
    this.load.image(
      'splash-screen-text',
      'assets/intro/splash-screen-text.png',
    );
  }

  create(): void {
    const cx = WINDOW_CENTER.x;
    const cy = WINDOW_CENTER.y;

    this.add.image(cx, cy, 'splash-screen');
    const text = this.add.image(cx, cy, 'splash-screen-text');

    const toggleText = new Time.TimerEvent({
      delay: 1000,
      repeat: -1,
      callback: function () {
        text.setVisible(!text.visible);
      },
    });
    this.time.addEvent(toggleText);

    this.cameras.main.fadeIn(1000);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
      () => {
        this.input.once('pointerdown', () => {
          this.cameras.main.fadeOut(1000);
          this.cameras.main.pan(cx, cy + 150, 1000, 'Sine.easeInOut');
          this.cameras.main.zoomTo(5, 1000);
        });
      },
    );

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start('PlayScene');
      },
    );
  }
}
