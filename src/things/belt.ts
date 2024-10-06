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

export interface Belt {
  items: ConveyorBeltItem[];
  spawnTimer: Time.TimerEvent;
}

function getRandomItemType(): ItemType {
  return sample([ItemType.Chicken, ItemType.GreenMushroom]);
}

export function createBelt(
  gameState: GameState,
  add: GameObjects.GameObjectFactory,
  assets: GameAssets,
  time: Time.Clock,
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
