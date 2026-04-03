// Programmatic pixel sprite generator using Canvas API
export class SpriteGenerator {

    static generateAll(scene) {
        this.generatePlayerSprite(scene);
        this.generateMonsterSprites(scene);
        this.generateTileSprites(scene);
        this.generateUISprites(scene);
        this.generateBuildingSprites(scene);
        this.generatePortalSprite(scene);
        this.generateNPCSprites(scene);
        this.generateItemSprites(scene);
    }

    // --- PLAYER ---
    static generatePlayerSprite(scene) {
        const frameW = 24, frameH = 32;
        const directions = ['down', 'left', 'right', 'up'];
        const canvas = document.createElement('canvas');
        canvas.width = frameW * 3;
        canvas.height = frameH * 4;
        const ctx = canvas.getContext('2d');

        directions.forEach((dir, row) => {
            for (let frame = 0; frame < 3; frame++) {
                const ox = frame * frameW;
                const oy = row * frameH;
                const legOffset = frame === 1 ? 0 : (frame === 0 ? -1 : 1);
                // Hair
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(ox + 7, oy + 1, 10, 5);
                // Head
                ctx.fillStyle = '#f5d0a9';
                ctx.fillRect(ox + 8, oy + 4, 8, 8);
                // Eyes
                if (dir !== 'up') {
                    ctx.fillStyle = '#00d4ff';
                    if (dir === 'down') {
                        ctx.fillRect(ox + 9, oy + 7, 2, 2);
                        ctx.fillRect(ox + 13, oy + 7, 2, 2);
                    } else if (dir === 'left') {
                        ctx.fillRect(ox + 8, oy + 7, 2, 2);
                    } else {
                        ctx.fillRect(ox + 14, oy + 7, 2, 2);
                    }
                }
                // Body (office shirt)
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(ox + 7, oy + 12, 10, 10);
                // Tie
                ctx.fillStyle = '#2196F3';
                ctx.fillRect(ox + 11, oy + 12, 2, 8);
                // Arms
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(ox + 5, oy + 13, 2, 7);
                ctx.fillRect(ox + 17, oy + 13, 2, 7);
                // Pants
                ctx.fillStyle = '#2d2d2d';
                ctx.fillRect(ox + 8, oy + 22, 4, 6);
                ctx.fillRect(ox + 12, oy + 22, 4, 6);
                // Leg animation
                if (legOffset !== 0) {
                    ctx.fillRect(ox + 8, oy + 22 + legOffset, 4, 6);
                }
                // Shoes
                ctx.fillStyle = '#4a4a4a';
                ctx.fillRect(ox + 8, oy + 28, 4, 2);
                ctx.fillRect(ox + 12, oy + 28, 4, 2);
                // Awakening glow (subtle)
                ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
                ctx.fillRect(ox + 5, oy + 2, 14, 28);
            }
        });

        scene.textures.addCanvas('player', canvas);
        // Create spritesheet frames
        const tex = scene.textures.get('player');
        tex.add('walk-down-0', 0, 0, 0, frameW, frameH);
        tex.add('walk-down-1', 0, frameW, 0, frameW, frameH);
        tex.add('walk-down-2', 0, frameW * 2, 0, frameW, frameH);
        tex.add('walk-left-0', 0, 0, frameH, frameW, frameH);
        tex.add('walk-left-1', 0, frameW, frameH, frameW, frameH);
        tex.add('walk-left-2', 0, frameW * 2, frameH, frameW, frameH);
        tex.add('walk-right-0', 0, 0, frameH * 2, frameW, frameH);
        tex.add('walk-right-1', 0, frameW, frameH * 2, frameW, frameH);
        tex.add('walk-right-2', 0, frameW * 2, frameH * 2, frameW, frameH);
        tex.add('walk-up-0', 0, 0, frameH * 3, frameW, frameH);
        tex.add('walk-up-1', 0, frameW, frameH * 3, frameW, frameH);
        tex.add('walk-up-2', 0, frameW * 2, frameH * 3, frameW, frameH);

        // Create spritesheet config for animations
        scene.textures.addSpriteSheet('player-sheet', canvas, { frameWidth: frameW, frameHeight: frameH });
    }

