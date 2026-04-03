// Menu scene - responsive inventory, status, equipment, quests
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
        this.s = Math.min(w / 800, h / 600);

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Tabs
        const tabs = ['status', 'inventory', 'equipment', 'skills', 'quest'];
        const tabLabels = ['狀態', '背包', '裝備', '技能', '任務'];
        const tabW = Math.min(90, (w - 10) / tabs.length - 2);

        tabs.forEach((tab, i) => {
            const x = 5 + i * (tabW + 2) + tabW / 2;
            const isActive = tab === this.activeTab;
            const btn = this.add.rectangle(x, 18, tabW, 32 * this.s, isActive ? 0x1a1a2e : 0x0a0a1a)
                .setStrokeStyle(1, isActive ? 0x00d4ff : 0x333333)
                .setInteractive({ useHandCursor: true });
            this.add.text(x, 18, tabLabels[i], {
                fontSize: `${Math.max(16, 18 * this.s)}px`, fontFamily: 'monospace',
                color: isActive ? '#00d4ff' : '#7f8c8d',
            }).setOrigin(0.5);
            btn.on('pointerdown', () => {
                this.audio.playSFX('click');
                this.scene.restart({ tab, city: this.cityKey });
            });
        });

        this.contentY = 42;
        this.contentW = w - 16;

        switch (this.activeTab) {
            case 'status': this._showStatus(); break;
            case 'inventory': this._showInventory(); break;
            case 'equipment': this._showEquipment(); break;
            case 'skills': this._showSkills(); break;
            case 'quest': this._showQuests(); break;
        }

        // Back
        this.add.text(w / 2, h - 20, '← 返回城市', {
            fontSize: `${Math.max(18, 20 * this.s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));
    }

    _showStatus() {
        const p = this.player;
        const s = this.s;
        const y = this.contentY;
        const fs = Math.max(16, Math.floor(18 * s));

        this.add.text(10, y, p.name, {
            fontSize: `${Math.max(22, 28 * s)}px`, fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold'
        });

        const lines = [
            `等級: LV.${p.level}    EXP: ${p.exp}/${p.expToNext}`,
            `HP: ${p.hp}/${p.maxHp}    MP: ${p.mp}/${p.maxMp}`,
            `ATK: ${p.atk} (基礎${p.baseAtk})  DEF: ${p.def} (基礎${p.baseDef})`,
            `SPD: ${p.spd} (基礎${p.baseSpd})`,
            `金幣: ${p.gold}    鑽石: ${p.diamonds}`,
            `淨化城市: ${p.bossesDefeated.length}/6`,
        ];
        lines.forEach((line, i) => {
            this.add.text(10, y + 32 + i * (fs + 12), line, {
                fontSize: `${fs}px`, fontFamily: 'monospace', color: '#bdc3c7',
                wordWrap: { width: this.contentW }
            });
        });
    }

    _showInventory() {
        const items = this.player.inventory;
        const s = this.s;
        const fs = Math.max(16, Math.floor(18 * s));
        const rowH = Math.max(36, 42 * s);
        const w = this.cameras.main.width;

        if (items.length === 0) {
            this.add.text(w / 2, 200, '背包空空如也', {
                fontSize: `${Math.max(16, 20 * s)}px`, fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5);
            return;
        }

        const maxVisible = Math.floor((this.cameras.main.height - this.contentY - 40) / rowH);
        items.slice(0, maxVisible).forEach((item, i) => {
            const y = this.contentY + i * rowH;
            const typeColors = { weapon: '#e74c3c', armor: '#3498db', accessory: '#9b59b6', consumable: '#2ecc71', material: '#f39c12' };
            const typeLabels = { weapon: '武', armor: '防', accessory: '飾', consumable: '消', material: '材' };

            this.add.text(8, y, `[${typeLabels[item.type] || '?'}]`, {
                fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: typeColors[item.type] || '#fff'
            });
            this.add.text(30, y, `${item.name}${(item.quantity || 1) > 1 ? ` x${item.quantity}` : ''}`, {
                fontSize: `${fs}px`, fontFamily: 'monospace', color: '#fff'
            });

            if (['weapon', 'armor', 'accessory'].includes(item.type)) {
                const isEq = this.player.equipment[item.type] === item.id;
                const eqBtn = this.add.text(w - 10, y + 2, isEq ? '已裝備' : '裝備', {
                    fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace',
                    color: isEq ? '#555' : '#f1c40f',
                }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
                eqBtn.on('pointerdown', () => {
                    if (isEq) this.player.unequip(item.type);
                    else this.player.equip(item.id);
                    this.audio.playSFX('click');
                    this.scene.restart({ tab: 'inventory', city: this.cityKey });
                });
            }
        });
    }

    _showEquipment() {
        const s = this.s;
        const slots = ['weapon', 'armor', 'accessory'];
        const slotLabels = { weapon: '武器', armor: '防具', accessory: '飾品' };

        slots.forEach((slot, i) => {
            const y = this.contentY + i * 70 * s;
            this.add.text(10, y, `【${slotLabels[slot]}】`, {
                fontSize: `${Math.max(18, 20 * s)}px`, fontFamily: 'monospace', color: '#3498db'
            });
            const equipped = this.player.getEquipped(slot);
            if (equipped) {
                this.add.text(20, y + 22 * s, equipped.name, {
                    fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#fff'
                });
                let stats = '';
                if (equipped.atk) stats += `ATK+${equipped.atk} `;
                if (equipped.def) stats += `DEF+${equipped.def} `;
                if (equipped.hp) stats += `HP+${equipped.hp} `;
                if (equipped.mp) stats += `MP+${equipped.mp} `;
                if (equipped.spd) stats += `SPD+${equipped.spd} `;
                if (stats) this.add.text(20, y + 40 * s, stats, {
                    fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#2ecc71'
                });
            } else {
                this.add.text(20, y + 22 * s, '（未裝備）', {
                    fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#555'
                });
            }
        });
    }

    _showSkills() {
        const s = this.s;
        const rowH = Math.max(34, 42 * s);
        const maxVisible = Math.floor((this.cameras.main.height - this.contentY - 40) / rowH);

        this.player.skills.slice(0, maxVisible).forEach((skId, i) => {
            const sk = SKILLS[skId];
            if (!sk) return;
            const y = this.contentY + i * rowH;
            this.add.text(10, y, sk.name, {
                fontSize: `${Math.max(16, 18 * s)}px`, fontFamily: 'monospace', color: '#9b59b6', fontStyle: 'bold'
            });
            this.add.text(10, y + 16 * s, `MP:${sk.mpCost} CD:${sk.cooldown || 0} — ${sk.desc}`, {
                fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#7f8c8d',
                wordWrap: { width: this.contentW }
            });
        });
    }

    _showQuests() {
        const s = this.s;
        const w = this.cameras.main.width;
        let cy = this.contentY;

        // Active
        this.add.text(10, cy, '進行中', {
            fontSize: `${Math.max(17, 19 * s)}px`, fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
        });
        cy += 22 * s;

        if (this.player.activeQuests.length === 0) {
            this.add.text(14, cy, '沒有進行中的任務', {
                fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#555'
            });
            cy += 20 * s;
        }
        this.player.activeQuests.forEach(qid => {
            const quest = QUESTS[qid];
            if (!quest) return;
            this.add.text(14, cy, quest.name, {
                fontSize: `${Math.max(15, 17 * s)}px`, fontFamily: 'monospace', color: '#fff'
            });
            cy += 16 * s;
            quest.objectives.forEach((obj, i) => {
                const progress = this.player.questProgress[qid]?.[i] || 0;
                const done = progress >= obj.count;
                this.add.text(20, cy, `${obj.type === 'kill' ? '討伐' : '收集'} ${obj.target}: ${progress}/${obj.count}`, {
                    fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: done ? '#2ecc71' : '#7f8c8d'
                });
                cy += 14 * s;
            });
            cy += 10 * s;
        });

        // Available
        cy += 10 * s;
        this.add.text(10, cy, '可接受', {
            fontSize: `${Math.max(17, 19 * s)}px`, fontFamily: 'monospace', color: '#3498db', fontStyle: 'bold'
        });
        cy += 22 * s;

        QuestSystem.getAvailableQuests(this.player, this.cityKey).forEach(quest => {
            if (cy > this.cameras.main.height - 50) return;
            this.add.text(14, cy, quest.name, {
                fontSize: `${Math.max(15, 17 * s)}px`, fontFamily: 'monospace', color: '#fff'
            });
            const acceptBtn = this.add.text(w - 10, cy, '接受', {
                fontSize: `${Math.max(14, 16 * s)}px`, fontFamily: 'monospace', color: '#2ecc71',
                backgroundColor: '#2c3e50', padding: { x: 6, y: 2 }
            }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
            acceptBtn.on('pointerdown', () => {
                QuestSystem.acceptQuest(this.player, quest.id);
                this.audio.playSFX('click');
                this.scene.restart({ tab: 'quest', city: this.cityKey });
            });
            cy += 14 * s;
            this.add.text(14, cy, quest.desc, {
                fontSize: `${Math.max(13, 15 * s)}px`, fontFamily: 'monospace', color: '#7f8c8d',
                wordWrap: { width: this.contentW - 80 }
            });
            cy += 24 * s;
        });
    }
}
