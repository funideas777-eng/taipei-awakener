// Items, equipment, and consumables database
export const ITEMS = {
    // === CONSUMABLES ===
    'potion-s': { id: 'potion-s', name: '回復藥水(小)', type: 'consumable', subType: 'hp', value: 50, price: 30, sprite: 'item-potion', desc: '回復 50 HP' },
    'potion-m': { id: 'potion-m', name: '回復藥水(中)', type: 'consumable', subType: 'hp', value: 150, price: 100, sprite: 'item-potion', desc: '回復 150 HP' },
    'potion-l': { id: 'potion-l', name: '回復藥水(大)', type: 'consumable', subType: 'hp', value: 500, price: 350, sprite: 'item-potion', desc: '回復 500 HP' },
    'mp-potion-s': { id: 'mp-potion-s', name: '魔力藥水(小)', type: 'consumable', subType: 'mp', value: 30, price: 40, sprite: 'item-mp-potion', desc: '回復 30 MP' },
    'mp-potion-m': { id: 'mp-potion-m', name: '魔力藥水(中)', type: 'consumable', subType: 'mp', value: 80, price: 120, sprite: 'item-mp-potion', desc: '回復 80 MP' },
    'mp-potion-l': { id: 'mp-potion-l', name: '魔力藥水(大)', type: 'consumable', subType: 'mp', value: 200, price: 400, sprite: 'item-mp-potion', desc: '回復 200 MP' },
    'antidote': { id: 'antidote', name: '解毒劑', type: 'consumable', subType: 'cure', value: 0, price: 50, sprite: 'item-potion', desc: '治療中毒狀態' },
    'revive': { id: 'revive', name: '復活藥', type: 'consumable', subType: 'revive', value: 100, price: 500, sprite: 'item-potion', desc: '戰鬥不利時回復 100 HP' },

    // === MATERIALS ===
    'slime-jelly': { id: 'slime-jelly', name: '史萊姆凝膠', type: 'material', price: 10, desc: '黏黏的凝膠，可做合成素材' },
    'shadow-essence': { id: 'shadow-essence', name: '暗影精華', type: 'material', price: 30, desc: '散發暗紫色光芒的精華' },
    'mech-parts': { id: 'mech-parts', name: '機械零件', type: 'material', price: 50, desc: '精密的機械組件' },
    'energy-core': { id: 'energy-core', name: '能量核心', type: 'material', price: 100, desc: '蘊含強大能量的核心' },
    'toxic-gas': { id: 'toxic-gas', name: '毒霧結晶', type: 'material', price: 60, desc: '凝結的有毒氣體結晶' },
    'ghost-essence': { id: 'ghost-essence', name: '幽靈精華', type: 'material', price: 80, desc: '半透明的靈魂碎片' },
    'abyss-pearl': { id: 'abyss-pearl', name: '深淵珍珠', type: 'material', price: 150, desc: '來自深海的神秘珍珠' },
    'data-core': { id: 'data-core', name: '數據核心', type: 'material', price: 200, desc: 'Boss掉落的特殊核心' },
    'chaos-fragment': { id: 'chaos-fragment', name: '混沌碎片', type: 'material', price: 300, desc: '蘊含混沌之力的碎片' },
    'overload-core': { id: 'overload-core', name: '暴走核心', type: 'material', price: 400, desc: '機械暴走體的核心' },
    'purified-air': { id: 'purified-air', name: '淨化之風', type: 'material', price: 500, desc: '淨化空污後留下的結晶' },
    'time-crystal': { id: 'time-crystal', name: '時間結晶', type: 'material', price: 600, desc: '凝固的時間碎片' },
    'abyss-heart': { id: 'abyss-heart', name: '深淵之心', type: 'material', price: 1000, desc: '深淵領主的心臟' },

    // === WEAPONS ===
    'wooden-bat': { id: 'wooden-bat', name: '木棒', type: 'weapon', atk: 5, price: 50, desc: '隨手撿來的木棒', sprite: 'item-sword' },
    'iron-sword': { id: 'iron-sword', name: '鐵劍', type: 'weapon', atk: 12, price: 200, desc: '基礎的鐵製長劍' },
    'steel-blade': { id: 'steel-blade', name: '鋼刃', type: 'weapon', atk: 22, price: 500, desc: '鋒利的鋼製武器' },
    'shadow-dagger': { id: 'shadow-dagger', name: '暗影匕首', type: 'weapon', atk: 30, price: 800, desc: '沾染暗影之力的匕首', spd: 5 },
    'mech-blade': { id: 'mech-blade', name: '機械刃', type: 'weapon', atk: 40, price: 1500, desc: '高科技鍛造的機械武器' },
    'wind-staff': { id: 'wind-staff', name: '風暴法杖', type: 'weapon', atk: 35, mp: 30, price: 2000, desc: '蘊含風之力的法杖' },
    'temporal-blade': { id: 'temporal-blade', name: '時空之刃', type: 'weapon', atk: 55, spd: 10, price: 5000, desc: '扭曲時空的傳說武器' },
    'digital-blade': { id: 'digital-blade', name: '數位之劍', type: 'weapon', atk: 25, price: 0, desc: '數據吞噬者掉落的特殊武器' },
    'trident': { id: 'trident', name: '深海三叉戟', type: 'weapon', atk: 50, price: 4000, desc: '深海異獸的稀有武器' },

    // === ARMOR ===
    'cloth-armor': { id: 'cloth-armor', name: '布甲', type: 'armor', def: 3, price: 40, desc: '薄薄的布製護甲' },
    'leather-armor': { id: 'leather-armor', name: '皮甲', type: 'armor', def: 8, price: 150, desc: '堅韌的皮革護甲' },
    'iron-armor': { id: 'iron-armor', name: '鐵甲', type: 'armor', def: 15, price: 400, desc: '沉重但堅固的鐵甲' },
    'shadow-armor': { id: 'shadow-armor', name: '暗影鎧甲', type: 'armor', def: 22, spd: 3, price: 1000, desc: '暗影之力強化的鎧甲' },
    'mech-armor': { id: 'mech-armor', name: '機械裝甲', type: 'armor', def: 35, price: 2500, desc: '高科技機械防護裝甲' },
    'storm-robe': { id: 'storm-robe', name: '風暴法袍', type: 'armor', def: 20, mp: 50, price: 3000, desc: '增強魔力的法袍' },
    'titanium-shield': { id: 'titanium-shield', name: '鈦合金盾', type: 'armor', def: 30, price: 2000, desc: '極其堅固的鈦合金盾牌' },
    'abyss-armor': { id: 'abyss-armor', name: '深淵鎧甲', type: 'armor', def: 45, hp: 200, price: 8000, desc: '深淵之力鍛造的傳說鎧甲' },

    // === ACCESSORIES ===
    'hp-ring': { id: 'hp-ring', name: '生命戒指', type: 'accessory', hp: 50, price: 300, desc: 'HP +50' },
    'mp-ring': { id: 'mp-ring', name: '魔力戒指', type: 'accessory', mp: 30, price: 300, desc: 'MP +30' },
    'atk-ring': { id: 'atk-ring', name: '力量戒指', type: 'accessory', atk: 8, price: 500, desc: 'ATK +8' },
    'def-ring': { id: 'def-ring', name: '防禦戒指', type: 'accessory', def: 8, price: 500, desc: 'DEF +8' },
    'spd-ring': { id: 'spd-ring', name: '速度戒指', type: 'accessory', spd: 8, price: 500, desc: 'SPD +8' },
    'chaos-ring': { id: 'chaos-ring', name: '混沌之戒', type: 'accessory', atk: 15, def: 10, price: 0, desc: 'Boss掉落的特殊戒指' },

    // === DIAMOND SHOP (premium) ===
    'divine-sword': { id: 'divine-sword', name: '神聖之劍', type: 'weapon', atk: 80, spd: 15, diamondPrice: 200, desc: '傳說中的聖劍，蘊含神聖之力' },
    'dragon-armor': { id: 'dragon-armor', name: '龍鱗鎧甲', type: 'armor', def: 60, hp: 500, diamondPrice: 250, desc: '以龍鱗鍛造的至高防具' },
    'exp-boost': { id: 'exp-boost', name: '經驗加成卷', type: 'consumable', subType: 'buff', value: 2, diamondPrice: 30, desc: '經驗值 x2，持續 30 分鐘' },
    'gold-boost': { id: 'gold-boost', name: '金幣加成卷', type: 'consumable', subType: 'buff', value: 2, diamondPrice: 30, desc: '金幣 x2，持續 30 分鐘' },
    'full-restore': { id: 'full-restore', name: '完全回復藥', type: 'consumable', subType: 'full', value: 9999, diamondPrice: 15, desc: '完全回復 HP 和 MP' },

    // === CURRENCY ===
    'diamond': { id: 'diamond', name: '鑽石', type: 'currency', sprite: 'item-diamond', desc: '高級貨幣，可在鑽石商城使用' },
};

