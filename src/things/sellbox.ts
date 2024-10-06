// https://phaser.io/examples/v3.85.0/input/zones/view/circular-drop-zone
import type { GameAssets } from '@/scenes/PlayScene';
import { type GameObjects } from 'phaser';

export interface SellBox {
  sprite: GameObjects.Sprite;
  zone: GameObjects.Zone;
  hoverEnter: () => void;
  hoverLeave: () => void;
}

export function createSellBox(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
): SellBox {
  const sprite = add.sprite(x, y, assets.sellBoxTexture, 0);
  sprite.depth -= 1;

  const zone = add.zone(x, y, 64, 64).setRectangleDropZone(64, 64);

  return {
    sprite,
    zone,
    hoverEnter: () => {
      sprite.setTexture(assets.sellBoxHoverTexture.key);
    },
    hoverLeave: () => {
      sprite.setTexture(assets.sellBoxTexture.key);
    },
  };
}
