import { WINDOW_CENTER } from '@/config';
import {
  updateGnome,
  createGnome,
  grabGnome,
  ungrabGnome,
  type Gnome,
  feedGnome,
} from '@/things/gnome';
import Phaser, { Input, Physics, type Animations, type Textures } from 'phaser';
import { createSellBox } from '@/things/sellbox';
import { createBelt, updateBelt, type Belt } from '@/things/belt';
import {
  createHat,
  Hat,
  HatColor,
  HatDecoration,
  HatShape,
} from '@/things/hat';

export interface GameState {
  gnomes: Gnome[];
  hats: Hat[];
  belt?: Belt;
}

export interface GameAssets {
  backgroundTexture: Textures.Texture;
  gnomeWalkAnimation: Animations.Animation;
  gnomeLayHatAnimation: Animations.Animation;
  gnomeSleepAnimation: Animations.Animation;
  gnomeTexture: Textures.Texture;
  hatTexture: Textures.Texture;
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
      hats: [],
    };
  }

  preload() {
    this.load.image('bg', 'assets/game/bg.png');
    this.load.image('hat', 'assets/game/hat.png');
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
    const hatTexture = this.textures.get('hat');
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

    const gnomeLayHatAnimation = must(
      'load-gnome-layHat',
      this.anims.create({
        key: 'gnome-layHat',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeTexture.key, {
          start: 5,
          end: 7,
        }),
      }),
    );

    const gnomeSleepAnimation = must(
      'load-gnome-sleep',
      this.anims.create({
        key: 'gnome-sleep',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeTexture.key, {
          start: 8,
          end: 10,
        }),
      }),
    );

    return {
      backgroundTexture,
      chickenTexture,
      gnomeTexture,
      hatTexture,
      gnomeWalkAnimation,
      gnomeLayHatAnimation,
      gnomeSleepAnimation,
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

    const pointer = this.matter.add.pointerConstraint({
      length: 30,
      stiffness: 0.16,
      damping: 0.1,
    }) as unknown as Physics.Matter.PointerConstraint;

    this.matter.world.on(Input.Events.DRAG_START, (body: MatterJS.BodyType) => {
      const g = this.gameState.gnomes.find((g) => body == g.physicsObject.body);
      if (g) {
        grabGnome(g);

        //TODO This ain't how ya feed em, but for now it is!
        if (feedGnome(g)) {
          //TODO Get the hat info from the gnome
          createHat(
            g.sprite.x,
            g.sprite.y,
            this.add,
            HatShape.basic,
            HatColor.red,
            HatDecoration.none,
          );
        }
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
      pointer,
    );
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);
    updateBelt(this.gameState.belt!, delta);

    this.gameState.gnomes.forEach(function (gnome) {
      updateGnome(gnome, delta);
    }, this);
  }
}
