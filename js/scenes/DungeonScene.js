// Dungeon exploration - responsive maze
import { MapGenerator } from '../utils/MapGenerator.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS, DUNGEON_THEMES, RANK_REWARDS } from '../data/dungeons.js';
import { CITIES } from '../data/cities.js';
import { STORY } from '../data/story.js';

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

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const city = CITIES[this.cityKey];
        const theme = DUNGEON_THEMES[city.theme];
        const rankInfo = PORTAL_RANKS[this.rank];

        this.cameras.main.setBackgroundColor(theme.floorColor);

        // Dungeon background image
        const dungeonBgKey = `dungeon-bg-${city.theme}`;
        if (this.textures.exists(dungeonBgKey)) {
            const bg = this.add.image(w / 2, h / 2, dungeonBgKey);
            bg.setDisplaySize(w, h);
            bg.setAlpha(0.2);
        }

        // Generate dungeon
        const dungeon = MapGenerator.generateDungeon(25, 19, city.theme);
        this.dungeonMap = dungeon.map;
        this.dungeonW = dungeon.width;
        this.dungeonH = dungeon.height;

        const tileSize = Math.min(Math.floor((w - 10) / this.dungeonW), Math.floor((h - 50) / this.dungeonH));
        const offsetX = (w - this.dungeonW * tileSize) / 2;
        const offsetY = 26;
        this.tileSize = tileSize;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        const wallColor = Phaser.Display.Color.HexStringToColor(theme.wallColor).color;
        const floorColor = Phaser.Display.Color.HexStringToColor(theme.floorColor).color;

        for (let y = 0; y < this.dungeonH; y++) {
            for (let x = 0; x < this.dungeonW; x++) {
                const px = offsetX + x * tileSize + tileSize / 2;
                const py = offsetY + y * tileSize + tileSize / 2;
                const cell = this.dungeonMap[y][x];
                const ts = tileSize - 1;

                if (cell === 1) {
                    this.add.rectangle(px, py, ts, ts, wallColor);
                } else if (cell === 2) {
                    this.add.rectangle(px, py, ts, ts, 0x2ecc71);
                } else if (cell === 3) {
                    this.add.rectangle(px, py, ts, ts, 0xe74c3c);
                } else if (cell === 4) {
                    this.add.rectangle(px, py, ts, ts, floorColor);
                    this.add.rectangle(px, py, ts * 0.5, ts * 0.4, 0x8B4513);
                    this.add.rectangle(px, py - ts * 0.1, ts * 0.2, ts * 0.15, 0xFFD700);
                } else {
                    this.add.rectangle(px, py, ts, ts, floorColor);
                }
            }
        }

        // Monster sprites
        this.monsterSprites = [];
        const monsterPool = CITY_MONSTERS[this.cityKey] || ['slime'];
        const grokSprites = this.registry.get('grokSprites') || {};
        dungeon.monsters.forEach(m => {
            const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            const monsterData = MONSTERS[monsterId];
            if (!monsterData) return;
            const px = offsetX + m.x * tileSize + tileSize / 2;
            const py = offsetY + m.y * tileSize + tileSize / 2;
            const spriteKey = grokSprites[monsterData.sprite] || monsterData.sprite;
            const sprite = this.add.image(px, py, spriteKey);
            // Scale Grok images (large) to fit tile, canvas sprites use old scale
            const isGrok = spriteKey !== monsterData.sprite;
            const mScale = isGrok ? (tileSize * 0.9) / sprite.height : Math.max(0.3, tileSize / 40);
            sprite.setScale(mScale);
            sprite.setInteractive({ useHandCursor: true });
            this.tweens.add({ targets: sprite, y: py - 2, duration: 400 + Math.random() * 400, yoyo: true, repeat: -1 });
            sprite.on('pointerdown', () => this._startBattle(monsterData, sprite));
            this.monsterSprites.push({ sprite, data: monsterData, gridX: m.x, gridY: m.y });
        });

        // Player dot
        this.playerGridX = 1;
        this.playerGridY = 1;
        const dotR = Math.max(3, tileSize * 0.2);
        this.playerDot = this.add.circle(
            offsetX + 1 * tileSize + tileSize / 2,
            offsetY + 1 * tileSize + tileSize / 2,
            dotR, 0x00d4ff
        );

        // Click to move
        this.input.on('pointerdown', (pointer) => {
            const gx = Math.floor((pointer.x - offsetX) / tileSize);
            const gy = Math.floor((pointer.y - offsetY) / tileSize);
            this._movePlayer(gx, gy);
        });

        // UI
        const s = Math.min(w / 800, h / 600);
        this.add.text(8, 5, `${theme.name} — ${rankInfo.name}`, {
            fontSize: `${Math.max(14, 18 * s)}px`, fontFamily: 'monospace', color: theme.accentColor
        });
        const exitBtn = this.add.text(w - 8, 5, '離開', {
            fontSize: `${Math.max(14, 18 * s)}px`, fontFamily: 'monospace', color: '#e74c3c',
            backgroundColor: '#000000aa', padding: { x: 6, y: 3 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        exitBtn.on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));

        this.statusText = this.add.text(8, h - 24, '', {
            fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#bdc3c7',
            backgroundColor: '#000000aa', padding: { x: 5, y: 2 }
        });
        this._updateStatus();
    }

    _movePlayer(targetX, targetY) {
        if (targetX < 0 || targetX >= this.dungeonW || targetY < 0 || targetY >= this.dungeonH) return;
        if (this.dungeonMap[targetY][targetX] === 1) return;

        const dx = Math.sign(targetX - this.playerGridX);
        const dy = Math.sign(targetY - this.playerGridY);
        let newX = this.playerGridX, newY = this.playerGridY;

        if (dx !== 0 && this.dungeonMap[this.playerGridY][this.playerGridX + dx] !== 1) newX += dx;
        else if (dy !== 0 && this.dungeonMap[this.playerGridY + dy][this.playerGridX] !== 1) newY += dy;
        if (newX === this.playerGridX && newY === this.playerGridY) return;

        this.playerGridX = newX;
        this.playerGridY = newY;
        this.tweens.add({
            targets: this.playerDot,
            x: this.offsetX + newX * this.tileSize + this.tileSize / 2,
            y: this.offsetY + newY * this.tileSize + this.tileSize / 2,
            duration: 120,
        });

        const cell = this.dungeonMap[newY][newX];
        if (cell === 3) {
            if (this.hasBoss) this._startBossBattle();
            else this._completeDungeon();
        } else if (cell === 4) {
            this._openChest(newX, newY);
        }

        // Monster collision
        this.monsterSprites.forEach(ms => {
            if (ms.gridX === newX && ms.gridY === newY && ms.sprite.visible) {
                this._startBattle(ms.data, ms.sprite);
            }
        });
    }

    _startBattle(monsterData, sprite) {
        if (sprite) sprite.setVisible(false);
        const rankData = PORTAL_RANKS[this.rank];
        const lvRange = rankData.monsterLevelRange;
        const scaledLevel = lvRange[0] + Math.floor(Math.random() * (lvRange[1] - lvRange[0]));
        const sf = scaledLevel / Math.max(1, monsterData.level);
        this.scene.start('Battle', {
            monster: {
                ...monsterData, level: scaledLevel,
                hp: Math.floor(monsterData.hp * sf), atk: Math.floor(monsterData.atk * sf),
                def: Math.floor(monsterData.def * sf), exp: Math.floor(monsterData.exp * sf),
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

        if (bossStory?.before) {
            this.scene.launch('Dialog', {
                dialogs: bossStory.before,
                onComplete: () => {
                    this.scene.start('Battle', {
                        monster: { ...bossData },
                        returnScene: 'City',
                        returnData: { city: this.cityKey },
                        rankMultiplier: RANK_REWARDS[this.rank].expMul,
                    });
                }
            });
        } else {
            this.scene.start('Battle', {
                monster: { ...bossData },
                returnScene: 'City',
                returnData: { city: this.cityKey },
                rankMultiplier: RANK_REWARDS[this.rank].expMul,
            });
        }
    }

    _openChest(x, y) {
        this.dungeonMap[y][x] = 0;
        this.audio.playSFX('chest');
        const rankLv = PORTAL_RANKS[this.rank].monsterLevelRange[0];
        const gold = 20 + Math.floor(Math.random() * 50) * Math.floor(rankLv / 5 + 1);
        this.player.addGold(gold);
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, `寶箱！獲得 ${gold} 金幣`, {
            fontSize: '20px', fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#000000cc', padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, y: h / 2 - 25, duration: 2000, onComplete: () => msg.destroy() });
        this._updateStatus();
    }

    _completeDungeon() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        this.add.text(w / 2, h / 2, '迷宮通關！', {
            fontSize: '24px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 14, y: 6 }
        }).setOrigin(0.5);
        this.time.delayedCall(1500, () => this.scene.start('City', { city: this.cityKey }));
    }

    _updateStatus() {
        this.statusText.setText(`HP:${this.player.hp}/${this.player.maxHp} MP:${this.player.mp}/${this.player.maxMp} 金:${this.player.gold}`);
    }
}
