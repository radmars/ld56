import type { GameAssets } from '@/scenes/PlayScene';
import type { GameObjects } from 'phaser';

const walkDuration: number = 1000
const pauseDuration: number = 1500
const walkSpeed: number = .05

export interface Gnome {
  sprite: GameObjects.Sprite;
  heading: Phaser.Math.Vector2
  speed: number
  actionDurationTracker: number
}

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
): Gnome {
  const sprite = add.sprite(x, y, assets.gnomeTexture, 0);
  sprite.play(assets.gnomeWalkAnimation);

  const heading = new Phaser.Math.Vector2();
  heading.x = 1
  heading.y = 0
  const speed = 0
  const actionDurationTracker: number = 0;
  return {
    sprite,
    heading,
    speed,
    actionDurationTracker
  };
}

export function updateGnome(gnome:Gnome, deltaTime:number) : void {
  if(gnome.speed > 0) {
    gnome.sprite.x += gnome.heading.x * gnome.speed * deltaTime
    gnome.sprite.y += gnome.heading.y * gnome.speed * deltaTime
  }

  gnome.actionDurationTracker -= deltaTime;
  if(gnome.actionDurationTracker <= 0) {
    if(gnome.speed > 0) {
      gnome.speed = 0;
      gnome.actionDurationTracker = pauseDuration;
    }
    else {
      gnome.speed = walkSpeed
      gnome.actionDurationTracker = walkDuration;
      //pick a new direction to walk
      gnome.heading.rotate(Phaser.Math.Between(0, 360))
    }

  }
}
