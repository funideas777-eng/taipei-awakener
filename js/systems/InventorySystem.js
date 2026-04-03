// Inventory management helpers
export class InventorySystem {

    static getConsumables(inventory) {
        return inventory.filter(i => i.type === 'consumable');
    }

    static getWeapons(inventory) {
        return inventory.filter(i => i.type === 'weapon');
    }

    static getArmors(inventory) {
        return inventory.filter(i => i.type === 'armor');
    }

    static getAccessories(inventory) {
        return inventory.filter(i => i.type === 'accessory');
    }

    static getMaterials(inventory) {
        return inventory.filter(i => i.type === 'material');
    }

    static getItemCount(inventory, itemId) {
        const item = inventory.find(i => i.id === itemId);
        return item ? (item.quantity || 1) : 0;
    }
}
