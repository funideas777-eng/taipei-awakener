// Player skills database
export const SKILLS = {
    // === BASIC ===
    'code-analysis': {
        id: 'code-analysis', name: '程式碼解析', type: 'scan',
        mpCost: 5, cooldown: 0, level: 1,
        desc: '看穿敵人弱點與詳細數據',
        effect: { type: 'scan' },
    },
    'power-strike': {
        id: 'power-strike', name: '強力打擊', type: 'attack',
        mpCost: 8, cooldown: 0, level: 1, power: 1.5,
        desc: '造成 1.5 倍攻擊力的傷害',
        effect: { type: 'damage', multiplier: 1.5 },
    },

    // === FIRE ===
    'fire-bolt': {
        id: 'fire-bolt', name: '火焰彈', type: 'magic',
        mpCost: 12, cooldown: 1, level: 5, power: 2.0,
        desc: '發射火焰彈，造成 2 倍魔法傷害',
        effect: { type: 'damage', multiplier: 2.0, element: 'fire' },
    },
    'inferno': {
        id: 'inferno', name: '烈焰風暴', type: 'magic',
        mpCost: 30, cooldown: 3, level: 20, power: 3.5,
        desc: '召喚烈焰風暴，造成 3.5 倍魔法傷害',
        effect: { type: 'damage', multiplier: 3.5, element: 'fire', target: 'all' },
    },

    // === LIGHTNING ===
    'thunder-bolt': {
        id: 'thunder-bolt', name: '雷擊', type: 'magic',
        mpCost: 15, cooldown: 1, level: 8, power: 2.2,
        desc: '召喚雷電攻擊，造成 2.2 倍魔法傷害',
        effect: { type: 'damage', multiplier: 2.2, element: 'thunder' },
    },
    'chain-lightning': {
        id: 'chain-lightning', name: '連鎖閃電', type: 'magic',
        mpCost: 35, cooldown: 3, level: 25, power: 3.0,
        desc: '閃電鏈式攻擊，造成 3 倍魔法傷害',
        effect: { type: 'damage', multiplier: 3.0, element: 'thunder', target: 'all' },
    },

    // === HEALING ===
    'heal': {
        id: 'heal', name: '治癒術', type: 'heal',
        mpCost: 10, cooldown: 1, level: 3, power: 1.0,
        desc: '回復自身 HP（基於 MP 的 2 倍）',
        effect: { type: 'heal', multiplier: 2.0 },
    },
    'mega-heal': {
        id: 'mega-heal', name: '大治癒術', type: 'heal',
        mpCost: 25, cooldown: 2, level: 15, power: 1.0,
        desc: '大幅回復自身 HP（基於 MP 的 5 倍）',
        effect: { type: 'heal', multiplier: 5.0 },
    },

    // === BUFFS ===
    'shield-up': {
        id: 'shield-up', name: '防禦強化', type: 'buff',
        mpCost: 8, cooldown: 3, level: 6, duration: 3,
        desc: '防禦力提升 50%，持續 3 回合',
        effect: { type: 'buff', stat: 'def', multiplier: 1.5, duration: 3 },
    },
    'haste': {
        id: 'haste', name: '加速', type: 'buff',
        mpCost: 10, cooldown: 3, level: 10, duration: 3,
        desc: '速度提升 50%，持續 3 回合',
        effect: { type: 'buff', stat: 'spd', multiplier: 1.5, duration: 3 },
    },
    'berserk': {
        id: 'berserk', name: '狂暴', type: 'buff',
        mpCost: 20, cooldown: 5, level: 18, duration: 3,
        desc: '攻擊力提升 80%，防禦降低 20%，持續 3 回合',
        effect: { type: 'buff', stat: 'atk', multiplier: 1.8, duration: 3, side: { stat: 'def', multiplier: 0.8 } },
    },

    // === WIND ===
    'wind-slash': {
        id: 'wind-slash', name: '風刃', type: 'magic',
        mpCost: 14, cooldown: 1, level: 12, power: 2.0,
        desc: '風屬性攻擊，造成 2 倍魔法傷害',
        effect: { type: 'damage', multiplier: 2.0, element: 'wind' },
    },

    // === LIGHT ===
    'holy-light': {
        id: 'holy-light', name: '聖光術', type: 'magic',
        mpCost: 20, cooldown: 2, level: 22, power: 2.5,
        desc: '光屬性攻擊，對暗屬性特效',
        effect: { type: 'damage', multiplier: 2.5, element: 'light' },
    },
    'divine-judgment': {
        id: 'divine-judgment', name: '神聖裁決', type: 'magic',
        mpCost: 50, cooldown: 4, level: 35, power: 4.0,
        desc: '最強光屬性攻擊',
        effect: { type: 'damage', multiplier: 4.0, element: 'light', target: 'all' },
    },

    // === EARTH ===
    'earthquake': {
        id: 'earthquake', name: '大地震擊', type: 'magic',
        mpCost: 25, cooldown: 2, level: 16, power: 2.0,
        desc: '對全體敵人造成 2 倍物理傷害',
        effect: { type: 'damage', multiplier: 2.0, target: 'all' },
    },

    // === METEOR ===
    'meteor-shower': {
        id: 'meteor-shower', name: '流星雨', type: 'magic',
        mpCost: 45, cooldown: 4, level: 28, power: 3.0,
        desc: '召喚流星雨攻擊全體敵人',
        effect: { type: 'damage', multiplier: 3.0, element: 'fire', target: 'all' },
    },

    // === ULTIMATE ===
    'debug-mode': {
        id: 'debug-mode', name: 'Debug 模式', type: 'special',
        mpCost: 40, cooldown: 5, level: 30,
        desc: '工程師的終極技能：全屬性提升 30%，持續 5 回合',
        effect: { type: 'buff', stat: 'all', multiplier: 1.3, duration: 5 },
    },
    'system-reboot': {
        id: 'system-reboot', name: '系統重啟', type: 'special',
        mpCost: 60, cooldown: 8, level: 40,
        desc: '完全回復 HP/MP，解除所有異常狀態',
        effect: { type: 'full-restore' },
    },
};

