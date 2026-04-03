// City exploration scene - top-down map with buildings
import { CITIES, CITY_ORDER } from '../data/cities.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS } from '../data/dungeons.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { STORY } from '../data/story.js';

export class CityScene extends Phaser.Scene {
    constructor() {
        super('City');
    }

    init(data) {
        this.cityKey = data?.city || 'taipei';
    }

    create() {
        const { width, height } = this.cameras.main;
        this.player = this.registry.get('player');
        this.player.currentCity = this.cityKey;
        this.city = CITIES[this.cityKey];

        this.audio = this.registry.get('audio');
        this.audio.playBGM('city');
        this.cameras.main.setBackgroundColor('#1a2a1a');

        // --- CITY MAP ---
        const mapW = 25, mapH = 15;
        const tileSize = 32;
        const offsetX = (width - mapW * tileSize) / 2;
        const offsetY = 40;

        // Draw ground
        for (let y = 0; y < mapH; y++) {
            for (let x = 0; x < mapW; x++) {
                const px = offsetX + x * tileSize;
                const py = offsetY + y * tileSize;
                if (x === 0 || x === mapW - 1 || y === 0 || y === mapH - 1) {
                    this.add.image(px + 16, py + 16, 'tile-wall');
                } else if (x === 12 || y === 7) {
                    this.add.image(px + 16, py + 16, 'tile-road');
                } else {
                    this.add.image(px + 16, py + 16, 'tile-grass');
                }
            }
        }

        // --- CITY NAME ---
        this.add.text(width / 2, 15, `${this.city.name} — ${this.city.description.substring(0, 20)}...`, {
            fontSize: '14px', fontFamily: 'monospace', color: this.city.color, fontStyle: 'bold'
        }).setOrigin(0.5);

        // --- BUILDINGS ---
        this.city.buildings.forEach(b => {
            const bx = offsetX + b.x * tileSize + 16;
            const by = offsetY + b.y * tileSize + 16;
            const buildingKey = `building-${b.type}`;
            const sprite = this.add.image(bx, by, buildingKey)
                .setInteractive({ useHandCursor: true });

            // Label
            this.add.text(bx, by + 28, b.name, {
                fontSize: '9px', fontFamily: 'monospace', color: '#fff',
                backgroundColor: '#00000088', padding: { x: 2, y: 1 }
            }).setOrigin(0.5);

            sprite.on('pointerdown', () => { this.audio.playSFX('click'); this._onBuildingClick(b); });
        });

        // --- PORTALS ---
        this.city.portalZones.forEach(p => {
            const px = offsetX + p.x * tileSize + 16;
            const py = offsetY + p.y * tileSize + 16;
            const portalSprite = this.add.image(px, py, `portal-${p.rank}`)
                .setInteractive({ useHandCursor: true });

            // Pulse animation
            this.tweens.add({
                targets: portalSprite,
                scaleX: { from: 0.9, to: 1.1 },
                scaleY: { from: 0.9, to: 1.1 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
            });

            this.add.text(px, py + 28, `${p.rank}級 LV.${p.minLevel}+`, {
                fontSize: '9px', fontFamily: 'monospace', color: PORTAL_RANKS[p.rank].color,
                backgroundColor: '#00000088', padding: { x: 2, y: 1 }
            }).setOrigin(0.5);

            portalSprite.on('pointerdown', () => { this.audio.playSFX('portal'); this._onPortalClick(p); });
        });

        // --- BOTTOM UI BAR ---
        this.add.rectangle(width / 2, height - 45, width, 90, 0x0a0a1a, 0.95);

        // Player stats
        this.add.text(15, height - 82, `${this.player.name} LV.${this.player.level}`, {
            fontSize: '13px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });
        this.hpText = this.add.text(15, height - 65, '', { fontSize: '11px', fontFamily: 'monospace', color: '#e74c3c' });
        this.mpText = this.add.text(15, height - 50, '', { fontSize: '11px', fontFamily: 'monospace', color: '#3498db' });
        this.goldText = this.add.text(15, height - 35, '', { fontSize: '11px', fontFamily: 'monospace', color: '#f1c40f' });
        this.diamondText = this.add.text(15, height - 20, '', { fontSize: '11px', fontFamily: 'monospace', color: '#00d4ff' });

        // Action buttons at bottom
        const btnData = [
            { label: '背包', x: width - 300, action: () => this.scene.start('Menu', { tab: 'inventory', city: this.cityKey }) },
            { label: '狀態', x: width - 220, action: () => this.scene.start('Menu', { tab: 'status', city: this.cityKey }) },
            { label: '任務', x: width - 140, action: () => this.scene.start('Menu', { tab: 'quest', city: this.cityKey }) },
            { label: '移動', x: width - 60, action: () => this._showCityTravel() },
        ];

        btnData.forEach(bd => {
            const btn = this.add.rectangle(bd.x, height - 50, 65, 30, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(bd.x, height - 50, bd.label, {
                fontSize: '12px', fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            btn.on('pointerover', () => txt.setColor('#00d4ff'));
            btn.on('pointerout', () => txt.setColor('#fff'));
            btn.on('pointerdown', bd.action);
        });

        // Save button
        const saveBtn = this.add.text(width - 60, height - 15, '存檔', {
            fontSize: '10px', fontFamily: 'monospace', color: '#7f8c8d'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        saveBtn.on('pointerdown', () => this._quickSave());

        this._updateUI();

        // Travel overlay
        this.travelContainer = this.add.container(0, 0).setVisible(false);
    }

    _updateUI() {
        this.hpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`);
        this.mpText.setText(`MP: ${this.player.mp}/${this.player.maxMp}`);
        this.goldText.setText(`金幣: ${this.player.gold}`);
        this.diamondText.setText(`鑽石: ${this.player.diamonds}`);
    }

    _onBuildingClick(building) {
        switch (building.type) {
            case 'weapon':
                this.scene.start('Shop', { city: this.cityKey, shopType: 'weapon', title: '武器店' });
                break;
            case 'armor':
                this.scene.start('Shop', { city: this.cityKey, shopType: 'armor', title: '防具店' });
                break;
            case 'item':
                this.scene.start('Shop', { city: this.cityKey, shopType: 'item', title: '道具店' });
                break;
            case 'magic':
                this.scene.start('Shop', { city: this.cityKey, shopType: 'accessory', title: '魔咒學院' });
                break;
            case 'inn':
                this._visitInn();
                break;
            case 'guild':
                this.scene.start('Menu', { tab: 'quest', city: this.cityKey });
                break;
            case 'diamond':
                this.scene.start('Shop', { city: this.cityKey, shopType: 'diamond', title: '鑽石商城' });
                break;
        }
    }

    _visitInn() {
        this.player.fullRestore();
        this._updateUI();
        const { width, height } = this.cameras.main;
        const msg = this.add.text(width / 2, height / 2, 'HP 和 MP 已完全回復！', {
            fontSize: '18px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: msg, alpha: 0, y: height / 2 - 40,
            duration: 2000, onComplete: () => msg.destroy()
        });
        // Auto save
        this._quickSave();
    }

    _onPortalClick(portal) {
        if (this.player.level < portal.minLevel) {
            const { width, height } = this.cameras.main;
            const msg = this.add.text(width / 2, height / 2,
                `等級不足！需要 LV.${portal.minLevel} 以上`, {
                fontSize: '16px', fontFamily: 'monospace', color: '#e74c3c',
                backgroundColor: '#000000cc', padding: { x: 16, y: 8 }
            }).setOrigin(0.5);
            this.tweens.add({ targets: msg, alpha: 0, duration: 2000, onComplete: () => msg.destroy() });
            return;
        }

        // Check if this is a boss portal (highest rank in city)
        const isBossRank = portal.rank === this.city.portalZones[this.city.portalZones.length - 1].rank;
        const bossId = CITY_BOSSES[this.cityKey];
        const bossNotDefeated = !this.player.bossesDefeated.includes(bossId);

        this.scene.start('Dungeon', {
            city: this.cityKey,
            rank: portal.rank,
            hasBoss: isBossRank && bossNotDefeated,
        });
    }

    _showCityTravel() {
        this.travelContainer.removeAll(true);
        this.travelContainer.setVisible(true);

        const { width, height } = this.cameras.main;
        const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
        this.travelContainer.add(bg);

        this.travelContainer.add(this.add.text(width / 2, height / 2 - 120, '高鐵傳送 — 選擇城市', {
            fontSize: '18px', fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        CITY_ORDER.forEach((cityKey, i) => {
            const city = CITIES[cityKey];
            const unlocked = this.player.citiesUnlocked.includes(cityKey);
            const y = height / 2 - 70 + i * 35;
            const isCurrent = cityKey === this.cityKey;

            const color = isCurrent ? '#7f8c8d' : (unlocked ? city.color : '#444');
            const label = `${city.name} (LV.${city.levelRange[0]}-${city.levelRange[1]})${isCurrent ? ' ← 目前' : ''}${!unlocked ? ' 🔒' : ''}`;

            const txt = this.add.text(width / 2, y, label, {
                fontSize: '14px', fontFamily: 'monospace', color
            }).setOrigin(0.5);

            if (unlocked && !isCurrent) {
                txt.setInteractive({ useHandCursor: true });
                txt.on('pointerover', () => txt.setColor('#fff'));
                txt.on('pointerout', () => txt.setColor(color));
                txt.on('pointerdown', () => {
                    this.travelContainer.setVisible(false);
                    this.scene.start('City', { city: cityKey });
                });
            }
            this.travelContainer.add(txt);
        });

        const closeBtn = this.add.text(width / 2, height / 2 + 125, '取消', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.travelContainer.setVisible(false));
        this.travelContainer.add(closeBtn);
    }

    _quickSave() {
        const slot = this.registry.get('currentSaveSlot') ?? 0;
        SaveSystem.save(slot, this.player.toJSON());
        SaveSystem.addLeaderboardEntry(this.player.toJSON());
        const { width, height } = this.cameras.main;
        const msg = this.add.text(width / 2, height / 2, '存檔成功！', {
            fontSize: '16px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, duration: 1500, onComplete: () => msg.destroy() });
    }
}
