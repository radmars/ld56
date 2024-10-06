import { WINDOW_WIDTH } from '@/config';
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { Input, type GameObjects, type Textures } from 'phaser';
import { feedGnome, GnomeZone } from './gnome';
import { Belt } from './belt';

export enum ItemType {
  Chicken,
  GreenMushroom,
}

export interface ConveyorBeltItem {
  sprite: GameObjects.Sprite;
  /** null if it has been dragged away */
  item: Item | null;
  price: number;
  text: GameObjects.Text;
}

function getItemPrice(itemType: ItemType): number {
  switch (itemType) {
    case ItemType.Chicken:
      return 1;
    case ItemType.GreenMushroom:
      return 2;
  }
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

  const itemSprite = add.sprite(x, y, getItemTypeIcon(itemType, assets), 0);
  itemSprite.setInteractive({ draggable: true });

  const price = getItemPrice(itemType);

  const text = add.text(x - 7 * (1 + Math.log10(price)), y + 32, `$${price}`);

  const item: Item = {
    sprite: itemSprite,
    itemType,
  };

  const beltItem: ConveyorBeltItem = {
    sprite,
    item,
    text,
    price,
  };

  itemSprite.on(Input.Events.GAMEOBJECT_DRAG_START, () => {
    // Remove the item from the belt.
    if (beltItem.item) {
      beltItem.item = null;
      gameState.cash -= price;
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
          feedGnome(g, gameState, item.itemType);
          item.sprite.destroy();
        }
      }
    },
  );

  return beltItem;
}

export function updatePrices(belt: Belt, cash: number) {
  for (const item of belt.items) {
    if (!item.item) {
      item.text.setColor('rgb(120, 120, 120)');
    } else if (item.price > cash) {
      item.text.setColor('rgb(255,0,0)');
      item.item.sprite.disableInteractive();
    } else {
      item.text.setColor('rgb(0,255,0)');
      item.item.sprite.setInteractive();
    }
  }
}

function cleanupBeltItem(beltItem: ConveyorBeltItem) {
  // Could make it go poof or something
  beltItem.sprite.destroy();
  if (beltItem.item) {
    beltItem.item.sprite.destroy();
  }
  beltItem.text.destroy();
}

/** @returns true if the thing should be removed */
export function beltItemMove(beltItem: ConveyorBeltItem, delta: number) {
  beltItem.sprite.x += delta * 0.1;
  if (beltItem.item) {
    beltItem.item.sprite.x += delta * 0.1;
  }
  beltItem.text.x += delta * 0.1;

  if (beltItem.sprite.x > WINDOW_WIDTH) {
    cleanupBeltItem(beltItem);
    return true;
  }
  return false;
}
