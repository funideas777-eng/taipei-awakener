// Turn-based battle logic engine — supports 1-5 monsters
import { SKILLS, MONSTER_SKILLS } from '../data/skills.js';

export class BattleSystem {
    constructor(player, monstersArray) {
        this.player = player;
        // Support both single monster (legacy) and array
        if (!Array.isArray(monstersArray)) monstersArray = [monstersArray];
        this.monsters = monstersArray.map(m => ({
            ...m, currentHp: m.hp, currentMp: m.mp || 0, alive: true
        }));
        this.turn = 0;
        this.log = [];
        this.playerBuffs = {};
        this.monsterBuffs = this.monsters.map(() => ({}));
        this.cooldowns = {};
        this.isPlayerTurn = player.spd >= (this.monsters[0]?.spd || 0);
        this.battleOver = false;
        this.result = null;
        this.killedMonsters = []; // track killed monster ids for quest
    }

    // Convenience: get first alive monster (for backward compat)
    get monster() { return this.monsters.find(m => m.alive) || this.monsters[0]; }

    getAliveMonsters() { return this.monsters.filter(m => m.alive); }

    // Player actions
    playerAttack(targetIndex) {
        if (this.battleOver) return;
        targetIndex = this._resolveTarget(targetIndex);
        if (targetIndex < 0) return { error: '無效的目標' };
        const m = this.monsters[targetIndex];
        const atk = this._getEffectiveStat('player', 'atk');
        const def = this._getMonsterStat(targetIndex, 'def');
        const dmg = Math.max(1, Math.floor(atk * (1 + Math.random() * 0.2) - def * 0.5));
        m.currentHp -= dmg;
        this.log.push({ actor: 'player', action: 'attack', damage: dmg, targetIndex,
            text: `劉艾博 攻擊 ${m.name}！造成 ${dmg} 點傷害！` });
        this._checkMonsterDeath(targetIndex);
        this._checkBattleEnd();
        if (!this.battleOver) this._allMonstersTurn();
        return this.log[this.log.length - 1];
    }

