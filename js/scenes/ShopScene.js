// Shop scene - responsive layout
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
        this._buildUI();
    }

    _buildUI() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Title
        this.add.text(w / 2, 14, this.title, {
            fontSize: `${Math.max(16, 22 * s)}px`, fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Currency
        this.goldText = this.add.text(12, 40, `金幣: ${this.player.gold}`, {
            fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#f1c40f'
        });
        this.diamondText = this.add.text(w / 2, 40, `鑽石: ${this.player.diamonds}`, {
            fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#00d4ff'
        });

        // Recharge button for diamond shop
        if (this.shopType === 'diamond') {
            const reBtn = this.add.text(w - 12, 40, '充值鑽石', {
                fontSize: `${Math.max(9, 11 * s)}px`, fontFamily: 'monospace', color: '#00d4ff',
                backgroundColor: '#2c3e50', padding: { x: 6, y: 2 }
            }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
            reBtn.on('pointerdown', () => this._showRecharge());
        }

        // Item list
        let items = this.shopType === 'diamond' ? ShopSystem.getDiamondShopItems() : ShopSystem.getShopItems(this.cityKey, this.shopType);
        const startY = 62;
        const rowH = Math.max(40, 48 * s);
        const maxItems = Math.floor((h - startY - 60) / rowH);

        items.slice(0, maxItems).forEach((item, i) => {
            const y = startY + i * rowH;
            this.add.rectangle(w / 2, y + rowH / 2, w - 12, rowH - 3, 0x1a1a2e, 0.8).setStrokeStyle(1, 0x2c3e50);

            // Name
            const nameColor = item.diamondPrice ? '#00d4ff' : '#fff';
            this.add.text(10, y + 4, item.name, {
                fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: nameColor, fontStyle: 'bold'
            });

            // Desc + stats
            let desc = item.desc || '';
            let stats = '';
            if (item.atk) stats += `ATK+${item.atk} `;
            if (item.def) stats += `DEF+${item.def} `;
            if (item.hp) stats += `HP+${item.hp} `;
            if (item.mp) stats += `MP+${item.mp} `;
            if (item.spd) stats += `SPD+${item.spd} `;
            this.add.text(10, y + 4 + 16 * s, stats || desc.substring(0, 20), {
                fontSize: `${Math.max(8, 10 * s)}px`, fontFamily: 'monospace', color: '#7f8c8d'
            });

            // Price
            const price = item.diamondPrice || item.price;
            const currency = item.diamondPrice ? '鑽' : '金';
            this.add.text(w - 80, y + 6, `${price}${currency}`, {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: item.diamondPrice ? '#00d4ff' : '#f1c40f'
            });

            // Buy button
            const buyBtn = this.add.text(w - 12, y + rowH / 2, '購買', {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#2ecc71',
                backgroundColor: '#2c3e50', padding: { x: 6, y: 3 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
            buyBtn.on('pointerdown', () => {
                const result = ShopSystem.buyItem(this.player, item.id);
                this.audio.playSFX(result.success ? 'buy' : 'error');
                this._showMsg(result.msg, result.success);
                this.goldText.setText(`金幣: ${this.player.gold}`);
                this.diamondText.setText(`鑽石: ${this.player.diamonds}`);
            });
        });

        if (items.length === 0) {
            this.add.text(w / 2, h / 2, '目前沒有商品', {
                fontSize: `${14 * s}px`, fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5);
        }

        // Message
        this.msgText = this.add.text(w / 2, h - 50, '', {
            fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: '#2ecc71'
        }).setOrigin(0.5);

        // Back
        this.add.text(w / 2, h - 20, '← 返回城市', {
            fontSize: `${Math.max(11, 13 * s)}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));
    }

    _showMsg(text, success) {
        this.msgText.setText(text);
        this.msgText.setColor(success ? '#2ecc71' : '#e74c3c');
        this.tweens.add({ targets: this.msgText, alpha: { from: 1, to: 0 }, duration: 3000 });
    }

    _showRecharge() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const s = Math.min(w / 800, h / 600);

        if (this._rechargePanel) { this._rechargePanel.destroy(); this._rechargePanel = null; return; }
        this._rechargePanel = this.add.container(0, 0);
        const boxW = Math.min(380, w * 0.85);
        this._rechargePanel.add(this.add.rectangle(w / 2, h / 2, boxW, 240 * s, 0x0a0a1e, 0.97).setStrokeStyle(2, 0x00d4ff));
        this._rechargePanel.add(this.add.text(w / 2, h / 2 - 90 * s, '鑽石充值', {
            fontSize: `${16 * s}px`, fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        ShopSystem.getDiamondPackages().forEach((pkg, i) => {
            const y = h / 2 - 50 * s + i * 36 * s;
            const btn = this.add.rectangle(w / 2, y, boxW - 40, 28 * s, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x00d4ff);
            const txt = this.add.text(w / 2, y, pkg.label, {
                fontSize: `${Math.max(10, 12 * s)}px`, fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);
            btn.on('pointerdown', () => {
                // Test mode: instant grant
                this.player.addDiamonds(pkg.diamonds);
                this.diamondText.setText(`鑽石: ${this.player.diamonds}`);
                this.audio.playSFX('levelup');
                this._showMsg(`[測試模式] 已發放 ${pkg.diamonds} 鑽石！`, true);
                this._rechargePanel.destroy();
                this._rechargePanel = null;
            });
            this._rechargePanel.add(btn);
            this._rechargePanel.add(txt);
        });

        const closeBtn = this.add.text(w / 2, h / 2 + 100 * s, '關閉', {
            fontSize: `${12 * s}px`, fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => { this._rechargePanel.destroy(); this._rechargePanel = null; });
        this._rechargePanel.add(closeBtn);
    }
}
