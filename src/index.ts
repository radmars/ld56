import Phaser from 'phaser';


export const SIZE = 800;
export const WINDOW_WIDTH = 800;
export const WINDOW_HEIGHT = 800;

export const WINDOW_CENTER = {
    x: WINDOW_WIDTH / 2,
    y: WINDOW_HEIGHT / 2,
};

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    pixelArt: true,
    physics: {
        default: 'arcade',
    },
	scene: [] as Phaser.Scene[],
};
const urlParams = new URLSearchParams(window.location.search);
const devMode = urlParams.get('dev') === 'true' ? true : false;

if (!devMode) {
    // config.scene.push(new RadmarsScreen());
}

new Phaser.Game(config);
