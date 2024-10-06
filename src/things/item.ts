import { WINDOW_WIDTH } from '@/config';
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { Input, type GameObjects, type Textures } from 'phaser';
import { feedGnome, GnomeZone } from './gnome';

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
  gameState: GameState,
  assets: GameAssets,
  x: number,
  y: number,
  add: GameObjects.GameObjectFactory,
  itemType: ItemType,
): ConveyorBeltItem {
  const sprite = add.sprite(x, y, assets.unselectedButton, 0);
  sprite.setInteractive();

  const itemSprite = add.sprite(x, y, getItemTypeIcon(itemType, assets), 0);
  itemSprite.setInteractive({ draggable: true });

  const item: Item = {
    sprite: itemSprite,
    itemType,
  };

  const beltItem: ConveyorBeltItem = {
    sprite,
    item,
  };

  itemSprite.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
    // Remove the item from the belt.
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
  itemSprite.on(
    Input.Events.GAMEOBJECT_DROP,
    (_: Input.Pointer, target: GameObjects.GameObject) => {
      if (target.name == GnomeZone) {
        const g = gameState.gnomes.find((g) => {
          return g.zone == target;
        });
        if (g) {
          if (feedGnome(g, gameState, item.itemType, add)) {
            item.sprite.destroy();
          }
        }
      }
    },
  );

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
