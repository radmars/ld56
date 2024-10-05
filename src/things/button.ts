import type { GameAssets } from '@/scenes/PlayScene';
import type { GameObjects } from 'phaser';

export enum ButtonType {
  Chicken,
}

export interface Button {
  sprite: GameObjects.Sprite;
  selected: boolean;
  buttonType: ButtonType;
}

export function createButton(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  buttonType: ButtonType,
  callback: () => void,
): Button {
  const sprite = add.sprite(x, y, assets.unselectedButton, 0);
  sprite.setInteractive();

  const button = {
    sprite,
    selected: false,
    buttonType,
  };

  sprite.on('pointerover', () => toggleSelected(button, assets));
  sprite.on('pointerout', () => toggleSelected(button, assets));
  sprite.on('pointerup', () => callback());

  return button;
}

export function toggleSelected(button: Button, assets: GameAssets) {
  console.log('Toggle?');
  if (!button.selected) {
    button.sprite.setTexture(assets.selectedButton.key);
    button.selected = true;
  } else {
    button.sprite.setTexture(assets.unselectedButton.key);
    button.selected = false;
  }
}
