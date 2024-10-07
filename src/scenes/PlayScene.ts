import { WINDOW_CENTER, WINDOW_WIDTH } from '@/config';
import {
  updateGnome,
  createGnome,
  type Gnome,
  gnomeSize,
} from '@/things/gnome';
import Phaser, { GameObjects, type Animations, type Textures } from 'phaser';
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
  hatShapeA: Animations.Animation;
  hatShapeB: Animations.Animation;
  hatShapeC: Animations.Animation;
  hatDecorationTexture: Textures.Texture;
  hatDecorationA: Animations.Animation;
  hatDecorationB: Animations.Animation;
  hatDecorationC: Animations.Animation;
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
  gnomeYoungIdleAnimation: Animations.Animation;
  gnomeYoungWalkAnimation: Animations.Animation;
  gnomeYoungLayHatAnimation: Animations.Animation;
  gnomeYoungSleepAnimation: Animations.Animation;
  gnomeMiddleIdleAnimation: Animations.Animation;
  gnomeMiddleWalkAnimation: Animations.Animation;
  gnomeMiddleLayHatAnimation: Animations.Animation;
  gnomeMiddleSleepAnimation: Animations.Animation;
  gnomeOldIdleAnimation: Animations.Animation;
  gnomeOldWalkAnimation: Animations.Animation;
  gnomeOldLayHatAnimation: Animations.Animation;
  gnomeOldSleepAnimation: Animations.Animation;
  gnomeDieAnimation: Animations.Animation;
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
      cash: 500,
      hud: {} as HUD, // plz ignore lies.
    };
  }

  preload() {
    this.load.image('bg', 'assets/game/bg.png');
    this.load.spritesheet('gnome-body', 'assets/game/gnome-body.png', {
      frameWidth: gnomeSize,
      frameHeight: gnomeSize,
    });
    this.load.spritesheet('hat', 'assets/game/hat.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      'hat-decorations',
      'assets/game/hat_decorations.png',
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );
    this.load.spritesheet('rat', 'assets/game/rat.png', {
      frameWidth: 52,
      frameHeight: 46,
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
      frameWidth: 46,
      frameHeight: 48,
    });
    this.load.spritesheet('eraser', 'assets/game/eraser.png', {
      frameWidth: 50,
      frameHeight: 44,
    });
    this.load.spritesheet('trafficcone', 'assets/game/traffic_cone.png', {
      frameWidth: 66,
      frameHeight: 62,
    });
    this.load.spritesheet('birdbath', 'assets/game/bird_bath.png', {
      frameWidth: 56,
      frameHeight: 58,
    });
    this.load.spritesheet('mooncookie', 'assets/game/moon_cookie.png', {
      frameWidth: 54,
      frameHeight: 38,
    });
    this.load.spritesheet('rock', 'assets/game/rock.png', {
      frameWidth: 60,
      frameHeight: 44,
    });
    this.load.spritesheet('philstone', 'assets/game/philosophers_stone.png', {
      frameWidth: 44,
      frameHeight: 58,
    });
    this.load.spritesheet('wand', 'assets/game/wand.png', {
      frameWidth: 42,
      frameHeight: 52,
    });
    this.load.spritesheet('potion', 'assets/game/potion.png', {
      frameWidth: 40,
      frameHeight: 52,
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
    const hatDecorationTexture = this.textures.get('hat-decorations');
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

    const hatShapeA = must(
      'load-hat-shape-a',
      this.anims.create({
        key: 'hat-shape-0',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatTexture.key, {
          start: 0,
          end: 0,
        }),
      }),
    );
    const hatShapeB = must(
      'load-hat-shape-b',
      this.anims.create({
        key: 'hat-shape-1',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatTexture.key, {
          start: 1,
          end: 1,
        }),
      }),
    );
    const hatShapeC = must(
      'load-hat-shape-c',
      this.anims.create({
        key: 'hat-shape-2',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatTexture.key, {
          start: 2,
          end: 2,
        }),
      }),
    );

    const hatDecorationA = must(
      'load-hat-decoration-a',
      this.anims.create({
        key: 'hat-decoration-0',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatDecorationTexture.key, {
          start: 2,
          end: 2,
        }),
      }),
    );

    const hatDecorationB = must(
      'load-hat-decoration-b',
      this.anims.create({
        key: 'hat-decoration-1',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatDecorationTexture.key, {
          start: 1,
          end: 1,
        }),
      }),
    );

    const hatDecorationC = must(
      'load-hat-decoration-c',
      this.anims.create({
        key: 'hat-decoration-2',
        frameRate: 0,
        repeat: -1,
        frames: this.anims.generateFrameNames(hatDecorationTexture.key, {
          start: 0,
          end: 0,
        }),
      }),
    );

    const gnomeYoungIdleAnimation = must(
      'load-gnome-idle-young',
      this.anims.create({
        key: 'gnome-idle-young',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 14,
          end: 14,
        }),
      }),
    );

    const gnomeMiddleIdleAnimation = must(
      'load-gnome-idle-middle',
      this.anims.create({
        key: 'gnome-idle-middle',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 0,
          end: 0,
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
          start: 7,
          end: 7,
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
          start: 15,
          end: 16,
        }),
      }),
    );

    const gnomeMiddleWalkAnimation = must(
      'load-gnome-walk-middle',
      this.anims.create({
        key: 'gnome-walk-middle',
        frameRate: 10,
        repeat: -1,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 1,
          end: 2,
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
          start: 8,
          end: 9,
        }),
      }),
    );

    const hatLayRate = 40;
    const hatLayRepeats = 40;

    const gnomeYoungLayHatAnimation = must(
      'load-gnome-lay-hat-young',
      this.anims.create({
        key: 'gnome-lay-hat-young',
        frameRate: hatLayRate,
        repeat: hatLayRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 19,
          end: 20,
        }),
      }),
    );

    const gnomeMiddleLayHatAnimation = must(
      'load-gnome-lay-hat-middle',
      this.anims.create({
        key: 'gnome-lay-hat-middle',
        frameRate: hatLayRate,
        repeat: hatLayRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 5,
          end: 6,
        }),
      }),
    );

    const gnomeOldLayHatAnimation = must(
      'load-gnome-lay-hat-old',
      this.anims.create({
        key: 'gnome-lay-hat-old',
        frameRate: hatLayRate,
        repeat: hatLayRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 12,
          end: 13,
        }),
      }),
    );

    const sleepRate = 1.2;
    const sleepRepeats = 4;

    const gnomeYoungSleepAnimation = must(
      'load-gnome-sleep-young',
      this.anims.create({
        key: 'gnome-sleep-young',
        frameRate: sleepRate,
        repeat: sleepRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 17,
          end: 18,
        }),
      }),
    );

    const gnomeMiddleSleepAnimation = must(
      'load-gnome-sleep-middle',
      this.anims.create({
        key: 'gnome-sleep-middle',
        frameRate: sleepRate,
        repeat: sleepRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 3,
          end: 4,
        }),
      }),
    );

    const gnomeOldSleepAnimation = must(
      'load-gnome-sleep-old',
      this.anims.create({
        key: 'gnome-sleep-old',
        frameRate: sleepRate,
        repeat: sleepRepeats,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 10,
          end: 11,
        }),
      }),
    );

    const gnomeDieAnimation = must(
      'load-gnome-die',
      this.anims.create({
        key: 'gnome-die',
        frameRate: 10,
        frames: this.anims.generateFrameNames(gnomeBodyTexture.key, {
          start: 21,
          end: 46,
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
      hatShapeA,
      hatShapeB,
      hatShapeC,
      hatDecorationTexture,
      hatDecorationA,
      hatDecorationB,
      hatDecorationC,
      ratTexture,
      mushroomTexture,
      gnomeYoungIdleAnimation,
      gnomeYoungWalkAnimation,
      gnomeYoungLayHatAnimation,
      gnomeYoungSleepAnimation,
      gnomeMiddleIdleAnimation,
      gnomeMiddleWalkAnimation,
      gnomeMiddleLayHatAnimation,
      gnomeMiddleSleepAnimation,
      gnomeOldIdleAnimation,
      gnomeOldWalkAnimation,
      gnomeOldLayHatAnimation,
      gnomeOldSleepAnimation,
      gnomeDieAnimation,
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

  spawnGnome(
    x: number,
    y: number,
    shapeGene: HatShape,
    colorGene: HatColor,
    decorationGene: HatDecoration,
  ) {
    this.gameState.gnomes.push(
      createGnome(
        this.gameAssets!,
        x,
        y,
        this.add,
        this.time,
        this,
        shapeGene,
        colorGene,
        decorationGene,
      ),
    );
  }

  spawnHat(
    x: number,
    y: number,
    shapeGene: HatShape,
    colorGene: HatColor,
    decorationGene: HatDecoration,
  ) {
    this.gameState.hats.push(
      createHat(
        x,
        y,
        this.add,
        this.physics,
        shapeGene,
        colorGene,
        decorationGene,
        this.gameState,
        this,
        true,
        true,
      ),
    );
  }

  create() {
    this.gameAssets = this.setupAssets();

    const bg = this.add.image(
      WINDOW_CENTER.x,
      WINDOW_CENTER.y,
      this.gameAssets.backgroundTexture,
    );
    bg.depth = -2;

    this.spawnGnome(
      WINDOW_CENTER.x,
      WINDOW_CENTER.y,
      HatShape.Cone,
      HatColor.Red,
      HatDecoration.None,
    );
    this.gameState.sellBox = createSellBox(
      this.gameAssets,
      32,
      32,
      this.add,
      this.physics,
      this.gameState,
      this,
    );
    this.gameState.belt = createBelt(
      this.gameState,
      this.add,
      this.physics,
      this.gameAssets,
      this.time,
      this,
    );

    const cashStr = getCashStr(this.gameState);
    const cashText = this.add.text(WINDOW_WIDTH - 8, 8, cashStr);
    cashText.setAlign('right');
    cashText.setOrigin(1, 0);

    this.gameState.hud = {
      cashText,
    };

    // uncomment this at some point
    //const music = this.sound.add('music', { volume: 0.5, loop: true });
    //music.play();
    this.sound.setVolume(0.15);
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
    this.gameState.hats = this.gameState.hats.filter((h) => {
      return !h.consumed;
    });
    if (this.gameState.gnomes.length == 0 && this.gameState.hats.length < 2) {
      console.debug('YOU LOSE');
      this.scene.start('GameOver');
    }

    this.gameState.gnomes.forEach(function (gnome) {
      updateGnome(gnome, delta);
    }, this);
  }
}

function getCashStr(gameState: GameState): string {
  return `You have $${gameState.cash} spend it wizely`;
}
