import { WINDOW_WIDTH } from '@/config';
import type { GameAssets } from '@/scenes/PlayScene';
import { Input, type GameObjects, type Textures } from 'phaser';

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
  item.setInteractive({ draggable: true });

  const beltItem: ConveyorBeltItem = {
    sprite,
    selected: false,
    item: {
      sprite: item,
      itemType,
    },
  };

  sprite.on(Input.Events.GAMEOBJECT_POINTER_OVER, () => {
    return toggleSelected(beltItem, assets);
  });
  sprite.on(Input.Events.GAMEOBJECT_POINTER_OUT, () => {
    return toggleSelected(beltItem, assets);
  });

  item.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
    // Remove the item from the belt.
    if (beltItem.item) {
      beltItem.item = null;
    }
  });

  item.on(
    Input.Events.GAMEOBJECT_DRAG,
    (_: Input.Pointer, dragX: number, dragY: number) => {
      item.x = dragX;
      item.y = dragY;
    },
  );

  return beltItem;
}

function toggleSelected(beltItem: ConveyorBeltItem, assets: GameAssets) {
  if (!beltItem.selected) {
    beltItem.sprite.setTexture(assets.selectedButton.key);
    beltItem.selected = true;
  } else {
    beltItem.sprite.setTexture(assets.unselectedButton.key);
    beltItem.selected = false;
  }
}

/** @returns true if the thing should be removed */
export function beltItemMove(beltItem: ConveyorBeltItem, delta: number) {
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
