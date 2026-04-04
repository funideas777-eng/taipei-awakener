// City scene - free movement RPG with scrolling camera
import { CITIES, CITY_ORDER } from '../data/cities.js';
import { CITY_MONSTERS, CITY_BOSSES, MONSTERS } from '../data/monsters.js';
import { PORTAL_RANKS } from '../data/dungeons.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { MapGenerator } from '../utils/MapGenerator.js';
import { VirtualJoystick } from '../utils/VirtualJoystick.js';

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

        const TILE = 32;
        this.TILE = TILE;
        this.SPEED = 160;

        // UI overlay objects (managed without container to avoid scrollFactor input bugs)
        this._uiOverlay = [];

        // Generate map
        const mapData = MapGenerator.generateCityMap(this.city);
        this.mapData = mapData;
        const worldW = mapData.width * TILE;
        const worldH = mapData.height * TILE;

        // Physics world bounds
        this.physics.world.setBounds(0, 0, worldW, worldH);

        // Background
        this.cameras.main.setBackgroundColor('#1a2a1a');
        const bgKey = `city-bg-${this.cityKey}`;
        if (this.textures.exists(bgKey)) {
            this.add.image(worldW / 2, worldH / 2, bgKey)
                .setDisplaySize(worldW, worldH).setAlpha(0.18).setDepth(0);
        }

        // Render ground tiles
        this._renderMap(mapData, TILE, worldW, worldH);

        // Place buildings & portals
        this.interactables = [];
        this._placeBuildings(TILE);
        this._placePortals(TILE);

        // Create player sprite
        this._createPlayer(mapData, TILE);

        // Camera
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.input.keyboard.on('keydown-SPACE', () => this._interact());
        this.input.keyboard.on('keydown-E', () => this._interact());

        // HUD (fixed to camera)
        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        this._createHUD(camW, camH);

        // Virtual joystick
        this.joystick = new VirtualJoystick(this, 80, camH - 90);

        // Action button
        const aBtnR = 30;
        this.actBtn = this.add.circle(camW - 55, camH - 90, aBtnR, 0x2c3e50, 0.6)
            .setStrokeStyle(2, 0x00d4ff, 0.5).setScrollFactor(0).setDepth(1000)
            .setInteractive({ useHandCursor: true });
        this.add.text(camW - 55, camH - 90, 'A', {
            fontSize: '22px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        this.actBtn.on('pointerdown', () => this._interact());

        // Interaction prompt
        this.interactPrompt = this.add.text(camW / 2, camH - 150, '', {
            fontSize: '18px', fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#000000cc', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);

        this.currentInteractable = null;
    }

    update() {
        if (this._uiOverlay && this._uiOverlay.length > 0) {
            this.playerSprite.setVelocity(0, 0);
            this.playerSprite.stop();
            return;
        }

        this._handleMovement();
        this._checkProximity();
        this._updateHUD();
    }

    // --- MAP RENDERING ---
    _renderMap(mapData, T, worldW, worldH) {
        const gfx = this.add.graphics().setDepth(1);
        const COLORS = {
            0: 0x4a7c59, // grass
            1: 0x5d4e37, // wall
            2: 0x606060, // road
            3: 0x2980b9, // water
            4: 0x3a6c49, // park/dark grass
            5: 0x707070, // plaza
            6: 0x4d3e27, // building ground
        };

        for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
                const cell = mapData.map[y][x];
                gfx.fillStyle(COLORS[cell] ?? 0x4a7c59, cell === 3 ? 0.7 : 1);
                gfx.fillRect(x * T, y * T, T, T);
            }
        }

        // Grid lines for road detail
        gfx.lineStyle(1, 0x555555, 0.15);
        for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
                if (mapData.map[y][x] === 2 || mapData.map[y][x] === 5) {
                    gfx.strokeRect(x * T, y * T, T, T);
                }
            }
        }

        // Collision bodies for walls and buildings
        this.wallGroup = this.physics.add.staticGroup();
        for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
                const cell = mapData.map[y][x];
                if (cell === 1 || cell === 3 || cell === 6) {
                    const body = this.add.zone(x * T + T / 2, y * T + T / 2, T, T);
                    this.physics.add.existing(body, true);
                    this.wallGroup.add(body);
                }
            }
        }
    }

    // --- BUILDINGS ---
    _placeBuildings(T) {
        this.city.buildings.forEach(b => {
            const bx = b.x * T + T / 2;
            const by = b.y * T + T / 2;
            const bw = (b.w || 3) * T;
            const bh = (b.h || 3) * T;

            // Building sprite (prefer Grok image if available)
            const baseSpriteKey = `building-${b.type}`;
            const grokSprites = this.registry.get('grokSprites') || {};
            const spriteKey = grokSprites[baseSpriteKey] || baseSpriteKey;
            if (this.textures.exists(spriteKey)) {
                const sprite = this.add.image(bx, by, spriteKey).setDepth(5);
                const scale = Math.min(bw / sprite.width, bh / sprite.height) * 0.85;
                sprite.setScale(scale);
            }

            // Label above building
            this.add.text(bx, by - bh / 2 - 8, b.name, {
                fontSize: '15px', fontFamily: 'monospace', color: '#fff',
                backgroundColor: '#000000cc', padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setDepth(6);

            // Interaction zone (in front of building)
            this.interactables.push({
                x: bx, y: by + bh / 2 + T,
                type: 'building',
                data: b,
                name: b.name
            });
        });
    }

    // --- PORTALS ---
    _placePortals(T) {
        this.city.portalZones.forEach(p => {
            const px = p.x * T + T / 2;
            const py = p.y * T + T / 2;

            const portal = this.add.image(px, py, `portal-${p.rank}`)
                .setScale(1.8).setDepth(5);
            this.tweens.add({
                targets: portal,
                scaleX: { from: 1.5, to: 2.1 },
                scaleY: { from: 1.5, to: 2.1 },
                duration: 1000, yoyo: true, repeat: -1,
            });
            this.add.text(px, py - T - 4, `${p.rank}級 LV${p.minLevel}+`, {
                fontSize: '14px', fontFamily: 'monospace',
                color: PORTAL_RANKS[p.rank].color,
                backgroundColor: '#000000cc', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(6);

            this.interactables.push({
                x: px, y: py,
                type: 'portal',
                data: p,
                name: `${p.rank}級傳送門`
            });
        });
    }

    // --- PLAYER ---
    _createPlayer(mapData, T) {
        const sx = mapData.spawnX * T + T / 2;
        const sy = mapData.spawnY * T + T / 2;

        this.playerSprite = this.physics.add.sprite(sx, sy, 'player-sheet', 1)
            .setScale(1.5).setDepth(10);
        this.playerSprite.body.setSize(14, 14);
        this.playerSprite.body.setOffset(5, 18);
        this.playerSprite.setCollideWorldBounds(true);

        this.physics.add.collider(this.playerSprite, this.wallGroup);

        // Name tag above player
        this.playerNameTag = this.add.text(sx, sy - 24, this.player.name, {
            fontSize: '12px', fontFamily: 'monospace', color: '#00d4ff',
            backgroundColor: '#00000088', padding: { x: 3, y: 1 }
        }).setOrigin(0.5).setDepth(11);
    }

    // --- MOVEMENT ---
    _handleMovement() {
        let vx = 0, vy = 0;

        // Keyboard
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;

        // Joystick
        const jd = this.joystick.getDirection();
        if (Math.abs(jd.x) > 0.15 || Math.abs(jd.y) > 0.15) {
            vx = jd.x; vy = jd.y;
        }

        // Normalize + apply speed
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            vx = (vx / mag) * this.SPEED;
            vy = (vy / mag) * this.SPEED;
            // Animation
            if (Math.abs(vy) > Math.abs(vx)) {
                this.playerSprite.play(vy < 0 ? 'walk-up' : 'walk-down', true);
            } else {
                this.playerSprite.play(vx < 0 ? 'walk-left' : 'walk-right', true);
            }
        } else {
            this.playerSprite.stop();
        }

        this.playerSprite.setVelocity(vx, vy);

        // Update name tag position
        this.playerNameTag.setPosition(this.playerSprite.x, this.playerSprite.y - 28);
    }

    // --- PROXIMITY ---
    _checkProximity() {
        const px = this.playerSprite.x;
        const py = this.playerSprite.y;
        const threshold = this.TILE * 2.5;
        let nearest = null;
        let nearDist = Infinity;

        for (const zone of this.interactables) {
            const dist = Phaser.Math.Distance.Between(px, py, zone.x, zone.y);
            if (dist < threshold && dist < nearDist) {
                nearest = zone;
                nearDist = dist;
            }
        }

        if (nearest) {
            this.currentInteractable = nearest;
            this.interactPrompt.setText(`按 A 互動: ${nearest.name}`);
            this.interactPrompt.setVisible(true);
        } else {
            this.currentInteractable = null;
            this.interactPrompt.setVisible(false);
        }
    }

    // --- INTERACT ---
    _interact() {
        if (!this.currentInteractable) return;
        this.audio.playSFX('click');
        if (this.currentInteractable.type === 'building') {
            this._onBuildingClick(this.currentInteractable.data);
        } else if (this.currentInteractable.type === 'portal') {
            this._onPortalClick(this.currentInteractable.data);
        }
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
            case 'hsr': this._showCityTravel(); break;
        }
    }

    _visitInn() {
        this.player.fullRestore();
        this.audio.playSFX('heal');
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, 'HP 和 MP 已完全回復！', {
            fontSize: '22px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 14, y: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
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
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
            this.tweens.add({ targets: msg, alpha: 0, duration: 2000, onComplete: () => msg.destroy() });
            return;
        }
        const isBossRank = portal.rank === this.city.portalZones[this.city.portalZones.length - 1].rank;
        const bossId = CITY_BOSSES[this.cityKey];
        const bossNotDefeated = !this.player.bossesDefeated.includes(bossId);
        this.scene.start('Dungeon', { city: this.cityKey, rank: portal.rank, hasBoss: isBossRank && bossNotDefeated });
    }

    // --- HUD ---
    _createHUD(camW, camH) {
        const s = Math.min(camW / 800, camH / 600);
        const fs = Math.max(14, 16 * s);

        // City name (top center)
        this.add.text(camW / 2, 8, this.city.name, {
            fontSize: `${Math.max(20, 26 * s)}px`, fontFamily: 'monospace',
            color: this.city.color, fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

        // Player stats (top left)
        this.hudName = this.add.text(8, 6, `${this.player.name} LV.${this.player.level}`, {
            fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#00d4ff',
            backgroundColor: '#00000088', padding: { x: 4, y: 2 }
        }).setScrollFactor(0).setDepth(999);

        // HP bar
        const barX = 8, barY = 28;
        const barW = Math.min(160, camW * 0.3);
        this.add.rectangle(barX + barW / 2, barY + 6, barW, 10, 0x333333)
            .setScrollFactor(0).setDepth(998);
        this.hpBar = this.add.rectangle(barX, barY + 6, barW, 10, 0x2ecc71)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
        this.hpText = this.add.text(barX + 2, barY + 1, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#fff'
        }).setScrollFactor(0).setDepth(1000);
        this._hpBarW = barW;

        // MP bar
        this.add.rectangle(barX + barW / 2, barY + 20, barW, 10, 0x333333)
            .setScrollFactor(0).setDepth(998);
        this.mpBar = this.add.rectangle(barX, barY + 20, barW, 10, 0x3498db)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
        this.mpText = this.add.text(barX + 2, barY + 15, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#fff'
        }).setScrollFactor(0).setDepth(1000);

        // Gold display
        this.goldText = this.add.text(8, barY + 32, '', {
            fontSize: `${Math.max(12, 14 * s)}px`, fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#00000088', padding: { x: 3, y: 1 }
        }).setScrollFactor(0).setDepth(999);

        // Menu buttons (top right)
        const btns = [
            { label: '☰', act: () => this._showQuickMenu() },
        ];
        btns.forEach((bd, i) => {
            const bx = camW - 40 - i * 42;
            const btn = this.add.rectangle(bx, 20, 34, 28, 0x2c3e50, 0.7)
                .setStrokeStyle(1, 0x3498db).setScrollFactor(0).setDepth(999)
                .setInteractive({ useHandCursor: true });
            this.add.text(bx, 20, bd.label, {
                fontSize: '18px', fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
            btn.on('pointerdown', () => { this.audio.playSFX('click'); bd.act(); });
        });

        this._updateHUD();
    }

    _updateHUD() {
        const p = this.player;
        this.hpBar.width = this._hpBarW * Math.max(0, p.hp / p.maxHp);
        this.mpBar.width = this._hpBarW * Math.max(0, p.mp / p.maxMp);
        this.hpText.setText(`HP ${p.hp}/${p.maxHp}`);
        this.mpText.setText(`MP ${p.mp}/${p.maxMp}`);
        this.goldText.setText(`金幣:${p.gold} 鑽石:${p.diamonds}`);
    }

    // --- QUICK MENU (fixed: no container, individual scrollFactor(0) objects) ---
    _showQuickMenu() {
        if (this._uiOverlay.length > 0) { this._clearOverlay(); return; }
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        const boxW = Math.min(320, w * 0.7);
        const boxH = Math.min(420, h * 0.72);

        // Fullscreen blocker to prevent clicks passing through
        const blocker = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.4)
            .setScrollFactor(0).setDepth(2999).setInteractive();
        blocker.on('pointerdown', () => this._clearOverlay());
        this._uiOverlay.push(blocker);

        const bg = this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x0a0a1e, 0.96)
            .setStrokeStyle(2, 0x00d4ff).setScrollFactor(0).setDepth(3000);
        this._uiOverlay.push(bg);

        const title = this.add.text(w / 2, h / 2 - boxH / 2 + 20, '系 統 選 單', {
            fontSize: `${Math.max(18, 22 * s)}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        this._uiOverlay.push(title);

        const menuItems = [
            { label: '📦  背包', act: () => this.scene.start('Menu', { tab: 'inventory', city: this.cityKey }) },
            { label: '📊  狀態', act: () => this.scene.start('Menu', { tab: 'status', city: this.cityKey }) },
            { label: '🛡️  裝備', act: () => this.scene.start('Menu', { tab: 'equipment', city: this.cityKey }) },
            { label: '⚡  技能', act: () => this.scene.start('Menu', { tab: 'skills', city: this.cityKey }) },
            { label: '📜  任務', act: () => this.scene.start('Menu', { tab: 'quest', city: this.cityKey }) },
            { label: '🚄  高鐵移動', act: () => { this._clearOverlay(); this._showCityTravel(); } },
            { label: '💾  存檔', act: () => { this._quickSave(); this._clearOverlay(); } },
        ];

        const btnW = boxW - 40;
        const btnH = Math.max(36, 40 * s);
        menuItems.forEach((item, i) => {
            const y = h / 2 - boxH / 2 + 58 + i * (btnH + 6);
            const btnBg = this.add.rectangle(w / 2, y, btnW, btnH, 0x1a1a3e, 0.9)
                .setStrokeStyle(1, 0x334455)
                .setScrollFactor(0).setDepth(3001)
                .setInteractive({ useHandCursor: true });
            const txt = this.add.text(w / 2, y, item.label, {
                fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#ddd'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);
            btnBg.on('pointerover', () => { btnBg.setFillStyle(0x2a2a4e); txt.setColor('#00d4ff'); });
            btnBg.on('pointerout', () => { btnBg.setFillStyle(0x1a1a3e); txt.setColor('#ddd'); });
            btnBg.on('pointerdown', () => { this.audio.playSFX('click'); item.act(); });
            this._uiOverlay.push(btnBg, txt);
        });

        const closeY = h / 2 + boxH / 2 - 26;
        const closeBg = this.add.rectangle(w / 2, closeY, btnW, btnH, 0x3e1a1a, 0.9)
            .setStrokeStyle(1, 0x553333)
            .setScrollFactor(0).setDepth(3001)
            .setInteractive({ useHandCursor: true });
        const closeTxt = this.add.text(w / 2, closeY, '✕  關閉', {
            fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);
        closeBg.on('pointerover', () => closeTxt.setColor('#ff6b6b'));
        closeBg.on('pointerout', () => closeTxt.setColor('#e74c3c'));
        closeBg.on('pointerdown', () => this._clearOverlay());
        this._uiOverlay.push(closeBg, closeTxt);
    }

    _clearOverlay() {
        this._uiOverlay.forEach(obj => obj.destroy());
        this._uiOverlay = [];
    }

    // --- CITY TRAVEL (fixed: no container, individual scrollFactor(0) objects) ---
    _showCityTravel() {
        if (this._uiOverlay.length > 0) { this._clearOverlay(); return; }
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        const boxW = Math.min(420, w * 0.85);
        const boxH = Math.min(380, h * 0.65);

        // Fullscreen blocker
        const blocker = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.4)
            .setScrollFactor(0).setDepth(2999).setInteractive();
        blocker.on('pointerdown', () => this._clearOverlay());
        this._uiOverlay.push(blocker);

        const bg = this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x0a0a1e, 0.96)
            .setStrokeStyle(2, 0x00d4ff).setScrollFactor(0).setDepth(3000);
        this._uiOverlay.push(bg);

        const title = this.add.text(w / 2, h / 2 - boxH / 2 + 20, '🚄 高鐵移動', {
            fontSize: `${Math.max(18, 22 * s)}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        this._uiOverlay.push(title);

        const btnW = boxW - 40;
        const btnH = Math.max(36, 40 * s);

        CITY_ORDER.forEach((ck, i) => {
            const city = CITIES[ck];
            const unlocked = this.player.citiesUnlocked.includes(ck);
            const isCurrent = ck === this.cityKey;
            const y = h / 2 - boxH / 2 + 58 + i * (btnH + 6);
            const labelText = `${city.name} (LV.${city.levelRange[0]}-${city.levelRange[1]})${isCurrent ? '  ← 目前所在' : ''}${!unlocked ? '  🔒' : ''}`;
            const bgColor = isCurrent ? 0x1a2a1a : unlocked ? 0x1a1a3e : 0x1a1a1a;
            const borderColor = isCurrent ? 0x2ecc71 : unlocked ? 0x334455 : 0x222222;
            const textColor = isCurrent ? '#2ecc71' : unlocked ? city.color : '#444';

            const rowBg = this.add.rectangle(w / 2, y, btnW, btnH, bgColor, 0.9)
                .setStrokeStyle(1, borderColor)
                .setScrollFactor(0).setDepth(3001);
            const txt = this.add.text(w / 2, y, labelText, {
                fontSize: `${Math.max(15, 17 * s)}px`, fontFamily: 'monospace', color: textColor
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);

            if (unlocked && !isCurrent) {
                rowBg.setInteractive({ useHandCursor: true });
                rowBg.on('pointerover', () => { rowBg.setFillStyle(0x2a2a4e); txt.setColor('#fff'); });
                rowBg.on('pointerout', () => { rowBg.setFillStyle(bgColor); txt.setColor(textColor); });
                rowBg.on('pointerdown', () => {
                    this.audio.playSFX('click');
                    this._clearOverlay();
                    this.scene.start('City', { city: ck });
                });
            }
            this._uiOverlay.push(rowBg, txt);
        });

        const closeY = h / 2 + boxH / 2 - 26;
        const closeBg = this.add.rectangle(w / 2, closeY, btnW, btnH, 0x3e1a1a, 0.9)
            .setStrokeStyle(1, 0x553333)
            .setScrollFactor(0).setDepth(3001)
            .setInteractive({ useHandCursor: true });
        const closeTxt = this.add.text(w / 2, closeY, '✕  取消', {
            fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);
        closeBg.on('pointerover', () => closeTxt.setColor('#ff6b6b'));
        closeBg.on('pointerout', () => closeTxt.setColor('#e74c3c'));
        closeBg.on('pointerdown', () => this._clearOverlay());
        this._uiOverlay.push(closeBg, closeTxt);
    }

    // --- SAVE ---
    _quickSave() {
        const slot = this.registry.get('currentSaveSlot') ?? 0;
        SaveSystem.save(slot, this.player.toJSON());
        SaveSystem.addLeaderboardEntry(this.player.toJSON());
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const msg = this.add.text(w / 2, h / 2, '存檔成功！', {
            fontSize: '20px', fontFamily: 'monospace', color: '#2ecc71',
            backgroundColor: '#000000cc', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
        this.tweens.add({ targets: msg, alpha: 0, duration: 1500, onComplete: () => msg.destroy() });
    }
}
