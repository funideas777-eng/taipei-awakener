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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
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
