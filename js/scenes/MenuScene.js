// Menu scene - responsive inventory, status, equipment, quests with proper text layout
import { SKILLS } from '../data/skills.js';
import { QUESTS } from '../data/quests.js';
import { QuestSystem } from '../systems/QuestSystem.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    init(data) {
        this.activeTab = data?.tab || 'status';
        this.cityKey = data?.city || 'taipei';
    }

    create() {
        this.player = this.registry.get('player');
        this.audio = this.registry.get('audio');
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.w = w;
        this.h = h;
        this.s = Math.min(w / 800, h / 600);

        // Responsive font sizes (guaranteed minimums to prevent overlap)
        this.fontSize = {
            title: Math.max(20, Math.floor(26 * this.s)),
            heading: Math.max(17, Math.floor(20 * this.s)),
            body: Math.max(14, Math.floor(16 * this.s)),
            small: Math.max(12, Math.floor(14 * this.s)),
            tiny: Math.max(11, Math.floor(12 * this.s)),
        };

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // === Tab bar ===
        this._createTabs(w);

        // === Content area with scroll ===
        const tabBarH = 40;
        const footerH = 44;
        this.contentTop = tabBarH + 4;
        this.contentH = h - tabBarH - footerH - 8;
        this.contentW = w - 20;

        // Scroll container
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.contentZone = this.add.container(10, this.contentTop);
        // Mask for scroll area
        const maskShape = this.make.graphics();
        maskShape.fillRect(0, this.contentTop, w, this.contentH);
        this.contentZone.setMask(maskShape.createGeometryMask());

        // Build tab content
        switch (this.activeTab) {
            case 'status': this._showStatus(); break;
            case 'inventory': this._showInventory(); break;
            case 'equipment': this._showEquipment(); break;
            case 'skills': this._showSkills(); break;
            case 'quest': this._showQuests(); break;
        }

        // Scroll input
        this.input.on('wheel', (pointer, gos, dx, dy) => {
            this._scrollContent(dy * 0.5);
        });
        this._dragStartY = null;
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > this.contentTop && pointer.y < this.contentTop + this.contentH) {
                this._dragStartY = pointer.y;
                this._dragScrollStart = this.scrollY;
            }
        });
        this.input.on('pointermove', (pointer) => {
            if (this._dragStartY !== null && pointer.isDown) {
                const delta = this._dragStartY - pointer.y;
                this.scrollY = Phaser.Math.Clamp(this._dragScrollStart + delta, 0, this.maxScrollY);
                this.contentZone.y = this.contentTop - this.scrollY;
            }
        });
        this.input.on('pointerup', () => { this._dragStartY = null; });

        // === Footer - back button ===
        const footerY = h - footerH / 2;
        const backBg = this.add.rectangle(w / 2, footerY, w - 20, footerH - 8, 0x2c1a1a, 0.8)
            .setStrokeStyle(1, 0x553333).setInteractive({ useHandCursor: true });
        const backTxt = this.add.text(w / 2, footerY, '← 返回城市', {
            fontSize: `${this.fontSize.body}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5);
        backBg.on('pointerover', () => backTxt.setColor('#ff6b6b'));
        backBg.on('pointerout', () => backTxt.setColor('#e74c3c'));
        backBg.on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));
    }

    _scrollContent(delta) {
        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, this.maxScrollY);
        this.contentZone.y = this.contentTop - this.scrollY;
    }

    _setMaxScroll(totalContentH) {
        this.maxScrollY = Math.max(0, totalContentH - this.contentH);
    }

    // === TABS ===
    _createTabs(w) {
        const tabs = ['status', 'inventory', 'equipment', 'skills', 'quest'];
        const tabLabels = ['狀態', '背包', '裝備', '技能', '任務'];
        const tabIcons = ['📊', '📦', '🛡️', '⚡', '📜'];
        const gap = 3;
        const tabW = Math.min(100, (w - gap * (tabs.length + 1)) / tabs.length);
        const tabH = 34;

        tabs.forEach((tab, i) => {
            const x = gap + i * (tabW + gap) + tabW / 2;
            const y = tabH / 2 + 3;
            const isActive = tab === this.activeTab;

            const bg = this.add.rectangle(x, y, tabW, tabH, isActive ? 0x1a1a3e : 0x0d0d1a)
                .setStrokeStyle(isActive ? 2 : 1, isActive ? 0x00d4ff : 0x222244)
                .setInteractive({ useHandCursor: true });
            this.add.text(x, y, `${tabIcons[i]} ${tabLabels[i]}`, {
                fontSize: `${this.fontSize.small}px`, fontFamily: 'monospace',
                color: isActive ? '#00d4ff' : '#6a6a8e',
            }).setOrigin(0.5);
            bg.on('pointerdown', () => {
                this.audio.playSFX('click');
                this.scene.restart({ tab, city: this.cityKey });
            });
        });
    }

    // === STATUS ===
    _showStatus() {
        const p = this.player;
        const fs = this.fontSize;
        let y = 0;
        const lineGap = 6;

        // Player name + level
        this._addText(0, y, `${p.name}`, fs.title, '#00d4ff', 'bold');
        y += fs.title + 4;
        this._addText(0, y, `覺醒等級 LV.${p.level}`, fs.body, '#7f8c8d');
        y += fs.body + lineGap + 8;

        // EXP bar visual
        const expRatio = p.exp / p.expToNext;
        const barW = this.contentW;
        const barH = 14;
        this.contentZone.add(this.add.rectangle(barW / 2, y + barH / 2, barW, barH, 0x1a1a2e).setStrokeStyle(1, 0x333355));
        this.contentZone.add(this.add.rectangle(0, y + barH / 2, barW * expRatio, barH, 0x9b59b6).setOrigin(0, 0.5));
        this._addText(barW / 2, y + barH / 2, `EXP  ${p.exp} / ${p.expToNext}`, fs.tiny, '#fff', 'normal', 0.5);
        y += barH + lineGap + 6;

        // Separator
        y = this._addSeparator(y, '生命狀態');

        // HP bar
        y = this._addStatBar(y, 'HP', p.hp, p.maxHp, 0x2ecc71);
        y += 4;
        // MP bar
        y = this._addStatBar(y, 'MP', p.mp, p.maxMp, 0x3498db);
        y += lineGap + 6;

        // Separator
        y = this._addSeparator(y, '戰鬥屬性');

        // Stats in 2-column grid
        const col1X = 0;
        const col2X = this.contentW * 0.5;
        const statRowH = fs.body + lineGap + 4;

        const stats = [
            [`⚔️ ATK  ${p.atk}`, `基礎 ${p.baseAtk}`],
            [`🛡️ DEF  ${p.def}`, `基礎 ${p.baseDef}`],
            [`💨 SPD  ${p.spd}`, `基礎 ${p.baseSpd}`],
        ];
        stats.forEach(([main, sub]) => {
            this._addText(col1X, y, main, fs.body, '#ecf0f1');
            this._addText(col2X, y, sub, fs.small, '#555');
            y += statRowH;
        });
        y += 6;

        // Separator
        y = this._addSeparator(y, '資產');

        this._addText(col1X, y, `💰 金幣    ${p.gold.toLocaleString()}`, fs.body, '#f1c40f');
        y += statRowH;
        this._addText(col1X, y, `💎 鑽石    ${p.diamonds.toLocaleString()}`, fs.body, '#00d4ff');
        y += statRowH + 6;

        // Progress
        y = this._addSeparator(y, '冒險進度');
        this._addText(col1X, y, `🏙️ 已淨化城市  ${p.bossesDefeated.length} / 6`, fs.body, '#2ecc71');
        y += statRowH;

        this._setMaxScroll(y);
    }

    // === INVENTORY ===
    _showInventory() {
        const items = this.player.inventory;
        const fs = this.fontSize;
        let y = 0;

        if (items.length === 0) {
            this._addText(this.contentW / 2, this.contentH * 0.3, '背包空空如也', fs.heading, '#444', 'normal', 0.5);
            return;
        }

        const typeColors = { weapon: '#e74c3c', armor: '#3498db', accessory: '#9b59b6', consumable: '#2ecc71', material: '#f39c12' };
        const typeLabels = { weapon: '武器', armor: '防具', accessory: '飾品', consumable: '消耗', material: '素材' };

        items.forEach((item, i) => {
            const cardH = fs.body + fs.small + 24;
            const cardY = y;

            // Card background
            const card = this.add.rectangle(this.contentW / 2, cardY + cardH / 2, this.contentW, cardH, 0x12122a, 0.9)
                .setStrokeStyle(1, 0x222244);
            this.contentZone.add(card);

            // Type badge
            const typeColor = typeColors[item.type] || '#666';
            const typeLabel = typeLabels[item.type] || '?';
            const badge = this.add.rectangle(28, cardY + cardH / 2, 44, 20, Phaser.Display.Color.HexStringToColor(typeColor).color, 0.25)
                .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(typeColor).color);
            this.contentZone.add(badge);
            this._addText(28, cardY + cardH / 2, typeLabel, fs.tiny, typeColor, 'bold', 0.5);

            // Item name + quantity
            const qtyStr = (item.quantity || 1) > 1 ? ` x${item.quantity}` : '';
            this._addText(56, cardY + 8, `${item.name}${qtyStr}`, fs.body, '#ecf0f1');

            // Stats line
            let statsStr = '';
            if (item.atk) statsStr += `ATK+${item.atk} `;
            if (item.def) statsStr += `DEF+${item.def} `;
            if (item.hp) statsStr += `HP+${item.hp} `;
            if (item.mp) statsStr += `MP+${item.mp} `;
            if (item.spd) statsStr += `SPD+${item.spd} `;
            if (item.desc && !statsStr) statsStr = item.desc;
            if (statsStr) {
                this._addText(56, cardY + 8 + fs.body + 4, statsStr, fs.tiny, '#7f8c8d');
            }

            // Equip button for equipable items
            if (['weapon', 'armor', 'accessory'].includes(item.type)) {
                const isEq = this.player.equipment[item.type] === item.id;
                const btnX = this.contentW - 40;
                const btnY = cardY + cardH / 2;
                const btnColor = isEq ? 0x1a3a1a : 0x2c3e50;
                const txtColor = isEq ? '#2ecc71' : '#f1c40f';
                const label = isEq ? '已裝備' : '裝備';

                const eqBg = this.add.rectangle(btnX, btnY, 56, 24, btnColor)
                    .setStrokeStyle(1, isEq ? 0x2ecc71 : 0xf1c40f);
                this.contentZone.add(eqBg);
                const eqTxt = this._addText(btnX, btnY, label, fs.tiny, txtColor, 'bold', 0.5);

                if (!isEq) {
                    eqBg.setInteractive({ useHandCursor: true });
                    eqBg.on('pointerdown', () => {
                        this.player.equip(item.id);
                        this.audio.playSFX('click');
                        this.scene.restart({ tab: 'inventory', city: this.cityKey });
                    });
                }
            }

            y += cardH + 4;
        });

        this._setMaxScroll(y);
    }

    // === EQUIPMENT ===
    _showEquipment() {
        const fs = this.fontSize;
        const slots = ['weapon', 'armor', 'accessory'];
        const slotLabels = { weapon: '⚔️ 武器', armor: '🛡️ 防具', accessory: '💍 飾品' };
        let y = 0;

        slots.forEach((slot) => {
            const cardH = fs.heading + fs.body + fs.small + 36;

            // Card bg
            const card = this.add.rectangle(this.contentW / 2, y + cardH / 2, this.contentW, cardH, 0x12122a, 0.9)
                .setStrokeStyle(1, 0x222244);
            this.contentZone.add(card);

            // Slot label
            this._addText(12, y + 10, slotLabels[slot], fs.heading, '#3498db', 'bold');

            const equipped = this.player.getEquipped(slot);
            if (equipped) {
                // Item name
                this._addText(16, y + 10 + fs.heading + 8, equipped.name, fs.body, '#ecf0f1', 'bold');

                // Stats
                let stats = '';
                if (equipped.atk) stats += `ATK+${equipped.atk}  `;
                if (equipped.def) stats += `DEF+${equipped.def}  `;
                if (equipped.hp) stats += `HP+${equipped.hp}  `;
                if (equipped.mp) stats += `MP+${equipped.mp}  `;
                if (equipped.spd) stats += `SPD+${equipped.spd}  `;
                if (stats) {
                    this._addText(16, y + 10 + fs.heading + 8 + fs.body + 6, stats.trim(), fs.small, '#2ecc71');
                }

                // Unequip button
                const btnX = this.contentW - 40;
                const btnY = y + cardH / 2;
                const ubg = this.add.rectangle(btnX, btnY, 56, 24, 0x3e2020)
                    .setStrokeStyle(1, 0x553333).setInteractive({ useHandCursor: true });
                this.contentZone.add(ubg);
                this._addText(btnX, btnY, '卸下', fs.tiny, '#e74c3c', 'bold', 0.5);
                ubg.on('pointerdown', () => {
                    this.player.unequip(slot);
                    this.audio.playSFX('click');
                    this.scene.restart({ tab: 'equipment', city: this.cityKey });
                });
            } else {
                this._addText(16, y + 10 + fs.heading + 12, '（未裝備）', fs.body, '#444');
            }

            y += cardH + 6;
        });

        this._setMaxScroll(y);
    }

    // === SKILLS ===
    _showSkills() {
        const fs = this.fontSize;
        let y = 0;

        if (this.player.skills.length === 0) {
            this._addText(this.contentW / 2, this.contentH * 0.3, '尚未習得任何技能', fs.heading, '#444', 'normal', 0.5);
            return;
        }

        this.player.skills.forEach((skId) => {
            const sk = SKILLS[skId];
            if (!sk) return;

            const cardH = fs.body + fs.small + fs.tiny + 30;

            // Card bg
            const card = this.add.rectangle(this.contentW / 2, y + cardH / 2, this.contentW, cardH, 0x12122a, 0.9)
                .setStrokeStyle(1, 0x222244);
            this.contentZone.add(card);

            // Skill name
            this._addText(12, y + 8, sk.name, fs.body, '#9b59b6', 'bold');

            // MP cost + cooldown (right side)
            const infoStr = `MP: ${sk.mpCost}    CD: ${sk.cooldown || 0}`;
            this._addText(this.contentW - 8, y + 8, infoStr, fs.small, '#f39c12', 'normal', 1);

            // Description
            const descText = this.add.text(12, y + 8 + fs.body + 6, sk.desc || '', {
                fontSize: `${fs.small}px`, fontFamily: 'monospace', color: '#7f8c8d',
                wordWrap: { width: this.contentW - 24 }
            });
            this.contentZone.add(descText);

            // Damage / effect info
            let effectStr = '';
            if (sk.power) effectStr += `威力: ${sk.power}  `;
            if (sk.hits) effectStr += `連擊: ${sk.hits}  `;
            if (sk.heal) effectStr += `回復: ${sk.heal}%  `;
            if (effectStr) {
                this._addText(12, y + 8 + fs.body + 6 + fs.small + 4, effectStr.trim(), fs.tiny, '#2ecc71');
            }

            y += cardH + 4;
        });

        this._setMaxScroll(y);
    }

    // === QUESTS ===
    _showQuests() {
        const fs = this.fontSize;
        let y = 0;

        // Active quests section
        y = this._addSeparator(y, '📋 進行中任務');

        if (this.player.activeQuests.length === 0) {
            this._addText(12, y, '目前沒有進行中的任務', fs.body, '#444');
            y += fs.body + 12;
        }

        this.player.activeQuests.forEach(qid => {
            const quest = QUESTS[qid];
            if (!quest) return;

            // Calculate card height based on objectives
            const objCount = quest.objectives.length;
            const cardH = fs.body + (objCount * (fs.small + 8)) + 24;

            const card = this.add.rectangle(this.contentW / 2, y + cardH / 2, this.contentW, cardH, 0x1a1a2e, 0.9)
                .setStrokeStyle(1, 0xf1c40f, 0.3);
            this.contentZone.add(card);

            // Quest name
            this._addText(12, y + 8, quest.name, fs.body, '#f1c40f', 'bold');

            // Objectives
            let oy = y + 8 + fs.body + 8;
            quest.objectives.forEach((obj, i) => {
                const progress = this.player.questProgress[qid]?.[i] || 0;
                const done = progress >= obj.count;
                const icon = done ? '✅' : '⬜';
                const actionLabel = obj.type === 'kill' ? '討伐' : '收集';
                this._addText(20, oy, `${icon} ${actionLabel} ${obj.target}: ${progress}/${obj.count}`, fs.small, done ? '#2ecc71' : '#999');
                oy += fs.small + 8;
            });

            y += cardH + 6;
        });

        y += 8;

        // Available quests section
        y = this._addSeparator(y, '📌 可接受任務');

        const available = QuestSystem.getAvailableQuests(this.player, this.cityKey);
        if (available.length === 0) {
            this._addText(12, y, '目前沒有可接受的任務', fs.body, '#444');
            y += fs.body + 12;
        }

        available.forEach(quest => {
            const cardH = fs.body + fs.small + 32;

            const card = this.add.rectangle(this.contentW / 2, y + cardH / 2, this.contentW, cardH, 0x12122a, 0.9)
                .setStrokeStyle(1, 0x222244);
            this.contentZone.add(card);

            // Quest name
            this._addText(12, y + 8, quest.name, fs.body, '#ecf0f1', 'bold');

            // Description
            const descText = this.add.text(12, y + 8 + fs.body + 6, quest.desc || '', {
                fontSize: `${fs.small}px`, fontFamily: 'monospace', color: '#7f8c8d',
                wordWrap: { width: this.contentW - 90 }
            });
            this.contentZone.add(descText);

            // Accept button
            const btnX = this.contentW - 36;
            const btnY = y + cardH / 2;
            const abg = this.add.rectangle(btnX, btnY, 56, 26, 0x1a3a1a)
                .setStrokeStyle(1, 0x2ecc71).setInteractive({ useHandCursor: true });
            this.contentZone.add(abg);
            this._addText(btnX, btnY, '接受', fs.tiny, '#2ecc71', 'bold', 0.5);
            abg.on('pointerdown', () => {
                QuestSystem.acceptQuest(this.player, quest.id);
                this.audio.playSFX('click');
                this.scene.restart({ tab: 'quest', city: this.cityKey });
            });

            y += cardH + 4;
        });

        this._setMaxScroll(y);
    }

    // === HELPER METHODS ===

    _addText(x, y, text, fontSize, color, style = 'normal', originX = 0) {
        const t = this.add.text(x, y, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'monospace',
            color: color,
            fontStyle: style,
        });
        if (originX === 0.5) t.setOrigin(0.5, 0.5);
        else if (originX === 1) t.setOrigin(1, 0);
        this.contentZone.add(t);
        return t;
    }

    _addSeparator(y, label) {
        const fs = this.fontSize;
        const lineY = y + fs.small + 6;

        // Left line
        const lineL = this.add.rectangle(0, lineY, 8, 1, 0x333355).setOrigin(0, 0.5);
        this.contentZone.add(lineL);

        // Label
        const labelText = this.add.text(14, lineY, label, {
            fontSize: `${fs.small}px`, fontFamily: 'monospace', color: '#5a5a8e', fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.contentZone.add(labelText);

        // Right line
        const labelW = labelText.width;
        const lineR = this.add.rectangle(20 + labelW, lineY, this.contentW - 24 - labelW, 1, 0x333355).setOrigin(0, 0.5);
        this.contentZone.add(lineR);

        return y + fs.small + 16;
    }

    _addStatBar(y, label, current, max, color) {
        const fs = this.fontSize;
        const barH = 16;
        const barW = this.contentW;
        const ratio = Math.max(0, current / max);

        // Background
        const bg = this.add.rectangle(barW / 2, y + barH / 2, barW, barH, 0x1a1a2e).setStrokeStyle(1, 0x333355);
        this.contentZone.add(bg);

        // Fill
        const fill = this.add.rectangle(0, y + barH / 2, barW * ratio, barH, color, 0.8).setOrigin(0, 0.5);
        this.contentZone.add(fill);

        // Text
        this._addText(barW / 2, y + barH / 2, `${label}  ${current} / ${max}`, fs.tiny, '#fff', 'bold', 0.5);

        return y + barH + 4;
    }
}
