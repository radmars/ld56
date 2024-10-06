import { Input, type GameObjects } from 'phaser';
import { GameState } from '@/scenes/PlayScene';

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
  gameState: GameState,
): Hat {
  const sprite = add.sprite(x, y, 'hat', 0);
  sprite.setInteractive({ draggable: true });

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
  sprite.on(
    Input.Events.GAMEOBJECT_DRAG_LEAVE,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target == gameState.sellBox?.zone) {
        gameState.sellBox.hoverLeave();
      }
    },
  );
  sprite.on(
    Input.Events.GAMEOBJECT_DRAG_ENTER,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target == gameState.sellBox?.zone) {
        gameState.sellBox.hoverEnter();
      }
    },
  );
  sprite.on(
    Input.Events.GAMEOBJECT_DROP,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target == gameState.sellBox?.zone) {
        gameState.sellBox?.hoverLeave();
        sprite.destroy();
      }
    },
  );

  return hat;
}
