import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects } from 'phaser';
import PlayScene from '@/scenes/PlayScene';
import { HatColor, HatDecoration, HatShape } from './hat';

export const gnomeSize = 64;
const hatOffset = -14;
const decorationOffset = -15;
const ageOffset = -4;
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@/config';
import { ItemType } from './item-enums';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;

const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;

const middleAge = 60_000;
const oldAge = 100_000;
const deathAge = 120_000;

const walkBoundsLeft = 50;
const walkBoundsRight = 50;
const walkBoundsTop = 50;
const walkBoundsBottom = 140;

export const GnomeZone = 'TheGnomeZone';

export interface Gnome {
  container: GameObjects.Container;
  body: GameObjects.Sprite;
  hat: GameObjects.Image;
  hatDecoration: GameObjects.Image;
  heading: Phaser.Math.Vector2;
  speed: number;
  actionDurationTracker: number;
  grabbed: boolean;
  awake: boolean;
  foodInTumTum: integer;
  zone: GameObjects.Zone;
  age: number;
  awaitingReaper: boolean;
  playScene: PlayScene;
  mimi: boolean;
  shapeGene: HatShape;
  colorGene: HatColor;
  decorationGene: HatDecoration;
  add: GameObjects.GameObjectFactory;
}

export function updateHat(gnome: Gnome) {
  if (gnome.hat) {
    gnome.hat.destroy();
  }
  if (gnome.hatDecoration) {
    gnome.hatDecoration.destroy();
  }

  gnome.hat = gnome.add.sprite(
    0,
    hatOffset + (gnome.age < middleAge ? 0 : ageOffset),
    'hat',
    gnome.shapeGene,
  );
  gnome.hatDecoration = gnome.add.sprite(
    0,
    decorationOffset + (gnome.age < middleAge ? 0 : ageOffset),
    'hat-decorations',
    2 - gnome.decorationGene,
  );
  switch (gnome.colorGene) {
    case HatColor.Red:
      gnome.hat.setTint(0xdc3333);
      break;
    case HatColor.Blue:
      gnome.hat.setTint(0x5b6ee1);
      break;
    case HatColor.Gold:
      gnome.hat.setTint(0xffd700);
      break;
  }

  if (gnome.body.flipX) {
    gnome.hat.flipX = true;
    gnome.hatDecoration.flipX = true;
  }

  gnome.container.add([gnome.hat, gnome.hatDecoration]);
  setHatVisibility(gnome, gnome.foodInTumTum > 1);
}

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  time: Phaser.Time.Clock,
  pPlayscene: PlayScene,
  shapeGene: HatShape,
  colorGene: HatColor,
  decorationGene: HatDecoration,
): Gnome {
  const body = add.sprite(0, 0, assets.gnomeBodyTexture.key);

  const container = add.container(x, y, [body]);
  container.setSize(gnomeSize, gnomeSize);

  body.play(assets.gnomeYoungWalkAnimation);

  const zone = add
    .zone(x, y, gnomeSize, gnomeSize)
    .setRectangleDropZone(gnomeSize, gnomeSize);
  zone.setName(GnomeZone);

  const snoreType = Math.random() > 0.5;

  const gnome = {
    container,
    body,
    hat: undefined as unknown as GameObjects.Image,
    hatDecoration: undefined as unknown as GameObjects.Image,
    heading: new Phaser.Math.Vector2(1, 0),
    speed: 0,
    actionDurationTracker: 0,
    grabbed: false,
    awake: true,
    foodInTumTum: 0,
    zone,
    age: 0,
    awaitingReaper: false,
    playScene: pPlayscene,
    mimi: snoreType,
    shapeGene: shapeGene,
    colorGene: colorGene,
    decorationGene: decorationGene,
    add,
  };

  updateHat(gnome);

  // Aging
  time.delayedCall(middleAge, becomeMiddle, [gnome]);
  time.delayedCall(oldAge, becomeOld, [gnome]);
  time.delayedCall(deathAge, becomeDead, [gnome]);

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  gnome.age += deltaTime;

  if (!gnome.awake) {
    return;
  }

  if (gnome.speed > 0) {
    if (gnome.heading.x > 0) {
      gnome.body.flipX = false;
      gnome.hat.flipX = false;
      gnome.hatDecoration.flipX = false;
    } else if (gnome.heading.x < 0) {
      gnome.body.flipX = true;
      gnome.hat.flipX = true;
      gnome.hatDecoration.flipX = true;
    }

    let newX = gnome.container.x + gnome.heading.x * gnome.speed * deltaTime;
    let newY = gnome.container.y + gnome.heading.y * gnome.speed * deltaTime;

    // Keep these bad bois in bounds
    if (newX > WINDOW_WIDTH - walkBoundsRight || newX < walkBoundsLeft) {
      gnome.heading.x *= -1;
      newX = Phaser.Math.Clamp(
        newX,
        walkBoundsLeft,
        WINDOW_WIDTH - walkBoundsRight,
      );
    }

    if (newY > WINDOW_HEIGHT - walkBoundsBottom || newY < walkBoundsTop) {
      gnome.heading.y *= -1;
      newY = Phaser.Math.Clamp(
        newY,
        walkBoundsTop,
        WINDOW_HEIGHT - walkBoundsBottom,
      );
    }

    gnome.container.setPosition(newX, newY);
  }

  gnome.actionDurationTracker -= deltaTime;

  if (gnome.actionDurationTracker <= 0) {
    if (gnome.speed > 0) {
      gnome.speed = 0;
      gnome.actionDurationTracker = pauseDuration;
      gnome.body.play(
        'gnome-idle' + ageSuffix(gnome.age) + fedSuffix(gnome.foodInTumTum),
      );
    } else {
      gnome.speed = walkSpeed;
      if (gnome.age > oldAge) {
        gnome.speed /= 2;
      }

      gnome.actionDurationTracker = walkDuration;
      // Pick a new direction to walk
      gnome.heading.rotate(Phaser.Math.Between(0, 360));
      gnome.body.play(
        'gnome-walk' + ageSuffix(gnome.age) + fedSuffix(gnome.foodInTumTum),
      );
    }
  }

  gnome.zone.x = gnome.container.x;
  gnome.zone.y = gnome.container.y;
}

