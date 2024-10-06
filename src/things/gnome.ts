import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;
const sleepDuration: number = 10000;
const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;

export interface Gnome {
  sprite: GameObjects.Sprite;
  heading: Phaser.Math.Vector2;
  speed: number;
  actionDurationTracker: number;
  physicsObject: Physics.Matter.Sprite;
  grabbed: boolean;
  awake: boolean;
  foodInTumTum: integer;
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
  };

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  if (gnome.speed > 0) {
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
}

export function ungrabGnome(gnome: Gnome) {
  gnome.grabbed = false;
}

export function grabGnome(gnome: Gnome) {
  gnome.grabbed = true;
}

export function feedGnome(gnome: Gnome): boolean {
  if (!gnome.awake) {
    return false;
  }

  gnome.foodInTumTum++;

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
    //TODO if gnome is old, die otherwise sleep
    sleep(gnome);
    return true;
  }

  return false;
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
