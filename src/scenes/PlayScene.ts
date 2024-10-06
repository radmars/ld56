import { WINDOW_CENTER, WINDOW_WIDTH } from '@/config';
import {
  updateGnome,
  createGnome,
  grabGnome,
  ungrabGnome,
  type Gnome,
} from '@/things/gnome';
import Phaser, {
  GameObjects,
  Input,
  Physics,
  type Animations,
  type Textures,
} from 'phaser';
import { createSellBox, SellBox } from '@/things/sellbox';
import { createBelt, updateBelt, type Belt } from '@/things/belt';
import { updatePrices } from '@/things/item';
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
  sellBox?: SellBox;
  belt?: Belt;
  cash: number;
  hud: HUD;
}

interface HUD {
  cashText: GameObjects.Text;
}

export interface GameAssets {
  backgroundTexture: Textures.Texture;
  unselectedButton: Textures.Texture;
  selectedButton: Textures.Texture;
  sellBoxTexture: Textures.Texture;
  sellBoxHoverTexture: Textures.Texture;
  gnomeBodyTexture: Textures.Texture;
  hatTexture: Textures.Texture;
  chickenTexture: Textures.Texture;
  greenMushroomTexture: Textures.Texture;
  gnomeYoungWalkAnimation: Animations.Animation;
  gnomeYoungLayHatAnimation: Animations.Animation;
  gnomeYoungSleepAnimation: Animations.Animation;
  gnomeOldWalkAnimation: Animations.Animation;
  gnomeOldLayHatAnimation: Animations.Animation;
  gnomeOldSleepAnimation: Animations.Animation;
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
      cash: 20,
      hud: {} as HUD, // plz ignore lies.
    };
  }

  preload() {
    this.load.image('bg', 'assets/game/bg.png');
    this.load.spritesheet('gnome-body', 'assets/game/gnome-body.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('hat', 'assets/game/hat.png', {
      frameWidth: 32,
      frameHeight: 32,
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
    const gnomeBodyTexture = this.textures.get('gnome-body');
    const hatTexture = this.textures.get('hat');
    const chickenTexture = this.textures.get('chickenleg');
    const greenMushroomTexture = this.textures.get('mushroom');
    const unselectedButton = this.textures.get('unselectedButton');
    const selectedButton = this.textures.get('selectedButton');
    const sellBoxTexture = this.textures.get('sellbox');
    const sellBoxHoverTexture = this.textures.get('sellbox-hover');

    const gnomeYoungWalkAnimation = must(
      'load-gnome-young-walk',
      this.anims.create({
        key: 'gnome-young-walk',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldWalkAnimation = must(
      'load-gnome-old-walk',
      this.anims.create({
        key: 'gnome-old-walk',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 1,
        }),
      }),
    );

    const gnomeYoungLayHatAnimation = must(
      'load-gnome-young-lay-hat',
      this.anims.create({
        key: 'gnome-young-lay-hat',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldLayHatAnimation = must(
      'load-gnome-old-lay-hat',
      this.anims.create({
        key: 'gnome-old-lay-hat',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 1,
        }),
      }),
    );

    const gnomeYoungSleepAnimation = must(
      'load-gnome-young-sleep',
      this.anims.create({
        key: 'gnome-young-sleep',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldSleepAnimation = must(
      'load-gnome-old-sleep',
      this.anims.create({
        key: 'gnome-old-sleep',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 1,
        }),
      }),
    );

    return {
      backgroundTexture,
      unselectedButton,
      selectedButton,
      sellBoxTexture,
      sellBoxHoverTexture,
      gnomeBodyTexture,
      hatTexture,
      chickenTexture,
      greenMushroomTexture,
      gnomeYoungWalkAnimation,
      gnomeOldWalkAnimation,
      gnomeYoungLayHatAnimation,
      gnomeOldLayHatAnimation,
      gnomeYoungSleepAnimation,
      gnomeOldSleepAnimation,
    };
  }

  spawnGnome(x: number, y: number) {
    this.gameState.gnomes.push(
      createGnome(this.gameAssets!, x, y, this.add, this.matter, this),
    );
  }

  //TODO This should take in shape, coor, decoration from the calling context
  spawnHat(x: number, y: number) {
    this.gameState.hats.push(
      createHat(
        x,
        y,
        this.add,
        HatShape.basic,
        HatColor.red,
        HatDecoration.none,
        this.gameState,
        this,
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
      const g = this.gameState.gnomes.find((g) => body == g.physics.body);
      if (g) {
        grabGnome(g);
      }
    });

    this.matter.world.on(Input.Events.DRAG_END, (body: MatterJS.BodyType) => {
      const g = this.gameState.gnomes.find((g) => body == g.physics.body);
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

    this.spawnGnome(WINDOW_CENTER.x, WINDOW_CENTER.y);
    this.gameState.sellBox = createSellBox(this.gameAssets, 32, 32, this.add);
    this.gameState.belt = createBelt(
      this.gameState,
      this.add,
      this.gameAssets,
      this.time,
    );

    this.input.on(Input.Events.DRAG_START, () => {
      pointer.active = false;
    });
    this.input.on(Input.Events.DRAG_END, () => {
      pointer.active = true;
    });
    this.input.on(Input.Events.DROP, () => {
      pointer.active = true;
    });

    const cashStr = getCashStr(this.gameState);
    const cashText = this.add.text(WINDOW_WIDTH - 8, 8, cashStr);
    cashText.setAlign('right');
    cashText.setOrigin(1, 0);

    this.gameState.hud = {
      cashText,
    };
  }

  updateHud() {
    const cashStr = getCashStr(this.gameState);
    this.gameState.hud.cashText.setText(cashStr);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);
    updateBelt(this.gameState.belt!, delta);
    updatePrices(this.gameState.belt!, this.gameState.cash);
    this.updateHud();

    this.gameState.gnomes.forEach(function (gnome) {
      updateGnome(gnome, delta);
    }, this);
  }
}

function getCashStr(gameState: GameState): string {
  return `You have $${gameState.cash} spend it wizely`;
}

/** This is absolutely not correct. Have fun. */
export function textWidth(chars: string): number {
  return 7 * chars.length;
}
