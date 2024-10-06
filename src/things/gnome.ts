import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';
import { ItemType } from '@/things//item';
import { createHat, HatColor, HatDecoration, HatShape } from '@/things/hat';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;
const sleepDuration: number = 10000;
const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;

export const GnomeZone = 'TheGnomeZone';

export interface Gnome {
  sprite: GameObjects.Sprite;
  heading: Phaser.Math.Vector2;
  speed: number;
  actionDurationTracker: number;
  physicsObject: Physics.Matter.Sprite;
  grabbed: boolean;
  awake: boolean;
  foodInTumTum: integer;
  zone: GameObjects.Zone;
}

// drag/throw
// https://labs.phaser.io/view.html?src=src/physics\matterjs\drag%20with%20pointer.js

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  matter: Physics.Matter.MatterPhysics,
): Gnome {
  const sprite = add.sprite(x, y, assets.gnomeTexture.key, 0);
  sprite.setInteractive();
  sprite.play(assets.gnomeWalkAnimation);

  const zone = add.zone(x, y, 64, 64).setRectangleDropZone(64, 64);
  zone.setName(GnomeZone);

  const physicsObject = matter.add.gameObject(sprite) as Physics.Matter.Sprite;
  physicsObject.setBounce(0.1);

  const gnome = {
    sprite,
    heading: new Phaser.Math.Vector2(1, 0),
    speed: 0,
    actionDurationTracker: 0,
    physicsObject,
    grabbed: false,
    awake: true,
    foodInTumTum: 0,
    zone,
  };

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  if (gnome.speed > 0) {
    if (gnome.heading.x > 0) {
      gnome.sprite.flipX = true;
    } else if (gnome.heading.x < 0) {
      gnome.sprite.flipX = false;
    }
    gnome.sprite.x += gnome.heading.x * gnome.speed * deltaTime;
    gnome.sprite.y += gnome.heading.y * gnome.speed * deltaTime;
  }

  gnome.actionDurationTracker -= deltaTime;
  if (gnome.actionDurationTracker <= 0) {
    if (gnome.awake) {
      if (gnome.speed > 0) {
        gnome.speed = 0;
        gnome.actionDurationTracker = pauseDuration;
      } else {
        gnome.speed = walkSpeed;
        gnome.actionDurationTracker = walkDuration;
        //pick a new direction to walk
        gnome.heading.rotate(Phaser.Math.Between(0, 360));
      }
    } else {
      awake(gnome);
    }
  }

  gnome.zone.x = gnome.sprite.x;
  gnome.zone.y = gnome.sprite.y;
}

export function ungrabGnome(gnome: Gnome) {
  gnome.grabbed = false;
}

export function grabGnome(gnome: Gnome) {
  gnome.grabbed = true;
}

export function feedGnome(
  gnome: Gnome,
  itemType: ItemType,
  add: GameObjects.GameObjectFactory,
) {
  if (!gnome.awake) {
    return;
  }
  console.log(`Feeding ${gnome} a ${itemType}`);

  gnome.foodInTumTum++;

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
    //TODO if gnome is old, die otherwise sleep
    sleep(gnome);
    createHat(
      gnome.sprite.x,
      gnome.sprite.y,
      add,
      HatShape.basic,
      HatColor.red,
      HatDecoration.none,
    );
  }
}

export function layHat(gnome: Gnome) {
  //Do animation for pooping a hat
  gnome.sprite.play('gnome-layHat');
  gnome.sprite.chain('gnome-sleep');
}

export function sleep(gnome: Gnome) {
  gnome.awake = false;
  gnome.actionDurationTracker = sleepDuration;
  gnome.speed = 0;
  gnome.foodInTumTum = 0;
}

export function awake(gnome: Gnome) {
  gnome.sprite.play('gnome-walk');
  gnome.awake = true;
  gnome.actionDurationTracker = 0;
  gnome.foodInTumTum = 0;
}
