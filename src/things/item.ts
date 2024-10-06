import { WINDOW_WIDTH } from '@/config';
import type { GameAssets } from '@/scenes/PlayScene';
import { Input, Physics, type GameObjects, type Textures } from 'phaser';
import type { SellBox } from '@/things/sellbox';

export const ItemDataKey = 'ITEM_DATA';

export enum ItemType {
  Chicken,
  GreenMushroom,
}

export interface ConveyorBeltItem {
  sprite: GameObjects.Sprite;
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
  sellBox: SellBox,
  pointer: Physics.Matter.PointerConstraint,
): ConveyorBeltItem {
  const sprite = add.sprite(x, y, assets.unselectedButton, 0);
  sprite.setInteractive();

  const itemSprite = add.sprite(x, y, getItemTypeIcon(itemType, assets), 0);
  itemSprite.setInteractive({ draggable: true });

  const beltItem: ConveyorBeltItem = {
    sprite,
    item: {
      sprite: itemSprite,
      itemType,
    },
  };

  itemSprite.setData(ItemDataKey, beltItem.item);

  itemSprite.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
    // Remove the item from the belt.
    pointer.active = false;
    if (beltItem.item) {
      beltItem.item = null;
    }
  });

  itemSprite.on(
    Input.Events.GAMEOBJECT_DRAG,
    (_: Input.Pointer, dragX: number, dragY: number) => {
      itemSprite.x = dragX;
      itemSprite.y = dragY;
    },
  );

  // TODO: The belongs to hats, not items!
  itemSprite.on(
    Input.Events.GAMEOBJECT_DRAG_LEAVE,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target == sellBox.zone) {
        sellBox.hoverLeave();
      }
    },
  );
  // TODO: The belongs to hats, not items!
  itemSprite.on(
    Input.Events.GAMEOBJECT_DRAG_ENTER,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target == sellBox.zone) {
        sellBox.hoverEnter();
      }
    },
  );
  itemSprite.on(Input.Events.GAMEOBJECT_DRAG_END, () => {
    pointer.active = true;
  });

  return beltItem;
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
