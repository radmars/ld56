import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;
const walkSpeed: number = 0.05;

export interface Gnome {
  sprite: GameObjects.Sprite;
  heading: Phaser.Math.Vector2;
  speed: number;
  actionDurationTracker: number;
  physicsObject: Physics.Matter.Sprite;
  grabbed: boolean;
}

// drag/throw
// https://labs.phaser.io/view.html?src=src/physics\matterjs\drag%20with%20pointer.js

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  matter: Phaser.Physics.Matter.MatterPhysics,
): Gnome {
  const sprite = add.sprite(x, y, assets.gnomeTexture.key, 0);
  sprite.setInteractive();
  sprite.play(assets.gnomeWalkAnimation);

  const heading = new Phaser.Math.Vector2();
  heading.x = 1;
  heading.y = 0;
  const speed = 0;
  const actionDurationTracker: number = 0;
  const physicsObject = matter.add.gameObject(sprite) as Physics.Matter.Sprite;
  physicsObject.setBounce(0.1);

  return {
    sprite,
    heading,
    speed,
    actionDurationTracker,
    physicsObject,
    grabbed: false,
  };
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
  if (gnome.speed > 0) {
    gnome.sprite.x += gnome.heading.x * gnome.speed * deltaTime;
    gnome.sprite.y += gnome.heading.y * gnome.speed * deltaTime;
  }

  gnome.actionDurationTracker -= deltaTime;
  if (gnome.actionDurationTracker <= 0) {
    if (gnome.speed > 0) {
      gnome.speed = 0;
      gnome.actionDurationTracker = pauseDuration;
    } else {
      gnome.speed = walkSpeed;
      gnome.actionDurationTracker = walkDuration;
      //pick a new direction to walk
      gnome.heading.rotate(Phaser.Math.Between(0, 360));
    }
  }
}

export function ungrabGnome(gnome: Gnome) {
  gnome.grabbed = false;
}

export function grabGnome(gnome: Gnome) {
  gnome.grabbed = true;
}
