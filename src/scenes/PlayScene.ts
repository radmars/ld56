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
  sellBoxTexture: Textures.Texture;
  sellBoxHoverTexture: Textures.Texture;
  gnomeBodyTexture: Textures.Texture;
  hatTexture: Textures.Texture;
  gnomeYoungIdleAnimation: Animations.Animation;
  ratTexture: Textures.Texture;
  mushroomTexture: Textures.Texture;
  birdbathTexture: Textures.Texture;
  mooncookieTexture: Textures.Texture;
  eraserTexture: Textures.Texture;
  trafficConeTexture: Textures.Texture;
  rockTexture: Textures.Texture;
  philstoneTexture: Textures.Texture;
  wandTexture: Textures.Texture;
  potionTexture: Textures.Texture;
  gnomeYoungWalkAnimation: Animations.Animation;
  gnomeYoungLayHatAnimation: Animations.Animation;
  gnomeYoungSleepAnimation: Animations.Animation;
  gnomeOldIdleAnimation: Animations.Animation;
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
    this.load.spritesheet('rat', 'assets/game/rat.png', {
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
    this.load.spritesheet('eraser', 'assets/game/eraser.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('trafficcone', 'assets/game/traffic_cone.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('birdbath', 'assets/game/bird_bath.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('mooncookie', 'assets/game/moon_cookie.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('rock', 'assets/game/rock.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('philstone', 'assets/game/philosophers_stone.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('wand', 'assets/game/wand.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('potion', 'assets/game/potion.png', {
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

    this.load.audio('music', [
      'assets/audio/ld56-theme.m4a',
      'assets/audio/ld56-theme.ogg',
    ]);
    this.load.audio('buy', ['assets/audio/buy.m4a', 'assets/audio/buy.ogg']);
    this.load.audio('die', ['assets/audio/die.m4a', 'assets/audio/die.ogg']);
    this.load.audio('drop', ['assets/audio/drop.m4a', 'assets/audio/drop.ogg']);
    this.load.audio('eat', ['assets/audio/eat.m4a', 'assets/audio/eat.ogg']);
    this.load.audio('hatgrow', [
      'assets/audio/hatgrow.m4a',
      'assets/audio/hatgrow.ogg',
    ]);
    this.load.audio('hatpop', [
      'assets/audio/hatpop.m4a',
      'assets/audio/hatpop.ogg',
    ]);
    this.load.audio('heart', [
      'assets/audio/heart.m4a',
      'assets/audio/heart.ogg',
    ]);
    this.load.audio('honkmimi', [
      'assets/audio/honkmimi.m4a',
      'assets/audio/honkmimi.ogg',
    ]);
    this.load.audio('honkshoo', [
      'assets/audio/honkshoo.m4a',
      'assets/audio/honkshoo.ogg',
    ]);
    this.load.audio('magic', [
      'assets/audio/magic.m4a',
      'assets/audio/magic.ogg',
    ]);
    this.load.audio('pickup', [
      'assets/audio/pickup.m4a',
      'assets/audio/pickup.ogg',
    ]);
    this.load.audio('rub', ['assets/audio/rub.m4a', 'assets/audio/rub.ogg']);
    this.load.audio('sell', ['assets/audio/sell.m4a', 'assets/audio/sell.ogg']);
    this.load.audio('whoosh', [
      'assets/audio/whoosh.m4a',
      'assets/audio/whoosh.ogg',
    ]);
    this.load.audio('win', ['assets/audio/win.m4a', 'assets/audio/win.ogg']);
  }

  /**
   * Runs when we have everything loaded during create to make it easy to
   * reference stuff without lame strings.
   */
  setupAssets(): GameAssets {
    const backgroundTexture = this.textures.get('bg');
    const gnomeBodyTexture = this.textures.get('gnome-body');
    const hatTexture = this.textures.get('hat');
    const ratTexture = this.textures.get('rat');
    const mushroomTexture = this.textures.get('mushroom');
    const eraserTexture = this.textures.get('eraser');
    const trafficConeTexture = this.textures.get('trafficcone');
    const birdbathTexture = this.textures.get('birdbath');
    const mooncookieTexture = this.textures.get('mooncookie');
    const rockTexture = this.textures.get('rock');
    const philstoneTexture = this.textures.get('philstone');
    const wandTexture = this.textures.get('wand');
    const potionTexture = this.textures.get('potion');
    const unselectedButton = this.textures.get('unselectedButton');
    const sellBoxTexture = this.textures.get('sellbox');
    const sellBoxHoverTexture = this.textures.get('sellbox-hover');

    const gnomeYoungIdleAnimation = must(
      'load-gnome-idle-young',
      this.anims.create({
        key: 'gnome-idle-young',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 2,
        }),
      }),
    );

    const gnomeOldIdleAnimation = must(
      'load-gnome-idle-old',
      this.anims.create({
        key: 'gnome-idle-old',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 0,
        }),
      }),
    );

    const gnomeYoungWalkAnimation = must(
      'load-gnome-walk-young',
      this.anims.create({
        key: 'gnome-walk-young',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldWalkAnimation = must(
      'load-gnome-walk-old',
      this.anims.create({
        key: 'gnome-walk-old',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 1,
        }),
      }),
    );

    const gnomeYoungLayHatAnimation = must(
      'load-gnome-lay-hat-young',
      this.anims.create({
        key: 'gnome-lay-hat-young',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldLayHatAnimation = must(
      'load-gnome-lay-hat-old',
      this.anims.create({
        key: 'gnome-lay-hat-old',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 1,
        }),
      }),
    );

    const gnomeYoungSleepAnimation = must(
      'load-gnome-sleep-young',
      this.anims.create({
        key: 'gnome-sleep-young',
        frameRate: 10,
        repeat: 0,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 2,
          end: 3,
        }),
      }),
    );

    const gnomeOldSleepAnimation = must(
      'load-gnome-sleep-old',
      this.anims.create({
        key: 'gnome-sleep-old',
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
      sellBoxTexture,
      sellBoxHoverTexture,
      gnomeBodyTexture,
      hatTexture,
      gnomeYoungIdleAnimation,
      ratTexture,
      mushroomTexture,
      gnomeYoungWalkAnimation,
      gnomeYoungLayHatAnimation,
      gnomeYoungSleepAnimation,
      gnomeOldIdleAnimation,
      gnomeOldWalkAnimation,
      gnomeOldLayHatAnimation,
      gnomeOldSleepAnimation,
      mooncookieTexture,
      eraserTexture,
      trafficConeTexture,
      birdbathTexture,
      rockTexture,
      wandTexture,
      philstoneTexture,
      potionTexture,
    };
  }

  spawnGnome(x: number, y: number) {
    this.gameState.gnomes.push(
      createGnome(
        this.gameAssets!,
        x,
        y,
        this.add,
        this.matter,
        this.time,
        this,
      ),
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

    const bg = this.add.image(
      WINDOW_CENTER.x,
      WINDOW_CENTER.y,
      this.gameAssets.backgroundTexture,
    );
    bg.depth = -2;

    this.spawnGnome(WINDOW_CENTER.x, WINDOW_CENTER.y);
    this.gameState.sellBox = createSellBox(this.gameAssets, 32, 32, this.add);
    this.gameState.belt = createBelt(
      this.gameState,
      this.add,
      this.gameAssets,
      this.time,
      this,
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

    this.gameState.gnomes = this.gameState.gnomes.filter((g) => {
      return !g.awaitingReaper;
    });
    this.gameState.gnomes.forEach(function (gnome) {
      updateGnome(gnome, delta);
    }, this);
  }
}

function getCashStr(gameState: GameState): string {
  return `You have $${gameState.cash} spend it wizely`;
}
