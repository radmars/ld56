import { Input, type GameObjects } from 'phaser';

export enum HatShape {
  basic,
  flop,
  witch,
}

export enum HatColor {
  red,
  blue,
  gold,
}

export enum HatDecoration {
  none,
  star,
  moon,
}

export interface Hat {
  shape: HatShape;
  color: HatColor;
  decoration: HatDecoration;
  sprite: GameObjects.Sprite;
}

export function createHat(
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  pShape: HatShape,
  pColor: HatColor,
  pDecoration: HatDecoration,
): Hat {
  const sprite = add.sprite(x, y, 'hat', 0);
  sprite.setInteractive();

  const hat: Hat = {
    sprite,
    shape: pShape,
    color: pColor,
    decoration: pDecoration,
  };

  sprite.on(Input.Events.GAMEOBJECT_DRAG_START, () => {});

  sprite.on(
    Input.Events.GAMEOBJECT_DRAG,
    (_: Input.Pointer, dragX: number, dragY: number) => {
      sprite.x = dragX;
      sprite.y = dragY;
    },
  );

  return hat;
}
