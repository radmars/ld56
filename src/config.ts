import RadmarsScreen from '@/scenes/RadmarsScreen';
import PlayScene from './scenes/PlayScene';
import { GameOver } from './scenes/GameOver';
import SplashScreen from './scenes/SplashScreen';

export const WINDOW_WIDTH = 800;
export const WINDOW_HEIGHT = 800;

export const WINDOW_CENTER = {
  x: WINDOW_WIDTH / 2,
  y: WINDOW_HEIGHT / 2,
};

export const getConfig = (): Phaser.Types.Core.GameConfig => {
  const urlParams = new URLSearchParams(window.location.search);
  const devMode = urlParams.get('dev') === 'true' ? true : false;
  return {
    // Div to bind in index.html
    parent: 'gamearea',
    type: Phaser.AUTO,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true,
      },
    },
    scene: [
      ...(!devMode ? [new RadmarsScreen(), new SplashScreen()] : []),
      new PlayScene(),
      new GameOver(),
    ],
  };
};
