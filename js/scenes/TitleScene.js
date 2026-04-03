// Title screen with save slot selection
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Animated background particles
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const particle = this.add.rectangle(x, y, 2, 2, 0x00d4ff, 0.3 + Math.random() * 0.4);
            this.tweens.add({
                targets: particle,
                y: y - 100 - Math.random() * 200,
                alpha: 0,
                duration: 3000 + Math.random() * 4000,
                repeat: -1,
                yoyo: false,
                onRepeat: () => {
                    particle.y = height + 10;
                    particle.alpha = 0.3 + Math.random() * 0.4;
                }
            });
        }

        // Title text
        const titleStyle = { fontSize: '42px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold' };
        const title = this.add.text(width / 2, 100, '台 北 覺 醒 者', titleStyle).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 155, 'TAIPEI AWAKENER', {
            fontSize: '18px', fontFamily: 'monospace', color: '#7f8c8d'
        }).setOrigin(0.5);

        // Glow effect on title
        this.tweens.add({
            targets: title,
            alpha: { from: 0.7, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Version
        this.add.text(width / 2, 185, 'v1.0', {
            fontSize: '12px', fontFamily: 'monospace', color: '#555'
        }).setOrigin(0.5);

        // Menu buttons
        const buttonY = 260;
        const buttonSpacing = 55;

        this._createButton(width / 2, buttonY, '新 遊 戲', () => this._newGame());
        this._createButton(width / 2, buttonY + buttonSpacing, '讀 取 存 檔', () => this._showLoadMenu());
        this._createButton(width / 2, buttonY + buttonSpacing * 2, '排 行 榜', () => this._showLeaderboard());

        // Save slots container (hidden initially)
        this.saveContainer = this.add.container(0, 0).setVisible(false);
        this.leaderboardContainer = this.add.container(0, 0).setVisible(false);
    }

    _createButton(x, y, text, callback) {
        const btn = this.add.image(x, y, 'ui-button').setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, text, {
            fontSize: '16px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => {
            btn.setTexture('ui-button-hover');
            label.setColor('#00d4ff');
        });
        btn.on('pointerout', () => {
            btn.setTexture('ui-button');
            label.setColor('#fff');
        });
        btn.on('pointerdown', callback);
        return btn;
    }

    _newGame() {
        const player = this.registry.get('player');
        player.reset();
        this.scene.start('Prologue');
    }

    _showLoadMenu() {
        this.saveContainer.removeAll(true);
        this.saveContainer.setVisible(true);
        this.leaderboardContainer.setVisible(false);

        const { width, height } = this.cameras.main;
        const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
        this.saveContainer.add(bg);

        this.saveContainer.add(this.add.text(width / 2, height / 2 - 120, '選擇存檔', {
            fontSize: '20px', fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        const saves = SaveSystem.getAllSaves();

        for (let i = 0; i < 3; i++) {
            const slotY = height / 2 - 50 + i * 60;
            const save = saves[i];
            const label = save ? save.label : `存檔 ${i + 1} — 空`;
            const color = save ? '#fff' : '#666';

            const btn = this.add.image(width / 2, slotY, 'ui-button').setInteractive({ useHandCursor: true });
            const txt = this.add.text(width / 2, slotY, label, {
                fontSize: '14px', fontFamily: 'monospace', color
            }).setOrigin(0.5);

            if (save) {
                btn.on('pointerover', () => { btn.setTexture('ui-button-hover'); txt.setColor('#00d4ff'); });
                btn.on('pointerout', () => { btn.setTexture('ui-button'); txt.setColor('#fff'); });
                btn.on('pointerdown', () => this._loadSlot(i));
            }

            this.saveContainer.add(btn);
            this.saveContainer.add(txt);
        }

        // Back button
        const backBtn = this.add.text(width / 2, height / 2 + 120, '返回', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.saveContainer.setVisible(false));
        this.saveContainer.add(backBtn);
    }

    _loadSlot(slot) {
        const data = SaveSystem.load(slot);
        if (!data) return;
        const player = this.registry.get('player');
        player.fromJSON(data);
        this.registry.set('currentSaveSlot', slot);

        if (player.prologueComplete) {
            this.scene.start('City', { city: player.currentCity });
        } else {
            this.scene.start('Prologue');
        }
    }

    _showLeaderboard() {
        this.leaderboardContainer.removeAll(true);
        this.leaderboardContainer.setVisible(true);
        this.saveContainer.setVisible(false);

        const { width, height } = this.cameras.main;
        const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
        this.leaderboardContainer.add(bg);

        this.leaderboardContainer.add(this.add.text(width / 2, height / 2 - 120, '排 行 榜', {
            fontSize: '20px', fontFamily: 'monospace', color: '#f1c40f'
        }).setOrigin(0.5));

        const board = SaveSystem.getLeaderboard();
        const headerStyle = { fontSize: '12px', fontFamily: 'monospace', color: '#7f8c8d' };
        this.leaderboardContainer.add(this.add.text(width / 2 - 180, height / 2 - 85, '排名  名稱          等級  城市', headerStyle));

        board.slice(0, 8).forEach((entry, i) => {
            const y = height / 2 - 60 + i * 22;
            const rankColor = i === 0 ? '#f1c40f' : i === 1 ? '#bdc3c7' : i === 2 ? '#cd7f32' : '#fff';
            this.leaderboardContainer.add(this.add.text(width / 2 - 180, y,
                `#${i + 1}    ${entry.name.padEnd(12)} LV.${String(entry.level).padStart(2)}  ${entry.citiesCleared}/6`,
                { fontSize: '13px', fontFamily: 'monospace', color: rankColor }
            ));
        });

        if (board.length === 0) {
            this.leaderboardContainer.add(this.add.text(width / 2, height / 2, '暫無記錄', {
                fontSize: '14px', fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5));
        }

        const backBtn = this.add.text(width / 2, height / 2 + 120, '返回', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.leaderboardContainer.setVisible(false));
        this.leaderboardContainer.add(backBtn);
    }
}
