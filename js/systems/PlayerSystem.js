// Player data management system
import { SKILL_LEARN_TABLE } from '../data/skills.js';

export class PlayerSystem {
    constructor() {
        this.reset();
    }

    reset() {
        this.name = '劉艾博';
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.mp = 30;
        this.maxMp = 30;
        this.baseAtk = 10;
        this.baseDef = 8;
        this.baseSpd = 12;
        this.gold = 0;
        this.diamonds = 0;
        this.skills = ['code-analysis', 'power-strike'];
        this.inventory = [];
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.currentCity = 'taipei';
        this.citiesUnlocked = ['taipei'];
        this.bossesDefeated = [];
        this.questProgress = {};
        this.activeQuests = [];
        this.completedQuests = [];
        this.killCounts = {};
        this.itemCounts = {};
        this.prologueComplete = false;
        this.totalPlayTime = 0;
        this.buffs = {};
    }

    get atk() {
        let val = this.baseAtk;
        const wp = this.getEquipped('weapon');
        if (wp) val += (wp.atk || 0);
        const acc = this.getEquipped('accessory');
        if (acc) val += (acc.atk || 0);
        return val;
    }

    get def() {
        let val = this.baseDef;
        const ar = this.getEquipped('armor');
        if (ar) val += (ar.def || 0);
        const acc = this.getEquipped('accessory');
        if (acc) val += (acc.def || 0);
        return val;
    }

    get spd() {
        let val = this.baseSpd;
        const wp = this.getEquipped('weapon');
        if (wp) val += (wp.spd || 0);
        const acc = this.getEquipped('accessory');
        if (acc) val += (acc.spd || 0);
        return val;
    }

    getEquipped(slot) {
        if (!this.equipment[slot]) return null;
        return this.inventory.find(item => item.id === this.equipment[slot]) || null;
    }

    addExp(amount) {
        this.exp += amount;
        const levelUps = [];
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = Math.floor(100 * Math.pow(1.15, this.level - 1));
            // Stat growth
            this.maxHp += 15 + Math.floor(this.level * 1.5);
            this.maxMp += 5 + Math.floor(this.level * 0.5);
            this.baseAtk += 2 + Math.floor(this.level * 0.3);
            this.baseDef += 2 + Math.floor(this.level * 0.2);
            this.baseSpd += 1;
            // Full heal on level up
            this.hp = this.maxHp;
            this.mp = this.maxMp;
            // Learn new skills
            const newSkills = SKILL_LEARN_TABLE[this.level] || [];
            newSkills.forEach(sk => {
                if (!this.skills.includes(sk)) {
                    this.skills.push(sk);
                }
            });
            levelUps.push({
                level: this.level,
                newSkills,
                hp: this.maxHp,
                mp: this.maxMp,
                atk: this.baseAtk,
                def: this.baseDef,
                spd: this.baseSpd,
            });
        }
        return levelUps;
    }

    addGold(amount) {
        this.gold += amount;
    }

    addDiamonds(amount) {
        this.diamonds += amount;
    }

    addItem(itemData) {
        const existing = this.inventory.find(i => i.id === itemData.id && itemData.type !== 'weapon' && itemData.type !== 'armor' && itemData.type !== 'accessory');
        if (existing && (itemData.type === 'consumable' || itemData.type === 'material')) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            this.inventory.push({ ...itemData, quantity: 1 });
        }
    }

    removeItem(itemId, count = 1) {
        const idx = this.inventory.findIndex(i => i.id === itemId);
        if (idx === -1) return false;
        const item = this.inventory[idx];
        if ((item.quantity || 1) > count) {
            item.quantity -= count;
        } else {
            this.inventory.splice(idx, 1);
            // Unequip if was equipped
            for (const slot of ['weapon', 'armor', 'accessory']) {
                if (this.equipment[slot] === itemId) {
                    this.equipment[slot] = null;
                }
            }
        }
        return true;
    }

    equip(itemId) {
        const item = this.inventory.find(i => i.id === itemId);
        if (!item) return false;
        const slot = item.type; // weapon, armor, accessory
        if (!['weapon', 'armor', 'accessory'].includes(slot)) return false;
        this.equipment[slot] = itemId;
        return true;
    }

    unequip(slot) {
        this.equipment[slot] = null;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    restoreMp(amount) {
        this.mp = Math.min(this.maxMp, this.mp + amount);
    }

    fullRestore() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    recordKill(monsterId) {
        this.killCounts[monsterId] = (this.killCounts[monsterId] || 0) + 1;
    }

    recordItemCollect(itemId) {
        this.itemCounts[itemId] = (this.itemCounts[itemId] || 0) + 1;
    }

    unlockCity(cityId) {
        if (!this.citiesUnlocked.includes(cityId)) {
            this.citiesUnlocked.push(cityId);
        }
    }

    defeatBoss(bossId) {
        if (!this.bossesDefeated.includes(bossId)) {
            this.bossesDefeated.push(bossId);
        }
    }

    toJSON() {
        return {
            name: this.name, level: this.level, exp: this.exp, expToNext: this.expToNext,
            hp: this.hp, maxHp: this.maxHp, mp: this.mp, maxMp: this.maxMp,
            baseAtk: this.baseAtk, baseDef: this.baseDef, baseSpd: this.baseSpd,
            gold: this.gold, diamonds: this.diamonds,
            skills: this.skills, inventory: this.inventory, equipment: this.equipment,
            currentCity: this.currentCity, citiesUnlocked: this.citiesUnlocked,
            bossesDefeated: this.bossesDefeated,
            questProgress: this.questProgress, activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            killCounts: this.killCounts, itemCounts: this.itemCounts,
            prologueComplete: this.prologueComplete, totalPlayTime: this.totalPlayTime,
        };
    }

    fromJSON(data) {
        Object.assign(this, data);
    }
}
