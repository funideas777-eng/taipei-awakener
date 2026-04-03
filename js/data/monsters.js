// Monster database
export const MONSTERS = {
    // --- NORMAL MONSTERS ---
    slime: {
        id: 'slime', name: '史萊姆', sprite: 'monster-slime',
        level: 1, hp: 30, mp: 0, atk: 5, def: 2, spd: 3,
        exp: 25, gold: 15,
        drops: [
            { itemId: 'slime-jelly', chance: 0.5 },
            { itemId: 'potion-s', chance: 0.2 },
        ],
        skills: [],
        weakness: '火屬性',
    },
    slime_blue: {
        id: 'slime_blue', name: '藍色史萊姆', sprite: 'monster-slime',
        level: 3, hp: 50, mp: 10, atk: 8, def: 4, spd: 4,
        exp: 40, gold: 25,
        drops: [
            { itemId: 'slime-jelly', chance: 0.4 },
            { itemId: 'mp-potion-s', chance: 0.2 },
        ],
        skills: ['water-splash'],
        weakness: '雷屬性',
    },
    shadow_soldier: {
        id: 'shadow_soldier', name: '暗影兵', sprite: 'monster-shadow',
        level: 8, hp: 120, mp: 20, atk: 18, def: 12, spd: 10,
        exp: 80, gold: 50,
        drops: [
            { itemId: 'shadow-essence', chance: 0.3 },
            { itemId: 'iron-sword', chance: 0.05 },
        ],
        skills: ['shadow-strike'],
        weakness: '光屬性',
    },
    shadow_knight: {
        id: 'shadow_knight', name: '暗影騎士', sprite: 'monster-shadow',
        level: 12, hp: 200, mp: 30, atk: 25, def: 20, spd: 12,
        exp: 150, gold: 90,
        drops: [
            { itemId: 'shadow-essence', chance: 0.5 },
            { itemId: 'shadow-armor', chance: 0.03 },
        ],
        skills: ['shadow-strike', 'dark-slash'],
        weakness: '光屬性',
    },
    mech_drone: {
        id: 'mech_drone', name: '機械無人機', sprite: 'monster-mech',
        level: 16, hp: 180, mp: 40, atk: 28, def: 25, spd: 18,
        exp: 200, gold: 120,
        drops: [
            { itemId: 'mech-parts', chance: 0.4 },
            { itemId: 'energy-core', chance: 0.1 },
        ],
        skills: ['laser-beam'],
        weakness: '水屬性',
    },
    mech_guardian: {
        id: 'mech_guardian', name: '機械守衛', sprite: 'monster-mech',
        level: 22, hp: 350, mp: 50, atk: 35, def: 35, spd: 12,
        exp: 350, gold: 200,
        drops: [
            { itemId: 'mech-parts', chance: 0.5 },
            { itemId: 'titanium-shield', chance: 0.03 },
        ],
        skills: ['laser-beam', 'shield-up'],
        weakness: '水屬性',
    },
    smog_wisp: {
        id: 'smog_wisp', name: '毒霧精靈', sprite: 'monster-smog',
        level: 24, hp: 220, mp: 60, atk: 32, def: 18, spd: 22,
        exp: 300, gold: 180,
        drops: [
            { itemId: 'toxic-gas', chance: 0.4 },
            { itemId: 'wind-scroll', chance: 0.08 },
        ],
        skills: ['poison-breath', 'smog-cloud'],
        weakness: '風屬性',
    },
    ghost_spirit: {
        id: 'ghost_spirit', name: '幽靈', sprite: 'monster-ghost',
        level: 32, hp: 280, mp: 80, atk: 38, def: 15, spd: 28,
        exp: 450, gold: 250,
        drops: [
            { itemId: 'ghost-essence', chance: 0.3 },
            { itemId: 'time-crystal', chance: 0.05 },
        ],
        skills: ['soul-drain', 'phase-shift'],
        weakness: '光屬性',
    },
    deepsea_creature: {
        id: 'deepsea_creature', name: '深海異獸', sprite: 'monster-deepsea',
        level: 40, hp: 500, mp: 60, atk: 45, def: 30, spd: 20,
        exp: 600, gold: 350,
        drops: [
            { itemId: 'abyss-pearl', chance: 0.3 },
            { itemId: 'trident', chance: 0.02 },
        ],
        skills: ['tidal-wave', 'ink-cloud'],
        weakness: '雷屬性',
    },

    // --- BOSSES ---
    boss_data_devourer: {
        id: 'boss_data_devourer', name: '數據吞噬者', sprite: 'boss-data-devourer',
        level: 10, hp: 500, mp: 100, atk: 22, def: 15, spd: 14,
        exp: 500, gold: 300, isBoss: true,
        drops: [
            { itemId: 'data-core', chance: 1.0 },
            { itemId: 'digital-blade', chance: 0.5 },
            { itemId: 'diamond', chance: 1.0, amount: 5 },
        ],
        skills: ['data-drain', 'system-crash', 'virus-attack'],
        weakness: '物理攻擊',
        storyKey: 'bossTaipei',
    },
    boss_chaos: {
        id: 'boss_chaos', name: '混沌擴散者', sprite: 'boss-chaos',
        level: 18, hp: 900, mp: 150, atk: 32, def: 22, spd: 16,
        exp: 1000, gold: 600, isBoss: true,
        drops: [
            { itemId: 'chaos-fragment', chance: 1.0 },
            { itemId: 'chaos-ring', chance: 0.3 },
            { itemId: 'diamond', chance: 1.0, amount: 8 },
        ],
        skills: ['chaos-wave', 'dimension-rift', 'confusion'],
        weakness: '秩序之力',
        storyKey: 'bossNewTaipei',
    },
    boss_mech_overlord: {
        id: 'boss_mech_overlord', name: '產線暴走體', sprite: 'boss-mech-overlord',
        level: 25, hp: 1500, mp: 80, atk: 45, def: 40, spd: 10,
        exp: 1800, gold: 1000, isBoss: true,
        drops: [
            { itemId: 'overload-core', chance: 1.0 },
            { itemId: 'mech-armor', chance: 0.3 },
            { itemId: 'diamond', chance: 1.0, amount: 12 },
        ],
        skills: ['assembly-rush', 'overload', 'steel-press'],
        weakness: '水屬性',
        storyKey: 'bossTaoyuan',
    },
    boss_smog_giant: {
        id: 'boss_smog_giant', name: '空污巨靈', sprite: 'boss-smog-giant',
        level: 32, hp: 2000, mp: 200, atk: 40, def: 28, spd: 18,
        exp: 2500, gold: 1500, isBoss: true,
        drops: [
            { itemId: 'purified-air', chance: 1.0 },
            { itemId: 'storm-robe', chance: 0.3 },
            { itemId: 'diamond', chance: 1.0, amount: 15 },
        ],
        skills: ['toxic-storm', 'acid-rain', 'suffocate'],
        weakness: '風屬性',
        storyKey: 'bossTaichung',
    },
    boss_time_corruptor: {
        id: 'boss_time_corruptor', name: '歷史篡改者', sprite: 'boss-time-corruptor',
        level: 40, hp: 2800, mp: 300, atk: 48, def: 35, spd: 25,
        exp: 3500, gold: 2000, isBoss: true,
        drops: [
            { itemId: 'time-crystal', chance: 1.0, amount: 3 },
            { itemId: 'temporal-blade', chance: 0.3 },
            { itemId: 'diamond', chance: 1.0, amount: 20 },
        ],
        skills: ['time-stop', 'history-rewrite', 'age-curse'],
        weakness: '真實之力',
        storyKey: 'bossTainan',
    },
    boss_abyss_lord: {
        id: 'boss_abyss_lord', name: '深淵領主', sprite: 'boss-abyss-lord',
        level: 50, hp: 4000, mp: 400, atk: 60, def: 45, spd: 22,
        exp: 5000, gold: 3000, isBoss: true,
        drops: [
            { itemId: 'abyss-heart', chance: 1.0 },
            { itemId: 'abyss-armor', chance: 0.5 },
            { itemId: 'diamond', chance: 1.0, amount: 30 },
        ],
        skills: ['abyss-call', 'deep-crush', 'tsunami', 'darkness-devour'],
        weakness: '光屬性',
        storyKey: 'bossKaohsiung',
    },
};

// Monsters by city/region
export const CITY_MONSTERS = {
    taipei: ['slime', 'slime_blue', 'shadow_soldier'],
    newTaipei: ['shadow_soldier', 'shadow_knight'],
    taoyuan: ['mech_drone', 'mech_guardian'],
    taichung: ['smog_wisp', 'mech_guardian'],
    tainan: ['ghost_spirit', 'smog_wisp'],
    kaohsiung: ['deepsea_creature', 'ghost_spirit'],
};

export const CITY_BOSSES = {
    taipei: 'boss_data_devourer',
    newTaipei: 'boss_chaos',
    taoyuan: 'boss_mech_overlord',
    taichung: 'boss_smog_giant',
    tainan: 'boss_time_corruptor',
    kaohsiung: 'boss_abyss_lord',
};
