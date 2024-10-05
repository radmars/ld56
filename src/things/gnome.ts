import type { GameAssets } from '@/scenes/PlayScene';
import type { GameObjects } from 'phaser';

export interface Gnome {
  sprite: GameObjects.Sprite;
}

export function createGnome(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
): Gnome {
  const sprite = add.sprite(x, y, assets.gnomeTexture, 0);
  sprite.play(assets.gnomeWalkAnimation);

  return {
    sprite,
  };
}