export function feedGnome(gnome: Gnome, itemType: ItemType) {
  if (!gnome.awake) {
    return false;
  }

  gnome.playScene.sound.play('eat');
  gnome.foodInTumTum++;

  // Apply mutations
  switch (itemType) {
    case ItemType.Mushroom:
      gnome.colorGene = HatColor.Red;
      break;
    case ItemType.MoonCookie:
      gnome.decorationGene = HatDecoration.Moon;
      break;
    case ItemType.Potion:
      gnome.shapeGene = HatShape.Wizard;
      gnome.playScene.sound.play('magic');
      break;
  }

  updateHat(gnome);

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
  } else if (gnome.foodInTumTum >= 2) {
    const blood = gnome.playScene.add.particles(
      gnome.container.x,
      gnome.container.y - 20 - (gnome.age < middleAge ? ageOffset : 0),
      'hat',
      {
        frame: 0,
        color: [0xff0000, 0x000000],
        colorEase: 'quad.out',
        lifespan: 1000,
        angle: { min: 0, max: 180 },
        scale: { start: 0.7, end: 0, ease: 'sine.out' },
        speed: 50,
        gravityY: 200,
        emitCallback: () => {
          const splat = Math.floor(Math.random() * 3.9999) + 1;
          gnome.playScene.sound.play('splat' + splat);
        },
      },
    );

    gnome.playScene.time.delayedCall(250, () => blood.stop());
  }

  return true;
}

