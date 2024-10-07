import { GameObjects, Input, Physics } from 'phaser';
import PlayScene, { GameState } from '@/scenes/PlayScene';
import { sellHat } from './sellbox';
import { chuckRandom } from './physics';

export enum HatShape {
  Cone,
  Floppy,
  Wizard,
}

export enum HatColor {
  Red,
  Blue,
  Gold,
}

export enum HatDecoration {
  None,
  Moon,
  Star,
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
  consumed: boolean;
}

export function createHat(
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  pShape: HatShape,
  pColor: HatColor,
  pDecoration: HatDecoration,
  gameState: GameState,
  playScene: PlayScene,
  interactable: boolean,
  chuck: boolean,
): Hat {
  const sprite = add.sprite(0, 0, playScene.gameAssets!.hatTexture, 3 + pShape);
  const decorationSprite = add.sprite(
    0,
    15,
    playScene.gameAssets!.hatDecorationTexture,
    2 - pDecoration,
  );

  // Color the hat
  switch (pColor) {
    case HatColor.Red:
      sprite.setTint(0xdc3333);
      break;
    case HatColor.Blue:
      sprite.setTint(0x5b6ee1);
      break;
    case HatColor.Gold:
      sprite.setTint(0xfbca16);
      break;
  }

  const container = add.container(x, y);
  container.add([sprite, decorationSprite]);
  container.setSize(64, 64);
  container.setInteractive({ draggable: true });

  physics.add.existing(container);
  const body = container.body as Physics.Arcade.Body;
  body.setCollideWorldBounds(true, 1, 1, true);

  if (chuck) {
    chuckRandom(body);
  }

  const hat: Hat = {
    shape: pShape,
    color: pColor,
    decoration: pDecoration,
    sprite,
    decorationSprite,
    container,
    consumed: false,
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
      enableZone(hat, add);
      playScene.sound.play('drop');
    });
    container.on(
      Input.Events.GAMEOBJECT_DROP,
      (_: Input.Pointer, target: GameObjects.GameObject) => {
        console.log(`Dropping hat on `, target.name);
        if (target == gameState.sellBox?.zone) {
          sellHat(hat, gameState.sellBox, gameState, add, physics, playScene);
          gameState.sellBox?.hoverLeave();
          destroyHatAndEverythingItStandsFor(hat);
          playScene.sound.play('sell');
        } else if (target.name == HatZone) {
          const h = gameState.hats.find((h) => {
            return h.zone == target;
          });
          if (h) {
            // Do had seggs
            // TODO: some sort of hat breeding animation/payoff before spawning gnome?

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
  h.consumed = true;
}

function determineHatShapeGene(catcher: Hat, pitcher: Hat): HatShape {
  if (catcher.shape == HatShape.Wizard || pitcher.shape == HatShape.Wizard) {
    return HatShape.Wizard;
  } else if (
    catcher.shape == HatShape.Floppy ||
    pitcher.shape == HatShape.Floppy
  ) {
    return HatShape.Floppy;
  }

  return HatShape.Cone;
}

function determineHatColorGene(catcher: Hat, pitcher: Hat): HatColor {
  if (catcher.color == HatColor.Gold || pitcher.color == HatColor.Gold) {
    return HatColor.Gold;
  } else if (catcher.color == HatColor.Blue || pitcher.color == HatColor.Blue) {
    return HatColor.Blue;
  }

  return HatColor.Red;
}

function determineHatDecorationGene(catcher: Hat, pitcher: Hat): HatDecoration {
  if (
    catcher.decoration == HatDecoration.Star ||
    pitcher.decoration == HatDecoration.Star
  ) {
    return HatDecoration.Star;
  } else if (
    catcher.decoration == HatDecoration.Moon ||
    pitcher.decoration == HatDecoration.Moon
  ) {
    return HatDecoration.Moon;
  }

  return HatDecoration.None;
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

export function updateHat(hat: Hat) {
  if (
    hat.container.body?.velocity.x != 0 ||
    hat.container.body.velocity.y != 0
  ) {
    hat.zone?.setPosition(hat.container.x, hat.container.y);
  }
}
