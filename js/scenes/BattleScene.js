// Turn-based battle scene
import { BattleSystem } from '../systems/BattleSystem.js';
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        this.monsterData = data.monster;
        this.isTutorial = data.isTutorial || false;
        this.returnScene = data.returnScene || 'City';
        this.returnData = data.returnData || {};
        this.rankMultiplier = data.rankMultiplier || 1;
        this.onWinCallback = data.onWin || null;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.player = this.registry.get('player');
        this.battle = new BattleSystem(this.player, this.monsterData);

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // --- BATTLE FIELD ---
        // Background
        this.add.rectangle(width / 2, 180, width, 280, 0x1a1a2e);

        // Player side
        this.playerSprite = this.add.image(150, 220, 'player-sheet', 7).setScale(3);

        // Monster side
        this.monsterSprite = this.add.image(width - 180, 180, this.monsterData.sprite).setScale(
            this.monsterData.isBoss ? 2.5 : 2
        );

        // Monster name & HP
        this.add.text(width - 300, 60, this.monsterData.name, {
            fontSize: '16px', fontFamily: 'monospace', color: '#e74c3c', fontStyle: 'bold'
        });
        this.add.text(width - 300, 80, `LV.${this.monsterData.level}`, {
            fontSize: '12px', fontFamily: 'monospace', color: '#7f8c8d'
        });
        this.monsterHpBg = this.add.image(width - 200, 100, 'ui-bar-bg').setScale(0.8, 1);
        this.monsterHpBar = this.add.rectangle(width - 280, 100, 156, 10, 0xe74c3c).setOrigin(0, 0.5);

        // Player info
        this.add.text(30, 60, `${this.player.name} LV.${this.player.level}`, {
            fontSize: '14px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });
        this.playerHpBg = this.add.image(130, 85, 'ui-bar-bg').setScale(0.7, 1);
        this.playerHpBar = this.add.rectangle(62, 85, 136, 10, 0xe74c3c).setOrigin(0, 0.5);
        this.playerHpText = this.add.text(200, 78, '', { fontSize: '11px', fontFamily: 'monospace', color: '#fff' });

        this.playerMpBg = this.add.image(130, 105, 'ui-bar-bg').setScale(0.7, 1);
        this.playerMpBar = this.add.rectangle(62, 105, 136, 10, 0x3498db).setOrigin(0, 0.5);
        this.playerMpText = this.add.text(200, 98, '', { fontSize: '11px', fontFamily: 'monospace', color: '#fff' });

        // --- BATTLE LOG ---
        this.logBg = this.add.rectangle(width / 2, 340, width - 20, 50, 0x0a0a1a, 0.9);
        this.logText = this.add.text(20, 320, '', {
            fontSize: '13px', fontFamily: 'monospace', color: '#fff',
            wordWrap: { width: width - 40 }
        });

        // --- COMMAND PANEL ---
        this.commandContainer = this.add.container(0, 0);
        this.subMenuContainer = this.add.container(0, 0).setVisible(false);

        this._createCommandButtons();
        this._updateBars();

        // Start with player turn indicator
        if (this.battle.isPlayerTurn) {
            this.logText.setText('你的回合！選擇行動。');
        } else {
            this.logText.setText('敵人先攻！');
            this.time.delayedCall(800, () => this._doMonsterFirst());
        }
    }

    _createCommandButtons() {
        const { width, height } = this.cameras.main;
        const commands = [
            { label: '攻擊', action: () => this._doAction('attack') },
            { label: '技能', action: () => this._showSkillMenu() },
            { label: '道具', action: () => this._showItemMenu() },
            { label: '防禦', action: () => this._doAction('defend') },
            { label: '逃跑', action: () => this._doAction('flee') },
        ];

        const startY = 390;
        const btnW = 140;
        const btnH = 36;
        const cols = 3;

        commands.forEach((cmd, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 90 + col * (btnW + 15);
            const y = startY + row * (btnH + 10);

            const btn = this.add.rectangle(x, y, btnW, btnH, 0x2c3e50)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(x, y, cmd.label, {
                fontSize: '14px', fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);

            btn.on('pointerover', () => { btn.setFillStyle(0x34495e); txt.setColor('#00d4ff'); });
            btn.on('pointerout', () => { btn.setFillStyle(0x2c3e50); txt.setColor('#fff'); });
            btn.on('pointerdown', cmd.action);

            this.commandContainer.add(btn);
            this.commandContainer.add(txt);
        });
    }

    _showSkillMenu() {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.removeAll(true);
        this.subMenuContainer.setVisible(true);

        const { width } = this.cameras.main;
        const skills = this.player.skills;

        // Back button
        const backBtn = this.add.text(width - 80, 385, '← 返回', {
            fontSize: '12px', fontFamily: 'monospace', color: '#e74c3c'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
            this.subMenuContainer.setVisible(false);
            this.commandContainer.setVisible(true);
        });
        this.subMenuContainer.add(backBtn);

        skills.forEach((skId, i) => {
            const sk = SKILLS[skId];
            if (!sk) return;
            const y = 405 + i * 28;
            if (y > 580) return;

            const cd = this.battle.cooldowns[skId] || 0;
            const canUse = this.player.mp >= sk.mpCost && cd === 0;
            const color = canUse ? '#fff' : '#666';

            const txt = this.add.text(30, y,
                `${sk.name} (MP:${sk.mpCost})${cd > 0 ? ` [CD:${cd}]` : ''}`,
                { fontSize: '12px', fontFamily: 'monospace', color }
            );
            if (canUse) {
                txt.setInteractive({ useHandCursor: true });
                txt.on('pointerover', () => txt.setColor('#00d4ff'));
                txt.on('pointerout', () => txt.setColor('#fff'));
                txt.on('pointerdown', () => {
                    this.subMenuContainer.setVisible(false);
                    this.commandContainer.setVisible(true);
                    this._doAction('skill', skId);
                });
            }
            this.subMenuContainer.add(txt);
        });
    }

    _showItemMenu() {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.removeAll(true);
        this.subMenuContainer.setVisible(true);

        const { width } = this.cameras.main;

        const backBtn = this.add.text(width - 80, 385, '← 返回', {
            fontSize: '12px', fontFamily: 'monospace', color: '#e74c3c'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
            this.subMenuContainer.setVisible(false);
            this.commandContainer.setVisible(true);
        });
        this.subMenuContainer.add(backBtn);

        const consumables = this.player.inventory.filter(i => i.type === 'consumable');
        if (consumables.length === 0) {
            this.subMenuContainer.add(this.add.text(30, 410, '沒有可使用的道具', {
                fontSize: '12px', fontFamily: 'monospace', color: '#666'
            }));
            return;
        }

        consumables.forEach((item, i) => {
            const y = 405 + i * 28;
            if (y > 580) return;
            const txt = this.add.text(30, y,
                `${item.name} x${item.quantity || 1}`,
                { fontSize: '12px', fontFamily: 'monospace', color: '#fff' }
            ).setInteractive({ useHandCursor: true });
            txt.on('pointerover', () => txt.setColor('#2ecc71'));
            txt.on('pointerout', () => txt.setColor('#fff'));
            txt.on('pointerdown', () => {
                this.subMenuContainer.setVisible(false);
                this.commandContainer.setVisible(true);
                this._doAction('item', item.id);
            });
            this.subMenuContainer.add(txt);
        });
    }

    _doAction(type, param) {
        this.commandContainer.setVisible(false);
        let result;

        switch (type) {
            case 'attack': result = this.battle.playerAttack(); break;
            case 'skill': result = this.battle.playerSkill(param); break;
            case 'defend': result = this.battle.playerDefend(); break;
            case 'item': result = this.battle.playerUseItem(param); break;
            case 'flee': result = this.battle.playerFlee(); break;
        }

        if (result?.error) {
            this.logText.setText(result.error);
            this.commandContainer.setVisible(true);
            return;
        }

        this._playBattleLog();
    }

    _doMonsterFirst() {
        // Monster attacks first
        this.battle._monsterTurn();
        this.battle._checkBattleEnd();
        this._playBattleLog();
    }

    _playBattleLog() {
        const logs = this.battle.log;
        let i = this._lastLogIndex || 0;

        const showNext = () => {
            if (i >= logs.length) {
                this._lastLogIndex = logs.length;
                this._updateBars();
                if (this.battle.battleOver) {
                    this._endBattle();
                } else {
                    this.commandContainer.setVisible(true);
                    this.logText.setText('你的回合！選擇行動。');
                }
                return;
            }

            const log = logs[i];
            this.logText.setText(log.text);
            this._updateBars();

            // Damage animation
            if (log.damage && log.actor === 'player') {
                this.tweens.add({
                    targets: this.monsterSprite,
                    x: this.monsterSprite.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                });
            } else if (log.damage && log.actor === 'monster') {
                this.tweens.add({
                    targets: this.playerSprite,
                    x: this.playerSprite.x - 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                });
                this.cameras.main.shake(200, 0.005);
            }

            i++;
            this.time.delayedCall(log.scan ? 2000 : 1000, showNext);
        };

        showNext();
    }

    _updateBars() {
        const p = this.player;
        const m = this.battle.monster;

        // Player HP
        const hpRatio = Math.max(0, p.hp / p.maxHp);
        this.playerHpBar.width = 136 * hpRatio;
        this.playerHpText.setText(`HP ${p.hp}/${p.maxHp}`);

        // Player MP
        const mpRatio = Math.max(0, p.mp / p.maxMp);
        this.playerMpBar.width = 136 * mpRatio;
        this.playerMpText.setText(`MP ${p.mp}/${p.maxMp}`);

        // Monster HP
        const mhpRatio = Math.max(0, m.currentHp / m.hp);
        this.monsterHpBar.width = 156 * mhpRatio;
    }

    _endBattle() {
        const { width, height } = this.cameras.main;

        if (this.battle.result === 'win') {
            // Monster death animation
            this.tweens.add({
                targets: this.monsterSprite,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 500,
            });

            const rewards = this.battle.getRewards(this.rankMultiplier);

            // Record kill
            this.player.recordKill(this.monsterData.id);
            if (this.monsterData.isBoss) {
                this.player.defeatBoss(this.monsterData.id);
            }

            // Grant rewards
            const levelUps = this.player.addExp(rewards.exp);
            this.player.addGold(rewards.gold);

            let rewardText = `勝利！\n獲得 ${rewards.exp} EXP, ${rewards.gold} 金幣`;

            rewards.drops.forEach(drop => {
                const item = ITEMS[drop.itemId];
                if (item) {
                    if (item.type === 'currency' && item.id === 'diamond') {
                        this.player.addDiamonds(drop.amount);
                        rewardText += `\n鑽石 x${drop.amount}`;
                    } else {
                        for (let n = 0; n < drop.amount; n++) {
                            this.player.addItem({ ...item });
                        }
                        rewardText += `\n${item.name} x${drop.amount}`;
                    }
                    this.player.recordItemCollect(drop.itemId);
                }
            });

            if (levelUps.length > 0) {
                levelUps.forEach(lu => {
                    rewardText += `\n\n等級提升！LV.${lu.level}`;
                    if (lu.newSkills.length > 0) {
                        lu.newSkills.forEach(skId => {
                            const sk = SKILLS[skId];
                            if (sk) rewardText += `\n習得新技能：【${sk.name}】`;
                        });
                    }
                });
            }

            this.time.delayedCall(600, () => {
                // Show reward window
                const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
                this.add.text(width / 2, height / 2 - 100, '戰 鬥 勝 利', {
                    fontSize: '22px', fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
                }).setOrigin(0.5);

                this.add.text(width / 2, height / 2, rewardText, {
                    fontSize: '13px', fontFamily: 'monospace', color: '#fff',
                    align: 'center', lineSpacing: 4,
                }).setOrigin(0.5);

                const contBtn = this.add.text(width / 2, height / 2 + 120, '繼續', {
                    fontSize: '16px', fontFamily: 'monospace', color: '#00d4ff'
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                contBtn.on('pointerdown', () => {
                    if (this.onWinCallback) {
                        this.onWinCallback();
                    }
                    this.scene.start(this.returnScene, this.returnData);
                });
            });

        } else if (this.battle.result === 'lose') {
            this.tweens.add({
                targets: this.playerSprite,
                alpha: 0,
                duration: 500,
            });

            this.time.delayedCall(600, () => {
                const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
                this.add.text(width / 2, height / 2 - 40, '戰 鬥 失 敗', {
                    fontSize: '22px', fontFamily: 'monospace', color: '#e74c3c', fontStyle: 'bold'
                }).setOrigin(0.5);
                this.add.text(width / 2, height / 2 + 10, '你被擊敗了...HP 回復至一半', {
                    fontSize: '13px', fontFamily: 'monospace', color: '#fff',
                }).setOrigin(0.5);

                this.player.hp = Math.floor(this.player.maxHp * 0.5);
                this.player.mp = Math.floor(this.player.maxMp * 0.5);

                const contBtn = this.add.text(width / 2, height / 2 + 60, '返回城市', {
                    fontSize: '16px', fontFamily: 'monospace', color: '#e74c3c'
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                contBtn.on('pointerdown', () => {
                    this.scene.start('City', { city: this.player.currentCity });
                });
            });

        } else if (this.battle.result === 'flee') {
            this.time.delayedCall(800, () => {
                this.scene.start(this.returnScene, this.returnData);
            });
        }
    }
}
