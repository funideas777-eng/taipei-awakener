// Save/Load system using localStorage
export class SaveSystem {
    static SAVE_KEY = 'taipei-awakener-save';
    static LEADERBOARD_KEY = 'taipei-awakener-leaderboard';
    static MAX_SLOTS = 3;

    static save(slot, playerData) {
        const saves = this.getAllSaves();
        saves[slot] = {
            data: playerData,
            timestamp: Date.now(),
            label: `LV.${playerData.level} ${playerData.name} - ${playerData.currentCity}`,
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
        return true;
    }

    static load(slot) {
        const saves = this.getAllSaves();
        return saves[slot] ? saves[slot].data : null;
    }

    static getAllSaves() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    static deleteSave(slot) {
        const saves = this.getAllSaves();
        delete saves[slot];
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
    }

    static hasSaves() {
        const saves = this.getAllSaves();
        return Object.keys(saves).length > 0;
    }

    // --- Leaderboard ---
    static addLeaderboardEntry(playerData) {
        const board = this.getLeaderboard();
        board.push({
            name: playerData.name,
            level: playerData.level,
            citiesCleared: playerData.bossesDefeated.length,
            bossKills: playerData.bossesDefeated.length,
            timestamp: Date.now(),
        });
        // Sort by level desc, then bosses desc
        board.sort((a, b) => b.level - a.level || b.citiesCleared - a.citiesCleared);
        // Keep top 20
        const trimmed = board.slice(0, 20);
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(trimmed));
    }

    static getLeaderboard() {
        try {
            const raw = localStorage.getItem(this.LEADERBOARD_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}
