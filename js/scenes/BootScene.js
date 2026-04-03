// Boot scene - load Grok-generated images + generate fallback sprites
import { SpriteGenerator } from '../utils/SpriteGenerator.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { audio } from '../systems/AudioSystem.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Loading bar
        const barW = Math.min(300, w * 0.6);
        const barH = 20;
        const barX = (w - barW) / 2;
        const barY = h / 2;
        const bg = this.add.rectangle(w / 2, barY, barW, barH, 0x1a1a2e).setStrokeStyle(1, 0x00d4ff);
        const bar = this.add.rectangle(barX + 2, barY, 0, barH - 4, 0x00d4ff).setOrigin(0, 0.5);
        const loadText = this.add.text(w / 2, barY - 30, '載入中...', {
            fontSize: '14px', fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5);

        this.load.on('progress', (v) => { bar.width = (barW - 4) * v; });
        this.load.on('complete', () => { bg.destroy(); bar.destroy(); loadText.destroy(); });

        // --- Load Grok-generated images ---
        // Title
        this.load.image('title-bg', 'assets/ui/title-bg.jpg');

        // Hero
        this.load.image('hero-portrait', 'assets/sprites/hero-portrait.jpg');

        // Monsters (mapped to existing sprite keys)
        this.load.image('grok-monster-slime', 'assets/sprites/slime-green.jpg');
        this.load.image('grok-monster-shadow', 'assets/sprites/shadow-soldier.jpg');
        this.load.image('grok-monster-mech', 'assets/sprites/mech-drone.jpg');
        this.load.image('grok-monster-smog', 'assets/sprites/smog-spirit.jpg');
        this.load.image('grok-monster-ghost', 'assets/sprites/ghost.jpg');
        this.load.image('grok-monster-deepsea', 'assets/sprites/deep-sea-beast.jpg');

        // Bosses
        this.load.image('grok-boss-data', 'assets/sprites/boss-data.jpg');
        this.load.image('grok-boss-chaos', 'assets/sprites/boss-chaos.jpg');
        this.load.image('grok-boss-mech', 'assets/sprites/boss-mech.jpg');
        this.load.image('grok-boss-smog', 'assets/sprites/boss-smog.jpg');
        this.load.image('grok-boss-time', 'assets/sprites/boss-time.jpg');
        this.load.image('grok-boss-abyss', 'assets/sprites/boss-abyss.jpg');

        // City backgrounds
        this.load.image('city-bg-taipei', 'assets/tiles/city-taipei-bg.jpg');
        this.load.image('city-bg-newtaipei', 'assets/tiles/city-newtaipei-bg.jpg');
        this.load.image('city-bg-taoyuan', 'assets/tiles/city-taoyuan-bg.jpg');
        this.load.image('city-bg-taichung', 'assets/tiles/city-taichung-bg.jpg');
        this.load.image('city-bg-tainan', 'assets/tiles/city-tainan-bg.jpg');
        this.load.image('city-bg-kaohsiung', 'assets/tiles/city-kaohsiung-bg.jpg');

        // Dungeon tilesets (as background reference images)
        this.load.image('dungeon-bg-tech', 'assets/tiles/dungeon-tech.jpg');
        this.load.image('dungeon-bg-shadow', 'assets/tiles/dungeon-shadow.jpg');
        this.load.image('dungeon-bg-mech', 'assets/tiles/dungeon-mech.jpg');
        this.load.image('dungeon-bg-storm', 'assets/tiles/dungeon-storm.jpg');
        this.load.image('dungeon-bg-time', 'assets/tiles/dungeon-time.jpg');
        this.load.image('dungeon-bg-abyss', 'assets/tiles/dungeon-abyss.jpg');

        // Building top-down views (for free-movement city map)
        this.load.image('grok-building-guild', 'assets/sprites/building-guild-topdown.jpg');
        this.load.image('grok-building-weapon', 'assets/sprites/building-weapon-topdown.jpg');
        this.load.image('grok-building-armor', 'assets/sprites/building-armor-topdown.jpg');
        this.load.image('grok-building-item', 'assets/sprites/building-item-topdown.jpg');
        this.load.image('grok-building-magic', 'assets/sprites/building-magic-topdown.jpg');
        this.load.image('grok-building-inn', 'assets/sprites/building-inn-topdown.jpg');
        this.load.image('grok-building-diamond', 'assets/sprites/building-diamond-topdown.jpg');

        // UI
        this.load.image('ui-elements', 'assets/ui/ui-elements.jpg');
        this.load.image('item-icons', 'assets/ui/item-icons.jpg');
        this.load.image('portal-anim', 'assets/sprites/portal-anim.jpg');
    }

    create() {
        // Generate all pixel sprites programmatically (as fallbacks + for keys Grok doesn't cover)
        SpriteGenerator.generateAll(this);

        // Override monster/boss textures with Grok images where available
        const grokOverrides = {
            'monster-slime': 'grok-monster-slime',
            'monster-shadow': 'grok-monster-shadow',
            'monster-mech': 'grok-monster-mech',
            'monster-smog': 'grok-monster-smog',
            'monster-ghost': 'grok-monster-ghost',
            'monster-deepsea': 'grok-monster-deepsea',
            'boss-data-devourer': 'grok-boss-data',
            'boss-chaos': 'grok-boss-chaos',
            'boss-mech-overlord': 'grok-boss-mech',
            'boss-smog-giant': 'grok-boss-smog',
            'boss-time-corruptor': 'grok-boss-time',
            'boss-abyss-lord': 'grok-boss-abyss',
            // Building overrides for city map
            'building-guild': 'grok-building-guild',
            'building-weapon': 'grok-building-weapon',
            'building-armor': 'grok-building-armor',
            'building-item': 'grok-building-item',
            'building-magic': 'grok-building-magic',
            'building-inn': 'grok-building-inn',
            'building-diamond': 'grok-building-diamond',
        };
        // Store the mapping for scenes to use
        this.registry.set('grokSprites', grokOverrides);

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
