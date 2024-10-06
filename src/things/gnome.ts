import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { type GameObjects, type Physics } from 'phaser';
import { ItemType } from '@/things//item';
import PlayScene from '@/scenes/PlayScene';

const walkDuration: number = 1000;
const pauseDuration: number = 1500;
const sleepDuration: number = 10000;
const walkSpeed: number = 0.05;
const poopThreshold: integer = 3;

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
  playScene: PlayScene;
}

// drag/throw
// https://labs.phaser.io/view.html?src=src/physics\matterjs\drag%20with%20pointer.js

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  matter: Physics.Matter.MatterPhysics,
  pPlayscene: PlayScene,
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
    playScene: pPlayscene,
  };

  return gnome;
}

export function updateGnome(gnome: Gnome, deltaTime: number): void {
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

  gnome.zone.x = gnome.container.x;
  gnome.zone.y = gnome.container.y;
}

export function ungrabGnome(gnome: Gnome) {
  gnome.grabbed = false;
}

export function grabGnome(gnome: Gnome) {
  gnome.grabbed = true;
}

export function feedGnome(
  gnome: Gnome,
  gameState: GameState,
  itemType: ItemType,
) {
  if (!gnome.awake) {
    return false;
  }
  console.log(`Feeding ${gnome} a ${itemType}`);

  gnome.foodInTumTum++;

  if (gnome.foodInTumTum >= poopThreshold) {
    layHat(gnome);
    //TODO if gnome is old, die otherwise sleep
    sleep(gnome);
    gnome.playScene.spawnHat(gnome.container.x, gnome.container.y);
  }

  return true;
}

export function layHat(gnome: Gnome) {
  //Do animation for pooping a hat
  gnome.body.play('gnome-young-lay-hat');
  gnome.body.chain('gnome-young-sleep');
}

export function sleep(gnome: Gnome) {
  gnome.awake = false;
  gnome.actionDurationTracker = sleepDuration;
  gnome.speed = 0;
  gnome.foodInTumTum = 0;
}

export function awake(gnome: Gnome) {
  gnome.body.play('gnome-young-walk');
  gnome.awake = true;
  gnome.actionDurationTracker = 0;
  gnome.foodInTumTum = 0;
}
