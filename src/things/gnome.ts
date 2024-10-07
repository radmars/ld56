import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';
import { ItemType } from '@/things//item';
import PlayScene from '@/scenes/PlayScene';
import { HatColor, HatDecoration, HatShape } from './hat';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;
const sleepDuration: number = 5000;
const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;
const oldAge = 40_000;
const deathAge = 60_000;

export const GnomeZone = 'TheGnomeZone';

export interface Gnome {
  container: GameObjects.Container;
  body: GameObjects.Sprite;
  hat: GameObjects.Image;
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
  const hat = add.image(0, -19, assets.hatTexture.key, 0);

  const container = add.container(x, y, [body, hat]);
  container.setSize(32, 32);
  // container.setInteractive();

  const physics = matter.add.gameObject(container) as Physics.Matter.Sprite;
  physics.setBounce(0.1);

  body.play(assets.gnomeYoungWalkAnimation);

  const zone = add.zone(x, y, 32, 32).setRectangleDropZone(32, 32);
  zone.setName(GnomeZone);

  const snoreType = Math.random() > 0.5;

  const gnome = {
    container,
    body,
    hat,
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
  time.delayedCall(oldAge, becomeOld, [gnome]);
  // Reenable when this doesn't soft-lock the game
  time.delayedCall(deathAge, becomeDead, [gnome]);

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  gnome.age += deltaTime;
  // console.log(gnome.age);

  if (gnome.speed > 0) {
    if (gnome.heading.x > 0) {
      gnome.body.flipX = false;
      gnome.hat.flipX = false;
    } else if (gnome.heading.x < 0) {
      gnome.body.flipX = true;
      gnome.hat.flipX = true;
    }
    gnome.container.x += gnome.heading.x * gnome.speed * deltaTime;
    gnome.container.y += gnome.heading.y * gnome.speed * deltaTime;
  }

  gnome.actionDurationTracker -= deltaTime;
  if (gnome.actionDurationTracker <= 0) {
    if (gnome.awake) {
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
    } else {
      awake(gnome);
    }
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
      break;
    case ItemType.Wand:
      gnome.decorationGene = HatDecoration.c;
      break;
    case ItemType.Potion:
      gnome.shapeGene = HatShape.c;
      break;
  }

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
    sleep(gnome);
    gnome.playScene.spawnHat(
      gnome.container.x,
      gnome.container.y,
      gnome.shapeGene,
      gnome.colorGene,
      gnome.decorationGene,
    );
  }

  return true;
}

export function layHat(gnome: Gnome) {
  // Do animation for pooping a hat
  gnome.body.play('gnome-lay-hat' + ageSuffix(gnome.age));
  gnome.body.chain('gnome-sleep' + ageSuffix(gnome.age));
  gnome.playScene.sound.play('hatpop');
}

export function sleep(gnome: Gnome) {
  gnome.awake = false;
  gnome.actionDurationTracker = sleepDuration;
  gnome.speed = 0;
  gnome.foodInTumTum = 0;
  gnome.playScene.sound.play(gnome.mimi ? 'honkmimi' : 'honkshoo');
}

export function awake(gnome: Gnome) {
  gnome.body.play('gnome-walk' + ageSuffix(gnome.age));
  gnome.awake = true;
  gnome.actionDurationTracker = 0;
  gnome.foodInTumTum = 0;
}

function ageSuffix(age: number) {
  if (age >= oldAge) {
    return '-old';
  } else {
    return '-young';
  }
}

function becomeOld(g: Gnome) {
  if (g.body.anims.currentAnim?.key == 'gnome-walk-young') {
    g.body.play('gnome-walk-old');
  }
  // Can add other animation transitions here, but the others so far are short.
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
