// Turn-based battle scene - fully responsive
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
    }

    create() {
        this.player = this.registry.get('player');
        this.audio = this.registry.get('audio');
        this.battle = new BattleSystem(this.player, this.monsterData);
        this.audio.playBGM(this.monsterData.isBoss ? 'boss' : 'battle');

        this._buildUI();

        if (this.battle.isPlayerTurn) {
            this.logText.setText('你的回合！選擇行動。');
        } else {
            this.logText.setText('敵人先攻！');
            this.time.delayedCall(800, () => this._doMonsterFirst());
        }
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.s = Math.min(w / 800, h / 600);
        const s = this.s;
        const fs = Math.max(10, Math.floor(13 * s));

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // --- BATTLE FIELD (top 55%) ---
        const fieldH = h * 0.52;
        this.add.rectangle(w / 2, fieldH / 2, w, fieldH, 0x1a1a2e);

        // Player sprite (left 25%) — prefer hero portrait
        const heroKey = this.textures.exists('hero-portrait') ? 'hero-portrait' : 'player-sheet';
        const heroFrame = heroKey === 'player-sheet' ? 7 : undefined;
        this.playerSprite = this.add.image(w * 0.2, fieldH * 0.65, heroKey, heroFrame)
            .setScale(heroKey === 'hero-portrait' ? Math.max(0.15, 0.3 * s) : Math.max(1.5, 3 * s));

        // Monster sprite (right 75%) — prefer Grok image
        const grokSprites = this.registry.get('grokSprites') || {};
        const monsterKey = grokSprites[this.monsterData.sprite] || this.monsterData.sprite;
        this.monsterSprite = this.add.image(w * 0.75, fieldH * 0.5, monsterKey)
            .setScale(this.monsterData.isBoss ? Math.max(1.5, 2.5 * s) : Math.max(1, 2 * s));

        // --- STATS BARS ---
        // Monster info (top-right)
        this.add.text(w * 0.55, 8, this.monsterData.name, {
            fontSize: `${Math.max(11, 15 * s)}px`, fontFamily: 'monospace', color: '#e74c3c', fontStyle: 'bold'
        });
        this.add.text(w * 0.55, 8 + 18 * s, `LV.${this.monsterData.level}`, {
            fontSize: `${Math.max(9, 11 * s)}px`, fontFamily: 'monospace', color: '#7f8c8d'
        });
        const mBarW = Math.min(180, w * 0.3);
        this.add.rectangle(w * 0.55 + mBarW / 2, 12 + 36 * s, mBarW, 10 * s, 0x1a1a1a).setStrokeStyle(1, 0x444444);
        this.monsterHpBar = this.add.rectangle(w * 0.55, 12 + 36 * s, mBarW - 4, 8 * s, 0xe74c3c).setOrigin(0, 0.5);
        this._mBarFullW = mBarW - 4;

        // Player info (top-left)
        this.add.text(10, 8, `${this.player.name} LV.${this.player.level}`, {
            fontSize: `${Math.max(10, 13 * s)}px`, fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });
        const pBarW = Math.min(150, w * 0.25);
        // HP bar
        this.add.rectangle(10 + pBarW / 2, 10 + 22 * s, pBarW, 8 * s, 0x1a1a1a).setStrokeStyle(1, 0x444444);
        this.playerHpBar = this.add.rectangle(10, 10 + 22 * s, pBarW - 4, 6 * s, 0xe74c3c).setOrigin(0, 0.5);
        this.playerHpText = this.add.text(10 + pBarW + 5, 4 + 22 * s, '', {
            fontSize: `${Math.max(8, 10 * s)}px`, fontFamily: 'monospace', color: '#fff'
        });
        this._pBarFullW = pBarW - 4;
        // MP bar
        this.add.rectangle(10 + pBarW / 2, 10 + 36 * s, pBarW, 8 * s, 0x1a1a1a).setStrokeStyle(1, 0x444444);
        this.playerMpBar = this.add.rectangle(10, 10 + 36 * s, pBarW - 4, 6 * s, 0x3498db).setOrigin(0, 0.5);
        this.playerMpText = this.add.text(10 + pBarW + 5, 4 + 36 * s, '', {
            fontSize: `${Math.max(8, 10 * s)}px`, fontFamily: 'monospace', color: '#fff'
        });

        // --- BATTLE LOG (middle strip ~12%) ---
        const logY = fieldH + 4;
        const logH = h * 0.12;
        this.add.rectangle(w / 2, logY + logH / 2, w - 10, logH, 0x0a0a1a, 0.95).setStrokeStyle(1, 0x2c3e50);
        this.logText = this.add.text(12, logY + 6, '', {
            fontSize: `${fs}px`, fontFamily: 'monospace', color: '#fff',
            wordWrap: { width: w - 30, useAdvancedWrap: true },
            lineSpacing: 3,
        });

        // --- COMMAND PANEL (bottom ~36%) ---
        const cmdY = fieldH + logH + 10;
        this.commandContainer = this.add.container(0, 0);
        this.subMenuContainer = this.add.container(0, 0).setVisible(false);

        const commands = [
            { label: '攻擊', action: () => this._doAction('attack') },
            { label: '技能', action: () => this._showSkillMenu() },
            { label: '道具', action: () => this._showItemMenu() },
            { label: '防禦', action: () => this._doAction('defend') },
            { label: '逃跑', action: () => this._doAction('flee') },
        ];

        const cols = w < 400 ? 3 : 5; // Stack on small screens
        const btnW = Math.min(130, (w - 20) / cols - 8);
        const btnH = Math.max(30, 36 * s);

        commands.forEach((cmd, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 12 + col * (btnW + 6) + btnW / 2;
            const y = cmdY + row * (btnH + 6) + btnH / 2;

            const btn = this.add.rectangle(x, y, btnW, btnH, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(x, y, cmd.label, {
                fontSize: `${Math.max(11, 14 * s)}px`, fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            btn.on('pointerover', () => { btn.setFillStyle(0x34495e); txt.setColor('#00d4ff'); });
            btn.on('pointerout', () => { btn.setFillStyle(0x2c3e50); txt.setColor('#fff'); });
            btn.on('pointerdown', cmd.action);
            this.commandContainer.add(btn);
            this.commandContainer.add(txt);
        });

        this._cmdY = cmdY;
        this._updateBars();
    }

    _showSkillMenu() {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.removeAll(true);
        this.subMenuContainer.setVisible(true);
        const w = this.cameras.main.width;
        const s = this.s;

        const backBtn = this.add.text(w - 15, this._cmdY, '← 返回', {
            fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => { this.subMenuContainer.setVisible(false); this.commandContainer.setVisible(true); });
        this.subMenuContainer.add(backBtn);

        this.player.skills.forEach((skId, i) => {
            const sk = SKILLS[skId];
            if (!sk) return;
            const y = this._cmdY + 4 + i * Math.max(22, 26 * s);
            if (y > this.cameras.main.height - 10) return;
            const cd = this.battle.cooldowns[skId] || 0;
            const canUse = this.player.mp >= sk.mpCost && cd === 0;
            const color = canUse ? '#fff' : '#555';
            const txt = this.add.text(12, y,
                `${sk.name} (MP:${sk.mpCost})${cd > 0 ? ` [CD:${cd}]` : ''}`, {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color
            });
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
        const w = this.cameras.main.width;
        const s = this.s;

        const backBtn = this.add.text(w - 15, this._cmdY, '← 返回', {
            fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => { this.subMenuContainer.setVisible(false); this.commandContainer.setVisible(true); });
        this.subMenuContainer.add(backBtn);

        const consumables = this.player.inventory.filter(i => i.type === 'consumable');
        if (consumables.length === 0) {
            this.subMenuContainer.add(this.add.text(12, this._cmdY + 4, '沒有可使用的道具', {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#666'
            }));
            return;
        }
        consumables.forEach((item, i) => {
            const y = this._cmdY + 4 + i * Math.max(22, 26 * s);
            if (y > this.cameras.main.height - 10) return;
            const txt = this.add.text(12, y, `${item.name} x${item.quantity || 1}`, {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#fff'
            }).setInteractive({ useHandCursor: true });
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
        this.subMenuContainer.setVisible(false);
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

            if (log.damage && log.actor === 'player') {
                this.audio.playSFX(log.critical ? 'magic' : 'attack');
                if (log.critical) this.audio.vibrateCritical();
                this.tweens.add({ targets: this.monsterSprite, x: this.monsterSprite.x + 8, duration: 40, yoyo: true, repeat: 3 });
            } else if (log.heal) {
                this.audio.playSFX('heal');
            } else if (log.scan) {
                this.audio.playSFX('magic');
            } else if (log.damage && log.actor === 'monster') {
                this.audio.playSFX('hit');
                this.audio.vibrateHit();
                this.tweens.add({ targets: this.playerSprite, x: this.playerSprite.x - 8, duration: 40, yoyo: true, repeat: 3 });
                this.cameras.main.shake(150, 0.004);
            }
            i++;
            this.time.delayedCall(log.scan ? 2000 : 900, showNext);
        };
        showNext();
    }

    _updateBars() {
        const p = this.player;
        const m = this.battle.monster;
        this.playerHpBar.width = this._pBarFullW * Math.max(0, p.hp / p.maxHp);
        this.playerHpText.setText(`${p.hp}/${p.maxHp}`);
        this.playerMpBar.width = this._pBarFullW * Math.max(0, p.mp / p.maxMp);
        this.playerMpText.setText(`${p.mp}/${p.maxMp}`);
        this.monsterHpBar.width = this._mBarFullW * Math.max(0, m.currentHp / m.hp);
    }

    _endBattle() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = this.s;

        if (this.battle.result === 'win') {
            this.audio.stopBGM();
            this.audio.playBGM('victory');
            this.audio.vibrateLevelUp();
            this.tweens.add({ targets: this.monsterSprite, alpha: 0, scaleX: 0, scaleY: 0, duration: 500 });

            const rewards = this.battle.getRewards(this.rankMultiplier);
            this.player.recordKill(this.monsterData.id);
            if (this.monsterData.isBoss) this.player.defeatBoss(this.monsterData.id);

            const levelUps = this.player.addExp(rewards.exp);
            this.player.addGold(rewards.gold);
            let rewardText = `獲得 ${rewards.exp} EXP, ${rewards.gold} 金幣`;
            rewards.drops.forEach(drop => {
                const item = ITEMS[drop.itemId];
                if (item) {
                    if (item.id === 'diamond') { this.player.addDiamonds(drop.amount); rewardText += `\n鑽石 x${drop.amount}`; }
                    else { for (let n = 0; n < drop.amount; n++) this.player.addItem({ ...item }); rewardText += `\n${item.name} x${drop.amount}`; }
                    this.player.recordItemCollect(drop.itemId);
                }
            });
            levelUps.forEach(lu => {
                rewardText += `\n\n等級提升！LV.${lu.level}`;
                lu.newSkills.forEach(skId => { const sk = SKILLS[skId]; if (sk) rewardText += `\n習得：【${sk.name}】`; });
            });

            this.time.delayedCall(600, () => {
                const boxW = Math.min(460, w * 0.88);
                const boxH = Math.min(280, h * 0.5);
                this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x0a0a1e, 0.96).setStrokeStyle(2, 0xf1c40f);
                this.add.text(w / 2, h / 2 - boxH / 2 + 20, '戰 鬥 勝 利', {
                    fontSize: `${Math.max(16, 20 * s)}px`, fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
                }).setOrigin(0.5);
                this.add.text(w / 2, h / 2, rewardText, {
                    fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#fff',
                    align: 'center', lineSpacing: 3, wordWrap: { width: boxW - 30 }
                }).setOrigin(0.5);
                const contBtn = this.add.text(w / 2, h / 2 + boxH / 2 - 25, '繼續', {
                    fontSize: `${Math.max(13, 16 * s)}px`, fontFamily: 'monospace', color: '#00d4ff',
                    backgroundColor: '#2c3e50', padding: { x: 20, y: 6 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                contBtn.on('pointerdown', () => {
                    if (this.monsterData.isBoss) {
                        const cityOrder = ['taipei', 'newTaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung'];
                        const idx = cityOrder.indexOf(this.player.currentCity);
                        if (idx >= 0 && idx < cityOrder.length - 1) this.player.unlockCity(cityOrder[idx + 1]);
                    }
                    this.scene.start(this.returnScene, this.returnData);
                });
            });

        } else if (this.battle.result === 'lose') {
            this.audio.stopBGM();
            this.audio.playSFX('defeat');
            this.audio.vibrateDefeat();
            this.tweens.add({ targets: this.playerSprite, alpha: 0, duration: 500 });
            this.time.delayedCall(600, () => {
                const boxW = Math.min(400, w * 0.8);
                this.add.rectangle(w / 2, h / 2, boxW, 150 * s, 0x0a0a1e, 0.96).setStrokeStyle(2, 0xe74c3c);
                this.add.text(w / 2, h / 2 - 30 * s, '戰 鬥 失 敗', {
                    fontSize: `${Math.max(16, 20 * s)}px`, fontFamily: 'monospace', color: '#e74c3c', fontStyle: 'bold'
                }).setOrigin(0.5);
                this.add.text(w / 2, h / 2 + 5, 'HP 回復至一半', {
                    fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#fff'
                }).setOrigin(0.5);
                this.player.hp = Math.floor(this.player.maxHp * 0.5);
                this.player.mp = Math.floor(this.player.maxMp * 0.5);
                const contBtn = this.add.text(w / 2, h / 2 + 40 * s, '返回城市', {
                    fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#e74c3c',
                    backgroundColor: '#2c3e50', padding: { x: 16, y: 6 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                contBtn.on('pointerdown', () => this.scene.start('City', { city: this.player.currentCity }));
            });

        } else if (this.battle.result === 'flee') {
            this.time.delayedCall(600, () => this.scene.start(this.returnScene, this.returnData));
        }
    }
}
