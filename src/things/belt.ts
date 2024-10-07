import { Time, type GameObjects } from 'phaser';
import {
  beltItemMove,
  createConveyorBeltItem,
  ItemType,
  type ConveyorBeltItem,
} from '@/things/item';
import { remove, sample } from 'lodash';
import type { GameAssets, GameState } from '@/scenes/PlayScene';
import { WINDOW_HEIGHT } from '@/config';
import PlayScene from '@/scenes/PlayScene';

export interface Belt {
  items: ConveyorBeltItem[];
  spawnTimer: Time.TimerEvent;
}

function getRandomItemType(): ItemType {
  return sample([
    ItemType.Rat,
    ItemType.Mushroom,
    ItemType.Eraser,
    ItemType.TrafficCone,
    ItemType.Birdbath,
    ItemType.MoonCookie,
    ItemType.Rock,
    ItemType.PhilStone,
    ItemType.Wand,
    ItemType.Potion,
  ]);
}

export function createBelt(
  gameState: GameState,
  add: GameObjects.GameObjectFactory,
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
            WINDOW_HEIGHT - 68,
            add,
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
