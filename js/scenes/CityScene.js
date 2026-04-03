// City exploration scene - responsive top-down map
import { CITIES, CITY_ORDER } from '../data/cities.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS } from '../data/dungeons.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class CityScene extends Phaser.Scene {
    constructor() {
        super('City');
    }

    init(data) {
        this.cityKey = data?.city || 'taipei';
    }

    create() {
        this.player = this.registry.get('player');
        this.player.currentCity = this.cityKey;
        this.city = CITIES[this.cityKey];
        this.audio = this.registry.get('audio');
        this.audio.playBGM('city');

        this._buildUI();
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        this.cameras.main.setBackgroundColor('#1a2a1a');

        // --- CITY MAP (top 78%) ---
        const mapAreaH = h * 0.78;
        const mapW = 25, mapH = 15;
        const tileSize = Math.min(Math.floor((w - 10) / mapW), Math.floor((mapAreaH - 30) / mapH));
        const offsetX = (w - mapW * tileSize) / 2;
        const offsetY = 28;

        // City background image
        const cityBgKey = `city-bg-${this.cityKey}`;
        if (this.textures.exists(cityBgKey)) {
            const bg = this.add.image(w / 2, offsetY + mapAreaH / 2 - 14, cityBgKey);
            bg.setDisplaySize(mapW * tileSize, mapH * tileSize);
            bg.setAlpha(0.35);
        }

        // Draw tiles
        for (let y = 0; y < mapH; y++) {
            for (let x = 0; x < mapW; x++) {
                const px = offsetX + x * tileSize + tileSize / 2;
                const py = offsetY + y * tileSize + tileSize / 2;
                if (x === 0 || x === mapW - 1 || y === 0 || y === mapH - 1) {
                    this.add.rectangle(px, py, tileSize - 1, tileSize - 1, 0x5d4e37);
                } else if (x === 12 || y === 7) {
                    this.add.rectangle(px, py, tileSize - 1, tileSize - 1, 0x606060);
                } else {
                    this.add.rectangle(px, py, tileSize - 1, tileSize - 1, 0x4a7c59);
                }
            }
        }

        // City name
        this.add.text(w / 2, 8, this.city.name, {
            fontSize: `${Math.max(18, 24 * s)}px`, fontFamily: 'monospace', color: this.city.color, fontStyle: 'bold'
        }).setOrigin(0.5);

        // Buildings
        const bldgScale = Math.max(0.5, tileSize / 48);
        this.city.buildings.forEach(b => {
            const bx = offsetX + b.x * tileSize + tileSize / 2;
            const by = offsetY + b.y * tileSize + tileSize / 2;
            const sprite = this.add.image(bx, by, `building-${b.type}`)
                .setScale(bldgScale).setInteractive({ useHandCursor: true });
            this.add.text(bx, by + tileSize / 2 + 2, b.name, {
                fontSize: `${Math.max(12, 14 * s)}px`, fontFamily: 'monospace', color: '#fff',
                backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
            }).setOrigin(0.5);
            sprite.on('pointerdown', () => { this.audio.playSFX('click'); this._onBuildingClick(b); });
        });

        // Portals
        this.city.portalZones.forEach(p => {
            const px = offsetX + p.x * tileSize + tileSize / 2;
            const py = offsetY + p.y * tileSize + tileSize / 2;
            const portal = this.add.image(px, py, `portal-${p.rank}`)
                .setScale(bldgScale).setInteractive({ useHandCursor: true });
            this.tweens.add({
                targets: portal,
                scaleX: { from: bldgScale * 0.9, to: bldgScale * 1.1 },
                scaleY: { from: bldgScale * 0.9, to: bldgScale * 1.1 },
                duration: 1000, yoyo: true, repeat: -1,
            });
            this.add.text(px, py + tileSize / 2 + 2, `${p.rank}級 LV${p.minLevel}+`, {
                fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: PORTAL_RANKS[p.rank].color,
                backgroundColor: '#000000aa', padding: { x: 3, y: 1 }
            }).setOrigin(0.5);
            portal.on('pointerdown', () => { this.audio.playSFX('portal'); this._onPortalClick(p); });
        });

        // --- BOTTOM BAR (bottom 18%) ---
        const barY = mapAreaH;
        const barH = h - barY;
        this.add.rectangle(w / 2, barY + barH / 2, w, barH, 0x0a0a1a, 0.96);
        this.add.rectangle(w / 2, barY, w, 1, 0x3498db);

        // Player stats (left)
        const statFs = Math.max(14, Math.floor(16 * s));
        this.add.text(8, barY + 6, `${this.player.name} LV.${this.player.level}`, {
            fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });
        this.add.text(8, barY + 6 + 22 * s, `HP:${this.player.hp}/${this.player.maxHp}  MP:${this.player.mp}/${this.player.maxMp}`, {
            fontSize: `${statFs}px`, fontFamily: 'monospace', color: '#bdc3c7'
        });
        this.add.text(8, barY + 6 + 40 * s, `金幣:${this.player.gold}  鑽石:${this.player.diamonds}`, {
            fontSize: `${statFs}px`, fontFamily: 'monospace', color: '#f1c40f'
        });

        // Action buttons (right)
        const btns = [
            { label: '背包', act: () => this.scene.start('Menu', { tab: 'inventory', city: this.cityKey }) },
            { label: '狀態', act: () => this.scene.start('Menu', { tab: 'status', city: this.cityKey }) },
            { label: '任務', act: () => this.scene.start('Menu', { tab: 'quest', city: this.cityKey }) },
            { label: '移動', act: () => this._showCityTravel() },
        ];
        const btnW = Math.min(72, (w * 0.55) / btns.length - 4);
        const btnH = Math.max(32, 36 * s);
        btns.forEach((bd, i) => {
            const bx = w - (btns.length - i) * (btnW + 4) - 4;
            const by = barY + barH / 2 - 4;
            const btn = this.add.rectangle(bx + btnW / 2, by, btnW, btnH, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(bx + btnW / 2, by, bd.label, {
                fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            btn.on('pointerover', () => txt.setColor('#00d4ff'));
            btn.on('pointerout', () => txt.setColor('#fff'));
            btn.on('pointerdown', () => { this.audio.playSFX('click'); bd.act(); });
        });

        // Save button
        const saveBtn = this.add.text(w - 30, barY + barH - 18, '存檔', {
            fontSize: `${Math.max(12, 14 * s)}px`, fontFamily: 'monospace', color: '#555'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        saveBtn.on('pointerdown', () => this._quickSave());

        this.travelContainer = null;
    }

    _onBuildingClick(building) {
        switch (building.type) {
            case 'weapon': this.scene.start('Shop', { city: this.cityKey, shopType: 'weapon', title: '武器店' }); break;
            case 'armor': this.scene.start('Shop', { city: this.cityKey, shopType: 'armor', title: '防具店' }); break;
            case 'item': this.scene.start('Shop', { city: this.cityKey, shopType: 'item', title: '道具店' }); break;
            case 'magic': this.scene.start('Shop', { city: this.cityKey, shopType: 'accessory', title: '魔咒學院' }); break;
            case 'inn': this._visitInn(); break;
            case 'guild': this.scene.start('Menu', { tab: 'quest', city: this.cityKey }); break;
            case 'diamond': this.scene.start('Shop', { city: this.cityKey, shopType: 'diamond', title: '鑽石商城' }); break;
        }
    }

    _visitInn() {
        this.player.fullRestore();
        this.audio.playSFX('heal');
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, 'HP 和 MP 已完全回復！', {
            fontSize: '22px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 14, y: 8 }
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, y: h / 2 - 30, duration: 2000, onComplete: () => msg.destroy() });
        this._quickSave();
    }

    _onPortalClick(portal) {
        if (this.player.level < portal.minLevel) {
            this.audio.playSFX('error');
            const w = this.cameras.main.width, h = this.cameras.main.height;
            const msg = this.add.text(w / 2, h / 2, `等級不足！需要 LV.${portal.minLevel}+`, {
                fontSize: '20px', fontFamily: 'monospace', color: '#e74c3c',
                backgroundColor: '#000000cc', padding: { x: 14, y: 8 }
            }).setOrigin(0.5);
            this.tweens.add({ targets: msg, alpha: 0, duration: 2000, onComplete: () => msg.destroy() });
            return;
        }
        const isBossRank = portal.rank === this.city.portalZones[this.city.portalZones.length - 1].rank;
        const bossId = CITY_BOSSES[this.cityKey];
        const bossNotDefeated = !this.player.bossesDefeated.includes(bossId);
        this.scene.start('Dungeon', { city: this.cityKey, rank: portal.rank, hasBoss: isBossRank && bossNotDefeated });
    }

    _showCityTravel() {
        if (this.travelContainer) { this.travelContainer.destroy(); this.travelContainer = null; return; }
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        this.travelContainer = this.add.container(0, 0);
        const boxW = Math.min(420, w * 0.85);
        const boxH = Math.min(300, h * 0.55);
        this.travelContainer.add(this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x0a0a1e, 0.96).setStrokeStyle(2, 0x00d4ff));
        this.travelContainer.add(this.add.text(w / 2, h / 2 - boxH / 2 + 16, '高鐵傳送', {
            fontSize: `${Math.max(18, 22 * s)}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        CITY_ORDER.forEach((ck, i) => {
            const city = CITIES[ck];
            const unlocked = this.player.citiesUnlocked.includes(ck);
            const isCurrent = ck === this.cityKey;
            const y = h / 2 - boxH / 2 + 48 + i * 38 * s;
            const color = isCurrent ? '#7f8c8d' : unlocked ? city.color : '#444';
            const label = `${city.name} (LV.${city.levelRange[0]}-${city.levelRange[1]})${isCurrent ? ' ← 目前' : ''}${!unlocked ? ' 🔒' : ''}`;
            const txt = this.add.text(w / 2, y, label, {
                fontSize: `${Math.max(15, 18 * s)}px`, fontFamily: 'monospace', color
            }).setOrigin(0.5);
            if (unlocked && !isCurrent) {
                txt.setInteractive({ useHandCursor: true });
                txt.on('pointerdown', () => { this.travelContainer.destroy(); this.travelContainer = null; this.scene.start('City', { city: ck }); });
            }
            this.travelContainer.add(txt);
        });

        const closeBtn = this.add.text(w / 2, h / 2 + boxH / 2 - 16, '取消', {
            fontSize: `${12 * s}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => { this.travelContainer.destroy(); this.travelContainer = null; });
        this.travelContainer.add(closeBtn);
    }

    _quickSave() {
        const slot = this.registry.get('currentSaveSlot') ?? 0;
        SaveSystem.save(slot, this.player.toJSON());
        SaveSystem.addLeaderboardEntry(this.player.toJSON());
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, '存檔成功！', {
            fontSize: '20px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        this.tweens.add({ targets: msg, alpha: 0, duration: 1500, onComplete: () => msg.destroy() });
    }
}
