import { Input, type GameObjects } from 'phaser';
import PlayScene, { GameState } from '@/scenes/PlayScene';

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

export const HatZone = 'TheHatZone';

export interface Hat {
  shape: HatShape;
  color: HatColor;
  decoration: HatDecoration;
  sprite: GameObjects.Sprite;
  zone: GameObjects.Zone;
}

export function createHat(
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  pShape: HatShape,
  pColor: HatColor,
  pDecoration: HatDecoration,
  gameState: GameState,
  playScene: PlayScene,
): Hat {
  const sprite = add.sprite(x, y, playScene.gameAssets!.hatTexture, 4);
  sprite.setInteractive({ draggable: true });

  const zone = add.zone(x, y, 32, 32).setRectangleDropZone(32, 32);
  zone.setName(HatZone);
  sprite.setAbove(zone);

  const hat: Hat = {
    sprite,
    shape: pShape,
    color: pColor,
    decoration: pDecoration,
    zone,
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
      console.log(`Deopping hat on  ${target.name}`);
      if (target == gameState.sellBox?.zone) {
        gameState.sellBox?.hoverLeave();
        sprite.destroy();
      } else if (target.name == HatZone) {
        const h = gameState.hats.find((h) => {
          return h.zone == target;
        });
        if (h) {
          //Do had seggs
          //TODO some sort of hat breeding animation/payoff before spawning gnome?

          h.sprite.destroy();
          sprite.destroy();
          playScene.spawnGnome(h.sprite.x, h.sprite.y);
        }
      }
    },
  );

  return hat;
}
