import { WINDOW_WIDTH } from '@/config';
import type { GameAssets } from '@/scenes/PlayScene';
import type { GameObjects, Textures } from 'phaser';

export enum ItemType {
  Chicken,
  GreenMushroom,
}

export interface ConveyorBeltItem {
  sprite: GameObjects.Sprite;
  selected: boolean;
  /** null if it has been dragged away */
  item: Item | null;
}

function getItemTypeIcon(
  itemType: ItemType,
  assets: GameAssets,
): Textures.Texture {
  switch (itemType) {
    case ItemType.Chicken:
      return assets.chickenTexture;
    case ItemType.GreenMushroom:
      return assets.greenMushroomTexture;
  }
}
export interface Item {
  itemType: ItemType;
  sprite: GameObjects.Sprite;
}

export function createConveyorBeltItem(
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  itemType: ItemType,
): ConveyorBeltItem {
  const sprite = add.sprite(x, y, assets.unselectedButton, 0);
  sprite.setInteractive();

  const item = add.sprite(x, y, getItemTypeIcon(itemType, assets), 0);

  const beltItem: ConveyorBeltItem = {
    sprite,
    selected: false,
    item: {
      sprite: item,
      itemType,
    },
  };

  sprite.on('pointerover', () => toggleSelected(beltItem, assets));
  sprite.on('pointerout', () => toggleSelected(beltItem, assets));

  return beltItem;
}

function toggleSelected(button: ConveyorBeltItem, assets: GameAssets) {
  if (!button.selected) {
    button.sprite.setTexture(assets.selectedButton.key);
    button.selected = true;
  } else {
    button.sprite.setTexture(assets.unselectedButton.key);
    button.selected = false;
  }
}

/** @returns true if the thing should be removed */
export function buttonMove(beltItem: ConveyorBeltItem, delta: number) {
  beltItem.sprite.x += delta * 0.1;
  if (beltItem.item) {
    beltItem.item.sprite.x += delta * 0.1;
  }

  if (beltItem.sprite.x > WINDOW_WIDTH) {
    // Could make it go poof or something
    beltItem.sprite.destroy();
    if (beltItem.item) {
      beltItem.item.sprite.destroy();
    }
    return true;
  }
  return false;
}
