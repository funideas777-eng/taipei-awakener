// Menu scene - inventory, status, equipment, quests
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
        const { width, height } = this.cameras.main;
        this.player = this.registry.get('player');
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Tab buttons
        const tabs = ['status', 'inventory', 'equipment', 'skills', 'quest'];
        const tabLabels = ['狀態', '背包', '裝備', '技能', '任務'];

        tabs.forEach((tab, i) => {
            const x = 20 + i * 100;
            const isActive = tab === this.activeTab;
            const btn = this.add.text(x, 10, tabLabels[i], {
                fontSize: '14px', fontFamily: 'monospace',
                color: isActive ? '#00d4ff' : '#7f8c8d',
                backgroundColor: isActive ? '#1a1a2e' : '#0a0a1a',
                padding: { x: 10, y: 6 },
            }).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                this.activeTab = tab;
                this.scene.restart({ tab, city: this.cityKey });
            });
        });

        // Content area
        this.contentY = 50;

        switch (this.activeTab) {
            case 'status': this._showStatus(); break;
            case 'inventory': this._showInventory(); break;
            case 'equipment': this._showEquipment(); break;
            case 'skills': this._showSkills(); break;
            case 'quest': this._showQuests(); break;
        }

        // Back button
        this.add.text(width / 2, height - 20, '← 返回城市', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));
    }

    _showStatus() {
        const p = this.player;
        const y = this.contentY;
        const style = { fontSize: '14px', fontFamily: 'monospace', color: '#fff', lineSpacing: 8 };

        this.add.text(40, y, `${p.name}`, { fontSize: '20px', fontFamily: 'monospace', color: '#00d4ff', fontStyle: 'bold' });
        this.add.text(40, y + 35, [
            `等級: LV.${p.level}`,
            `經驗: ${p.exp} / ${p.expToNext}`,
            ``,
            `HP: ${p.hp} / ${p.maxHp}`,
            `MP: ${p.mp} / ${p.maxMp}`,
            ``,
            `攻擊力 (ATK): ${p.atk}  (基礎 ${p.baseAtk})`,
            `防禦力 (DEF): ${p.def}  (基礎 ${p.baseDef})`,
            `速度 (SPD): ${p.spd}  (基礎 ${p.baseSpd})`,
            ``,
            `金幣: ${p.gold}`,
            `鑽石: ${p.diamonds}`,
            ``,
            `已淨化城市: ${p.bossesDefeated.length} / 6`,
            `已解鎖城市: ${p.citiesUnlocked.join(', ')}`,
        ].join('\n'), style);

        // Player sprite preview
        this.add.image(650, y + 80, 'player-sheet', 1).setScale(4);
    }

    _showInventory() {
        const items = this.player.inventory;
        const y = this.contentY;

        if (items.length === 0) {
            this.add.text(400, 250, '背包空空如也', { fontSize: '16px', fontFamily: 'monospace', color: '#666' }).setOrigin(0.5);
            return;
        }

        items.forEach((item, i) => {
            const iy = y + i * 35;
            if (iy > 530) return;

            const typeColors = { weapon: '#e74c3c', armor: '#3498db', accessory: '#9b59b6', consumable: '#2ecc71', material: '#f39c12' };
            const typeLabels = { weapon: '武器', armor: '防具', accessory: '飾品', consumable: '消耗', material: '材料' };

            this.add.text(30, iy, `[${typeLabels[item.type] || item.type}]`, {
                fontSize: '11px', fontFamily: 'monospace', color: typeColors[item.type] || '#fff'
            });
            this.add.text(90, iy, `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`, {
                fontSize: '13px', fontFamily: 'monospace', color: '#fff'
            });

            let stats = '';
            if (item.atk) stats += `ATK+${item.atk} `;
            if (item.def) stats += `DEF+${item.def} `;
            if (item.hp) stats += `HP+${item.hp} `;
            if (item.mp) stats += `MP+${item.mp} `;
            if (item.spd) stats += `SPD+${item.spd} `;
            if (stats) {
                this.add.text(400, iy, stats, { fontSize: '11px', fontFamily: 'monospace', color: '#2ecc71' });
            }

            // Equip button for equipment
            if (['weapon', 'armor', 'accessory'].includes(item.type)) {
                const isEquipped = this.player.equipment[item.type] === item.id;
                const eqBtn = this.add.text(700, iy, isEquipped ? '已裝備' : '裝備', {
                    fontSize: '12px', fontFamily: 'monospace',
                    color: isEquipped ? '#7f8c8d' : '#f1c40f',
                }).setInteractive({ useHandCursor: true });
                eqBtn.on('pointerdown', () => {
                    if (isEquipped) {
                        this.player.unequip(item.type);
                    } else {
                        this.player.equip(item.id);
                    }
                    this.scene.restart({ tab: 'inventory', city: this.cityKey });
                });
            }
        });
    }

    _showEquipment() {
        const y = this.contentY;
        const slots = ['weapon', 'armor', 'accessory'];
        const slotLabels = { weapon: '武器', armor: '防具', accessory: '飾品' };

        slots.forEach((slot, i) => {
            const sy = y + i * 80;
            this.add.text(40, sy, `【${slotLabels[slot]}】`, {
                fontSize: '16px', fontFamily: 'monospace', color: '#3498db'
            });

            const equipped = this.player.getEquipped(slot);
            if (equipped) {
                this.add.text(60, sy + 25, equipped.name, {
                    fontSize: '14px', fontFamily: 'monospace', color: '#fff'
                });
                let stats = '';
                if (equipped.atk) stats += `ATK+${equipped.atk} `;
                if (equipped.def) stats += `DEF+${equipped.def} `;
                if (equipped.hp) stats += `HP+${equipped.hp} `;
                if (equipped.mp) stats += `MP+${equipped.mp} `;
                if (equipped.spd) stats += `SPD+${equipped.spd} `;
                this.add.text(60, sy + 45, stats, {
                    fontSize: '12px', fontFamily: 'monospace', color: '#2ecc71'
                });
            } else {
                this.add.text(60, sy + 25, '（未裝備）', {
                    fontSize: '14px', fontFamily: 'monospace', color: '#666'
                });
            }
        });
    }

    _showSkills() {
        const y = this.contentY;
        this.player.skills.forEach((skId, i) => {
            const sk = SKILLS[skId];
            if (!sk) return;
            const sy = y + i * 45;
            if (sy > 530) return;

            this.add.text(40, sy, sk.name, {
                fontSize: '14px', fontFamily: 'monospace', color: '#9b59b6', fontStyle: 'bold'
            });
            this.add.text(200, sy, `MP: ${sk.mpCost}  CD: ${sk.cooldown || 0}`, {
                fontSize: '12px', fontFamily: 'monospace', color: '#3498db'
            });
            this.add.text(40, sy + 20, sk.desc, {
                fontSize: '11px', fontFamily: 'monospace', color: '#7f8c8d'
            });
        });
    }

    _showQuests() {
        const y = this.contentY;
        const { width } = this.cameras.main;

        // Active quests
        this.add.text(40, y, '進行中的任務', {
            fontSize: '16px', fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
        });

        if (this.player.activeQuests.length === 0) {
            this.add.text(60, y + 25, '沒有進行中的任務', {
                fontSize: '12px', fontFamily: 'monospace', color: '#666'
            });
        }

        let currentY = y + 25;
        this.player.activeQuests.forEach(qid => {
            const quest = QUESTS[qid];
            if (!quest) return;
            this.add.text(60, currentY, `${quest.name}`, {
                fontSize: '13px', fontFamily: 'monospace', color: '#fff'
            });
            quest.objectives.forEach((obj, i) => {
                const progress = this.player.questProgress[qid]?.[i] || 0;
                this.add.text(80, currentY + 18, `  ${obj.type === 'kill' ? '討伐' : '收集'} ${obj.target}: ${progress}/${obj.count}`, {
                    fontSize: '11px', fontFamily: 'monospace', color: progress >= obj.count ? '#2ecc71' : '#7f8c8d'
                });
                currentY += 18;
            });
            currentY += 30;
        });

        // Available quests
        currentY += 20;
        this.add.text(40, currentY, '可接受的任務', {
            fontSize: '16px', fontFamily: 'monospace', color: '#3498db', fontStyle: 'bold'
        });
        currentY += 25;

        const available = QuestSystem.getAvailableQuests(this.player, this.cityKey);
        available.forEach(quest => {
            this.add.text(60, currentY, quest.name, {
                fontSize: '13px', fontFamily: 'monospace', color: '#fff'
            });
            this.add.text(60, currentY + 16, quest.desc, {
                fontSize: '10px', fontFamily: 'monospace', color: '#7f8c8d'
            });

            const acceptBtn = this.add.text(700, currentY + 5, '接受', {
                fontSize: '12px', fontFamily: 'monospace', color: '#2ecc71',
                backgroundColor: '#2c3e50', padding: { x: 8, y: 3 }
            }).setInteractive({ useHandCursor: true });
            acceptBtn.on('pointerdown', () => {
                QuestSystem.acceptQuest(this.player, quest.id);
                this.scene.restart({ tab: 'quest', city: this.cityKey });
            });

            currentY += 45;
        });
    }
}
