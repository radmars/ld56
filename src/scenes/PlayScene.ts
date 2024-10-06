import { WINDOW_CENTER, WINDOW_HEIGHT } from '@/config';
import {
  updateGnome,
  createGnome,
  grabGnome,
  ungrabGnome,
  type Gnome,
} from '@/things/gnome';
import Phaser, { Input, type Animations, type Textures } from 'phaser';
import { createSellBox, type SellBox } from '@/things/sellbox';
import { createBelt, updateBelt } from '@/things/belt';

export interface GameState {
  gnomes: Gnome[];
  belt: Belt;
}

export interface GameAssets {
  backgroundTexture: Textures.Texture;
  gnomeWalkAnimation: Animations.Animation;
  gnomeTexture: Textures.Texture;
  chickenTexture: Textures.Texture;
  unselectedButton: Textures.Texture;
  selectedButton: Textures.Texture;
  greenMushroomTexture: Textures.Texture;
  sellBoxTexture: Textures.Texture;
  sellBoxHoverTexture: Textures.Texture;
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

    this.load.spritesheet('sellbox', 'assets/game/sellbox.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet('sellbox-hover', 'assets/game/sellbox-hover.png', {
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
    const sellBoxTexture = this.textures.get('sellbox');
    const sellBoxHoverTexture = this.textures.get('sellbox-hover');

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
      sellBoxHoverTexture,
      sellBoxTexture,
    };
  }

  spawnGnome() {
    this.gameState.gnomes.push(
      createGnome(
        this.gameAssets!,
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        this.add,
        this.matter,
      ),
    );
  }

  create() {
    this.gameAssets = this.setupAssets();
    this.matter.world.setBounds();

    this.matter.add.pointerConstraint({
      length: 30,
      stiffness: 0.16,
      damping: 0.1,
    });

    this.matter.world.on(Input.Events.DRAG_START, (body: MatterJS.BodyType) => {
      const g = this.gameState.gnomes.find((g) => body == g.physicsObject.body);
      if (g) {
        grabGnome(g);
      }
    });

    this.matter.world.on(Input.Events.DRAG_END, (body: MatterJS.BodyType) => {
      const g = this.gameState.gnomes.find((g) => body == g.physicsObject.body);
      if (g) {
        ungrabGnome(g);
      }
    });

    this.add
      .image(
        WINDOW_CENTER.x,
        WINDOW_CENTER.y,
        this.gameAssets.backgroundTexture,
      )
      .setScale(2);

    this.spawnGnome();
    const sellBox = createSellBox(this.gameAssets, 32, 32, this.add);
    this.gameState.belt = createBelt(
      this.add,
      this.gameAssets,
      this.time,
      sellBox,
    );
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);
    updateBelt(this.gameState.belt, delta);

    this.gameState.gnomes.forEach(function (gnome) {
      updateGnome(gnome, delta);
    }, this);
  }
}
