// Save/Load system using localStorage + Global Leaderboard via Google Apps Script
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwAhuS5A02qLzdvUIzgCabG0FhTJdxlLpQBmAcJzIOgO3GvzMBEzilIzeblsPCnzi-m/exec';
const GAME_ID = 'taipeiawakener';

export class SaveSystem {
    static SAVE_KEY = 'taipei-awakener-save';
    static LEADERBOARD_KEY = 'taipei-awakener-leaderboard';
    static PLAYER_NAME_KEY = 'taipei-awakener-player-name';
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

    // --- Player Name ---
    static getSavedPlayerName() {
        return localStorage.getItem(this.PLAYER_NAME_KEY) || '';
    }

    static savePlayerName(name) {
        localStorage.setItem(this.PLAYER_NAME_KEY, name);
    }

    // --- Local Leaderboard ---
    static addLeaderboardEntry(playerData) {
        const board = this.getLeaderboard();
        board.push({
            name: playerData.name,
            level: playerData.level,
            citiesCleared: (playerData.bossesDefeated || []).length,
            bossKills: (playerData.bossesDefeated || []).length,
            timestamp: Date.now(),
        });
        board.sort((a, b) => b.level - a.level || b.citiesCleared - a.citiesCleared);
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

    // --- Global Leaderboard (Google Sheets API) ---
    static async pushGlobal(playerName, level, citiesCleared) {
        try {
            // Score = level * 100 + citiesCleared * 10 (composite score for ranking)
            const score = level * 100 + citiesCleared * 10;
            const payload = {
                action: 'addScore',
                game: GAME_ID,
                name: String(playerName).substring(0, 12),
                score: score,
            };
            await fetch(GOOGLE_SHEET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                mode: 'no-cors',
            });
            return true;
        } catch (e) {
            console.warn('Failed to push to global leaderboard:', e);
            return false;
        }
    }

    static async fetchGlobal() {
        try {
            const url = `${GOOGLE_SHEET_API_URL}?action=getScores&game=${GAME_ID}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    return data.map(s => ({
                        name: String(s.name || '匿名'),
                        score: Number(s.score) || 0,
                        level: Math.floor((Number(s.score) || 0) / 100),
                        citiesCleared: Math.floor(((Number(s.score) || 0) % 100) / 10),
                        date: s.date || '',
                    })).slice(0, 10);
                }
            }
        } catch (e) {
            console.warn('Global leaderboard unavailable:', e);
        }
        return null;
    }
}
