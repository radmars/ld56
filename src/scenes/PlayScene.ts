import { WINDOW_CENTER } from '@/config';
import { createGnome } from '@/things/gnome';
import Phaser, { type Animations, type Textures } from 'phaser';

export interface GameAssets {
  gnomeWalkAnimation: Animations.Animation;
  gnomeTexture: Textures.Texture;
}

const must = <T>(what: string, thing: T | false): T => {
  if (thing === false) {
    throw new Error(`Failed to ${what}`);
  }
  return thing;
};

export default class PlayScreen extends Phaser.Scene {
  gameAssets?: GameAssets;

  constructor() {
    super('PlayScene');
  }

  preload() {
    this.load.spritesheet('gnome', 'assets/game/gnome.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  /** Runs when we have everything loaded during create to make it easy to
   * reference stuff without lame strings.
   */
  setupAssets(): GameAssets {
    const gnomeTexture = this.textures.get('gnome');
    const gnomeWalkAnimation = must(
      'load-gnome-walk',
      this.anims.create({
        key: 'gnome-walk',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeTexture.key, {
          start: 0,
          end: 3,
        }),
      }),
    );

    return {
      gnomeTexture,
      gnomeWalkAnimation,
    };
  }

  create() {
    this.gameAssets = this.setupAssets();

    createGnome(this.gameAssets, WINDOW_CENTER.x, WINDOW_CENTER.y, this.add);
  }
}
