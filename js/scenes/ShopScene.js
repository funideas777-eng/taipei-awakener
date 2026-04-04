// Shop scene - responsive layout with proper text spacing
import { ShopSystem } from '../systems/ShopSystem.js';
import { ITEMS } from '../data/items.js';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super('Shop');
    }

    init(data) {
        this.cityKey = data.city || 'taipei';
        this.shopType = data.shopType || 'item';
        this.title = data.title || '商店';
    }

    create() {
        this.player = this.registry.get('player');
        this.audio = this.registry.get('audio');
        this.audio.playBGM('shop');
        this._uiOverlay = [];
        this._buildUI();
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);
        this.cameras.main.setBackgroundColor('#0a0a1a');

        const fs = {
            title: Math.max(20, Math.floor(26 * s)),
            body: Math.max(14, Math.floor(16 * s)),
            small: Math.max(12, Math.floor(14 * s)),
            tiny: Math.max(11, Math.floor(12 * s)),
        };

        // Title bar
        this.add.rectangle(w / 2, 22, w, 44, 0x12122a);
        this.add.text(w / 2, 22, this.title, {
            fontSize: `${fs.title}px`, fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Currency bar
        const currY = 52;
        this.add.rectangle(w / 2, currY, w, 24, 0x0d0d1a);
        this.goldText = this.add.text(12, currY, `💰 ${this.player.gold.toLocaleString()}`, {
            fontSize: `${fs.small}px`, fontFamily: 'monospace', color: '#f1c40f'
        }).setOrigin(0, 0.5);
        this.diamondText = this.add.text(w / 2, currY, `💎 ${this.player.diamonds.toLocaleString()}`, {
            fontSize: `${fs.small}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0, 0.5);

        // Recharge button for diamond shop
        if (this.shopType === 'diamond') {
            const reBtn = this.add.text(w - 12, currY, '充值鑽石', {
                fontSize: `${fs.tiny}px`, fontFamily: 'monospace', color: '#00d4ff',
                backgroundColor: '#2c3e50', padding: { x: 6, y: 2 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
            reBtn.on('pointerdown', () => this._showRecharge());
        }

        // Item list with scroll
        const listTop = 68;
        const footerH = 80;
        const listH = h - listTop - footerH;
        this.scrollContainer = this.add.container(0, listTop);
        const maskGfx = this.make.graphics();
        maskGfx.fillRect(0, listTop, w, listH);
        this.scrollContainer.setMask(maskGfx.createGeometryMask());

        let items = this.shopType === 'diamond' ? ShopSystem.getDiamondShopItems() : ShopSystem.getShopItems(this.cityKey, this.shopType);

        let y = 0;
        const itemW = w - 12;
        items.forEach((item) => {
            const cardH = fs.body + fs.small + 26;

            // Card bg
            const card = this.add.rectangle(w / 2, y + cardH / 2, itemW, cardH, 0x12122a, 0.9)
                .setStrokeStyle(1, 0x222244);
            this.scrollContainer.add(card);

            // Name
            const nameColor = item.diamondPrice ? '#00d4ff' : '#ecf0f1';
            const nameText = this.add.text(10, y + 6, item.name, {
                fontSize: `${fs.body}px`, fontFamily: 'monospace', color: nameColor, fontStyle: 'bold'
            });
            this.scrollContainer.add(nameText);

            // Desc + stats
            let desc = '';
            if (item.atk) desc += `ATK+${item.atk} `;
            if (item.def) desc += `DEF+${item.def} `;
            if (item.hp) desc += `HP+${item.hp} `;
            if (item.mp) desc += `MP+${item.mp} `;
            if (item.spd) desc += `SPD+${item.spd} `;
            if (!desc && item.desc) desc = item.desc.substring(0, 30);
            const descText = this.add.text(10, y + 6 + fs.body + 4, desc, {
                fontSize: `${fs.tiny}px`, fontFamily: 'monospace', color: '#7f8c8d'
            });
            this.scrollContainer.add(descText);

            // Price
            const price = item.diamondPrice || item.price;
            const currency = item.diamondPrice ? ' 💎' : ' 💰';
            const priceText = this.add.text(w - 80, y + cardH / 2, `${price}${currency}`, {
                fontSize: `${fs.small}px`, fontFamily: 'monospace', color: item.diamondPrice ? '#00d4ff' : '#f1c40f'
            }).setOrigin(1, 0.5);
            this.scrollContainer.add(priceText);

            // Buy button
            const btnX = w - 34;
            const btnY = y + cardH / 2;
            const buyBg = this.add.rectangle(btnX, btnY, 50, 24, 0x1a3a1a)
                .setStrokeStyle(1, 0x2ecc71).setInteractive({ useHandCursor: true });
            this.scrollContainer.add(buyBg);
            const buyTxt = this.add.text(btnX, btnY, '購買', {
                fontSize: `${fs.tiny}px`, fontFamily: 'monospace', color: '#2ecc71', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.scrollContainer.add(buyTxt);
            buyBg.on('pointerdown', () => {
                const result = ShopSystem.buyItem(this.player, item.id);
                this.audio.playSFX(result.success ? 'buy' : 'error');
                this._showMsg(result.msg, result.success);
                this.goldText.setText(`💰 ${this.player.gold.toLocaleString()}`);
                this.diamondText.setText(`💎 ${this.player.diamonds.toLocaleString()}`);
            });

            y += cardH + 4;
        });

        if (items.length === 0) {
            const emptyText = this.add.text(w / 2, listH * 0.3, '目前沒有商品', {
                fontSize: `${fs.body}px`, fontFamily: 'monospace', color: '#444'
            }).setOrigin(0.5);
            this.scrollContainer.add(emptyText);
        }

        // Scroll
        this._scrollY = 0;
        this._maxScroll = Math.max(0, y - listH);
        this._listTop = listTop;
        this.input.on('wheel', (p, g, dx, dy) => {
            this._scrollY = Phaser.Math.Clamp(this._scrollY + dy * 0.5, 0, this._maxScroll);
            this.scrollContainer.y = this._listTop - this._scrollY;
        });

        // Message text
        this.msgText = this.add.text(w / 2, h - footerH + 8, '', {
            fontSize: `${fs.body}px`, fontFamily: 'monospace', color: '#2ecc71'
        }).setOrigin(0.5);

        // Back button
        const backY = h - 24;
        const backBg = this.add.rectangle(w / 2, backY, w - 20, 36, 0x2c1a1a, 0.8)
            .setStrokeStyle(1, 0x553333).setInteractive({ useHandCursor: true });
        const backTxt = this.add.text(w / 2, backY, '← 返回城市', {
            fontSize: `${fs.body}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5);
        backBg.on('pointerover', () => backTxt.setColor('#ff6b6b'));
        backBg.on('pointerout', () => backTxt.setColor('#e74c3c'));
        backBg.on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));
    }

    _showMsg(text, success) {
        this.msgText.setText(text);
        this.msgText.setColor(success ? '#2ecc71' : '#e74c3c');
        this.msgText.setAlpha(1);
        this.tweens.add({ targets: this.msgText, alpha: 0, duration: 3000 });
    }

    _showRecharge() {
        if (this._uiOverlay.length > 0) { this._uiOverlay.forEach(o => o.destroy()); this._uiOverlay = []; return; }
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);
        const fs = Math.max(14, Math.floor(16 * s));

        const blocker = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.4).setDepth(2999).setInteractive();
        blocker.on('pointerdown', () => { this._uiOverlay.forEach(o => o.destroy()); this._uiOverlay = []; });
        this._uiOverlay.push(blocker);

        const packages = ShopSystem.getDiamondPackages();
        const boxH = 80 + packages.length * 42;
        const boxW = Math.min(380, w * 0.85);
        const bg = this.add.rectangle(w/2, h/2, boxW, boxH, 0x0a0a1e, 0.97).setStrokeStyle(2, 0x00d4ff).setDepth(3000);
        this._uiOverlay.push(bg);

        const title = this.add.text(w/2, h/2 - boxH/2 + 24, '💎 鑽石充值', {
            fontSize: `${Math.max(18, 22*s)}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5).setDepth(3001);
        this._uiOverlay.push(title);

        packages.forEach((pkg, i) => {
            const py = h/2 - boxH/2 + 60 + i * 42;
            const btn = this.add.rectangle(w/2, py, boxW - 40, 34, 0x1a1a3e)
                .setStrokeStyle(1, 0x334455).setDepth(3001).setInteractive({ useHandCursor: true });
            const txt = this.add.text(w/2, py, pkg.label, {
                fontSize: `${fs}px`, fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5).setDepth(3002);
            btn.on('pointerover', () => txt.setColor('#00d4ff'));
            btn.on('pointerout', () => txt.setColor('#fff'));
            btn.on('pointerdown', () => {
                this.player.addDiamonds(pkg.diamonds);
                this.diamondText.setText(`💎 ${this.player.diamonds.toLocaleString()}`);
                this.audio.playSFX('levelup');
                this._showMsg(`[測試模式] 已發放 ${pkg.diamonds} 鑽石！`, true);
                this._uiOverlay.forEach(o => o.destroy()); this._uiOverlay = [];
            });
            this._uiOverlay.push(btn, txt);
        });

        const closeY = h/2 + boxH/2 - 24;
        const cbg = this.add.rectangle(w/2, closeY, boxW - 40, 30, 0x3e1a1a)
            .setStrokeStyle(1, 0x553333).setDepth(3001).setInteractive({ useHandCursor: true });
        const ctx = this.add.text(w/2, closeY, '關閉', {
            fontSize: `${fs}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setDepth(3002);
        cbg.on('pointerdown', () => { this._uiOverlay.forEach(o => o.destroy()); this._uiOverlay = []; });
        this._uiOverlay.push(cbg, ctx);
    }
}
