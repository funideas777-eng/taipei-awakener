// Title screen with save slot selection
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        this.audio = this.registry.get('audio');

        // Start BGM on first interaction
        this.input.once('pointerdown', () => {
            this.audio.init();
            this.audio.resume();
            this.audio.playBGM('title');
        });

        this._buildUI();

        // Rebuild UI on resize
        this.scale.on('resize', () => {
            this.children.removeAll(true);
            this.saveContainer = null;
            this.leaderboardContainer = null;
            this._buildUI();
        });
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600); // scale factor

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Title background image
        if (this.textures.exists('title-bg')) {
            const bg = this.add.image(w / 2, h / 2, 'title-bg');
            bg.setDisplaySize(w, h);
            bg.setAlpha(0.6);
        }

        // Particles
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const p = this.add.rectangle(x, y, 2 * s, 2 * s, 0x00d4ff, 0.3 + Math.random() * 0.4);
            this.tweens.add({
                targets: p, y: y - 100 - Math.random() * 200, alpha: 0,
                duration: 3000 + Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.y = h + 10; p.alpha = 0.3 + Math.random() * 0.4; }
            });
        }

        // Title
        const titleSize = Math.max(24, Math.floor(42 * s));
        const title = this.add.text(w / 2, h * 0.16, '台 北 覺 醒 者', {
            fontSize: `${titleSize}px`, fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, alpha: { from: 0.7, to: 1 }, duration: 1500, yoyo: true, repeat: -1 });

        this.add.text(w / 2, h * 0.23, 'TAIPEI AWAKENER', {
            fontSize: `${Math.max(12, Math.floor(18 * s))}px`, fontFamily: 'monospace', color: '#7f8c8d'
        }).setOrigin(0.5);

        // Buttons
        const btnW = Math.min(260, w * 0.5);
        const btnH = Math.min(48, h * 0.08);
        const btnY = h * 0.42;
        const gap = btnH + 16 * s;

        this._createBtn(w / 2, btnY, btnW, btnH, '新 遊 戲', s, () => this._newGame());
        this._createBtn(w / 2, btnY + gap, btnW, btnH, '讀 取 存 檔', s, () => this._showLoadMenu());
        this._createBtn(w / 2, btnY + gap * 2, btnW, btnH, '排 行 榜', s, () => this._showLeaderboard());

        // Sound toggle
        const muteBtn = this.add.text(w - 15, 15, '🔊', {
            fontSize: `${Math.max(16, 20 * s)}px`
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        muteBtn.on('pointerdown', () => {
            const muted = this.audio.toggleMute();
            muteBtn.setText(muted ? '🔇' : '🔊');
        });

        this.saveContainer = null;
        this.leaderboardContainer = null;
    }

    _createBtn(x, y, bw, bh, text, s, cb) {
        const btn = this.add.rectangle(x, y, bw, bh, 0x2c3e50)
            .setStrokeStyle(2, 0x3498db).setInteractive({ useHandCursor: true });
        const lbl = this.add.text(x, y, text, {
            fontSize: `${Math.max(13, Math.floor(16 * s))}px`, fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5);
        btn.on('pointerover', () => { btn.setFillStyle(0x34495e).setStrokeStyle(2, 0x00d4ff); lbl.setColor('#00d4ff'); });
        btn.on('pointerout', () => { btn.setFillStyle(0x2c3e50).setStrokeStyle(2, 0x3498db); lbl.setColor('#fff'); });
        btn.on('pointerdown', () => { this.audio.playSFX('click'); cb(); });
    }

    _newGame() {
        this.registry.get('player').reset();
        this.audio.stopBGM();
        this.scene.start('Prologue');
    }

    _showLoadMenu() {
        if (this.saveContainer) { this.saveContainer.destroy(); this.saveContainer = null; return; }
        if (this.leaderboardContainer) { this.leaderboardContainer.destroy(); this.leaderboardContainer = null; }
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        this.saveContainer = this.add.container(0, 0);
        this.saveContainer.add(this.add.rectangle(w / 2, h / 2, Math.min(500, w * 0.85), Math.min(300, h * 0.55), 0x0a0a1e, 0.96).setStrokeStyle(2, 0x00d4ff));
        this.saveContainer.add(this.add.text(w / 2, h / 2 - 100 * s, '選擇存檔', {
            fontSize: `${18 * s}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        const saves = SaveSystem.getAllSaves();
        for (let i = 0; i < 3; i++) {
            const sy = h / 2 - 40 * s + i * 50 * s;
            const save = saves[i];
            const label = save ? save.label : `存檔 ${i + 1} — 空`;
            const color = save ? '#fff' : '#666';
            const slotBg = this.add.rectangle(w / 2, sy, Math.min(360, w * 0.6), 36 * s, 0x2c3e50)
                .setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(w / 2, sy, label, {
                fontSize: `${13 * s}px`, fontFamily: 'monospace', color
            }).setOrigin(0.5);
            this.saveContainer.add(slotBg);
            this.saveContainer.add(txt);
            if (save) {
                slotBg.setInteractive({ useHandCursor: true });
                slotBg.on('pointerdown', () => this._loadSlot(i));
            }
        }
        const closeBtn = this.add.text(w / 2, h / 2 + 110 * s, '返回', {
            fontSize: `${14 * s}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => { this.saveContainer.destroy(); this.saveContainer = null; });
        this.saveContainer.add(closeBtn);
    }

    _loadSlot(slot) {
        const data = SaveSystem.load(slot);
        if (!data) return;
        const player = this.registry.get('player');
        player.fromJSON(data);
        this.registry.set('currentSaveSlot', slot);
        this.audio.stopBGM();
        if (player.prologueComplete) {
            this.scene.start('City', { city: player.currentCity });
        } else {
            this.scene.start('Prologue');
        }
    }

    _showLeaderboard() {
        if (this.leaderboardContainer) { this.leaderboardContainer.destroy(); this.leaderboardContainer = null; return; }
        if (this.saveContainer) { this.saveContainer.destroy(); this.saveContainer = null; }
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        this.leaderboardContainer = this.add.container(0, 0);
        this.leaderboardContainer.add(this.add.rectangle(w / 2, h / 2, Math.min(500, w * 0.85), Math.min(350, h * 0.6), 0x0a0a1e, 0.96).setStrokeStyle(2, 0xf1c40f));
        this.leaderboardContainer.add(this.add.text(w / 2, h / 2 - 130 * s, '排 行 榜', {
            fontSize: `${18 * s}px`, fontFamily: 'monospace', color: '#f1c40f'
        }).setOrigin(0.5));

        const board = SaveSystem.getLeaderboard();
        board.slice(0, 8).forEach((entry, i) => {
            const y = h / 2 - 80 * s + i * 24 * s;
            const rankColor = i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#cd7f32' : '#fff';
            this.leaderboardContainer.add(this.add.text(w / 2 - 160 * s, y,
                `#${i + 1}  ${entry.name.padEnd(10)} LV.${String(entry.level).padStart(2)}  ${entry.citiesCleared}/6`,
                { fontSize: `${12 * s}px`, fontFamily: 'monospace', color: rankColor }
            ));
        });
        if (board.length === 0) {
            this.leaderboardContainer.add(this.add.text(w / 2, h / 2, '暫無記錄', {
                fontSize: `${14 * s}px`, fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5));
        }
        const closeBtn = this.add.text(w / 2, h / 2 + 140 * s, '返回', {
            fontSize: `${14 * s}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => { this.leaderboardContainer.destroy(); this.leaderboardContainer = null; });
        this.leaderboardContainer.add(closeBtn);
    }
}
