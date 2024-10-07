// https://phaser.io/examples/v3.85.0/input/zones/view/circular-drop-zone
import type { GameState } from '@/scenes/PlayScene';
import { Physics, type GameObjects } from 'phaser';
import {
  compareHat,
  createHat,
  destroyHatAndEverythingItStandsFor,
  Hat,
} from './hat';
import PlayScene from '@/scenes/PlayScene';
import { WINDOW_CENTER } from '@/config';

export interface SellBox {
  zone: GameObjects.Zone;
  hoverEnter: () => void;
  hoverLeave: () => void;
  hatOrder: Hat;
  winHat: Hat;
}

const boxCenterX = 112;
const boxCenterY = 84;

const quotaX = 280;
const quotaY = 64;

const winX = 455;
const winY = 64;

export function createSellBox(
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  gameState: GameState,
  playScene: PlayScene,
): SellBox {
  const zone = add.zone(boxCenterX, boxCenterY, 1, 1).setCircleDropZone(32);
  const hat = orderHat(add, physics, gameState, playScene);
  const winHat = createHat(
    winX,
    winY,
    add,
    physics,
    2,
    2,
    2,
    gameState,
    playScene,
    false,
    false,
  );

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
    winHat: winHat,
  };
}

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
  if (compareHat(hat, sellbox.winHat)) {
    gameState.cash += hatValue(hat) * 10;
    if (!gameState.hasWon) {
      congratulationsAreInOrder(playScene);
    }
  } else if (compareHat(hat, sellbox.hatOrder)) {
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

function congratulationsAreInOrder(p: PlayScene) {
  p.sound.setMute(true);
  p.time.timeScale = 0;
  p.gameState.hasWon = true;

  const cx = WINDOW_CENTER.x;
  const cy = WINDOW_CENTER.y;

  p.cameras.main.fadeOut(1000);

  p.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    const winScreen = p.add.image(cx, cy, 'win-screen');
    p.cameras.main.fadeIn(1000);

    p.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      p.input.once('pointerdown', () => {
        p.cameras.main.fadeOut(1000);
        p.cameras.main.once(
          Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          () => {
            winScreen.destroy();
            p.cameras.main.fadeIn(1000);
            p.time.timeScale = 1;
            p.sound.setMute(false);
          },
        );
      });
    });
  });
}
