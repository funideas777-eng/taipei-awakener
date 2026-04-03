// Boot scene - generate all sprites and assets
import { SpriteGenerator } from '../utils/SpriteGenerator.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { audio } from '../systems/AudioSystem.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        // Generate all pixel sprites programmatically
        SpriteGenerator.generateAll(this);

        // Create global player instance
        this.registry.set('player', new PlayerSystem());
        // Store audio system globally
        this.registry.set('audio', audio);

        // Create player walk animations
        const dirs = ['down', 'left', 'right', 'up'];
        dirs.forEach((dir, row) => {
            this.anims.create({
                key: `walk-${dir}`,
                frames: [
                    { key: 'player-sheet', frame: row * 3 },
                    { key: 'player-sheet', frame: row * 3 + 1 },
                    { key: 'player-sheet', frame: row * 3 + 2 },
                    { key: 'player-sheet', frame: row * 3 + 1 },
                ],
                frameRate: 8,
                repeat: -1,
            });
        });

        this.scene.start('Title');
    }
}
