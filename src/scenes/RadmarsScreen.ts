import Phaser from "phaser";
import { WINDOW_CENTER, WINDOW_HEIGHT } from "../";

export default class RadmarsScreen extends Phaser.Scene {
  constructor() {
    super("RadmarsScreen");
  }

  preload(): void {
    this.load.image("bg", "assets/intro/intro_bg.png");
    this.load.image("mars", "assets/intro/intro_mars.png");

    this.load.spritesheet("glasses", "assets/intro/intro_glasses.png", {
      frameWidth: 72,
      frameHeight: 12,
      spacing: 1,
    });
    this.load.spritesheet("radmars", "assets/intro/intro_radmars.png", {
      frameWidth: 96,
      frameHeight: 14,
    });

    this.load.audio("radmarslogo", [
      "assets/intro/radmarslogo.m4a",
      "assets/intro/radmarslogo.ogg",
    ]);
  }

  startInto() {
    this.anims.create({
      key: "glassesIdle",
      frames: [{ key: "glasses", frame: 0 }],
    });
    this.anims.create({
      key: "glassesFlash",
      frames: this.anims.generateFrameNumbers("glasses", { start: 1 }),
      frameRate: 10,
    });
    this.anims.create({
      key: "textIdle",
      frames: [{ key: "radmars", frame: 0 }],
    });
    this.anims.create({
      key: "textFlash",
      frames: this.anims.generateFrameNumbers("radmars", {}),
      frameRate: 10,
      repeat: 3,
    });

    this.sound.play("radmarslogo", { volume: 0.5 });

    const cx = WINDOW_CENTER.x;
    const cy = WINDOW_CENTER.y;

    this.add.image(cx, cy, "bg").setScale(2);
    const radmarsGlasses = this.add
      .sprite(cx, WINDOW_HEIGHT / 6, "glasses")
      .setScale(2);
    radmarsGlasses.play("glassesIdle");
    const radmarsText = this.add.sprite(cx, cy + 100, "mars").setScale(2);

    this.tweens.add({
      targets: radmarsGlasses,
      y: cy,
      ease: "Linear",
      duration: 1600,
      onComplete: () => {
        radmarsGlasses.play("glassesFlash");
        radmarsGlasses.chain(["glassesIdle"]);
      },
    });
    radmarsGlasses.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "glassesFlash",
      () => {
        // I tried to use playAfterDelay instead, but the delay was inherited by the chained animation.
        this.time.addEvent({
          delay: 500,
          callback: () => {
            radmarsText.play("textFlash");
            radmarsText.chain(["textIdle"]);
          },
        });
      },
    );
    radmarsText.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "textFlash",
      () => {
        this.time.addEvent({
          delay: 2000,
          callback: () => {
            this.cameras.main.fadeOut(1000);
          },
        });
      },
    );
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start("TileScreen");
      },
    );

    this.cameras.main.fadeIn(1000);
  }

  create(): void {
    const helloButton = this.add
      .text(100, 100, "Click HERE to start", {
        color: "#0f0",
      })
      .setInteractive()
      .on("pointerup", () => {
        this.startInto();
        helloButton.destroy();
      });
  }
}
