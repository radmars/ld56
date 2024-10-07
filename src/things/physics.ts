import { Physics } from 'phaser';

const chuckSpeed = 300;

export function chuckRandom(body: Physics.Arcade.Body) {
  const v = new Phaser.Math.Vector2();
  Phaser.Math.RandomXY(v, chuckSpeed);
  const vx = v.x;
  const vy = v.y;

  body.setVelocity(vx, vy).setDrag(Math.abs(vx), Math.abs(vy));
}
