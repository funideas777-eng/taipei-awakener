// Shop and diamond store logic
import { ITEMS, SHOP_INVENTORY, DIAMOND_SHOP } from '../data/items.js';

export class ShopSystem {

    static getShopItems(cityId, shopType) {
        const inv = SHOP_INVENTORY[cityId];
        if (!inv || !inv[shopType]) return [];
        return inv[shopType].map(id => ITEMS[id]).filter(Boolean);
    }

    static getDiamondShopItems() {
        return DIAMOND_SHOP.map(id => ITEMS[id]).filter(Boolean);
    }

    static buyItem(player, itemId) {
        const item = ITEMS[itemId];
        if (!item) return { success: false, msg: '物品不存在' };
        if (item.price && player.gold < item.price) return { success: false, msg: '金幣不足！' };
        if (item.diamondPrice && player.diamonds < item.diamondPrice) return { success: false, msg: '鑽石不足！' };

        if (item.diamondPrice) {
            player.diamonds -= item.diamondPrice;
        } else {
            player.gold -= item.price;
        }
        player.addItem({ ...item });
        return { success: true, msg: `購買了 ${item.name}！` };
    }

    static sellItem(player, itemId) {
        const item = player.inventory.find(i => i.id === itemId);
        if (!item) return { success: false, msg: '物品不存在' };
        const sellPrice = Math.floor((item.price || 0) * 0.5);
        player.gold += sellPrice;
        player.removeItem(itemId);
        return { success: true, msg: `賣出了 ${item.name}，獲得 ${sellPrice} 金幣！` };
    }

    // Diamond purchase packages
    static getDiamondPackages() {
        return [
            { id: 'pkg-30', diamonds: 30, price: 30, label: '30 鑽石 / NT$30' },
            { id: 'pkg-100', diamonds: 100, price: 90, label: '100 鑽石 / NT$90' },
            { id: 'pkg-300', diamonds: 300, price: 250, label: '300 鑽石 / NT$250' },
            { id: 'pkg-1000', diamonds: 1000, price: 750, label: '1000 鑽石 / NT$750' },
        ];
    }
}
