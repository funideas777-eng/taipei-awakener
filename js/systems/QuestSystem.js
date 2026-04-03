// Quest tracking system
import { QUESTS } from '../data/quests.js';
import { ITEMS as QUEST_ITEMS } from '../data/items.js';

export class QuestSystem {

    static getAvailableQuests(player, cityId) {
        return Object.values(QUESTS).filter(q => {
            if (q.city !== cityId) return false;
            if (!q.repeatable && player.completedQuests.includes(q.id)) return false;
            if (player.activeQuests.includes(q.id)) return false;
            return true;
        });
    }

    static acceptQuest(player, questId) {
        if (player.activeQuests.includes(questId)) return false;
        player.activeQuests.push(questId);
        player.questProgress[questId] = {};
        const quest = QUESTS[questId];
        quest.objectives.forEach((obj, i) => {
            player.questProgress[questId][i] = 0;
        });
        return true;
    }

    static updateProgress(player, type, target) {
        const updated = [];
        player.activeQuests.forEach(qid => {
            const quest = QUESTS[qid];
            if (!quest) return;
            quest.objectives.forEach((obj, i) => {
                if (obj.type === type && obj.target === target) {
                    player.questProgress[qid][i] = (player.questProgress[qid][i] || 0) + 1;
                    updated.push({ questId: qid, objectiveIndex: i });
                }
            });
        });
        return updated;
    }

    static checkCompletion(player, questId) {
        const quest = QUESTS[questId];
        if (!quest) return false;
        return quest.objectives.every((obj, i) => {
            return (player.questProgress[questId][i] || 0) >= obj.count;
        });
    }

    static completeQuest(player, questId) {
        const quest = QUESTS[questId];
        if (!quest) return null;
        if (!this.checkCompletion(player, questId)) return null;

        // Remove from active
        player.activeQuests = player.activeQuests.filter(id => id !== questId);
        if (!quest.repeatable) {
            player.completedQuests.push(questId);
        }
        delete player.questProgress[questId];

        // Grant rewards
        const rewards = quest.rewards;
        if (rewards.exp) player.addExp(rewards.exp);
        if (rewards.gold) player.addGold(rewards.gold);
        if (rewards.diamonds) player.addDiamonds(rewards.diamonds);
        if (rewards.items) {
            // Items are imported at the top of this module
            rewards.items.forEach(itemId => {
                const item = QUEST_ITEMS[itemId];
                if (item) player.addItem({ ...item });
            });
        }
        if (rewards.unlockCity) {
            player.unlockCity(rewards.unlockCity);
        }

        return rewards;
    }

    static getQuestProgress(player, questId) {
        const quest = QUESTS[questId];
        if (!quest) return null;
        return quest.objectives.map((obj, i) => ({
            ...obj,
            current: player.questProgress[questId]?.[i] || 0,
        }));
    }
}
