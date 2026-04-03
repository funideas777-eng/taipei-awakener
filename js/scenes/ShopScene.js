// Shop scene for buying/selling items and diamond store
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
        const { width, height } = this.cameras.main;
        this.player = this.registry.get('player');
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Title
        this.add.text(width / 2, 20, this.title, {
            fontSize: '22px', fontFamily: 'monospace', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Player gold/diamonds
        this.goldText = this.add.text(20, 50, '', { fontSize: '13px', fontFamily: 'monospace', color: '#f1c40f' });
        this.diamondText = this.add.text(200, 50, '', { fontSize: '13px', fontFamily: 'monospace', color: '#00d4ff' });
        this._updateCurrency();

        // Item list
        this.itemContainer = this.add.container(0, 0);
        this._buildShopList();

        // Message area
        this.msgText = this.add.text(width / 2, height - 60, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#2ecc71'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.text(width / 2, height - 25, '← 返回城市', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('City', { city: this.cityKey }));

        // Tabs for diamond shop
        if (this.shopType === 'diamond') {
            this._createDiamondTabs();
        }
    }

    _buildShopList() {
        this.itemContainer.removeAll(true);

        let items;
        if (this.shopType === 'diamond') {
            items = ShopSystem.getDiamondShopItems();
        } else {
            items = ShopSystem.getShopItems(this.cityKey, this.shopType);
        }

        const startY = 80;
        items.forEach((item, i) => {
            const y = startY + i * 50;
            if (y > 500) return;

            // Item row background
            const bg = this.add.rectangle(400, y + 15, 750, 44, 0x1a1a2e, 0.8).setStrokeStyle(1, 0x2c3e50);
            this.itemContainer.add(bg);

            // Item name
            const nameColor = item.diamondPrice ? '#00d4ff' : '#fff';
            this.itemContainer.add(this.add.text(40, y, item.name, {
                fontSize: '14px', fontFamily: 'monospace', color: nameColor, fontStyle: 'bold'
            }));

            // Item description
            this.itemContainer.add(this.add.text(40, y + 18, item.desc || '', {
                fontSize: '10px', fontFamily: 'monospace', color: '#7f8c8d'
            }));

            // Stats
            let stats = '';
            if (item.atk) stats += `ATK+${item.atk} `;
            if (item.def) stats += `DEF+${item.def} `;
            if (item.hp) stats += `HP+${item.hp} `;
            if (item.mp) stats += `MP+${item.mp} `;
            if (item.spd) stats += `SPD+${item.spd} `;
            if (stats) {
                this.itemContainer.add(this.add.text(400, y + 5, stats, {
                    fontSize: '11px', fontFamily: 'monospace', color: '#2ecc71'
                }));
            }

            // Price
            const price = item.diamondPrice || item.price;
            const currency = item.diamondPrice ? '鑽石' : '金幣';
            const priceColor = item.diamondPrice ? '#00d4ff' : '#f1c40f';
            this.itemContainer.add(this.add.text(600, y + 2, `${price} ${currency}`, {
                fontSize: '13px', fontFamily: 'monospace', color: priceColor
            }));

            // Buy button
            const buyBtn = this.add.text(720, y + 5, '購買', {
                fontSize: '13px', fontFamily: 'monospace', color: '#2ecc71',
                backgroundColor: '#2c3e50', padding: { x: 8, y: 4 }
            }).setInteractive({ useHandCursor: true });
            buyBtn.on('pointerover', () => buyBtn.setColor('#fff'));
            buyBtn.on('pointerout', () => buyBtn.setColor('#2ecc71'));
            buyBtn.on('pointerdown', () => this._buyItem(item.id));
            this.itemContainer.add(buyBtn);
        });

        if (items.length === 0) {
            this.itemContainer.add(this.add.text(400, 200, '目前沒有商品', {
                fontSize: '16px', fontFamily: 'monospace', color: '#666'
            }).setOrigin(0.5));
        }
    }

    _createDiamondTabs() {
        const { width } = this.cameras.main;

        // Recharge tab
        const rechargeBtn = this.add.text(width - 120, 50, '💎 充值鑽石', {
            fontSize: '12px', fontFamily: 'monospace', color: '#00d4ff',
            backgroundColor: '#2c3e50', padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true });
        rechargeBtn.on('pointerdown', () => this._showRechargePanel());
    }

    _showRechargePanel() {
        const { width, height } = this.cameras.main;

        if (this.rechargePanel) {
            this.rechargePanel.setVisible(!this.rechargePanel.visible);
            return;
        }

        this.rechargePanel = this.add.container(0, 0);
        const bg = this.add.image(width / 2, height / 2, 'ui-system-window');
        this.rechargePanel.add(bg);

        this.rechargePanel.add(this.add.text(width / 2, height / 2 - 120, '鑽石充值', {
            fontSize: '20px', fontFamily: 'monospace', color: '#00d4ff'
        }).setOrigin(0.5));

        const packages = ShopSystem.getDiamondPackages();
        packages.forEach((pkg, i) => {
            const y = height / 2 - 60 + i * 45;
            const btn = this.add.rectangle(width / 2, y, 300, 35, 0x2c3e50)
                .setInteractive({ useHandCursor: true }).setStrokeStyle(1, 0x00d4ff);
            const txt = this.add.text(width / 2, y, pkg.label, {
                fontSize: '14px', fontFamily: 'monospace', color: '#fff'
            }).setOrigin(0.5);

            btn.on('pointerover', () => txt.setColor('#00d4ff'));
            btn.on('pointerout', () => txt.setColor('#fff'));
            btn.on('pointerdown', () => {
                // ECPay integration placeholder
                this._initiateECPayPayment(pkg);
            });

            this.rechargePanel.add(btn);
            this.rechargePanel.add(txt);
        });

        const closeBtn = this.add.text(width / 2, height / 2 + 120, '關閉', {
            fontSize: '14px', fontFamily: 'monospace', color: '#e74c3c'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.rechargePanel.setVisible(false));
        this.rechargePanel.add(closeBtn);
    }

    _initiateECPayPayment(pkg) {
        // In production, this would call the Vercel API endpoint
        // For now, show a message about ECPay integration
        const { width, height } = this.cameras.main;
        this.msgText.setText(`綠界付款功能開發中...\n方案：${pkg.label}`);
        this.msgText.setColor('#f39c12');

        // Demo: give diamonds for testing
        this.player.addDiamonds(pkg.diamonds);
        this._updateCurrency();
        this.time.delayedCall(500, () => {
            this.msgText.setText(`[測試模式] 已發放 ${pkg.diamonds} 鑽石！`);
            this.msgText.setColor('#2ecc71');
        });
    }

    _buyItem(itemId) {
        const result = ShopSystem.buyItem(this.player, itemId);
        this.msgText.setText(result.msg);
        this.msgText.setColor(result.success ? '#2ecc71' : '#e74c3c');
        this._updateCurrency();
    }

    _updateCurrency() {
        this.goldText.setText(`金幣: ${this.player.gold}`);
        this.diamondText.setText(`鑽石: ${this.player.diamonds}`);
    }
}