// Shop inventories per city
export const SHOP_INVENTORY = {
    taipei: {
        weapon: ['wooden-bat', 'iron-sword'],
        armor: ['cloth-armor', 'leather-armor'],
        item: ['potion-s', 'mp-potion-s', 'antidote'],
        accessory: ['hp-ring', 'mp-ring'],
    },
    newTaipei: {
        weapon: ['iron-sword', 'steel-blade'],
        armor: ['leather-armor', 'iron-armor'],
        item: ['potion-s', 'potion-m', 'mp-potion-s', 'mp-potion-m', 'antidote'],
        accessory: ['hp-ring', 'mp-ring', 'atk-ring'],
    },
    taoyuan: {
        weapon: ['steel-blade', 'shadow-dagger', 'mech-blade'],
        armor: ['iron-armor', 'shadow-armor'],
        item: ['potion-m', 'mp-potion-m', 'antidote', 'revive'],
        accessory: ['atk-ring', 'def-ring', 'spd-ring'],
    },
    taichung: {
        weapon: ['mech-blade', 'wind-staff'],
        armor: ['shadow-armor', 'mech-armor', 'storm-robe'],
        item: ['potion-m', 'potion-l', 'mp-potion-m', 'mp-potion-l', 'revive'],
        accessory: ['atk-ring', 'def-ring', 'spd-ring'],
    },
    tainan: {
        weapon: ['wind-staff', 'temporal-blade'],
        armor: ['mech-armor', 'storm-robe'],
        item: ['potion-l', 'mp-potion-l', 'revive'],
        accessory: ['atk-ring', 'def-ring', 'spd-ring'],
    },
    kaohsiung: {
        weapon: ['temporal-blade', 'trident'],
        armor: ['storm-robe', 'abyss-armor'],
        item: ['potion-l', 'mp-potion-l', 'revive'],
        accessory: ['chaos-ring'],
    },
};

// Diamond shop (global)
export const DIAMOND_SHOP = [
    'divine-sword', 'dragon-armor', 'exp-boost', 'gold-boost', 'full-restore'
];
