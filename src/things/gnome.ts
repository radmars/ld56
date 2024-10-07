import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';
import { ItemType } from '@/things//item';
import PlayScene from '@/scenes/PlayScene';
import { HatColor, HatDecoration, HatShape } from './hat';

export const gnomeSize = 64;
const hatOffset = -14;
const decorationOffset = -15;
const ageOffset = -4;
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@/config';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;

const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;

const middleAge = 5_000;
const oldAge = 10_000;
const deathAge = 15_000;

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
  physics: Physics.Matter.Sprite;
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
}

// drag/throw
// https://labs.phaser.io/view.html?src=src/physics\matterjs\drag%20with%20pointer.js

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  matter: Physics.Matter.MatterPhysics,
  time: Phaser.Time.Clock,
  pPlayscene: PlayScene,
  shapeGene: HatShape,
  colorGene: HatColor,
  decorationGene: HatDecoration,
): Gnome {
  const body = add.sprite(0, 0, assets.gnomeBodyTexture.key);
  const hat = add.sprite(0, hatOffset, assets.hatTexture.key, shapeGene);
  const hatDecoration = add.sprite(
    0,
    decorationOffset,
    assets.hatDecorationTexture.key,
    decorationGene,
  );
  switch (colorGene) {
    case HatColor.a:
      hat.setTint(0xdc3333);
      break;
    case HatColor.b:
      hat.setTint(0x5b6ee1);
      break;
    case HatColor.c:
      hat.setTint(0xffd700);
      break;
  }

  const container = add.container(x, y, [body, hat, hatDecoration]);
  container.setSize(gnomeSize, gnomeSize);
  // container.setInteractive();

  const physics = matter.add.gameObject(container) as Physics.Matter.Sprite;
  physics.setBounce(0.1);

  body.play(assets.gnomeYoungWalkAnimation);

  const zone = add
    .zone(x, y, gnomeSize, gnomeSize)
    .setRectangleDropZone(gnomeSize, gnomeSize);
  zone.setName(GnomeZone);

  const snoreType = Math.random() > 0.5;

  const gnome = {
    container,
    body,
    hat,
    hatDecoration,
    heading: new Phaser.Math.Vector2(1, 0),
    speed: 0,
    actionDurationTracker: 0,
    physics: physics,
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
  };

  // Aging
  time.delayedCall(middleAge, becomeMiddle, [gnome]);
  time.delayedCall(oldAge, becomeOld, [gnome]);
  // time.delayedCall(deathAge, becomeDead, [gnome]);

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  gnome.age += deltaTime;

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

  if (gnome.awake) {
    gnome.actionDurationTracker -= deltaTime;

    if (gnome.actionDurationTracker <= 0) {
      if (gnome.speed > 0) {
        gnome.speed = 0;
        gnome.actionDurationTracker = pauseDuration;
        gnome.body.play('gnome-idle' + ageSuffix(gnome.age));
      } else {
        gnome.speed = walkSpeed;
        gnome.actionDurationTracker = walkDuration;
        // Pick a new direction to walk
        gnome.heading.rotate(Phaser.Math.Between(0, 360));
        gnome.body.play('gnome-walk' + ageSuffix(gnome.age));
      }
    }
  }

  if (gnome.physics.angle != 0.0) {
    gnome.physics.setAngle(0.0);
  }

  gnome.zone.x = gnome.container.x;
  gnome.zone.y = gnome.container.y;
}

export function ungrabGnome(gnome: Gnome) {
  gnome.grabbed = false;
  gnome.playScene.sound.play('whoosh');
}

export function grabGnome(gnome: Gnome) {
  gnome.grabbed = true;
  gnome.playScene.sound.play('pickup');
}

export function feedGnome(gnome: Gnome, itemType: ItemType) {
  if (!gnome.awake) {
    return false;
  }

  console.log(`Feeding ${gnome} a ${itemType}`);
  gnome.playScene.sound.play('eat');

  gnome.foodInTumTum++;

  // Apply mutations
  switch (itemType) {
    case ItemType.Mushroom:
      gnome.colorGene = HatColor.a;
      break;
    case ItemType.Eraser:
      // We probably want this to do something different
      gnome.decorationGene = HatDecoration.a;
      break;
    case ItemType.TrafficCone:
      gnome.shapeGene = HatShape.a;
      break;
    case ItemType.Birdbath:
      gnome.colorGene = HatColor.b;
      break;
    case ItemType.MoonCookie:
      gnome.decorationGene = HatDecoration.b;
      break;
    case ItemType.Rock:
      gnome.shapeGene = HatShape.b;
      break;
    case ItemType.PhilStone:
      gnome.colorGene = HatColor.c;
      gnome.playScene.sound.play('magic');
      break;
    case ItemType.Wand:
      gnome.decorationGene = HatDecoration.c;
      gnome.playScene.sound.play('magic');
      break;
    case ItemType.Potion:
      gnome.shapeGene = HatShape.c;
      gnome.playScene.sound.play('magic');
      break;
  }

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
  }

  return true;
}

export function layHat(gnome: Gnome) {
  gnome.awake = false;
  gnome.speed = 0;
  gnome.foodInTumTum = 0;

  gnome.playScene.sound.play('hatpop');

  // Do animation for pooping a hat
  gnome.hat.setVisible(false);
  gnome.hatDecoration.setVisible(false);

  gnome.body.play('gnome-lay-hat' + ageSuffix(gnome.age));
  gnome.body.chain('gnome-sleep' + ageSuffix(gnome.age));

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

function becomeDead(g: Gnome) {
  // We may want to use an object pool for this
  g.body.destroy();
  g.hat.destroy();
  g.physics.destroy();
  g.container.destroy();
  g.zone.destroy();
  g.awaitingReaper = true;
  g.playScene.sound.play('die');
}
