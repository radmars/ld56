import { GameObjects, Input } from 'phaser';
import PlayScene, { GameState } from '@/scenes/PlayScene';
import { sellHat } from './sellbox';

export enum HatShape {
  a,
  b,
  c,
}

export enum HatColor {
  a,
  b,
  c,
}

export enum HatDecoration {
  a,
  b,
  c,
}

export const HatZone = 'TheHatZone';

export interface Hat {
  shape: HatShape;
  color: HatColor;
  decoration: HatDecoration;
  sprite: GameObjects.Sprite;
  decorationSprite: GameObjects.Sprite;
  zone?: GameObjects.Zone;
  container: GameObjects.Container;
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
  interactable: boolean = true,
): Hat {
  const sprite = add.sprite(0, 0, playScene.gameAssets!.hatTexture, 3 + pShape);
  const decorationSprite = add.sprite(
    0,
    15,
    playScene.gameAssets!.hatDecorationTexture,
    pDecoration,
  );

  //Color the hat
  switch (pColor) {
    case HatColor.a:
      sprite.setTint(0xdc3333);
      break;
    case HatColor.b:
      sprite.setTint(0x5b6ee1);
      break;
    case HatColor.c:
      sprite.setTint(0xfbca16);
      break;
  }

  const container = add.container(x, y);
  container.add([sprite, decorationSprite]);
  container.setSize(64, 64);
  container.setInteractive({ draggable: true });

  const hat: Hat = {
    shape: pShape,
    color: pColor,
    decoration: pDecoration,
    sprite,
    decorationSprite,
    container,
  };

  enableZone(hat, add);

  if (interactable) {
    container.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
      playScene.sound.play('pickup');
    });

    container.on(
      Input.Events.GAMEOBJECT_DRAG,
      (_: Input.Pointer, dragX: number, dragY: number) => {
        container.x = dragX;
        container.y = dragY;
        disableZone(hat);
      },
    );
    container.on(
      Input.Events.GAMEOBJECT_DRAG_LEAVE,
      (_: Input.Pointer, target: GameObjects.GameObject) => {
        if (target == gameState.sellBox?.zone) {
          gameState.sellBox.hoverLeave();
        }
      },
    );
    container.on(
      Input.Events.GAMEOBJECT_DRAG_ENTER,
      (_: Input.Pointer, target: GameObjects.GameObject) => {
        if (target == gameState.sellBox?.zone) {
          gameState.sellBox.hoverEnter();
        }
      },
    );
    container.on(Input.Events.GAMEOBJECT_DRAG_END, () => {
      console.log(`putting hat zone back`);
      enableZone(hat, add);
      playScene.sound.play('drop');
    });
    container.on(
      Input.Events.GAMEOBJECT_DROP,
      (_: Input.Pointer, target: GameObjects.GameObject) => {
        console.log(`Dropping hat on `, target.name);
        if (target == gameState.sellBox?.zone) {
          sellHat(hat, gameState.sellBox, gameState, add, playScene);
          gameState.sellBox?.hoverLeave();
          destroyHatAndEverythingItStandsFor(hat);
          playScene.sound.play('sell');
        } else if (target.name == HatZone) {
          const h = gameState.hats.find((h) => {
            return h.zone == target;
          });
          if (h) {
            //Do had seggs
            //TODO some sort of hat breeding animation/payoff before spawning gnome?

            destroyHatAndEverythingItStandsFor(h);
            destroyHatAndEverythingItStandsFor(hat);
            playScene.sound.play('hatgrow');
            playScene.spawnGnome(
              h.container.x,
              h.container.y,
              determineHatShapeGene(h, hat),
              determineHatColorGene(h, hat),
              determineHatDecorationGene(h, hat),
            );
          }
        } else {
          console.log(`putting hat zone back`);

          enableZone(hat, add);
        }
      },
    );
  }

  return hat;
}

export function disableZone(hat: Hat) {
  hat.zone?.destroy();
}

function enableZone(hat: Hat, add: GameObjects.GameObjectFactory) {
  hat.zone = add
    .zone(hat.container.x, hat.container.y, 32, 32)
    .setRectangleDropZone(32, 32);
  hat.zone.setName(HatZone);

  hat.container.setAbove(hat.zone);
}

export function destroyHatAndEverythingItStandsFor(h: Hat) {
  h.zone?.destroy();
  h.container.destroy();
}

function determineHatShapeGene(catcher: Hat, pitcher: Hat): HatShape {
  if (catcher.shape == HatShape.c || pitcher.shape == HatShape.c) {
    return HatShape.c;
  } else if (catcher.shape == HatShape.b || pitcher.shape == HatShape.b) {
    return HatShape.b;
  }

  return HatShape.a;
}

function determineHatColorGene(catcher: Hat, pitcher: Hat): HatColor {
  if (catcher.color == HatColor.c || pitcher.color == HatColor.c) {
    return HatColor.c;
  } else if (catcher.color == HatColor.b || pitcher.color == HatColor.b) {
    return HatColor.b;
  }

  return HatColor.a;
}

function determineHatDecorationGene(catcher: Hat, pitcher: Hat): HatDecoration {
  if (
    catcher.decoration == HatDecoration.c ||
    pitcher.decoration == HatDecoration.c
  ) {
    return HatDecoration.c;
  } else if (
    catcher.decoration == HatDecoration.b ||
    pitcher.decoration == HatDecoration.b
  ) {
    return HatDecoration.b;
  }

  return HatDecoration.a;
}

export function compareHat(hatA: Hat, hatB: Hat): boolean {
  if (hatA.shape != hatB.shape) {
    return false;
  }
  if (hatA.color != hatB.color) {
    return false;
  }
  if (hatA.decoration != hatB.decoration) {
    return false;
  }

  return true;
}