export function layHat(gnome: Gnome) {
  gnome.awake = false;
  gnome.foodInTumTum = 0;

  // Do animation for pooping a hat
  gnome.hat.setVisible(false);
  gnome.hatDecoration.setVisible(false);

  gnome.body.play('gnome-lay-hat' + ageSuffix(gnome.age));
  gnome.body.chain('gnome-sleep' + ageSuffix(gnome.age));

  const blood = gnome.playScene.add.particles(
    gnome.container.x,
    gnome.container.y - 20 - (gnome.age < middleAge ? ageOffset : 0),
    'hat',
    {
      frame: 0,
      color: [0xff0000, 0x000000],
      colorEase: 'quad.out',
      lifespan: 2400,
      angle: { min: -100, max: -80 },
      scale: { start: 0.7, end: 0, ease: 'sine.out' },
      speed: 400,
      gravityY: 400,
      emitCallback: () => {
        const splat = Math.floor(Math.random() * 3.9999) + 1;
        gnome.playScene.sound.play('splat' + splat);
      },
    },
  );

  const bleedAnimation = gnome.playScene.anims.get(
    'gnome-lay-hat' + ageSuffix(gnome.age),
  );
  const bleedDuration =
    (1_000 * bleedAnimation.frames.length * bleedAnimation.repeat) /
    bleedAnimation.frameRate;

  // Separated in case the gnome dies during the animation, to prevent eternal geysers.
  setTimeout(() => blood.stop(), bleedDuration);

  gnome.body.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      'gnome-lay-hat' +
      ageSuffix(gnome.age),
    () => {
      gnome.playScene.spawnHat(
        gnome.container.x,
        gnome.container.y,
        gnome.shapeGene,
        gnome.colorGene,
        gnome.decorationGene,
      );

      gnome.playScene.sound.play('hatpop');
      gnome.playScene.sound.play(gnome.mimi ? 'honkmimi' : 'honkshoo');
    },
  );

  gnome.body.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      'gnome-sleep' +
      ageSuffix(gnome.age),
    () => {
      gnome.awake = true;
      gnome.actionDurationTracker = 0;
      gnome.hat.setVisible(true);
      gnome.hatDecoration.setVisible(true);
    },
  );
}

function ageSuffix(age: number) {
  if (age >= oldAge) {
    return '-old';
  } else if (age >= middleAge) {
    return '-middle';
  } else {
    return '-young';
  }
}

function fedSuffix(foodInTumTum: number) {
  if (foodInTumTum >= 1) {
    return '-cone';
  }

  return '';
}

function becomeMiddle(g: Gnome) {
  g.hat.y = hatOffset + ageOffset;
  g.hatDecoration.y = decorationOffset + ageOffset;

  if (g.body.anims.currentAnim?.key == 'gnome-idle-young') {
    g.body.play('gnome-idle-middle');
  } else if (g.body.anims.currentAnim?.key == 'gnome-walk-young') {
    g.body.play('gnome-walk-middle');
  }
}

function becomeOld(g: Gnome) {
  if (g.body.anims.currentAnim?.key == 'gnome-idle-middle') {
    g.body.play('gnome-idle-old');
  } else if (g.body.anims.currentAnim?.key == 'gnome-walk-middle') {
    g.body.play('gnome-walk-old');
  }
}

// We may want to use an object pool for this
function becomeDead(g: Gnome) {
  if (g.foodInTumTum >= 2) {
    layHat(g);
  }
  g.awake = false; // Alas, this is forever
  g.body.play('gnome-die');
  g.hat.setVisible(false);
  g.hatDecoration.setVisible(false);

  g.body.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'gnome-die',
    () => {
      g.body.destroy();
      g.hat.destroy();
      g.container.destroy();
      g.zone.destroy();

      g.awaitingReaper = true;
      g.playScene.sound.play('die');
    },
  );
}

function setHatVisibility(g: Gnome, visible: boolean) {
  g.hat.visible = visible;
  g.hatDecoration.visible = visible;
}

// case ItemType.Birdbath:
//   gnome.colorGene = HatColor.Blue;
//   break;
