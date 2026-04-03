// Dungeon scene - free movement with monster patrol AI
import { MapGenerator } from '../utils/MapGenerator.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS, DUNGEON_THEMES, RANK_REWARDS } from '../data/dungeons.js';
import { CITIES } from '../data/cities.js';
import { STORY } from '../data/story.js';
import { VirtualJoystick } from '../utils/VirtualJoystick.js';

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super('Dungeon');
    }

    init(data) {
        this.cityKey = data.city || 'taipei';
        this.rank = data.rank || 'E';
        this.hasBoss = data.hasBoss || false;
    }

    create() {
        this.player = this.registry.get('player');
        this.audio = this.registry.get('audio');
        this.audio.playBGM('dungeon');

        const city = CITIES[this.cityKey];
        const theme = DUNGEON_THEMES[city.theme];
        const rankInfo = PORTAL_RANKS[this.rank];

        const TILE = 32;
        this.TILE = TILE;
        this.SPEED = 140;
        this.theme = theme;

        // Generate dungeon
        const dungeon = MapGenerator.generateDungeon(40, 30, city.theme);
        this.dungeonData = dungeon;
        const worldW = dungeon.width * TILE;
        const worldH = dungeon.height * TILE;

        this.physics.world.setBounds(0, 0, worldW, worldH);

        const wallColor = Phaser.Display.Color.HexStringToColor(theme.wallColor).color;
        const floorColor = Phaser.Display.Color.HexStringToColor(theme.floorColor).color;
        this.cameras.main.setBackgroundColor(theme.wallColor);

        // Background overlay
        const bgKey = `dungeon-bg-${city.theme}`;
        if (this.textures.exists(bgKey)) {
            this.add.image(worldW / 2, worldH / 2, bgKey)
                .setDisplaySize(worldW, worldH).setAlpha(0.15).setDepth(0);
        }

        // Render map + collision
        this._renderMap(dungeon, TILE, wallColor, floorColor);

        // Player
        this._createPlayer(dungeon, TILE);

        // Monsters
        this.monsterSprites = [];
        this._placeMonsters(dungeon, TILE);

        // Camera
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        this.joystick = new VirtualJoystick(this, 80, camH - 90);

        // HUD
        const s = Math.min(camW / 800, camH / 600);
        this.add.text(8, 5, `${theme.name} — ${rankInfo.name}`, {
            fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace',
            color: theme.accentColor, backgroundColor: '#000000aa', padding: { x: 5, y: 2 }
        }).setScrollFactor(0).setDepth(999);

        this.add.text(camW - 8, 5, '離開', {
            fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#e74c3c',
            backgroundColor: '#000000aa', padding: { x: 6, y: 3 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(999)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));

        this.statusText = this.add.text(8, camH - 28, '', {
            fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#bdc3c7',
            backgroundColor: '#000000aa', padding: { x: 5, y: 2 }
        }).setScrollFactor(0).setDepth(999);
        this._updateStatus();

        this._inBattle = false;
    }

    update() {
        if (this._inBattle) return;
        this._handleMovement();
        this._updateMonsters();
        this._updateStatus();
    }

    _renderMap(dungeon, T, wallColor, floorColor) {
        const gfx = this.add.graphics().setDepth(1);
        this.wallGroup = this.physics.add.staticGroup();

        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                const cell = dungeon.map[y][x];
                const px = x * T, py = y * T;

                if (cell === 1) {
                    gfx.fillStyle(wallColor, 1);
                    gfx.fillRect(px, py, T, T);
                    const body = this.add.zone(px + T / 2, py + T / 2, T, T);
                    this.physics.add.existing(body, true);
                    this.wallGroup.add(body);
                } else if (cell === 2) {
                    gfx.fillStyle(0x2ecc71, 1);
                    gfx.fillRect(px, py, T, T);
                } else if (cell === 3) {
                    gfx.fillStyle(0xe74c3c, 1);
                    gfx.fillRect(px, py, T, T);
                    this.exitZone = this.add.zone(px + T / 2, py + T / 2, T * 1.5, T * 1.5);
                    this.physics.add.existing(this.exitZone, true);
                    this.add.text(px + T / 2, py - 8, '出口', {
                        fontSize: '13px', fontFamily: 'monospace', color: '#e74c3c',
                        backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
                    }).setOrigin(0.5).setDepth(6);
                } else if (cell === 4) {
                    gfx.fillStyle(floorColor, 1);
                    gfx.fillRect(px, py, T, T);
                    this.add.rectangle(px + T / 2, py + T / 2, T * 0.5, T * 0.4, 0x8B4513).setDepth(4);
                    this.add.rectangle(px + T / 2, py + T / 2 - 2, T * 0.2, T * 0.15, 0xFFD700).setDepth(5);
                } else {
                    gfx.fillStyle(floorColor, 1);
                    gfx.fillRect(px, py, T, T);
                }
            }
        }

        // Floor grid
        gfx.lineStyle(1, 0x000000, 0.06);
        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                if (dungeon.map[y][x] !== 1) {
                    gfx.strokeRect(x * T, y * T, T, T);
                }
            }
        }
    }

    _createPlayer(dungeon, T) {
        const sx = dungeon.spawnX * T + T / 2;
        const sy = dungeon.spawnY * T + T / 2;

        this.playerSprite = this.physics.add.sprite(sx, sy, 'player-sheet', 1)
            .setScale(1.3).setDepth(10);
        this.playerSprite.body.setSize(14, 14);
        this.playerSprite.body.setOffset(5, 18);
        this.playerSprite.setCollideWorldBounds(true);
        this.physics.add.collider(this.playerSprite, this.wallGroup);

        // Exit overlap
        if (this.exitZone) {
            this.physics.add.overlap(this.playerSprite, this.exitZone, () => {
                if (this._inBattle) return;
                this._inBattle = true;
                if (this.hasBoss) this._startBossBattle();
                else this._completeDungeon();
            });
        }
    }

    _placeMonsters(dungeon, T) {
        const monsterPool = CITY_MONSTERS[this.cityKey] || ['slime'];
        const grokSprites = this.registry.get('grokSprites') || {};

        dungeon.monsters.forEach(m => {
            const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            const monsterData = MONSTERS[monsterId];
            if (!monsterData) return;

            const px = m.x * T + T / 2;
            const py = m.y * T + T / 2;
            const spriteKey = grokSprites[monsterData.sprite] || monsterData.sprite;

            const sprite = this.physics.add.sprite(px, py, spriteKey).setDepth(8);
            const isGrok = spriteKey !== monsterData.sprite;
            const mScale = isGrok ? (T * 0.9) / sprite.height : Math.max(0.5, T / 36);
            sprite.setScale(mScale);
            sprite.body.setImmovable(true);

            const ms = {
                sprite, data: monsterData,
                room: m.room,
                patrolTimer: 0,
                patrolDir: { x: 0, y: 0 },
                alive: true,
            };

            this.physics.add.overlap(this.playerSprite, sprite, () => {
                if (!ms.alive || this._inBattle) return;
                ms.alive = false;
                sprite.setVisible(false);
                sprite.body.enable = false;
                this._startBattle(monsterData);
            });

            // Bounce tween
            this.tweens.add({
                targets: sprite, y: py - 3,
                duration: 500 + Math.random() * 500,
                yoyo: true, repeat: -1,
            });

            this.monsterSprites.push(ms);
        });
    }

    _updateMonsters() {
        const T = this.TILE;
        this.monsterSprites.forEach(ms => {
            if (!ms.alive) return;

            ms.patrolTimer -= 16;
            if (ms.patrolTimer <= 0) {
                ms.patrolTimer = 1500 + Math.random() * 2000;
                if (Math.random() < 0.3) {
                    ms.patrolDir.x = 0;
                    ms.patrolDir.y = 0;
                } else {
                    const angle = Math.random() * Math.PI * 2;
                    ms.patrolDir.x = Math.cos(angle) * 35;
                    ms.patrolDir.y = Math.sin(angle) * 35;
                }
            }

            // Room bounds
            if (ms.room) {
                const rx = ms.room.x * T + T;
                const ry = ms.room.y * T + T;
                const rr = (ms.room.x + ms.room.w) * T - T;
                const rb = (ms.room.y + ms.room.h) * T - T;
                if (ms.sprite.x < rx || ms.sprite.x > rr) ms.patrolDir.x *= -1;
                if (ms.sprite.y < ry || ms.sprite.y > rb) ms.patrolDir.y *= -1;
            }

            // Chase if player nearby
            const dist = Phaser.Math.Distance.Between(
                ms.sprite.x, ms.sprite.y,
                this.playerSprite.x, this.playerSprite.y
            );
            if (dist < T * 5 && dist > T) {
                const dx = this.playerSprite.x - ms.sprite.x;
                const dy = this.playerSprite.y - ms.sprite.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                ms.sprite.setVelocity((dx / mag) * 55, (dy / mag) * 55);
            } else {
                ms.sprite.setVelocity(ms.patrolDir.x, ms.patrolDir.y);
            }
        });
    }

    _handleMovement() {
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;

        const jd = this.joystick.getDirection();
        if (Math.abs(jd.x) > 0.15 || Math.abs(jd.y) > 0.15) {
            vx = jd.x; vy = jd.y;
        }

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            vx = (vx / mag) * this.SPEED;
            vy = (vy / mag) * this.SPEED;
            if (Math.abs(vy) > Math.abs(vx)) {
                this.playerSprite.play(vy < 0 ? 'walk-up' : 'walk-down', true);
            } else {
                this.playerSprite.play(vx < 0 ? 'walk-left' : 'walk-right', true);
            }
        } else {
            this.playerSprite.stop();
        }

        this.playerSprite.setVelocity(vx, vy);

        // Chest check
        const gx = Math.floor(this.playerSprite.x / this.TILE);
        const gy = Math.floor(this.playerSprite.y / this.TILE);
        if (gy >= 0 && gy < this.dungeonData.height && gx >= 0 && gx < this.dungeonData.width) {
            if (this.dungeonData.map[gy][gx] === 4) this._openChest(gx, gy);
        }
    }

    _startBattle(monsterData) {
        this._inBattle = true;
        this.playerSprite.setVelocity(0, 0);

        const rankData = PORTAL_RANKS[this.rank];
        const lvRange = rankData.monsterLevelRange;
        const scaledLevel = lvRange[0] + Math.floor(Math.random() * (lvRange[1] - lvRange[0]));
        const sf = scaledLevel / Math.max(1, monsterData.level);

        this.scene.start('Battle', {
            monster: {
                ...monsterData, level: scaledLevel,
                hp: Math.floor(monsterData.hp * sf),
                atk: Math.floor(monsterData.atk * sf),
                def: Math.floor(monsterData.def * sf),
                exp: Math.floor(monsterData.exp * sf),
                gold: Math.floor(monsterData.gold * sf),
            },
            returnScene: 'Dungeon',
            returnData: { city: this.cityKey, rank: this.rank, hasBoss: this.hasBoss },
            rankMultiplier: RANK_REWARDS[this.rank].expMul,
        });
    }

    _startBossBattle() {
        const bossId = CITY_BOSSES[this.cityKey];
        const bossData = MONSTERS[bossId];
        if (!bossData) return;
        const bossStory = STORY[bossData.storyKey];

        const go = () => {
            this.scene.start('Battle', {
                monster: { ...bossData },
                returnScene: 'City',
                returnData: { city: this.cityKey },
                rankMultiplier: RANK_REWARDS[this.rank].expMul,
            });
        };

        if (bossStory?.before) {
            this.scene.launch('Dialog', { dialogs: bossStory.before, onComplete: go });
        } else {
            go();
        }
    }

    _openChest(x, y) {
        this.dungeonData.map[y][x] = 0;
        this.audio.playSFX('chest');
        const rankLv = PORTAL_RANKS[this.rank].monsterLevelRange[0];
        const gold = 20 + Math.floor(Math.random() * 50) * Math.floor(rankLv / 5 + 1);
        this.player.addGold(gold);

        const w = this.cameras.main.width, h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, `寶箱！獲得 ${gold} 金幣`, {
            fontSize: '20px', fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#000000cc', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        this.tweens.add({ targets: msg, alpha: 0, y: h / 2 - 25, duration: 2000, onComplete: () => msg.destroy() });
    }

    _completeDungeon() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        this.add.text(w / 2, h / 2, '迷宮通關！', {
            fontSize: '24px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 14, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        this.time.delayedCall(1500, () => this.scene.start('City', { city: this.cityKey }));
    }

    _updateStatus() {
        this.statusText?.setText(
            `HP:${this.player.hp}/${this.player.maxHp} MP:${this.player.mp}/${this.player.maxMp} 金:${this.player.gold}`
        );
    }
}