// Skills learned at each level
export const SKILL_LEARN_TABLE = {
    1: ['code-analysis', 'power-strike'],
    3: ['heal'],
    5: ['fire-bolt'],
    6: ['shield-up'],
    8: ['thunder-bolt'],
    10: ['haste'],
    12: ['wind-slash'],
    15: ['mega-heal'],
    16: ['earthquake'],
    18: ['berserk'],
    20: ['inferno'],
    22: ['holy-light'],
    25: ['chain-lightning'],
    28: ['meteor-shower'],
    30: ['debug-mode'],
    35: ['divine-judgment'],
    40: ['system-reboot'],
};

// Monster skills
export const MONSTER_SKILLS = {
    'water-splash': { name: '水花攻擊', power: 1.3, element: 'water' },
    'shadow-strike': { name: '暗影突襲', power: 1.5, element: 'dark' },
    'dark-slash': { name: '暗黑斬', power: 2.0, element: 'dark' },
    'laser-beam': { name: '雷射光束', power: 1.8, element: 'fire' },
    'shield-up': { name: '護盾強化', power: 0, type: 'buff' },
    'poison-breath': { name: '毒霧吐息', power: 1.5, element: 'poison', status: 'poison' },
    'smog-cloud': { name: '濃霧籠罩', power: 1.2, type: 'debuff' },
    'soul-drain': { name: '靈魂吸取', power: 1.8, element: 'dark', drain: true },
    'phase-shift': { name: '相位轉移', power: 0, type: 'dodge' },
    'tidal-wave': { name: '潮汐波', power: 2.0, element: 'water', target: 'all' },
    'ink-cloud': { name: '墨汁噴射', power: 1.3, status: 'blind' },
    // Boss skills
    'data-drain': { name: '數據吸收', power: 2.0, drain: true },
    'system-crash': { name: '系統崩潰', power: 2.5, status: 'stun' },
    'virus-attack': { name: '病毒攻擊', power: 1.8, status: 'poison' },
    'chaos-wave': { name: '混沌波動', power: 2.5, target: 'all' },
    'dimension-rift': { name: '次元裂縫', power: 3.0 },
    'confusion': { name: '混亂術', power: 0, status: 'confuse' },
    'assembly-rush': { name: '產線衝擊', power: 2.5 },
    'overload': { name: '過載', power: 3.5, selfDmg: true },
    'steel-press': { name: '鋼鐵壓制', power: 2.0, status: 'stun' },
    'toxic-storm': { name: '毒霧風暴', power: 2.5, status: 'poison', target: 'all' },
    'acid-rain': { name: '酸雨', power: 2.0, status: 'def-down' },
    'suffocate': { name: '窒息', power: 3.0 },
    'time-stop': { name: '時間停止', power: 0, status: 'stun' },
    'history-rewrite': { name: '歷史改寫', power: 3.0 },
    'age-curse': { name: '歲月詛咒', power: 2.0, status: 'atk-down' },
    'abyss-call': { name: '深淵召喚', power: 2.5 },
    'deep-crush': { name: '深海壓碎', power: 3.5, target: 'all' },
    'tsunami': { name: '海嘯', power: 4.0, element: 'water', target: 'all' },
    'darkness-devour': { name: '黑暗吞噬', power: 3.0, drain: true },
    // Trump boss skills
    'tariff-attack': { name: '對等關稅', power: 5.0, element: 'dark' },
    'you-are-fired': { name: 'You Are Fired!', power: 4.0, status: 'atk-down' },
    'trade-war': { name: '貿易戰爭', power: 3.0, status: 'def-down' },
    'fake-news': { name: '假新聞', power: 0, type: 'debuff', status: 'confuse' },
    'executive-order': { name: '行政命令', power: 3.5, status: 'stun' },
};