    // --- MONSTERS ---
    static generateMonsterSprites(scene) {
        this._genSlime(scene);
        this._genShadowSoldier(scene);
        this._genMechBot(scene);
        this._genSmogSpirit(scene);
        this._genGhost(scene);
        this._genDeepSeaBeast(scene);
        this._genBossDataDevourer(scene);
        this._genBossChaos(scene);
        this._genBossMechOverlord(scene);
        this._genBossSmogGiant(scene);
        this._genBossTimeCorruptor(scene);
        this._genBossAbyssLord(scene);
    }

    static _genSlime(scene) {
        const c = document.createElement('canvas');
        c.width = 24; c.height = 24;
        const ctx = c.getContext('2d');
        // Body
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.ellipse(12, 15, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(8, 12, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(8, 14, 2, 2);
        ctx.fillRect(14, 14, 2, 2);
        scene.textures.addCanvas('monster-slime', c);
    }

    static _genShadowSoldier(scene) {
        const c = document.createElement('canvas');
        c.width = 24; c.height = 32;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(8, 2, 8, 8); // head
        ctx.fillRect(6, 10, 12, 12); // body
        ctx.fillRect(8, 22, 3, 8); // legs
        ctx.fillRect(13, 22, 3, 8);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(10, 5, 2, 2); // eyes
        ctx.fillRect(14, 5, 2, 2);
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(3, 12, 3, 8); // sword
        scene.textures.addCanvas('monster-shadow', c);
    }

    static _genMechBot(scene) {
        const c = document.createElement('canvas');
        c.width = 28; c.height = 28;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(6, 2, 16, 12); // head
        ctx.fillRect(4, 14, 20, 10); // body
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(9, 5, 3, 3); // eyes
        ctx.fillRect(16, 5, 3, 3);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(12, 16, 4, 4); // core
        ctx.fillRect(2, 16, 2, 6); // arms
        ctx.fillRect(24, 16, 2, 6);
        scene.textures.addCanvas('monster-mech', c);
    }

    static _genSmogSpirit(scene) {
        const c = document.createElement('canvas');
        c.width = 28; c.height = 28;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(128,128,128,0.7)';
        ctx.beginPath();
        ctx.ellipse(14, 16, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(100,100,100,0.5)';
        ctx.beginPath();
        ctx.ellipse(10, 8, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(9, 13, 3, 2);
        ctx.fillRect(16, 13, 3, 2);
        scene.textures.addCanvas('monster-smog', c);
    }

    static _genGhost(scene) {
        const c = document.createElement('canvas');
        c.width = 24; c.height = 28;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(12, 10, 8, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(4, 10, 16, 14);
        // wavy bottom
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.ellipse(6 + i * 4, 24, 2, 3, 0, 0, Math.PI);
            ctx.fill();
        }
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(8, 8, 3, 3);
        ctx.fillRect(14, 8, 3, 3);
        scene.textures.addCanvas('monster-ghost', c);
    }

    static _genDeepSeaBeast(scene) {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 28;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#1a5276';
        ctx.beginPath();
        ctx.ellipse(16, 16, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // tentacles
        ctx.fillStyle = '#1a6e8e';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(4 + i * 6, 22, 2, 6);
        }
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(10, 12, 3, 3);
        ctx.fillRect(19, 12, 3, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(14, 16, 4, 2); // mouth
        scene.textures.addCanvas('monster-deepsea', c);
    }

    // --- BOSSES (larger sprites 48x48) ---
    static _genBossDataDevourer(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        // Digital body
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(8, 8, 32, 32);
        // Circuit patterns
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(10 + i * 6, 10);
            ctx.lineTo(10 + i * 6, 38);
            ctx.stroke();
        }
        // Glowing red eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(16, 18, 5, 5);
        ctx.fillRect(27, 18, 5, 5);
        // Data streams
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(4, 12, 3, 2);
        ctx.fillRect(41, 20, 3, 2);
        ctx.fillRect(4, 30, 3, 2);
        ctx.fillRect(41, 34, 3, 2);
        // Mouth
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(18, 30, 12, 4);
        scene.textures.addCanvas('boss-data-devourer', c);
    }

    static _genBossChaos(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#2c003e';
        ctx.beginPath();
        ctx.ellipse(24, 24, 20, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        // Chaos tendrils
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(24, 24);
            ctx.lineTo(24 + Math.cos(angle) * 22, 24 + Math.sin(angle) * 22);
            ctx.stroke();
        }
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(17, 20, 4, 4);
        ctx.fillRect(27, 20, 4, 4);
        scene.textures.addCanvas('boss-chaos', c);
    }

    static _genBossMechOverlord(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(12, 4, 24, 16); // head
        ctx.fillRect(8, 20, 32, 20); // body
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(16, 8, 5, 5);
        ctx.fillRect(27, 8, 5, 5);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(20, 26, 8, 8); // core
        // Arms with weapons
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(2, 22, 6, 16);
        ctx.fillRect(40, 22, 6, 16);
        scene.textures.addCanvas('boss-mech-overlord', c);
    }

    static _genBossSmogGiant(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(100,100,100,0.8)';
        ctx.beginPath();
        ctx.ellipse(24, 28, 20, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(24, 12, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f44336';
        ctx.fillRect(17, 9, 4, 4);
        ctx.fillRect(27, 9, 4, 4);
        // Toxic particles
        ctx.fillStyle = '#8bc34a';
        ctx.fillRect(6, 6, 2, 2);
        ctx.fillRect(38, 10, 2, 2);
        ctx.fillRect(10, 40, 2, 2);
        ctx.fillRect(36, 38, 2, 2);
        scene.textures.addCanvas('boss-smog-giant', c);
    }

    static _genBossTimeCorruptor(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        // Hooded figure
        ctx.fillStyle = '#4a0080';
        ctx.beginPath();
        ctx.moveTo(24, 2);
        ctx.lineTo(8, 16);
        ctx.lineTo(8, 44);
        ctx.lineTo(40, 44);
        ctx.lineTo(40, 16);
        ctx.closePath();
        ctx.fill();
        // Face void
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(24, 16, 8, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Glowing eyes
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(19, 14, 3, 3);
        ctx.fillRect(26, 14, 3, 3);
        // Time symbols
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(24, 34, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(24, 28);
        ctx.lineTo(24, 34);
        ctx.lineTo(28, 34);
        ctx.stroke();
        scene.textures.addCanvas('boss-time-corruptor', c);
    }

    static _genBossAbyssLord(scene) {
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(10, 4, 28, 20); // head
        ctx.fillRect(6, 24, 36, 20); // body
        // Crown/horns
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(10, 0, 4, 6);
        ctx.fillRect(34, 0, 4, 6);
        // Eyes
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(16, 10, 5, 5);
        ctx.fillRect(27, 10, 5, 5);
        // Abyss core
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.ellipse(24, 34, 6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tentacles
        ctx.fillStyle = '#1a3a5c';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(8 + i * 6, 44, 3, 4);
        }
        scene.textures.addCanvas('boss-abyss-lord', c);
    }

    // --- TILES ---
    static generateTileSprites(scene) {
        const tileSize = 32;

        // Floor tile
        let c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        let ctx = c.getContext('2d');
        ctx.fillStyle = '#3d3d3d';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.strokeStyle = '#4a4a4a';
        ctx.strokeRect(0, 0, tileSize, tileSize);
        scene.textures.addCanvas('tile-floor', c);

        // Wall tile
        c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#5d4e37';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillStyle = '#6d5e47';
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillRect(18, 2, 12, 12);
        ctx.fillRect(8, 18, 12, 12);
        ctx.strokeStyle = '#4a3f2f';
        ctx.strokeRect(0, 0, tileSize, tileSize);
        scene.textures.addCanvas('tile-wall', c);

        // Grass tile
        c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#4a7c59';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillStyle = '#5a8c69';
        ctx.fillRect(4, 6, 2, 4);
        ctx.fillRect(14, 20, 2, 4);
        ctx.fillRect(24, 10, 2, 4);
        scene.textures.addCanvas('tile-grass', c);

        // Road tile
        c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillStyle = '#707070';
        ctx.fillRect(14, 0, 4, tileSize);
        scene.textures.addCanvas('tile-road', c);

        // Water tile
        c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(4, 8, 12, 2);
        ctx.fillRect(18, 20, 10, 2);
        scene.textures.addCanvas('tile-water', c);

        // Chest
        c = document.createElement('canvas');
        c.width = 24; c.height = 20;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(2, 4, 20, 14);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(2, 4, 20, 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(10, 8, 4, 4);
        scene.textures.addCanvas('tile-chest', c);

        // Door
        c = document.createElement('canvas');
        c.width = tileSize; c.height = tileSize;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#5d4e37';
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(6, 2, 20, 28);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(22, 16, 3, 3);
        scene.textures.addCanvas('tile-door', c);
    }

    // --- UI ---
    static generateUISprites(scene) {
        // Button background
        let c = document.createElement('canvas');
        c.width = 160; c.height = 40;
        let ctx = c.getContext('2d');
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 160, 40);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 158, 38);
        scene.textures.addCanvas('ui-button', c);

        // Button hover
        c = document.createElement('canvas');
        c.width = 160; c.height = 40;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, 160, 40);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 158, 38);
        scene.textures.addCanvas('ui-button-hover', c);

        // Dialog box
        c = document.createElement('canvas');
        c.width = 700; c.height = 160;
        ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(10, 10, 30, 0.92)';
        ctx.fillRect(0, 0, 700, 160);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 696, 156);
        scene.textures.addCanvas('ui-dialog', c);

        // HP bar background
        c = document.createElement('canvas');
        c.width = 200; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 200, 16);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(0, 0, 200, 16);
        scene.textures.addCanvas('ui-bar-bg', c);

        // HP bar fill
        c = document.createElement('canvas');
        c.width = 196; c.height = 12;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(0, 0, 196, 12);
        scene.textures.addCanvas('ui-bar-hp', c);

        // MP bar fill
        c = document.createElement('canvas');
        c.width = 196; c.height = 12;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, 0, 196, 12);
        scene.textures.addCanvas('ui-bar-mp', c);

        // EXP bar fill
        c = document.createElement('canvas');
        c.width = 196; c.height = 12;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(0, 0, 196, 12);
        scene.textures.addCanvas('ui-bar-exp', c);

        // System window (awakening style)
        c = document.createElement('canvas');
        c.width = 500; c.height = 300;
        ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(0, 10, 30, 0.95)';
        ctx.fillRect(0, 0, 500, 300);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 496, 296);
        // Corner accents
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(2, 2, 20, 2);
        ctx.fillRect(2, 2, 2, 20);
        ctx.fillRect(478, 2, 20, 2);
        ctx.fillRect(496, 2, 2, 20);
        ctx.fillRect(2, 296, 20, 2);
        ctx.fillRect(2, 278, 2, 20);
        ctx.fillRect(478, 296, 20, 2);
        ctx.fillRect(496, 278, 2, 20);
        scene.textures.addCanvas('ui-system-window', c);

        // Panel
        c = document.createElement('canvas');
        c.width = 300; c.height = 400;
        ctx = c.getContext('2d');
        ctx.fillStyle = 'rgba(10, 10, 30, 0.92)';
        ctx.fillRect(0, 0, 300, 400);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 298, 398);
        scene.textures.addCanvas('ui-panel', c);
    }

