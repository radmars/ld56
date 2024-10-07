import { GameObjects, Input } from 'phaser';
import PlayScene, { GameState } from '@/scenes/PlayScene';

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
  decorationSprite: GameObjects.Image;
  zone?: GameObjects.Zone;
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
  const sprite = add.sprite(x, y, playScene.gameAssets!.hatTexture, 3 + pShape);
  sprite.setInteractive({ draggable: true });
  const decorationSprite = add.sprite(
    x,
    y,
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


  const zone = add.zone(x, y, 32, 32).setRectangleDropZone(32, 32);
  zone.setName(HatZone);
  sprite.setAbove(zone);

  const hat: Hat = {
    shape: pShape,
    color: pColor,
    decoration: pDecoration,
    sprite,
    decorationSprite,
    zone,
  };

  sprite.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
    playScene.sound.play('pickup');
  });

  sprite.on(
    Input.Events.GAMEOBJECT_DRAG,
    (_: Input.Pointer, dragX: number, dragY: number) => {
      sprite.x = dragX;
      sprite.y = dragY;
      zone.destroy();
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
  sprite.on(Input.Events.GAMEOBJECT_DRAG_END, () => {
    console.log(`putting hat zone back`);
    hat.zone = add
      .zone(sprite.x, sprite.y, 32, 32)
      .setRectangleDropZone(32, 32);
    hat.zone.setName(HatZone);
    sprite.setAbove(hat.zone);
    playScene.sound.play('drop');
  });
  sprite.on(
    Input.Events.GAMEOBJECT_DROP,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      console.log(`Dropping hat on `, target.name);
      if (target == gameState.sellBox?.zone) {
        gameState.cash += 50;
        gameState.sellBox?.hoverLeave();
        sprite.destroy();
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
            h.sprite.x,
            h.sprite.y,
            determineHatShapeGene(h, hat),
            determineHatColorGene(h, hat),
            determineHatDecorationGene(h, hat),
          );
        }
      } else {
        console.log(`putting hat zone back`);
        hat.zone = add
          .zone(sprite.x, sprite.y, 32, 32)
          .setRectangleDropZone(32, 32);
        hat.zone.setName(HatZone);
        sprite.setAbove(hat.zone);
      }
    },
  );

  return hat;
}

function destroyHatAndEverythingItStandsFor(h: Hat) {
  h.sprite.destroy();
  h.zone?.destroy();
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
