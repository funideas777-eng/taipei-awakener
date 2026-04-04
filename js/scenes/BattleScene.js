// Turn-based battle scene — multi-monster support with scrollable skills
import { BattleSystem } from '../systems/BattleSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { STORY } from '../data/story.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        // Support both single monster and array
        this.monstersData = data.monsters || (data.monster ? [data.monster] : []);
        this.isTutorial = data.isTutorial || false;
        this.returnScene = data.returnScene || 'City';
        this.returnData = data.returnData || {};
        this.rankMultiplier = data.rankMultiplier || 1;
        this.isFinalBoss = data.isFinalBoss || false;
    }

    create() {
        this.player = this.registry.get('player');
        this.audio = this.registry.get('audio');
        this.battle = new BattleSystem(this.player, this.monstersData);
        const hasBoss = this.monstersData.some(m => m.isBoss);
        this.audio.playBGM(hasBoss ? 'boss' : 'battle');

        this._selectingTarget = false;
        this._pendingAction = null;
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
        const fs = Math.max(14, Math.floor(16 * s));

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // --- BATTLE FIELD (top ~50%) ---
        const fieldH = h * 0.48;
        this.add.rectangle(w / 2, fieldH / 2, w, fieldH, 0x1a1a2e);

        // Player sprite (left 20%)
        const heroKey = this.textures.exists('hero-portrait') ? 'hero-portrait' : 'player-sheet';
        const heroFrame = heroKey === 'player-sheet' ? 7 : undefined;
        this.playerSprite = this.add.image(w * 0.15, fieldH * 0.65, heroKey, heroFrame);
        if (heroKey === 'hero-portrait') {
            const targetH = fieldH * 0.55;
            this.playerSprite.setScale(targetH / this.playerSprite.height);
        } else {
            this.playerSprite.setScale(Math.max(1.5, 3 * s));
        }

        // Monster sprites (right side, spread across)
        this.monsterSprites = [];
        this.monsterHpBars = [];
        this.monsterHpBarFullW = [];
        this.monsterNameTexts = [];
        const monsterCount = this.battle.monsters.length;
        const grokSprites = this.registry.get('grokSprites') || {};
        const monsterAreaStart = w * 0.35;
        const monsterAreaEnd = w * 0.95;
        const monsterSpacing = monsterCount > 1 ? (monsterAreaEnd - monsterAreaStart) / monsterCount : 0;

        this.battle.monsters.forEach((m, i) => {
            const mx = monsterCount === 1 ? w * 0.72 : monsterAreaStart + monsterSpacing * (i + 0.5);
            const my = fieldH * 0.5;

            const isGrokMonster = !!grokSprites[m.sprite];
            const monsterKey = grokSprites[m.sprite] || m.sprite;
            const sprite = this.add.image(mx, my, monsterKey);
            if (isGrokMonster) {
                const targetH = fieldH * (m.isBoss ? 0.6 : 0.4) / (monsterCount > 3 ? 1.3 : 1);
                sprite.setScale(targetH / sprite.height);
            } else {
                const baseScale = m.isBoss ? Math.max(1.2, 2 * s) : Math.max(0.8, 1.5 * s);
                sprite.setScale(baseScale / (monsterCount > 3 ? 1.3 : 1));
            }
            // Make sprite interactive for targeting
            sprite.setInteractive({ useHandCursor: true });
            sprite.on('pointerdown', () => this._onMonsterClick(i));
            this.monsterSprites.push(sprite);

            // Monster name + level
            const nameSize = Math.max(10, Math.floor(12 * s));
            const nameT = this.add.text(mx, my - sprite.displayHeight / 2 - 18, `${m.name} Lv${m.level}`, {
                fontSize: `${nameSize}px`, fontFamily: 'monospace', color: m.isBoss ? '#ff4444' : '#ccc',
                backgroundColor: '#00000088', padding: { x: 2, y: 1 }
            }).setOrigin(0.5);
            this.monsterNameTexts.push(nameT);

            // HP bar
            const barW = Math.min(80, Math.floor(w * 0.1));
            this.add.rectangle(mx, my - sprite.displayHeight / 2 - 6, barW, 6, 0x333333).setStrokeStyle(1, 0x555555);
            const hpBar = this.add.rectangle(mx - barW / 2 + 1, my - sprite.displayHeight / 2 - 6, barW - 2, 4, 0xe74c3c).setOrigin(0, 0.5);
            this.monsterHpBars.push(hpBar);
            this.monsterHpBarFullW.push(barW - 2);
        });

        // Player info (top-left)
        this.add.text(8, 6, `${this.player.name} LV.${this.player.level}`, {
            fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });
        const pBarW = Math.min(140, w * 0.22);
        // HP bar
        this.add.rectangle(8 + pBarW / 2, 8 + 20 * s, pBarW, 8 * s, 0x1a1a1a).setStrokeStyle(1, 0x444444);
        this.playerHpBar = this.add.rectangle(8, 8 + 20 * s, pBarW - 4, 6 * s, 0xe74c3c).setOrigin(0, 0.5);
        this.playerHpText = this.add.text(8 + pBarW + 4, 2 + 20 * s, '', {
            fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: '#fff'
        });
        this._pBarFullW = pBarW - 4;
        // MP bar
        this.add.rectangle(8 + pBarW / 2, 8 + 32 * s, pBarW, 8 * s, 0x1a1a1a).setStrokeStyle(1, 0x444444);
        this.playerMpBar = this.add.rectangle(8, 8 + 32 * s, pBarW - 4, 6 * s, 0x3498db).setOrigin(0, 0.5);
        this.playerMpText = this.add.text(8 + pBarW + 4, 2 + 32 * s, '', {
            fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: '#fff'
        });

        // --- BATTLE LOG (middle strip ~10%) ---
        const logY = fieldH + 2;
        const logH = h * 0.1;
        this.add.rectangle(w / 2, logY + logH / 2, w - 8, logH, 0x0a0a1a, 0.95).setStrokeStyle(1, 0x2c3e50);
        this.logText = this.add.text(10, logY + 4, '', {
            fontSize: `${fs}px`, fontFamily: 'monospace', color: '#fff',
            wordWrap: { width: w - 24, useAdvancedWrap: true },
            lineSpacing: 2,
        });

        // --- COMMAND PANEL (bottom ~40%) ---
        const cmdY = fieldH + logH + 6;
        this._cmdY = cmdY;
        this._cmdH = h - cmdY;
        this.commandContainer = this.add.container(0, 0);
        this.subMenuContainer = this.add.container(0, 0).setVisible(false);

        // Target selection prompt
        this.targetPrompt = this.add.text(w / 2, cmdY - 2, '', {
            fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#f1c40f',
            backgroundColor: '#000000cc', padding: { x: 6, y: 2 }
        }).setOrigin(0.5, 1).setDepth(100).setVisible(false);

        const commands = [
            { label: '攻擊', action: () => this._requestTarget('attack') },
            { label: '技能', action: () => this._showSkillMenu() },
            { label: '道具', action: () => this._showItemMenu() },
            { label: '防禦', action: () => this._doAction('defend') },
            { label: '逃跑', action: () => this._doAction('flee') },
        ];

        const cols = w < 400 ? 3 : 5;
        const btnW = Math.min(120, (w - 16) / cols - 6);
        const btnH = Math.max(28, 32 * s);

        commands.forEach((cmd, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 10 + col * (btnW + 5) + btnW / 2;
            const y = cmdY + row * (btnH + 5) + btnH / 2;

            const btn = this.add.rectangle(x, y, btnW, btnH, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x3498db);
            const txt = this.add.text(x, y, cmd.label, {
                fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            btn.on('pointerover', () => { btn.setFillStyle(0x34495e); txt.setColor('#00d4ff'); });
            btn.on('pointerout', () => { btn.setFillStyle(0x2c3e50); txt.setColor('#fff'); });
            btn.on('pointerdown', cmd.action);
            this.commandContainer.add(btn);
            this.commandContainer.add(txt);
        });

        this._updateBars();
    }

    _onMonsterClick(idx) {
        if (!this._selectingTarget) return;
        if (!this.battle.monsters[idx].alive) return;
        this._selectingTarget = false;
        this.targetPrompt.setVisible(false);
        // Restore monster sprite tints
        this.monsterSprites.forEach(s => s.clearTint());

        if (this._pendingAction === 'attack') {
            this._doAction('attack', idx);
        } else if (this._pendingAction?.startsWith('skill:')) {
            const skillId = this._pendingAction.split(':')[1];
            this._doAction('skill', skillId, idx);
        }
        this._pendingAction = null;
    }

    _requestTarget(actionType, skillId) {
        const alive = this.battle.getAliveMonsters();
        if (alive.length === 1) {
            // Auto-target
            const idx = this.battle.monsters.findIndex(m => m.alive);
            if (actionType === 'attack') this._doAction('attack', idx);
            else this._doAction('skill', skillId, idx);
            return;
        }
        // Show target selection
        this._selectingTarget = true;
        this._pendingAction = actionType === 'attack' ? 'attack' : `skill:${skillId}`;
        this.targetPrompt.setText('選擇攻擊目標（點擊怪物）');
        this.targetPrompt.setVisible(true);
        this.commandContainer.setVisible(false);
        // Highlight alive monsters
        this.monsterSprites.forEach((s, i) => {
            if (this.battle.monsters[i].alive) s.setTint(0xffff88);
        });
    }

    _showSkillMenu() {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.removeAll(true);
        this.subMenuContainer.setVisible(true);
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = this.s;
        const fs = Math.max(13, Math.floor(15 * s));
        const lineH = Math.max(24, Math.floor(28 * s));

        // Scrollable area setup
        const listTop = this._cmdY;
        const listH = this._cmdH - 4;

        // Back button (fixed)
        const backBtn = this.add.text(w - 12, listTop + 2, '← 返回', {
            fontSize: `${fs}px`, fontFamily: 'monospace', color: '#e74c3c',
            backgroundColor: '#1a1a2e', padding: { x: 4, y: 2 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(50);
        backBtn.on('pointerdown', () => {
            this.subMenuContainer.setVisible(false);
            this.commandContainer.setVisible(true);
            if (this._scrollMask) { this._scrollMask.destroy(); this._scrollMask = null; }
            if (this._skillScroll) { this._skillScroll.destroy(); this._skillScroll = null; }
        });
        this.subMenuContainer.add(backBtn);

        // Skill list in a scroll container
        const scrollContainer = this.add.container(0, listTop);
        const maskGfx = this.make.graphics();
        maskGfx.fillRect(0, listTop, w - 80, listH);
        scrollContainer.setMask(maskGfx.createGeometryMask());
        this._scrollMask = maskGfx;
        this._skillScroll = scrollContainer;
        this.subMenuContainer.add(scrollContainer);

        let y = 4;
        this.player.skills.forEach((skId) => {
            const sk = SKILLS[skId];
            if (!sk) return;
            const cd = this.battle.cooldowns[skId] || 0;
            const canUse = this.player.mp >= sk.mpCost && cd === 0;
            const isAoE = sk.effect?.target === 'all';
            const color = canUse ? '#fff' : '#555';
            const aoeTag = isAoE ? ' [全體]' : '';
            const label = `${sk.name} (MP:${sk.mpCost})${cd > 0 ? ` [CD:${cd}]` : ''}${aoeTag}`;

            const bg = this.add.rectangle(w * 0.35, y + lineH / 2, w * 0.7, lineH - 2, 0x1a1a2e, 0.8);
            scrollContainer.add(bg);

            const txt = this.add.text(8, y + 2, label, {
                fontSize: `${fs}px`, fontFamily: 'monospace', color
            });
            scrollContainer.add(txt);

            if (canUse) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerover', () => txt.setColor('#00d4ff'));
                bg.on('pointerout', () => txt.setColor('#fff'));
                bg.on('pointerdown', () => {
                    this.subMenuContainer.setVisible(false);
                    this.commandContainer.setVisible(true);
                    if (this._scrollMask) { this._scrollMask.destroy(); this._scrollMask = null; }
                    if (this._skillScroll) { this._skillScroll.destroy(); this._skillScroll = null; }
                    if (isAoE || sk.effect?.type !== 'damage') {
                        this._doAction('skill', skId);
                    } else {
                        this._requestTarget('skill', skId);
                    }
                });
            }
            y += lineH;
        });

        // Scroll logic
        const totalH = y;
        let scrollY = 0;
        const maxScroll = Math.max(0, totalH - listH);
        this.input.on('wheel', this._skillWheelHandler = (p, g, dx, dy) => {
            if (!this.subMenuContainer.visible) return;
            scrollY = Phaser.Math.Clamp(scrollY + dy * 0.5, 0, maxScroll);
            scrollContainer.y = listTop - scrollY;
        });
    }

    _showItemMenu() {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.removeAll(true);
        this.subMenuContainer.setVisible(true);
        const w = this.cameras.main.width;
        const s = this.s;
        const fs = Math.max(13, Math.floor(15 * s));
        const lineH = Math.max(24, Math.floor(28 * s));
        const listTop = this._cmdY;
        const listH = this._cmdH - 4;

        const backBtn = this.add.text(w - 12, listTop + 2, '← 返回', {
            fontSize: `${fs}px`, fontFamily: 'monospace', color: '#e74c3c',
            backgroundColor: '#1a1a2e', padding: { x: 4, y: 2 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(50);
        backBtn.on('pointerdown', () => {
            this.subMenuContainer.setVisible(false);
            this.commandContainer.setVisible(true);
            if (this._scrollMask) { this._scrollMask.destroy(); this._scrollMask = null; }
            if (this._skillScroll) { this._skillScroll.destroy(); this._skillScroll = null; }
        });
        this.subMenuContainer.add(backBtn);

        const consumables = this.player.inventory.filter(i => i.type === 'consumable');
        if (consumables.length === 0) {
            this.subMenuContainer.add(this.add.text(10, listTop + 6, '沒有可使用的道具', {
                fontSize: `${fs}px`, fontFamily: 'monospace', color: '#666'
            }));
            return;
        }

        const scrollContainer = this.add.container(0, listTop);
        const maskGfx = this.make.graphics();
        maskGfx.fillRect(0, listTop, w - 80, listH);
        scrollContainer.setMask(maskGfx.createGeometryMask());
        this._scrollMask = maskGfx;
        this._skillScroll = scrollContainer;
        this.subMenuContainer.add(scrollContainer);

        let y = 4;
        consumables.forEach((item) => {
            const bg = this.add.rectangle(w * 0.35, y + lineH / 2, w * 0.7, lineH - 2, 0x1a1a2e, 0.8)
                .setInteractive({ useHandCursor: true });
            scrollContainer.add(bg);

            const txt = this.add.text(8, y + 2, `${item.name} x${item.quantity || 1}`, {
                fontSize: `${fs}px`, fontFamily: 'monospace', color: '#fff'
            });
            scrollContainer.add(txt);

            bg.on('pointerover', () => txt.setColor('#2ecc71'));
            bg.on('pointerout', () => txt.setColor('#fff'));
            bg.on('pointerdown', () => {
                this.subMenuContainer.setVisible(false);
                this.commandContainer.setVisible(true);
                if (this._scrollMask) { this._scrollMask.destroy(); this._scrollMask = null; }
                if (this._skillScroll) { this._skillScroll.destroy(); this._skillScroll = null; }
                this._doAction('item', item.id);
            });
            y += lineH;
        });

        const totalH = y;
        let scrollY = 0;
        const maxScroll = Math.max(0, totalH - listH);
        this.input.on('wheel', this._itemWheelHandler = (p, g, dx, dy) => {
            if (!this.subMenuContainer.visible) return;
            scrollY = Phaser.Math.Clamp(scrollY + dy * 0.5, 0, maxScroll);
            scrollContainer.y = listTop - scrollY;
        });
    }

    _doAction(type, param, targetIndex) {
        this.commandContainer.setVisible(false);
        this.subMenuContainer.setVisible(false);
        let result;
        switch (type) {
            case 'attack': result = this.battle.playerAttack(param); break; // param = targetIndex
            case 'skill': result = this.battle.playerSkill(param, targetIndex); break; // param = skillId
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
        this.battle._allMonstersTurn();
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

            // Animate monster death
            if (log.monsterDeath && log.monsterIndex !== undefined) {
                const sprite = this.monsterSprites[log.monsterIndex];
                if (sprite) this.tweens.add({ targets: sprite, alpha: 0, scaleX: 0, scaleY: 0, duration: 400 });
            }

            if (log.damage && log.actor === 'player') {
                this.audio.playSFX(log.critical ? 'magic' : 'attack');
                if (log.critical) this.audio.vibrateCritical();
                if (log.isAoE) {
                    this.monsterSprites.forEach((s, idx) => {
                        if (this.battle.monsters[idx].alive || this.battle.monsters[idx].currentHp <= 0) {
                            this.tweens.add({ targets: s, x: s.x + 6, duration: 30, yoyo: true, repeat: 3 });
                        }
                    });
                } else if (log.targetIndex !== undefined) {
                    const s = this.monsterSprites[log.targetIndex];
                    if (s) this.tweens.add({ targets: s, x: s.x + 8, duration: 40, yoyo: true, repeat: 3 });
                }
            } else if (log.heal) {
                this.audio.playSFX('heal');
            } else if (log.scan) {
                this.audio.playSFX('magic');
            } else if (log.damage && log.actor === 'monster') {
                this.audio.playSFX('hit');
                this.audio.vibrateHit();
                this.tweens.add({ targets: this.playerSprite, x: this.playerSprite.x - 6, duration: 40, yoyo: true, repeat: 3 });
                this.cameras.main.shake(120, 0.003);
            }
            i++;
            this.time.delayedCall(log.scan ? 2000 : log.monsterDeath ? 500 : 700, showNext);
        };
        showNext();
    }

    _updateBars() {
        const p = this.player;
        this.playerHpBar.width = this._pBarFullW * Math.max(0, p.hp / p.maxHp);
        this.playerHpText.setText(`${p.hp}/${p.maxHp}`);
        this.playerMpBar.width = this._pBarFullW * Math.max(0, p.mp / p.maxMp);
        this.playerMpText.setText(`${p.mp}/${p.maxMp}`);

        this.battle.monsters.forEach((m, i) => {
            if (this.monsterHpBars[i]) {
                this.monsterHpBars[i].width = this.monsterHpBarFullW[i] * Math.max(0, m.currentHp / m.hp);
            }
        });
    }

    _endBattle() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = this.s;

        if (this.battle.result === 'win') {
            this.audio.stopBGM();
            this.audio.playBGM('victory');
            this.audio.vibrateLevelUp();

            // Track kills for quest system
            this.battle.killedMonsters.forEach(mId => {
                this.player.recordKill(mId);
                QuestSystem.updateProgress(this.player, 'kill', mId);
            });
            // Check boss kills
            this.monstersData.forEach(m => {
                if (m.isBoss) {
                    this.player.defeatBoss(m.id);
                    QuestSystem.updateProgress(this.player, 'kill_boss', m.id);
                }
            });

            // Auto-complete any finished quests
            [...this.player.activeQuests].forEach(qid => {
                if (QuestSystem.checkCompletion(this.player, qid)) {
                    const rewards = QuestSystem.completeQuest(this.player, qid);
                    if (rewards) {
                        this.battle.log.push({ actor: 'system',
                            text: `任務完成！獲得獎勵：${rewards.exp ? rewards.exp + ' EXP ' : ''}${rewards.gold ? rewards.gold + ' 金幣' : ''}` });
                    }
                }
            });

            const rewards = this.battle.getRewards(this.rankMultiplier);
            const levelUps = this.player.addExp(rewards.exp);
            this.player.addGold(rewards.gold);
            let rewardText = `獲得 ${rewards.exp} EXP, ${rewards.gold} 金幣`;
            rewards.drops.forEach(drop => {
                const item = ITEMS[drop.itemId];
                if (item) {
                    if (item.id === 'diamond') { this.player.addDiamonds(drop.amount); rewardText += `\n鑽石 x${drop.amount}`; }
                    else { for (let n = 0; n < drop.amount; n++) this.player.addItem({ ...item }); rewardText += `\n${item.name} x${drop.amount}`; }
                    this.player.recordItemCollect(drop.itemId);
                    QuestSystem.updateProgress(this.player, 'collect', drop.itemId);
                }
            });
            levelUps.forEach(lu => {
                rewardText += `\n\n等級提升！LV.${lu.level}`;
                lu.newSkills.forEach(skId => { const sk = SKILLS[skId]; if (sk) rewardText += `\n習得：【${sk.name}】`; });
            });

            // Animate remaining monster sprites
            this.monsterSprites.forEach(sp => {
                if (sp.alpha > 0) this.tweens.add({ targets: sp, alpha: 0, scaleX: 0, scaleY: 0, duration: 500 });
            });

            this.time.delayedCall(600, () => {
                const boxW = Math.min(460, w * 0.88);
                const boxH = Math.min(300, h * 0.52);
                this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x0a0a1e, 0.96).setStrokeStyle(2, 0xf1c40f).setDepth(100);
                this.add.text(w / 2, h / 2 - boxH / 2 + 20, '戰 鬥 勝 利', {
                    fontSize: `${Math.max(16, 20 * s)}px`, fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(101);
                this.add.text(w / 2, h / 2, rewardText, {
                    fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#fff',
                    align: 'center', lineSpacing: 2, wordWrap: { width: boxW - 30 }
                }).setOrigin(0.5).setDepth(101);
                const contBtn = this.add.text(w / 2, h / 2 + boxH / 2 - 25, '繼續', {
                    fontSize: `${Math.max(13, 16 * s)}px`, fontFamily: 'monospace', color: '#00d4ff',
                    backgroundColor: '#2c3e50', padding: { x: 20, y: 6 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);
                contBtn.on('pointerdown', () => {
                    // City unlock for boss defeats
                    const hasBoss = this.monstersData.some(m => m.isBoss && !m.isFinalBoss);
                    if (hasBoss) {
                        const cityOrder = ['taipei', 'newTaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung'];
                        const idx = cityOrder.indexOf(this.player.currentCity);
                        if (idx >= 0 && idx < cityOrder.length - 1) this.player.unlockCity(cityOrder[idx + 1]);
                    }

                    if (this.isFinalBoss) {
                        this._promptNameThenDo(() => this._triggerFinalEnding());
                        return;
                    }

                    // Show boss victory + citizen gratitude dialog
                    if (hasBoss) {
                        this._promptNameThenDo(() => this._showBossVictoryDialog());
                        return;
                    }

                    // Return to previous scene
                    if (this.returnScene === 'Dungeon') {
                        this.scene.stop();
                        this.scene.wake('Dungeon');
                    } else {
                        this.scene.start(this.returnScene, this.returnData);
                    }
                });
            });

        } else if (this.battle.result === 'lose') {
            this.audio.stopBGM();
            this.audio.playSFX('defeat');
            this.audio.vibrateDefeat();
            this.tweens.add({ targets: this.playerSprite, alpha: 0, duration: 500 });
            this.time.delayedCall(600, () => {
                const boxW = Math.min(400, w * 0.8);
                this.add.rectangle(w / 2, h / 2, boxW, 150 * s, 0x0a0a1e, 0.96).setStrokeStyle(2, 0xe74c3c).setDepth(100);
                this.add.text(w / 2, h / 2 - 30 * s, '戰 鬥 失 敗', {
                    fontSize: `${Math.max(16, 20 * s)}px`, fontFamily: 'monospace', color: '#e74c3c', fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(101);
                this.add.text(w / 2, h / 2 + 5, 'HP 回復至一半', {
                    fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#fff'
                }).setOrigin(0.5).setDepth(101);
                this.player.hp = Math.floor(this.player.maxHp * 0.5);
                this.player.mp = Math.floor(this.player.maxMp * 0.5);
                const contBtn = this.add.text(w / 2, h / 2 + 40 * s, '返回城市', {
                    fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#e74c3c',
                    backgroundColor: '#2c3e50', padding: { x: 16, y: 6 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);
                contBtn.on('pointerdown', () => {
                    // Stop sleeping dungeon if any
                    if (this.scene.isSleeping('Dungeon')) this.scene.stop('Dungeon');
                    this.scene.start('City', { city: this.player.currentCity });
                });
            });

        } else if (this.battle.result === 'flee') {
            this.time.delayedCall(600, () => {
                if (this.returnScene === 'Dungeon') {
                    this.scene.stop();
                    this.scene.wake('Dungeon');
                } else {
                    this.scene.start(this.returnScene, this.returnData);
                }
            });
        }
    }

    _promptNameThenDo(callback) {
        const modal = document.getElementById('name-modal');
        const input = document.getElementById('player-name-input');
        const submitBtn = document.getElementById('name-submit-btn');
        const skipBtn = document.getElementById('name-skip-btn');

        if (!modal || !input) {
            callback();
            return;
        }

        // Disable Phaser input so HTML modal can receive clicks/touches
        this.input.enabled = false;
        const canvas = this.game.canvas;
        if (canvas) canvas.style.pointerEvents = 'none';

        // Pre-fill saved name
        const savedName = SaveSystem.getSavedPlayerName();
        input.value = savedName;
        modal.style.display = 'flex';

        // Delay focus to ensure modal is visible
        setTimeout(() => input.focus(), 100);

        const cleanup = () => {
            modal.style.display = 'none';
            // Restore Phaser input
            this.input.enabled = true;
            if (canvas) canvas.style.pointerEvents = 'auto';
            submitBtn.removeEventListener('click', onSubmit);
            skipBtn.removeEventListener('click', onSkip);
            submitBtn.removeEventListener('touchend', onSubmit);
            skipBtn.removeEventListener('touchend', onSkip);
            input.removeEventListener('keydown', onEnter);
        };

        const onSubmit = (e) => {
            if (e) e.preventDefault();
            const name = (input.value || '').trim().substring(0, 12) || '匿名覺醒者';
            SaveSystem.savePlayerName(name);
            this.player.name = name;

            const citiesCleared = (this.player.bossesDefeated || []).length;
            SaveSystem.pushGlobal(name, this.player.level, citiesCleared);
            SaveSystem.addLeaderboardEntry(this.player);

            cleanup();
            callback();
        };

        const onSkip = (e) => {
            if (e) e.preventDefault();
            const citiesCleared = (this.player.bossesDefeated || []).length;
            SaveSystem.addLeaderboardEntry(this.player);
            cleanup();
            callback();
        };

        const onEnter = (e) => {
            if (e.key === 'Enter') onSubmit(e);
        };

        // Support both click (desktop) and touchend (mobile)
        submitBtn.addEventListener('click', onSubmit);
        skipBtn.addEventListener('click', onSkip);
        submitBtn.addEventListener('touchend', onSubmit);
        skipBtn.addEventListener('touchend', onSkip);
        input.addEventListener('keydown', onEnter);
    }

    _showBossVictoryDialog() {
        const cityMap = {
            taipei: 'bossVictory_taipei', newTaipei: 'bossVictory_newTaipei',
            taoyuan: 'bossVictory_taoyuan', taichung: 'bossVictory_taichung',
            tainan: 'bossVictory_tainan', kaohsiung: 'bossVictory_kaohsiung',
        };
        const currentCity = this.player.currentCity;
        const victoryKey = cityMap[currentCity];
        const dialogs = victoryKey ? STORY[victoryKey] : null;

        if (dialogs && dialogs.length > 0) {
            this.scene.start('Dialog', {
                dialogs: dialogs,
                onComplete: () => {
                    this.scene.start('City', { city: currentCity });
                }
            });
        } else {
            this.scene.start('City', { city: currentCity });
        }
    }

    _triggerFinalEnding() {
        const victoryDialogs = STORY.finalBossVictory || [];
        const endingDialogs = STORY.finalEnding || [];
        const allDialogs = [...victoryDialogs, ...endingDialogs];

        this.scene.start('Dialog', {
            dialogs: allDialogs,
            onComplete: () => {
                this.scene.start('Title');
            }
        });
    }
}
