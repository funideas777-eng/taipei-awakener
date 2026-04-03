// Quest data
export const QUESTS = {
    // Main quests
    main_taipei: {
        id: 'main_taipei', type: 'main', city: 'taipei',
        name: '淨化台北', desc: '消滅數據吞噬者，淨化台北的核心裂縫。',
        objectives: [{ type: 'kill_boss', target: 'boss_data_devourer', count: 1 }],
        rewards: { exp: 500, gold: 500, diamonds: 10, items: ['digital-blade'], unlockCity: 'newTaipei' },
    },
    main_newTaipei: {
        id: 'main_newTaipei', type: 'main', city: 'newTaipei',
        name: '淨化新北', desc: '消滅混沌擴散者，淨化新北的核心裂縫。',
        objectives: [{ type: 'kill_boss', target: 'boss_chaos', count: 1 }],
        rewards: { exp: 1200, gold: 1000, diamonds: 15, unlockCity: 'taoyuan' },
    },
    main_taoyuan: {
        id: 'main_taoyuan', type: 'main', city: 'taoyuan',
        name: '淨化桃園', desc: '消滅產線暴走體，淨化桃園的核心裂縫。',
        objectives: [{ type: 'kill_boss', target: 'boss_mech_overlord', count: 1 }],
        rewards: { exp: 2000, gold: 1500, diamonds: 20, unlockCity: 'taichung' },
    },
    main_taichung: {
        id: 'main_taichung', type: 'main', city: 'taichung',
        name: '淨化台中', desc: '消滅空污巨靈，淨化台中的核心裂縫。',
        objectives: [{ type: 'kill_boss', target: 'boss_smog_giant', count: 1 }],
        rewards: { exp: 3000, gold: 2000, diamonds: 25, unlockCity: 'tainan' },
    },
    main_tainan: {
        id: 'main_tainan', type: 'main', city: 'tainan',
        name: '淨化台南', desc: '消滅歷史篡改者，淨化台南的核心裂縫。',
        objectives: [{ type: 'kill_boss', target: 'boss_time_corruptor', count: 1 }],
        rewards: { exp: 4000, gold: 3000, diamonds: 30, unlockCity: 'kaohsiung' },
    },
    main_kaohsiung: {
        id: 'main_kaohsiung', type: 'main', city: 'kaohsiung',
        name: '淨化高雄', desc: '消滅深淵領主，完成全台灣的淨化。',
        objectives: [{ type: 'kill_boss', target: 'boss_abyss_lord', count: 1 }],
        rewards: { exp: 8000, gold: 5000, diamonds: 50 },
    },

    // Side quests
    side_slime_hunt: {
        id: 'side_slime_hunt', type: 'side', city: 'taipei',
        name: '史萊姆討伐', desc: '在台北周遭討伐 5 隻史萊姆。',
        objectives: [{ type: 'kill', target: 'slime', count: 5 }],
        rewards: { exp: 100, gold: 80, items: ['potion-s', 'potion-s', 'potion-s'] },
        repeatable: true,
    },
    side_shadow_patrol: {
        id: 'side_shadow_patrol', type: 'side', city: 'newTaipei',
        name: '暗影巡邏', desc: '消滅 3 隻暗影兵。',
        objectives: [{ type: 'kill', target: 'shadow_soldier', count: 3 }],
        rewards: { exp: 250, gold: 200 },
        repeatable: true,
    },
    side_mech_scrap: {
        id: 'side_mech_scrap', type: 'side', city: 'taoyuan',
        name: '機械回收', desc: '收集 5 個機械零件。',
        objectives: [{ type: 'collect', target: 'mech-parts', count: 5 }],
        rewards: { exp: 400, gold: 350, items: ['energy-core'] },
        repeatable: true,
    },
    side_toxic_cleanup: {
        id: 'side_toxic_cleanup', type: 'side', city: 'taichung',
        name: '毒霧清除', desc: '消滅 5 隻毒霧精靈。',
        objectives: [{ type: 'kill', target: 'smog_wisp', count: 5 }],
        rewards: { exp: 600, gold: 500 },
        repeatable: true,
    },
    side_ghost_exorcism: {
        id: 'side_ghost_exorcism', type: 'side', city: 'tainan',
        name: '驅魂任務', desc: '消滅 3 隻幽靈。',
        objectives: [{ type: 'kill', target: 'ghost_spirit', count: 3 }],
        rewards: { exp: 900, gold: 700, items: ['time-crystal'] },
        repeatable: true,
    },
    side_deep_dive: {
        id: 'side_deep_dive', type: 'side', city: 'kaohsiung',
        name: '深海探索', desc: '消滅 3 隻深海異獸。',
        objectives: [{ type: 'kill', target: 'deepsea_creature', count: 3 }],
        rewards: { exp: 1500, gold: 1200, items: ['abyss-pearl'] },
        repeatable: true,
    },
};
