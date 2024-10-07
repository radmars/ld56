import { Physics, Time, type GameObjects } from 'phaser';
import {
  beltItemMove,
  createConveyorBeltItem,
  type ConveyorBeltItem,
} from '@/things/item';
import { remove, sample } from 'lodash';
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { WINDOW_HEIGHT } from '@/config';
import PlayScene from '@/scenes/PlayScene';
import { ItemType } from './item-enums';

export const beltHeight = 100;
const fontHeight = 16;

export interface Belt {
  items: ConveyorBeltItem[];
  spawnTimer: Time.TimerEvent;
}

const available = [
  ItemType.Rat,
  ItemType.Rat,
  ItemType.Rat,
  ItemType.Rat,
  ItemType.Rat,
  ItemType.Mushroom,
  ItemType.Mushroom,
  ItemType.MoonCookie,
  ItemType.MoonCookie,
  ItemType.Potion,
  ItemType.Potion,
  ItemType.Eraser,
  ItemType.TrafficCone,
  ItemType.Birdbath,
  ItemType.Rock,
  ItemType.PhilStone,
  ItemType.Wand,
];

export function removeFromAvailable(i: ItemType) {
  remove(available, (j) => {
    return i == j;
  });
}

function getRandomItemType(): ItemType {
  return sample(available) as ItemType;
}

export function createBelt(
  gameState: GameState,
  add: GameObjects.GameObjectFactory,
  physics: Physics.Arcade.ArcadePhysics,
  assets: GameAssets,
  time: Time.Clock,
  playScene: PlayScene,
) {
  const belt: Belt = {
    items: [],
    spawnTimer: new Time.TimerEvent({
      delay: 1000,
      repeat: -1,
      callback: function () {
        belt.items.push(
          createConveyorBeltItem(
            gameState,
            assets,
            0,
            WINDOW_HEIGHT - (beltHeight + fontHeight) / 2,
            add,
            physics,
            getRandomItemType(),
            playScene,
          ),
        );
      },
    }),
  };

  time.addEvent(belt.spawnTimer);

  return belt;
}

export function updateBelt(belt: Belt, delta: number) {
  remove(belt.items, (b) => {
    return beltItemMove(b, delta);
  });
}
