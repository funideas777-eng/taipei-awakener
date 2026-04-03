import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { PrologueScene } from './scenes/PrologueScene.js';
import { CityScene } from './scenes/CityScene.js';
import { DungeonScene } from './scenes/DungeonScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { DialogScene } from './scenes/DialogScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#0a0a0a',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 320, height: 480 },
        max: { width: 1920, height: 1080 },
    },
    input: {
        activePointers: 3,
        touch: { capture: true },
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    dom: { createContainer: false },
    scene: [
        BootScene,
        TitleScene,
        PrologueScene,
        CityScene,
        DungeonScene,
        BattleScene,
        ShopScene,
        MenuScene,
        DialogScene
    ]
};

const game = new Phaser.Game(config);

// Prevent default touch behaviors
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
