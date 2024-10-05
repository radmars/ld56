import { WINDOW_CENTER, WINDOW_HEIGHT } from '@/config';
import {
  beltItemMove,
  createConveyorBeltItem,
  ItemType,
  type ConveyorBeltItem,
} from '@/things/item';
import { createGnome, type Gnome } from '@/things/gnome';
import Phaser, { type Animations, type Textures } from 'phaser';
import { remove } from 'lodash';

export interface GameState {
  gnomes: Gnome[];
  conveyorBeltItems: ConveyorBeltItem[];
}

export interface GameAssets {
  backgroundTexture: Textures.Texture;
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
      conveyorBeltItems: [],
    };
  }

  preload() {
    this.load.image('bg', 'assets/game/bg.png');
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
    const backgroundTexture = this.textures.get('bg');

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
      backgroundTexture,
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
    const chickenButton = createConveyorBeltItem(
      this.gameAssets!,
      WINDOW_CENTER.x - 32 - 8,
      WINDOW_HEIGHT - 68,
      this.add,
      ItemType.Chicken,
    );

    const mushroomButton = createConveyorBeltItem(
      this.gameAssets!,
      WINDOW_CENTER.x + 32 - 8,
      WINDOW_HEIGHT - 68,
      this.add,
      ItemType.GreenMushroom,
    );

    this.gameState.conveyorBeltItems.push(chickenButton);
    this.gameState.conveyorBeltItems.push(mushroomButton);
  }

  create() {
    this.gameAssets = this.setupAssets();

    this.add.image(WINDOW_CENTER.x, WINDOW_CENTER.y, this.gameAssets.backgroundTexture).setScale(2);

    this.spawnGnome();

    this.setupHotbar();
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);
    this.updateBelt(delta);
  }

  updateBelt(delta: number) {
    remove(this.gameState.conveyorBeltItems, (b) => {
      return beltItemMove(b, delta);
    });
  }
}