    // --- BUILDINGS ---
    static generateBuildingSprites(scene) {
        const buildings = [
            { key: 'building-weapon', color: '#c0392b', icon: 'W', label: '武器店' },
            { key: 'building-armor', color: '#2980b9', icon: 'A', label: '防具店' },
            { key: 'building-item', color: '#27ae60', icon: 'I', label: '道具店' },
            { key: 'building-magic', color: '#8e44ad', icon: 'M', label: '魔咒學院' },
            { key: 'building-inn', color: '#d35400', icon: 'R', label: '酒館' },
            { key: 'building-guild', color: '#f1c40f', icon: 'G', label: '公會' },
            { key: 'building-diamond', color: '#00bcd4', icon: 'D', label: '鑽石商城' },
        ];

        buildings.forEach(b => {
            const c = document.createElement('canvas');
            c.width = 48; c.height = 48;
            const ctx = c.getContext('2d');
            // Building body
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(4, 12, 40, 32);
            // Roof
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(0, 16);
            ctx.lineTo(24, 0);
            ctx.lineTo(48, 16);
            ctx.closePath();
            ctx.fill();
            // Door
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(18, 30, 12, 14);
            // Sign
            ctx.fillStyle = b.color;
            ctx.fillRect(10, 18, 28, 10);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.label, 24, 26);
            scene.textures.addCanvas(b.key, c);
        });
    }

    // --- PORTAL ---
    static generatePortalSprite(scene) {
        const c = document.createElement('canvas');
        c.width = 40; c.height = 48;
        const ctx = c.getContext('2d');
        // Outer ring
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(20, 24, 16, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Inner glow
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.beginPath();
        ctx.ellipse(20, 24, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = 'rgba(142, 68, 173, 0.5)';
        ctx.beginPath();
        ctx.ellipse(20, 24, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rank text area
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('E', 20, 28);
        scene.textures.addCanvas('portal', c);

        // Portal per rank
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];
        const colors = ['#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#f44336', '#ff0000'];
        ranks.forEach((rank, i) => {
            const pc = document.createElement('canvas');
            pc.width = 40; pc.height = 48;
            const pctx = pc.getContext('2d');
            pctx.strokeStyle = colors[i];
            pctx.lineWidth = 3;
            pctx.beginPath();
            pctx.ellipse(20, 24, 16, 20, 0, 0, Math.PI * 2);
            pctx.stroke();
            pctx.fillStyle = colors[i] + '40';
            pctx.beginPath();
            pctx.ellipse(20, 24, 12, 16, 0, 0, Math.PI * 2);
            pctx.fill();
            pctx.fillStyle = '#fff';
            pctx.font = 'bold 16px monospace';
            pctx.textAlign = 'center';
            pctx.fillText(rank, 20, 29);
            scene.textures.addCanvas(`portal-${rank}`, pc);
        });
    }

    // --- NPCs ---
    static generateNPCSprites(scene) {
        const npcs = [
            { key: 'npc-guild-master', hairColor: '#c0392b', shirtColor: '#2c3e50' },
            { key: 'npc-shopkeeper', hairColor: '#8B4513', shirtColor: '#27ae60' },
            { key: 'npc-mage', hairColor: '#9b59b6', shirtColor: '#4a0080' },
            { key: 'npc-innkeeper', hairColor: '#d35400', shirtColor: '#8B4513' },
            { key: 'npc-mysterious', hairColor: '#1a1a1a', shirtColor: '#1a1a2e' },
        ];

        npcs.forEach(npc => {
            const c = document.createElement('canvas');
            c.width = 24; c.height = 32;
            const ctx = c.getContext('2d');
            ctx.fillStyle = npc.hairColor;
            ctx.fillRect(7, 1, 10, 5);
            ctx.fillStyle = '#f5d0a9';
            ctx.fillRect(8, 4, 8, 8);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(9, 7, 2, 2);
            ctx.fillRect(13, 7, 2, 2);
            ctx.fillStyle = npc.shirtColor;
            ctx.fillRect(6, 12, 12, 10);
            ctx.fillRect(4, 13, 2, 7);
            ctx.fillRect(18, 13, 2, 7);
            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(8, 22, 4, 8);
            ctx.fillRect(12, 22, 4, 8);
            scene.textures.addCanvas(npc.key, c);
        });
    }

    // --- ITEM ICONS ---
    static generateItemSprites(scene) {
        // Sword
        let c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        let ctx = c.getContext('2d');
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(7, 1, 2, 10);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(5, 11, 6, 2);
        ctx.fillRect(6, 13, 4, 2);
        scene.textures.addCanvas('item-sword', c);

        // Shield
        c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(2, 4);
        ctx.lineTo(2, 10);
        ctx.lineTo(8, 15);
        ctx.lineTo(14, 10);
        ctx.lineTo(14, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(7, 6, 2, 4);
        ctx.fillRect(5, 8, 6, 2);
        scene.textures.addCanvas('item-shield', c);

        // Potion
        c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(6, 1, 4, 3);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(8, 11, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(6, 4, 4, 4);
        scene.textures.addCanvas('item-potion', c);

        // MP Potion
        c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(6, 1, 4, 3);
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(8, 11, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(6, 4, 4, 4);
        scene.textures.addCanvas('item-mp-potion', c);

        // Diamond
        c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(2, 6);
        ctx.lineTo(8, 15);
        ctx.lineTo(14, 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(4, 6);
        ctx.lineTo(8, 10);
        ctx.closePath();
        ctx.fill();
        scene.textures.addCanvas('item-diamond', c);

        // Gold coin
        c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        ctx = c.getContext('2d');
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(8, 8, 6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4a017';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$', 8, 11);
        scene.textures.addCanvas('item-gold', c);
    }
}
