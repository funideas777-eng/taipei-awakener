// Turn-based battle logic engine
import { SKILLS, MONSTER_SKILLS } from '../data/skills.js';

export class BattleSystem {
    constructor(player, monster) {
        this.player = player;
        this.monster = { ...monster, currentHp: monster.hp, currentMp: monster.mp };
        this.turn = 0;
        this.log = [];
        this.playerBuffs = {};
        this.monsterBuffs = {};
        this.cooldowns = {};
        this.isPlayerTurn = player.spd >= monster.spd;
        this.battleOver = false;
        this.result = null; // 'win' or 'lose'
    }

    // Player actions
    playerAttack() {
        if (this.battleOver) return;
        const atk = this._getEffectiveStat('player', 'atk');
        const def = this._getEffectiveStat('monster', 'def');
        const dmg = Math.max(1, Math.floor(atk * (1 + Math.random() * 0.2) - def * 0.5));
        this.monster.currentHp -= dmg;
        this.log.push({ actor: 'player', action: 'attack', damage: dmg, text: `劉艾博 發動攻擊！造成 ${dmg} 點傷害！` });
        this._checkBattleEnd();
        if (!this.battleOver) this._monsterTurn();
        return this.log[this.log.length - 1];
    }

    playerSkill(skillId) {
        if (this.battleOver) return;
        const skill = SKILLS[skillId];
        if (!skill) return { error: '技能不存在' };
        if (this.player.mp < skill.mpCost) return { error: 'MP 不足！' };
        if (this.cooldowns[skillId] > 0) return { error: `技能冷卻中（${this.cooldowns[skillId]} 回合）` };

        this.player.mp -= skill.mpCost;
        this.cooldowns[skillId] = skill.cooldown || 0;

        if (skill.effect.type === 'scan') {
            this.log.push({
                actor: 'player', action: 'skill', skillName: skill.name,
                text: `劉艾博 使用【${skill.name}】！\n${this.monster.name} 的弱點：${this.monster.weakness}\nHP: ${this.monster.currentHp}/${this.monster.hp}\nATK: ${this.monster.atk} DEF: ${this.monster.def}`,
                scan: true
            });
        } else if (skill.effect.type === 'damage') {
            const atk = this._getEffectiveStat('player', 'atk');
            const def = this._getEffectiveStat('monster', 'def');
            let dmg = Math.max(1, Math.floor(atk * skill.effect.multiplier - def * 0.3));
            // Element bonus
            if (skill.effect.element && this.monster.weakness && this.monster.weakness.includes(this._elementName(skill.effect.element))) {
                dmg = Math.floor(dmg * 1.5);
                this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, damage: dmg, text: `劉艾博 使用【${skill.name}】！弱點命中！造成 ${dmg} 點傷害！`, critical: true });
            } else {
                this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, damage: dmg, text: `劉艾博 使用【${skill.name}】���造成 ${dmg} 點傷害！` });
            }
            this.monster.currentHp -= dmg;
        } else if (skill.effect.type === 'heal') {
            const heal = Math.floor(skill.effect.multiplier * (this.player.maxMp * 0.5 + this.player.level * 2));
            this.player.heal(heal);
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, heal, text: `劉���博 使用【${skill.name}】！回復 ${heal} HP！` });
        } else if (skill.effect.type === 'buff') {
            if (skill.effect.stat === 'all') {
                this.playerBuffs.atk = { multiplier: skill.effect.multiplier, duration: skill.effect.duration };
                this.playerBuffs.def = { multiplier: skill.effect.multiplier, duration: skill.effect.duration };
                this.playerBuffs.spd = { multiplier: skill.effect.multiplier, duration: skill.effect.duration };
            } else {
                this.playerBuffs[skill.effect.stat] = { multiplier: skill.effect.multiplier, duration: skill.effect.duration };
            }
            if (skill.effect.side) {
                this.playerBuffs[skill.effect.side.stat] = { multiplier: skill.effect.side.multiplier, duration: skill.effect.duration };
            }
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, text: `劉艾博 使用【${skill.name}】！能力提升！` });
        } else if (skill.effect.type === 'full-restore') {
            this.player.fullRestore();
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, text: `劉艾博 使用【${skill.name}】！HP 和 MP 完全回復！` });
        }

        this._checkBattleEnd();
        if (!this.battleOver) this._monsterTurn();
        return this.log[this.log.length - 1];
    }

    playerDefend() {
        if (this.battleOver) return;
        this.playerBuffs.def = { multiplier: 2.0, duration: 1 };
        this.log.push({ actor: 'player', action: 'defend', text: '劉艾博 進入防禦姿態！防禦力暫時提升！' });
        if (!this.battleOver) this._monsterTurn();
        return this.log[this.log.length - 1];
    }

    playerUseItem(itemId) {
        if (this.battleOver) return;
        const item = this.player.inventory.find(i => i.id === itemId);
        if (!item) return { error: '物品不存在' };

        if (item.subType === 'hp') {
            this.player.heal(item.value);
            this.log.push({ actor: 'player', action: 'item', text: `劉艾博 使用了 ${item.name}！回復 ${item.value} HP！` });
        } else if (item.subType === 'mp') {
            this.player.restoreMp(item.value);
            this.log.push({ actor: 'player', action: 'item', text: `劉艾博 ���用了 ${item.name}！回復 ${item.value} MP���` });
        } else if (item.subType === 'full') {
            this.player.fullRestore();
            this.log.push({ actor: 'player', action: 'item', text: `劉艾博 ��用了 ${item.name}！HP 和 MP 完全回復！` });
        }
        this.player.removeItem(itemId);

        if (!this.battleOver) this._monsterTurn();
        return this.log[this.log.length - 1];
    }

    playerFlee() {
        if (this.battleOver) return;
        if (this.monster.isBoss) {
            this.log.push({ actor: 'system', text: 'Boss 戰無法逃跑！' });
            this._monsterTurn();
            return this.log[this.log.length - 1];
        }
        const chance = 0.5 + (this.player.spd - this.monster.spd) * 0.05;
        if (Math.random() < chance) {
            this.battleOver = true;
            this.result = 'flee';
            this.log.push({ actor: 'system', text: '成功逃跑了！' });
        } else {
            this.log.push({ actor: 'system', text: '逃跑失敗！' });
            this._monsterTurn();
        }
        return this.log[this.log.length - 1];
    }

    // Monster turn
    _monsterTurn() {
        if (this.battleOver) return;
        this.turn++;
        this._tickBuffs();
        this._tickCooldowns();

        const m = this.monster;
        // Decide action: 30% chance to use skill if available
        if (m.skills.length > 0 && Math.random() < 0.35) {
            const skillKey = m.skills[Math.floor(Math.random() * m.skills.length)];
            const skill = MONSTER_SKILLS[skillKey];
            if (skill) {
                if (skill.type === 'buff') {
                    this.monsterBuffs.def = { multiplier: 1.5, duration: 2 };
                    this.log.push({ actor: 'monster', action: 'skill', text: `${m.name} 使用了【${skill.name}】！防禦提升！` });
                } else {
                    const atk = this._getEffectiveStat('monster', 'atk');
                    const def = this._getEffectiveStat('player', 'def');
                    let dmg = Math.max(1, Math.floor(atk * (skill.power || 1.0) - def * 0.4));
                    this.player.hp -= dmg;
                    let text = `${m.name} 使用了【${skill.name}】！造成 ${dmg} 點傷害！`;
                    if (skill.drain) {
                        const healAmt = Math.floor(dmg * 0.3);
                        m.currentHp = Math.min(m.hp, m.currentHp + healAmt);
                        text += ` 吸取了 ${healAmt} HP！`;
                    }
                    this.log.push({ actor: 'monster', action: 'skill', damage: dmg, text });
                }
                this._checkBattleEnd();
                return;
            }
        }

        // Normal attack
        const atk = this._getEffectiveStat('monster', 'atk');
        const def = this._getEffectiveStat('player', 'def');
        const dmg = Math.max(1, Math.floor(atk * (1 + Math.random() * 0.15) - def * 0.5));
        this.player.hp -= dmg;
        this.log.push({ actor: 'monster', action: 'attack', damage: dmg, text: `${m.name} 發動攻擊！造成 ${dmg} 點傷害��` });
        this._checkBattleEnd();
    }

    _getEffectiveStat(who, stat) {
        let base;
        const buffs = who === 'player' ? this.playerBuffs : this.monsterBuffs;
        if (who === 'player') {
            base = stat === 'atk' ? this.player.atk : stat === 'def' ? this.player.def : this.player.spd;
        } else {
            base = this.monster[stat] || 0;
        }
        if (buffs[stat]) {
            base = Math.floor(base * buffs[stat].multiplier);
        }
        return base;
    }

    _tickBuffs() {
        for (const [stat, buff] of Object.entries(this.playerBuffs)) {
            buff.duration--;
            if (buff.duration <= 0) delete this.playerBuffs[stat];
        }
        for (const [stat, buff] of Object.entries(this.monsterBuffs)) {
            buff.duration--;
            if (buff.duration <= 0) delete this.monsterBuffs[stat];
        }
    }

    _tickCooldowns() {
        for (const [sk, cd] of Object.entries(this.cooldowns)) {
            if (cd > 0) this.cooldowns[sk]--;
        }
    }

    _checkBattleEnd() {
        if (this.monster.currentHp <= 0) {
            this.monster.currentHp = 0;
            this.battleOver = true;
            this.result = 'win';
        }
        if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.battleOver = true;
            this.result = 'lose';
        }
    }

    _elementName(element) {
        const map = { fire: '火', thunder: '雷', water: '水', wind: '風', light: '光', dark: '暗' };
        return map[element] || element;
    }

    // Calculate rewards
    getRewards(rankMultiplier = 1) {
        if (this.result !== 'win') return null;
        const m = this.monster;
        const exp = Math.floor(m.exp * rankMultiplier);
        const gold = Math.floor(m.gold * rankMultiplier);
        const drops = [];
        if (m.drops) {
            m.drops.forEach(drop => {
                if (Math.random() < drop.chance + (rankMultiplier - 1) * 0.1) {
                    drops.push({ itemId: drop.itemId, amount: drop.amount || 1 });
                }
            });
        }
        return { exp, gold, drops };
    }
}
