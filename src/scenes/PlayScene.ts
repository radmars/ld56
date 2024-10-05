import { WINDOW_CENTER, WINDOW_HEIGHT } from '@/config';
import { ButtonType, createButton, type Button } from '@/things/button';
import { createGnome, type Gnome } from '@/things/gnome';
import Phaser, { type Animations, type Textures } from 'phaser';

export interface GameState {
  gnomes: Gnome[];
  buttons: Button[];
}

export interface GameAssets {
  gnomeWalkAnimation: Animations.Animation;
  gnomeTexture: Textures.Texture;
  chickenTexture: Textures.Texture;
  unselectedButton: Textures.Texture;
  selectedButton: Textures.Texture;
  greenMushroomTexture: Textures.Texture;
}

const must = <T>(what: string, thing: T | false): T => {
  if (thing === false) {
    throw new Error(`Failed to ${what}`);
  }
  return thing;
};

export default class PlayScreen extends Phaser.Scene {
  gameAssets?: GameAssets;
  gameState: GameState;

  constructor() {
    super('PlayScene');
    this.gameState = {
      gnomes: [],
      buttons: [],
    };
  }

  preload() {
    this.load.spritesheet('gnome', 'assets/game/gnome.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('chickenleg', 'assets/game/chicken.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('selectedButton', 'assets/game/button-selected.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      'unselectedButton',
      'assets/game/button-unselected.png',
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );
    this.load.spritesheet('mushroom', 'assets/game/mushroom.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  /**
   * Runs when we have everything loaded during create to make it easy to
   * reference stuff without lame strings.
   */
  setupAssets(): GameAssets {
    const gnomeTexture = this.textures.get('gnome');
    const chickenTexture = this.textures.get('chickenleg');
    const greenMushroomTexture = this.textures.get('mushroom');
    const unselectedButton = this.textures.get('unselectedButton');
    const selectedButton = this.textures.get('selectedButton');

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
      chickenTexture,
      gnomeTexture,
      gnomeWalkAnimation,
      greenMushroomTexture,
      selectedButton,
      unselectedButton,
    };
  }

  spawnGnome() {
    this.gameState.gnomes.push(
      createGnome(this.gameAssets!, WINDOW_CENTER.x, WINDOW_CENTER.y, this.add),
    );
  }

  setupHotbar() {
    const chickenButton = createButton(
      this.gameAssets!,
      WINDOW_CENTER.x - 32 - 8,
      WINDOW_HEIGHT - 68,
      this.add,
      ButtonType.Chicken,
      () => {},
    );

    const mushroomButton = createButton(
      this.gameAssets!,
      WINDOW_CENTER.x + 32 - 8,
      WINDOW_HEIGHT - 68,
      this.add,
      ButtonType.GreenMushroom,
      () => {},
    );

    this.gameState.buttons.push(chickenButton);
    this.gameState.buttons.push(mushroomButton);
  }

  create() {
    this.gameAssets = this.setupAssets();

    this.spawnGnome();

    this.setupHotbar([]);
  }
}
