// Dungeon/portal data
export const PORTAL_RANKS = {
    E: { name: 'E級', color: '#4caf50', minLevel: 1, monsterLevelRange: [1, 5], floors: 1 },
    D: { name: 'D級', color: '#2196f3', minLevel: 5, monsterLevelRange: [5, 12], floors: 2 },
    C: { name: 'C級', color: '#9c27b0', minLevel: 12, monsterLevelRange: [12, 20], floors: 2 },
    B: { name: 'B級', color: '#ff9800', minLevel: 20, monsterLevelRange: [20, 30], floors: 3 },
    A: { name: 'A級', color: '#f44336', minLevel: 30, monsterLevelRange: [30, 42], floors: 3 },
    S: { name: 'S級', color: '#ff0000', minLevel: 38, monsterLevelRange: [38, 50], floors: 4 },
};

export const DUNGEON_THEMES = {
    tech: { name: '科技廢墟', wallColor: '#2c3e50', floorColor: '#1a1a2e', accentColor: '#00d4ff' },
    shadow: { name: '暗影地道', wallColor: '#1a1a2e', floorColor: '#2d2d2d', accentColor: '#9b59b6' },
    mech: { name: '機械工廠', wallColor: '#7f8c8d', floorColor: '#95a5a6', accentColor: '#f39c12' },
    storm: { name: '毒霧荒原', wallColor: '#5d6d7e', floorColor: '#4a5568', accentColor: '#e74c3c' },
    time: { name: '時空迴廊', wallColor: '#4a0080', floorColor: '#2d004d', accentColor: '#ffeb3b' },
    abyss: { name: '深海神殿', wallColor: '#0d1b2a', floorColor: '#1b2838', accentColor: '#00bcd4' },
};

// Rewards multiplier by rank
export const RANK_REWARDS = {
    E: { expMul: 1.0, goldMul: 1.0, dropBonus: 0 },
    D: { expMul: 1.5, goldMul: 1.5, dropBonus: 0.05 },
    C: { expMul: 2.0, goldMul: 2.0, dropBonus: 0.1 },
    B: { expMul: 3.0, goldMul: 3.0, dropBonus: 0.15 },
    A: { expMul: 4.0, goldMul: 4.0, dropBonus: 0.2 },
    S: { expMul: 6.0, goldMul: 6.0, dropBonus: 0.3 },
};
