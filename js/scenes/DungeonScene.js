// Dungeon exploration with maze and monster encounters
import { MapGenerator } from '../utils/MapGenerator.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS, DUNGEON_THEMES, RANK_REWARDS } from '../data/dungeons.js';
import { CITIES } from '../data/cities.js';
import { ITEMS } from '../data/items.js';
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
        const { width, height } = this.cameras.main;
        const city = CITIES[this.cityKey];
        const theme = DUNGEON_THEMES[city.theme];
        const rankInfo = PORTAL_RANKS[this.rank];

        this.audio = this.registry.get('audio');
        this.audio.playBGM('dungeon');
        this.cameras.main.setBackgroundColor(theme.floorColor);

        // Generate dungeon
        const dungeon = MapGenerator.generateDungeon(25, 19, city.theme);
        this.dungeonMap = dungeon.map;
        this.dungeonW = dungeon.width;
        this.dungeonH = dungeon.height;

        const tileSize = 28;
        const offsetX = (width - this.dungeonW * tileSize) / 2;
        const offsetY = 30;
        this.tileSize = tileSize;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        // Draw dungeon map
        this.mapTiles = [];
        for (let y = 0; y < this.dungeonH; y++) {
            this.mapTiles[y] = [];
            for (let x = 0; x < this.dungeonW; x++) {
                const px = offsetX + x * tileSize + tileSize / 2;
                const py = offsetY + y * tileSize + tileSize / 2;
                const cell = this.dungeonMap[y][x];

                let tile;
                if (cell === 1) {
                    tile = this.add.rectangle(px, py, tileSize - 1, tileSize - 1, Phaser.Display.Color.HexStringToColor(theme.wallColor).color);
                } else if (cell === 2) {
                    tile = this.add.rectangle(px, py, tileSize - 1, tileSize - 1, 0x2ecc71); // entrance
                } else if (cell === 3) {
                    tile = this.add.rectangle(px, py, tileSize - 1, tileSize - 1, 0xe74c3c); // exit
                } else if (cell === 4) {
                    tile = this.add.rectangle(px, py, tileSize - 1, tileSize - 1, Phaser.Display.Color.HexStringToColor(theme.floorColor).color);
                    this.add.image(px, py, 'tile-chest').setScale(0.8);
                } else {
                    tile = this.add.rectangle(px, py, tileSize - 1, tileSize - 1, Phaser.Display.Color.HexStringToColor(theme.floorColor).color);
                }
                this.mapTiles[y][x] = tile;
            }
        }

        // Place monster sprites on map
        this.monsterSprites = [];
        const monsterPool = CITY_MONSTERS[this.cityKey] || ['slime'];
        dungeon.monsters.forEach(m => {
            const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            const monsterData = MONSTERS[monsterId];
            if (!monsterData) return;

            const px = offsetX + m.x * tileSize + tileSize / 2;
            const py = offsetY + m.y * tileSize + tileSize / 2;
            const sprite = this.add.image(px, py, monsterData.sprite).setScale(0.7)
                .setInteractive({ useHandCursor: true });

            // Idle animation
            this.tweens.add({
                targets: sprite,
                y: py - 3,
                duration: 500 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
            });

            sprite.on('pointerdown', () => {
                this._startBattle(monsterData, sprite);
            });

            this.monsterSprites.push({ sprite, data: monsterData, gridX: m.x, gridY: m.y });
        });

        // Player position (at entrance)
        this.playerGridX = 1;
        this.playerGridY = 1;
        const ppx = offsetX + 1 * tileSize + tileSize / 2;
        const ppy = offsetY + 1 * tileSize + tileSize / 2;
        this.playerDot = this.add.circle(ppx, ppy, 6, 0x00d4ff);

        // Controls - click to move
        this.input.on('pointerdown', (pointer) => {
            const gx = Math.floor((pointer.x - offsetX) / tileSize);
            const gy = Math.floor((pointer.y - offsetY) / tileSize);
            this._movePlayer(gx, gy);
        });

        // UI
        this.add.text(10, 5, `${theme.name} — ${rankInfo.name}`, {
            fontSize: '12px', fontFamily: 'monospace', color: theme.accentColor
        });

        // Exit button
        const exitBtn = this.add.text(width - 60, 5, '離開', {
            fontSize: '12px', fontFamily: 'monospace', color: '#e74c3c',
            backgroundColor: '#000000aa', padding: { x: 6, y: 3 }
        }).setInteractive({ useHandCursor: true });
        exitBtn.on('pointerdown', () => {
            this.scene.start('City', { city: this.cityKey });
        });

        // HP/MP display
        this.statusText = this.add.text(10, height - 25, '', {
            fontSize: '11px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#000000aa', padding: { x: 4, y: 2 }
        });
        this._updateStatus();
    }

    _movePlayer(targetX, targetY) {
        if (targetX < 0 || targetX >= this.dungeonW || targetY < 0 || targetY >= this.dungeonH) return;
        if (this.dungeonMap[targetY][targetX] === 1) return; // wall

        // Simple pathfinding: move one step closer (manhattan)
        const dx = Math.sign(targetX - this.playerGridX);
        const dy = Math.sign(targetY - this.playerGridY);

        let newX = this.playerGridX;
        let newY = this.playerGridY;

        // Try horizontal first
        if (dx !== 0 && this.dungeonMap[this.playerGridY][this.playerGridX + dx] !== 1) {
            newX = this.playerGridX + dx;
        } else if (dy !== 0 && this.dungeonMap[this.playerGridY + dy][this.playerGridX] !== 1) {
            newY = this.playerGridY + dy;
        }

        if (newX === this.playerGridX && newY === this.playerGridY) return;

        this.playerGridX = newX;
        this.playerGridY = newY;

        const px = this.offsetX + newX * this.tileSize + this.tileSize / 2;
        const py = this.offsetY + newY * this.tileSize + this.tileSize / 2;
        this.tweens.add({
            targets: this.playerDot,
            x: px, y: py,
            duration: 150,
        });

        // Check cell
        const cell = this.dungeonMap[newY][newX];
        if (cell === 3) {
            // Exit - check boss
            if (this.hasBoss) {
                this._startBossBattle();
            } else {
                this._completeDungeon();
            }
        } else if (cell === 4) {
            // Chest
            this._openChest(newX, newY);
        } else if (cell === 5) {
            // Monster encounter
            const ms = this.monsterSprites.find(m => m.gridX === newX && m.gridY === newY);
            if (ms) {
                this._startBattle(ms.data, ms.sprite);
            }
        }

        // Check proximity to monster sprites
        this.monsterSprites.forEach(ms => {
            if (Math.abs(ms.gridX - newX) <= 0 && Math.abs(ms.gridY - newY) <= 0 && ms.sprite.visible) {
                this._startBattle(ms.data, ms.sprite);
            }
        });
    }

    _startBattle(monsterData, sprite) {
        if (sprite) sprite.setVisible(false);
        const rankReward = RANK_REWARDS[this.rank];

        // Scale monster to dungeon level
        const rankData = PORTAL_RANKS[this.rank];
        const lvRange = rankData.monsterLevelRange;
        const scaledLevel = lvRange[0] + Math.floor(Math.random() * (lvRange[1] - lvRange[0]));
        const scaleFactor = scaledLevel / Math.max(1, monsterData.level);

        const scaledMonster = {
            ...monsterData,
            level: scaledLevel,
            hp: Math.floor(monsterData.hp * scaleFactor),
            atk: Math.floor(monsterData.atk * scaleFactor),
            def: Math.floor(monsterData.def * scaleFactor),
            exp: Math.floor(monsterData.exp * scaleFactor),
            gold: Math.floor(monsterData.gold * scaleFactor),
        };

        this.scene.start('Battle', {
            monster: scaledMonster,
            returnScene: 'Dungeon',
            returnData: { city: this.cityKey, rank: this.rank, hasBoss: this.hasBoss },
            rankMultiplier: rankReward.expMul,
        });
    }

    _startBossBattle() {
        const bossId = CITY_BOSSES[this.cityKey];
        const bossData = MONSTERS[bossId];
        if (!bossData) return;

        const storyKey = bossData.storyKey;
        const bossStory = STORY[storyKey];

        if (bossStory && bossStory.before) {
            this.scene.launch('Dialog', {
                dialogs: bossStory.before,
                onComplete: () => {
                    this.scene.start('Battle', {
                        monster: { ...bossData },
                        returnScene: 'Dungeon',
                        returnData: { city: this.cityKey, rank: this.rank, hasBoss: false },
                        rankMultiplier: RANK_REWARDS[this.rank].expMul,
                        onWin: () => {
                            this.player.defeatBoss(bossId);
                            // Unlock next city
                            const cityOrder = ['taipei', 'newTaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung'];
                            const idx = cityOrder.indexOf(this.cityKey);
                            if (idx < cityOrder.length - 1) {
                                this.player.unlockCity(cityOrder[idx + 1]);
                            }
                        }
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
        this.dungeonMap[y][x] = 0; // mark as opened

        // Random reward
        const rewards = [];
        const roll = Math.random();
        if (roll < 0.5) {
            const gold = 20 + Math.floor(Math.random() * 50) * (PORTAL_RANKS[this.rank].monsterLevelRange[0] / 5 + 1);
            this.audio.playSFX('chest');
            this.player.addGold(gold);
            rewards.push(`${gold} 金幣`);
        } else if (roll < 0.8) {
            this.player.addItem({ id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30 });
            rewards.push('回復藥水(小)');
        } else {
            this.player.addDiamonds(1);
            rewards.push('鑽石 x1');
        }

        const { width, height } = this.cameras.main;
        const msg = this.add.text(width / 2, height / 2, `寶箱！獲得 ${rewards.join(', ')}`, {
            fontSize: '14px', fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#000000cc', padding: { x: 10, y: 6 }
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, y: height / 2 - 30, duration: 2000, onComplete: () => msg.destroy() });
    }

    _completeDungeon() {
        const { width, height } = this.cameras.main;
        const msg = this.add.text(width / 2, height / 2, '迷宮通關！', {
            fontSize: '20px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        this.time.delayedCall(1500, () => {
            this.scene.start('City', { city: this.cityKey });
        });
    }

    _updateStatus() {
        this.statusText.setText(`HP: ${this.player.hp}/${this.player.maxHp}  MP: ${this.player.mp}/${this.player.maxMp}  金幣: ${this.player.gold}`);
    }
}
