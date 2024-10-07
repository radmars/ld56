// https://phaser.io/examples/v3.85.0/input/zones/view/circular-drop-zone
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { Physics, type GameObjects } from 'phaser';
import {
  compareHat,
  createHat,
  destroyHatAndEverythingItStandsFor,
  Hat,
} from './hat';
import PlayScene from '@/scenes/PlayScene';

export interface SellBox {
  sprite: GameObjects.Sprite;
  zone: GameObjects.Zone;
  hoverEnter: () => void;
  hoverLeave: () => void;
  hatOrder: Hat;
}

export function createSellBox(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  gameState: GameState,
  playScene: PlayScene,
): SellBox {
  const sprite = add.sprite(x, y, assets.sellBoxTexture, 0);
  sprite.depth -= 1;

  const zone = add.zone(x, y, 64, 64).setRectangleDropZone(64, 64);

  const hat = orderHat(x, y, add, physics, gameState, playScene);

  return {
    sprite,
    zone,
    hoverEnter: () => {
      sprite.setTexture(assets.sellBoxHoverTexture.key);
    },
    hoverLeave: () => {
      sprite.setTexture(assets.sellBoxTexture.key);
    },
    hatOrder: hat,
  };
}

function orderHat(
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  gameState: GameState,
  playScene: PlayScene,
): Hat {
  const newOrder = createHat(
    x + 100,
    y,
    add,
    physics,
    Phaser.Math.Between(0, 2),
    Phaser.Math.Between(0, 2),
    Phaser.Math.Between(0, 2),
    gameState,
    playScene,
    false,
    false,
  );

  return newOrder;
}

export function sellHat(
  hat: Hat,
  sellbox: SellBox,
  gameState: GameState,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  playScene: PlayScene,
) {
  if (compareHat(hat, sellbox.hatOrder)) {
    destroyHatAndEverythingItStandsFor(sellbox.hatOrder);
    gameState.cash += 2000;
    sellbox.hatOrder = orderHat(
      sellbox.sprite.x,
      sellbox.sprite.y,
      add,
      physics,
      gameState,
      playScene,
    );
  } else {
    gameState.cash +=
      25 * (hat.shape + 1) * (hat.color + 1) * (hat.decoration + 1);
  }
}
