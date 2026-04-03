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
};