    playerSkill(skillId, targetIndex) {
        if (this.battleOver) return;
        const skill = SKILLS[skillId];
        if (!skill) return { error: '技能不存在' };
        if (this.player.mp < skill.mpCost) return { error: 'MP 不足！' };
        if (this.cooldowns[skillId] > 0) return { error: `技能冷卻中（${this.cooldowns[skillId]} 回合）` };

        this.player.mp -= skill.mpCost;
        this.cooldowns[skillId] = skill.cooldown || 0;
        const isAoE = skill.effect.target === 'all';

        if (skill.effect.type === 'scan') {
            targetIndex = this._resolveTarget(targetIndex);
            if (targetIndex < 0) { this.player.mp += skill.mpCost; return { error: '無效的目標' }; }
            const m = this.monsters[targetIndex];
            this.log.push({
                actor: 'player', action: 'skill', skillName: skill.name,
                text: `劉艾博 使用【${skill.name}】！\n${m.name} 弱點：${m.weakness}\nHP: ${m.currentHp}/${m.hp}\nATK: ${m.atk} DEF: ${m.def}`,
                scan: true
            });
        } else if (skill.effect.type === 'damage') {
            if (isAoE) {
                this._applyAoEDamage(skill);
            } else {
                targetIndex = this._resolveTarget(targetIndex);
                if (targetIndex < 0) { this.player.mp += skill.mpCost; return { error: '無效的目標' }; }
                this._applySingleDamage(skill, targetIndex);
            }
        } else if (skill.effect.type === 'heal') {
            const heal = Math.floor(skill.effect.multiplier * (this.player.maxMp * 0.5 + this.player.level * 2));
            this.player.heal(heal);
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, heal,
                text: `劉艾博 使用【${skill.name}】！回復 ${heal} HP！` });
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
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name,
                text: `劉艾博 使用【${skill.name}】！能力提升！` });
        } else if (skill.effect.type === 'full-restore') {
            this.player.fullRestore();
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name,
                text: `劉艾博 使用【${skill.name}】！HP 和 MP 完全回復！` });
        }

        this._checkBattleEnd();
        if (!this.battleOver) this._allMonstersTurn();
        return this.log[this.log.length - 1];
    }

    _applySingleDamage(skill, targetIndex) {
        const m = this.monsters[targetIndex];
        const atk = this._getEffectiveStat('player', 'atk');
        const def = this._getMonsterStat(targetIndex, 'def');
        let dmg = Math.max(1, Math.floor(atk * skill.effect.multiplier - def * 0.3));
        let critical = false;
        if (skill.effect.element && m.weakness && m.weakness.includes(this._elementName(skill.effect.element))) {
            dmg = Math.floor(dmg * 1.5);
            critical = true;
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, damage: dmg, targetIndex,
                text: `劉艾博 使用【${skill.name}】攻擊 ${m.name}！弱點命中！造成 ${dmg} 點傷害！`, critical: true });
        } else {
            this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, damage: dmg, targetIndex,
                text: `劉艾博 使用【${skill.name}】攻擊 ${m.name}！造成 ${dmg} 點傷害！` });
        }
        m.currentHp -= dmg;
        this._checkMonsterDeath(targetIndex);
    }

    _applyAoEDamage(skill) {
        const atk = this._getEffectiveStat('player', 'atk');
        let totalDmg = 0;
        let targets = 0;
        this.monsters.forEach((m, i) => {
            if (!m.alive) return;
            const def = this._getMonsterStat(i, 'def');
            let dmg = Math.max(1, Math.floor(atk * skill.effect.multiplier * 0.8 - def * 0.3));
            if (skill.effect.element && m.weakness && m.weakness.includes(this._elementName(skill.effect.element))) {
                dmg = Math.floor(dmg * 1.5);
            }
            m.currentHp -= dmg;
            totalDmg += dmg;
            targets++;
            this._checkMonsterDeath(i);
        });
        this.log.push({ actor: 'player', action: 'skill', skillName: skill.name, damage: totalDmg, isAoE: true,
            text: `劉艾博 使用【${skill.name}】！全體攻擊！共造成 ${totalDmg} 點傷害（${targets}體）！`, critical: false });
    }

    playerDefend() {
        if (this.battleOver) return;
        this.playerBuffs.def = { multiplier: 2.0, duration: 1 };
        this.log.push({ actor: 'player', action: 'defend',
            text: '劉艾博 進入防禦姿態！防禦力暫時提升！' });
        if (!this.battleOver) this._allMonstersTurn();
        return this.log[this.log.length - 1];
    }

    playerUseItem(itemId) {
        if (this.battleOver) return;
        const item = this.player.inventory.find(i => i.id === itemId);
        if (!item) return { error: '物品不存在' };

        if (item.subType === 'hp') {
            this.player.heal(item.value);
            this.log.push({ actor: 'player', action: 'item',
                text: `劉艾博 使用了 ${item.name}！回復 ${item.value} HP！` });
        } else if (item.subType === 'mp') {
            this.player.restoreMp(item.value);
            this.log.push({ actor: 'player', action: 'item',
                text: `劉艾博 使用了 ${item.name}！回復 ${item.value} MP！` });
        } else if (item.subType === 'full') {
            this.player.fullRestore();
            this.log.push({ actor: 'player', action: 'item',
                text: `劉艾博 使用了 ${item.name}！HP 和 MP 完全回復！` });
        }
        this.player.removeItem(itemId);
        if (!this.battleOver) this._allMonstersTurn();
        return this.log[this.log.length - 1];
    }

    playerFlee() {
        if (this.battleOver) return;
        if (this.monsters.some(m => m.isBoss)) {
            this.log.push({ actor: 'system', text: 'Boss 戰無法逃跑！' });
            this._allMonstersTurn();
            return this.log[this.log.length - 1];
        }
        const avgSpd = this.getAliveMonsters().reduce((s, m) => s + m.spd, 0) / Math.max(1, this.getAliveMonsters().length);
        const chance = 0.5 + (this.player.spd - avgSpd) * 0.05;
        if (Math.random() < chance) {
            this.battleOver = true;
            this.result = 'flee';
            this.log.push({ actor: 'system', text: '成功逃跑了！' });
        } else {
            this.log.push({ actor: 'system', text: '逃跑失敗！' });
            this._allMonstersTurn();
        }
        return this.log[this.log.length - 1];
    }

    // All alive monsters take turns
    _allMonstersTurn() {
        if (this.battleOver) return;
        this.turn++;
        this._tickBuffs();
        this._tickCooldowns();

        this.monsters.forEach((m, i) => {
            if (!m.alive || this.battleOver) return;
            this._singleMonsterTurn(m, i);
        });
    }

    _singleMonsterTurn(m, idx) {
        if (this.battleOver) return;
        // 35% chance to use skill
        if (m.skills && m.skills.length > 0 && Math.random() < 0.35) {
            const skillKey = m.skills[Math.floor(Math.random() * m.skills.length)];
            const skill = MONSTER_SKILLS[skillKey];
            if (skill) {
                if (skill.type === 'buff') {
                    this.monsterBuffs[idx].def = { multiplier: 1.5, duration: 2 };
                    this.log.push({ actor: 'monster', monsterIndex: idx, action: 'skill',
                        text: `${m.name} 使用了【${skill.name}】！防禦提升！` });
                } else if (skill.type === 'debuff') {
                    this.playerBuffs.atk = { multiplier: 0.7, duration: 2 };
                    this.log.push({ actor: 'monster', monsterIndex: idx, action: 'skill',
                        text: `${m.name} 使用了【${skill.name}】！你的攻擊力下降！` });
                } else {
                    const atk = this._getMonsterStat(idx, 'atk');
                    const def = this._getEffectiveStat('player', 'def');
                    let dmg = Math.max(1, Math.floor(atk * (skill.power || 1.0) - def * 0.4));
                    this.player.hp -= dmg;
                    let text = `${m.name} 使用了【${skill.name}】！造成 ${dmg} 點傷害！`;
                    if (skill.drain) {
                        const healAmt = Math.floor(dmg * 0.3);
                        m.currentHp = Math.min(m.hp, m.currentHp + healAmt);
                        text += ` 吸取了 ${healAmt} HP！`;
                    }
                    this.log.push({ actor: 'monster', monsterIndex: idx, action: 'skill', damage: dmg, text });
                }
                this._checkBattleEnd();
                return;
            }
        }
        // Normal attack
        const atk = this._getMonsterStat(idx, 'atk');
        const def = this._getEffectiveStat('player', 'def');
        const dmg = Math.max(1, Math.floor(atk * (1 + Math.random() * 0.15) - def * 0.5));
        this.player.hp -= dmg;
        this.log.push({ actor: 'monster', monsterIndex: idx, action: 'attack', damage: dmg,
            text: `${m.name} 發動攻擊！造成 ${dmg} 點傷害！` });
        this._checkBattleEnd();
    }

    _resolveTarget(targetIndex) {
        if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < this.monsters.length && this.monsters[targetIndex].alive) {
            return targetIndex;
        }
        // Auto-select first alive monster
        const idx = this.monsters.findIndex(m => m.alive);
        return idx;
    }

    _getEffectiveStat(who, stat) {
        let base;
        const buffs = this.playerBuffs;
        if (who === 'player') {
            base = stat === 'atk' ? this.player.atk : stat === 'def' ? this.player.def : this.player.spd;
        }
        if (buffs[stat]) {
            base = Math.floor(base * buffs[stat].multiplier);
        }
        return base;
    }

    _getMonsterStat(idx, stat) {
        const m = this.monsters[idx];
        let base = m[stat] || 0;
        const buffs = this.monsterBuffs[idx] || {};
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
        this.monsterBuffs.forEach(buffs => {
            for (const [stat, buff] of Object.entries(buffs)) {
                buff.duration--;
                if (buff.duration <= 0) delete buffs[stat];
            }
        });
    }

    _tickCooldowns() {
        for (const [sk, cd] of Object.entries(this.cooldowns)) {
            if (cd > 0) this.cooldowns[sk]--;
        }
    }

    _checkMonsterDeath(idx) {
        const m = this.monsters[idx];
        if (m.currentHp <= 0 && m.alive) {
            m.currentHp = 0;
            m.alive = false;
            this.killedMonsters.push(m.id);
            this.log.push({ actor: 'system', text: `${m.name} 被消滅了！`, monsterDeath: true, monsterIndex: idx });
        }
    }

    _checkBattleEnd() {
        if (this.monsters.every(m => !m.alive)) {
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

    // Calculate rewards (sum over all killed monsters)
    getRewards(rankMultiplier = 1) {
        if (this.result !== 'win') return null;
        let exp = 0, gold = 0;
        const drops = [];
        this.monsters.forEach(m => {
            exp += Math.floor(m.exp * rankMultiplier);
            gold += Math.floor(m.gold * rankMultiplier);
            if (m.drops) {
                m.drops.forEach(drop => {
                    if (Math.random() < drop.chance + (rankMultiplier - 1) * 0.1) {
                        drops.push({ itemId: drop.itemId, amount: drop.amount || 1 });
                    }
                });
            }
        });
        return { exp, gold, drops };
    }
}
