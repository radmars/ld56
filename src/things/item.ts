import { WINDOW_WIDTH } from '@/config';
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import PlayScene from '@/scenes/PlayScene';
import { Input, type GameObjects, type Textures } from 'phaser';
import { feedGnome, GnomeZone } from './gnome';
import { Belt } from './belt';

export enum ItemType {
  Rat,
  Mushroom,
  Eraser,
  TrafficCone,
  Birdbath,
  MoonCookie,
  Rock,
  PhilStone,
  Wand,
  Potion,
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
    case ItemType.Rat:
      return 1;
    case ItemType.Mushroom:
      return 1;
    case ItemType.Eraser:
      return 5;
    case ItemType.TrafficCone:
      return 5;
    case ItemType.Birdbath:
      return 50;
    case ItemType.MoonCookie:
      return 20;
    case ItemType.Rock:
      return 50;
    case ItemType.PhilStone:
      return 999;
    case ItemType.Wand:
      return 500;
    case ItemType.Potion:
      return 200;
  }
}

function getItemTypeIcon(
  itemType: ItemType,
  assets: GameAssets,
): Textures.Texture {
  switch (itemType) {
    case ItemType.Rat:
      return assets.ratTexture;
    case ItemType.Mushroom:
      return assets.mushroomTexture;
    case ItemType.Eraser:
      return assets.eraserTexture;
    case ItemType.TrafficCone:
      return assets.trafficConeTexture;
    case ItemType.Birdbath:
      return assets.birdbathTexture;
    case ItemType.MoonCookie:
      return assets.mooncookieTexture;
    case ItemType.Rock:
      return assets.rockTexture;
    case ItemType.PhilStone:
      return assets.philstoneTexture;
    case ItemType.Wand:
      return assets.wandTexture;
    case ItemType.Potion:
      return assets.potionTexture;
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
  playScene: PlayScene,
): ConveyorBeltItem {
  const sprite = add.sprite(x, y, assets.unselectedButton, 0);

  const itemSprite = add.sprite(x, y, getItemTypeIcon(itemType, assets), 0);
  itemSprite.setInteractive({ draggable: true });

  const price = getItemPrice(itemType);
  const priceText = `$${price}`;

  const text = add.text(x, y + 32, priceText);
  text.setOrigin(0.5, 0);

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
    playScene.sound.play('pickup');
    if (beltItem.item) {
      beltItem.item = null;
      gameState.cash -= price;
      playScene.sound.play('buy');
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
          if (feedGnome(g, gameState, item.itemType)) {
            item.sprite.destroy();
          }
        }
      }
      playScene.sound.play('drop');
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
