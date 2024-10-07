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
  zone: GameObjects.Zone;
  hoverEnter: () => void;
  hoverLeave: () => void;
  hatOrder: Hat;
}

const boxCenterX = 112;
const boxCenterY = 84;

export function createSellBox(
  assets: GameAssets,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  gameState: GameState,
  playScene: PlayScene,
): SellBox {
  const zone = add.zone(boxCenterX, boxCenterY, 1, 1).setCircleDropZone(32);
  const hat = orderHat(add, physics, gameState, playScene);

  return {
    zone,
    // TODO: Add highlight while hovering with sellable item
    hoverEnter: () => {
      // sprite.setTexture(assets.sellBoxHoverTexture.key);
    },
    hoverLeave: () => {
      // sprite.setTexture(assets.sellBoxTexture.key);
    },
    hatOrder: hat,
  };
}

const quotaX = 300;
const quotaY = 64;

function orderHat(
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  gameState: GameState,
  playScene: PlayScene,
): Hat {
  let maxTier = 1;
  if (gameState.cash >= 200) {
    maxTier = 2;
  }

  const newOrder = createHat(
    quotaX,
    quotaY,
    add,
    physics,
    Phaser.Math.Between(0, maxTier),
    Phaser.Math.Between(0, maxTier),
    Phaser.Math.Between(0, maxTier),
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
    gameState.cash += hatValue(hat) * 4;
    sellbox.hatOrder = orderHat(add, physics, gameState, playScene);
  } else {
    gameState.cash += hatValue(hat);
  }
}

function hatValue(hat: Hat): number {
  return 25 * (hat.shape + 1) * (hat.color + 1) * (hat.decoration + 1);
}
