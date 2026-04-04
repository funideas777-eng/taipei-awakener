// Story dialogue data for all scenes
export const STORY = {

    prologue: [
        {
            speaker: '旁白',
            text: '西元 2026 年，台北市內湖科技園區——'
        },
        {
            speaker: '旁白',
            text: '又是一個加班到晚上八點的平凡日子。'
        },
        {
            speaker: '劉艾博',
            text: '（嘆氣）終於把那個 Bug 修好了...該回家了。'
        },
        {
            speaker: '劉艾博',
            text: '每天就是這樣，寫 code、debug、開會、再寫 code...'
        },
        {
            speaker: '旁白',
            text: '劉艾博拖著疲憊的身軀，走向內湖捷運站。'
        },
        {
            speaker: '旁白',
            text: '然而，今夜注定不同尋常——'
        },
        {
            speaker: '???',
            text: '叮！',
            effect: 'flash'
        },
    ],

    awakening: [
        {
            speaker: '【系統】',
            text: '偵測到符合條件的宿主。',
            style: 'system'
        },
        {
            speaker: '【系統】',
            text: '覺醒程序啟動中...... 3%... 27%... 58%... 99%...',
            style: 'system'
        },
        {
            speaker: '【系統】',
            text: '覺醒完成。歡迎進入「覺醒者」系統。',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '什...什麼？我眼前怎麼出現了半透明的視窗？'
        },
        {
            speaker: '劉艾博',
            text: '這是...系統介面？像遊戲一樣的狀態面板？'
        },
        {
            speaker: '【系統】',
            text: '宿主：劉艾博\nLV.1 | HP: 100/100 | MP: 30/30\n固有能力：【程式碼解析】',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '程式碼解析...？我是工程師不錯，但這也太離譜了吧？'
        },
        {
            speaker: '【系統】',
            text: '警告：時空傳送門將於 30 秒後在附近生成。建議宿主做好戰鬥準備。',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '戰...戰鬥？什麼傳送門？等等——那是什麼光？！'
        },
    ],

    firstPortal: [
        {
            speaker: '旁白',
            text: '一道紫色光柱從內湖捷運站外的廣場上衝天而起，空間像是被撕開了一道裂縫。'
        },
        {
            speaker: '【系統】',
            text: 'E 級傳送門已生成。內含魔物：史萊姆（LV.1~3）。建議進入進行初次戰鬥訓練。',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '我一定是加班加到出幻覺了...但這個感覺太真實了。'
        },
        {
            speaker: '劉艾博',
            text: '好吧...既然系統說要戰鬥，那就試試看。反正我每天 debug 也是在戰鬥！'
        },
    ],

    tutorialBattle: [
        {
            speaker: '【系統】',
            text: '進入教學模式。\n\n戰鬥採回合制：\n「攻擊」- 基本物理攻擊\n「技能」- 消耗 MP 使用特殊能力\n「道具」- 使用背包中的物品\n「防禦」- 減少受到的傷害\n「逃跑」- 嘗試脫離戰鬥',
            style: 'system'
        },
        {
            speaker: '【系統】',
            text: '提示：使用【程式碼解析】技能可以看穿敵人的弱點屬性，這是你的固有能力。',
            style: 'system'
        },
    ],

    afterFirstBattle: [
        {
            speaker: '【系統】',
            text: '恭喜！首次戰鬥勝利。\n獲得：50 EXP、30 金幣、回復藥水 x1',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '我居然真的打贏了...這感覺好不真實。但身體裡好像有一股溫暖的力量在流動。'
        },
        {
            speaker: '【系統】',
            text: '等級提升！LV.1 → LV.2\nHP +20, MP +5, ATK +3',
            style: 'system'
        },
        {
            speaker: '劉艾博',
            text: '升級了？！這真的跟遊戲一模一樣！'
        },
    ],

    organizationContact: [
        {
            speaker: '旁白',
            text: '就在劉艾博沉浸在覺醒的驚奇中時，一通神秘的電話打了進來。'
        },
        {
            speaker: '???',
            text: '劉艾博先生，恭喜你覺醒了。'
        },
        {
            speaker: '劉艾博',
            text: '你是誰？你怎麼知道——'
        },
        {
            speaker: '???',
            text: '我是「覺醒者聯盟」的聯絡人。我們是一個由覺醒者組成的秘密組織。'
        },
        {
            speaker: '覺醒者聯盟',
            text: '你不是唯一一個。全台灣有數百名覺醒者，我們一直在暗中保護這個世界。'
        },
        {
            speaker: '覺醒者聯盟',
            text: '異次元的裂縫正在擴大，傳送門會在全台灣的主要城市出現，裡面的魔物越來越強。'
        },
        {
            speaker: '覺醒者聯盟',
            text: '每座城市都有一個「核心裂縫」，被強大的魔王把守。只有消滅魔王，才能淨化城市。'
        },
        {
            speaker: '覺醒者聯盟',
            text: '前往台北的「覺醒者公會」吧，那裡有更多資訊和任務。準備好的時候，去各城市戰鬥！'
        },
        {
            speaker: '劉艾博',
            text: '原來這個世界...一直有這樣的暗面存在。好，我會去公會的。'
        },
        {
            speaker: '【系統】',
            text: '主線任務開啟：【六都淨化】\n目標：消滅六座城市的核心魔王，淨化台灣。\n\n台北城市地圖已解鎖。',
            style: 'system'
        },
    ],

    // City-specific boss dialogues
    bossTaipei: {
        before: [
            { speaker: '數據吞噬者', text: '哈哈哈...又一個被科技奴役的可憐人類。' },
            { speaker: '數據吞噬者', text: '你們每天盯著螢幕，被數據淹沒，精神早已被我侵蝕！' },
            { speaker: '劉艾博', text: '身為工程師，我比誰都了解數據。你控制不了我！' },
        ],
        after: [
            { speaker: '【系統】', text: '台北核心裂縫已淨化！新北城市已解鎖。', style: 'system' },
            { speaker: '劉艾博', text: '呼...台北安全了。但這只是開始而已。' },
        ]
    },

    bossNewTaipei: {
        before: [
            { speaker: '混沌擴散者', text: '城市不斷膨脹...混亂不斷蔓延...這就是你們人類的命運。' },
            { speaker: '劉艾博', text: '成長不代表混亂，讓我來整理這團亂吧！' },
        ],
        after: [
            { speaker: '【系統】', text: '新北核心裂縫已淨化！桃園城市已解鎖。', style: 'system' },
        ]
    },

    bossTaoyuan: {
        before: [
            { speaker: '產線暴走體', text: '生產！生產！更多的生產！直到一切毀滅！' },
            { speaker: '劉艾博', text: '效率不是一切，讓我終止這條失控的產線！' },
        ],
        after: [
            { speaker: '【系統】', text: '桃園核心裂縫已淨化！台中城市已解鎖。', style: 'system' },
        ]
    },

    bossTaichung: {
        before: [
            { speaker: '空污巨靈', text: '呼吸吧...吸入我的毒霧...讓一切窒息！' },
            { speaker: '劉艾博', text: '為了台中的藍天，我不會讓你繼續肆虐！' },
        ],
        after: [
            { speaker: '【系統】', text: '台中核心裂縫已淨化！台南城市已解鎖。', style: 'system' },
        ]
    },

    bossTainan: {
        before: [
            { speaker: '歷史篡改者', text: '歷史是由勝者書寫的...讓我重新改寫這片土地的記憶。' },
            { speaker: '劉艾博', text: '歷史不容竄改！台南的文化記憶，我來守護！' },
        ],
        after: [
            { speaker: '【系統】', text: '台南核心裂縫已淨化！高雄城市已解鎖。', style: 'system' },
        ]
    },

    bossKaohsiung: {
        before: [
            { speaker: '深淵領主', text: '從海洋深處...我將吞噬這座港口，讓黑暗淹沒一切！' },
            { speaker: '劉艾博', text: '這是最後一戰了。為了整個台灣，我不會退縮！' },
        ],
        after: [
            { speaker: '【系統】', text: '高雄核心裂縫已淨化！全台灣六都淨化完成！', style: 'system' },
            { speaker: '覺醒者聯盟', text: '劉艾博，你做到了！全台灣的裂縫已經全部封閉。' },
            { speaker: '覺醒者聯盟', text: '但這不是結束...更強大的威脅正在醞釀。保持警覺。' },
            { speaker: '劉艾博', text: '我會的。從一個普通的工程師，到覺醒者...這段旅程改變了一切。' },
            { speaker: '【系統】', text: '恭喜通關！你的成就已記錄至排行榜。', style: 'system' },
        ]
    },

    // City introduction dialogs (first visit)
    cityIntro_taipei: [
        { speaker: '【系統】', text: '歡迎來到台北市——科技之都，覺醒的起點。', style: 'system' },
        { speaker: '旁白', text: '內湖科技園區充滿了數位能量，信義商圈高樓林立。然而，數據的暗流已經開始侵蝕這座城市。' },
        { speaker: '旁白', text: '這裡出沒的魔物以史萊姆和暗影兵為主，數據吞噬者在暗處伺機而動。' },
        { speaker: '【系統】', text: '建議先到覺醒者公會接取任務，並到商店準備裝備。', style: 'system' },
    ],
    cityIntro_newTaipei: [
        { speaker: '【系統】', text: '抵達新北市——廣闊而混沌的都市叢林。', style: 'system' },
        { speaker: '旁白', text: '新北是全台人口最多的城市，老舊巷弄與新建大樓交錯。混沌之力在這裡特別活躍。' },
        { speaker: '旁白', text: '暗影騎士在此巡邏，混沌擴散者企圖將整座城市吞噬入混亂之中。' },
    ],
    cityIntro_taoyuan: [
        { speaker: '【系統】', text: '抵達桃園市——工業重鎮，機械迷宮的所在。', style: 'system' },
        { speaker: '旁白', text: '桃園的工廠區深處，失控的自動化產線已經成為新的威脅。機械無人機在天空盤旋。' },
        { speaker: '旁白', text: '產線暴走體正在不斷製造更多的機械兵，必須盡快阻止它。' },
    ],
    cityIntro_taichung: [
        { speaker: '【系統】', text: '抵達台中市——風暴之地，空氣中瀰漫著危險的氣息。', style: 'system' },
        { speaker: '旁白', text: '台中的天空被詭異的霧氣籠罩，毒霧精靈在工業區出沒。空污巨靈的力量正在擴張。' },
        { speaker: '旁白', text: '小心毒霧精靈的毒素攻擊，建議準備解毒藥品。' },
    ],
    cityIntro_tainan: [
        { speaker: '【系統】', text: '抵達台南市——古都，歷史與魔法交織之處。', style: 'system' },
        { speaker: '旁白', text: '台南的古蹟中隱藏著時空裂縫，幽靈在府城的巷弄間遊蕩。歷史篡改者企圖改寫這片土地的記憶。' },
        { speaker: '旁白', text: '這裡的敵人擅長時間系魔法，要格外小心時間停止的效果。' },
    ],
    cityIntro_kaohsiung: [
        { speaker: '【系統】', text: '抵達高雄市——港口之城，最終決戰之地。', style: 'system' },
        { speaker: '旁白', text: '高雄港口被深淵之力籠罩，海底深處不斷湧出異界生物。深淵領主在此等候最終對決。' },
        { speaker: '旁白', text: '這是六都中最危險的城市，深海異獸和幽靈是主要威脅。做好萬全準備再挑戰魔王。' },
    ],

    // Boss victory + citizen gratitude dialogs
    bossVictory_taipei: [
        { speaker: '旁白', text: '隨著數據吞噬者的消滅，籠罩台北的數位暗流消散了。' },
        { speaker: '台北市民A', text: '你看！天空中那些奇怪的光消失了！' },
        { speaker: '台北市民B', text: '聽說是一位覺醒者打敗了魔王！真是太感謝了！' },
        { speaker: '台北市民C', text: '我們科技園區終於可以安心工作了，謝謝你，英雄！' },
        { speaker: '劉艾博', text: '不用客氣，保護這座城市是覺醒者的責任。' },
        { speaker: '【系統】', text: '台北市已淨化。新北市傳送門已開啟。', style: 'system' },
    ],
    bossVictory_newTaipei: [
        { speaker: '旁白', text: '混沌擴散者倒下，新北的街道恢復了秩序。' },
        { speaker: '新北市民', text: '太好了！那些可怕的暗影終於消失了！' },
        { speaker: '新北市民', text: '覺醒者大人，真的非常感謝你拯救了我們的城市！' },
        { speaker: '劉艾博', text: '還有更多城市需要拯救，我會繼續前進的。' },
    ],
    bossVictory_taoyuan: [
        { speaker: '旁白', text: '失控的產線終於停止了運作，桃園恢復了平靜。' },
        { speaker: '桃園市民', text: '工廠終於不再發出那種可怕的聲音了！' },
        { speaker: '桃園市民', text: '英雄先生，桃園的所有人都感謝你！' },
        { speaker: '劉艾博', text: '（微笑）能幫上忙就好。接下來要去台中了。' },
    ],
    bossVictory_taichung: [
        { speaker: '旁白', text: '空污巨靈消散，台中的天空終於露出了久違的藍色。' },
        { speaker: '台中市民', text: '好久沒看到這麼藍的天空了...謝謝你！' },
        { speaker: '台中市民', text: '覺醒者，我們以你為榮！台中人永遠感謝你！' },
        { speaker: '劉艾博', text: '看到藍天回來，一切都值得了。' },
    ],
    bossVictory_tainan: [
        { speaker: '旁白', text: '歷史篡改者被擊敗，台南的古蹟恢復了原本的風貌。' },
        { speaker: '台南市民', text: '赤崁樓和安平古堡的時空裂縫都消失了！' },
        { speaker: '台南市民', text: '感謝覺醒者守護了台南的歷史與文化！' },
        { speaker: '劉艾博', text: '歷史不容篡改，這是我的信念。只剩高雄了...' },
    ],
    bossVictory_kaohsiung: [
        { speaker: '旁白', text: '深淵領主倒下，高雄港重新恢復了寧靜。海水從混濁變回清澈。' },
        { speaker: '高雄市民', text: '海港的異變終於結束了！我們的城市得救了！' },
        { speaker: '高雄市民', text: '覺醒者，你是全台灣的英雄！' },
        { speaker: '劉艾博', text: '六座城市...全部淨化完成了。終於可以鬆一口氣了——' },
    ],

    // Final boss storyline
    finalBossPrelude: [
        { speaker: '旁白', text: '就在劉艾博以為一切終於結束的時候——' },
        { speaker: '旁白', text: '六都的傳送門全部消失了。台灣恢復了和平。人們開始慶祝。' },
        { speaker: '旁白', text: '然而，一週後——' },
        { speaker: '【緊急新聞】', text: '各位觀眾，台北市上空出現了一個前所未見的巨大傳送門！', style: 'system' },
        { speaker: '【緊急新聞】', text: '政府已發布緊急警報！軍隊正在台北101周邊設立防線！', style: 'system' },
        { speaker: '【緊急新聞】', text: '這個傳送門的規模是之前所有傳送門的百倍以上！全台灣人民都在恐懼中等待...', style: 'system' },
        { speaker: '覺醒者聯盟', text: '劉艾博！情況緊急！台北上空出現了超巨大傳送門！' },
        { speaker: '覺醒者聯盟', text: '我們的探測顯示，這個傳送門的能量等級...是異次元最高等級的存在！' },
        { speaker: '覺醒者聯盟', text: '全台灣的人都指望你了。請立刻前往台北101！' },
        { speaker: '劉艾博', text: '我知道了。從覺醒到現在，就是為了這一刻。我這就去！' },
    ],
    finalBossBattle: [
        { speaker: '旁白', text: '劉艾博站在台北101的觀景台上，抬頭仰望那遮蔽天空的巨大傳送門。' },
        { speaker: '旁白', text: '突然，傳送門中射出一道金色光柱——' },
        { speaker: '旁白', text: '一個身穿華麗西裝、頂著一頭金髮、膚色橘得不可思議的身影緩緩走出。' },
        { speaker: '???', text: '...' },
        { speaker: '異界霸主・川普', text: 'Well, well, well... 你就是消滅了我六個手下的人類？' },
        { speaker: '異界霸主・川普', text: 'Let me tell you something — Nobody, and I mean NOBODY, messes with my portals!' },
        { speaker: '劉艾博', text: '你是...什麼人？' },
        { speaker: '異界霸主・川普', text: 'I am the GREATEST dimensional overlord, EVER. Everybody says so!' },
        { speaker: '異界霸主・川普', text: 'And YOU... 指著劉艾博' },
        { speaker: '異界霸主・川普', text: 'YOU ARE FIRED!!!' },
        { speaker: '異界霸主・川普', text: '看我的必殺技——「對等關稅」！讓你見識什麼叫做真正的力量！' },
        { speaker: '劉艾博', text: '不管你是誰，我不會讓你毀滅台灣！來吧！！' },
    ],
    finalBossVictory: [
        { speaker: '異界霸主・川普', text: 'Im...Impossible! How could I lose to a... a programmer?!' },
        { speaker: '異界霸主・川普', text: 'This is... FAKE NEWS!!! This result is RIGGED!!!' },
        { speaker: '旁白', text: '隨著最後一擊，異界霸主・川普的身體開始崩解。' },
        { speaker: '異界霸主・川普', text: 'I... I will be back... Make the dimensions great aga——' },
        { speaker: '旁白', text: '巨大的傳送門開始劇烈震動，一道白光從中迸射而出——' },
        { speaker: '旁白', text: '白光吞噬了一切。台北101、城市、天空...全部被光芒淹沒。' },
        { speaker: '劉艾博', text: '啊啊啊啊！！！' },
    ],
    finalEnding: [
        { speaker: '旁白', text: '............' },
        { speaker: '旁白', text: '嗶嗶嗶嗶嗶——' },
        { speaker: '旁白', text: '鬧鐘的聲音刺耳地響著。' },
        { speaker: '劉艾博', text: '唔...（揉眼睛）' },
        { speaker: '旁白', text: '劉艾博睜開了眼睛。' },
        { speaker: '旁白', text: '熟悉的天花板。熟悉的小套房。內湖的早晨陽光透過窗簾灑進來。' },
        { speaker: '劉艾博', text: '我...我在房間裡？那些傳送門、魔物、戰鬥...全部都是...' },
        { speaker: '劉艾博', text: '夢？！那一切都是夢嗎？！' },
        { speaker: '旁白', text: '劉艾博看了看自己的手。沒有系統面板。沒有覺醒者的力量。' },
        { speaker: '劉艾博', text: '（嘆氣）原來這一切...都是一場夢啊。' },
        { speaker: '劉艾博', text: '不過，好真實的夢。如果是真的就好了...' },
        { speaker: '旁白', text: '就在他準備起床上班的時候——' },
        { speaker: '???', text: '叮！', effect: 'flash' },
        { speaker: '【系統】', text: '偵測到宿主意識回歸。', style: 'system' },
        { speaker: '【系統】', text: '任務重啟選項已開放。', style: 'system' },
        { speaker: '【系統】', text: '是否要重新開始冒險？', style: 'system' },
        { speaker: '劉艾博', text: '！！！這個聲音...系統？！' },
        { speaker: '【系統】', text: '「台北覺醒者」任務完成。\n\n感謝遊玩！\n期待下一個挑戰的開始。', style: 'system' },
    ],

    // Boss battle intro key for final boss
    bossFinal: {
        before: [
            { speaker: '異界霸主・川普', text: 'You are FIRED!' },
            { speaker: '異界霸主・川普', text: '看我的必殺技——對等關稅！' },
            { speaker: '劉艾博', text: '不管你是誰，我不會讓你毀滅台灣！' },
        ],
        after: [
            { speaker: '【系統】', text: '恭喜！最終Boss已被擊敗！', style: 'system' },
        ]
    },
};
