// Map generator for city and dungeon maps (free-movement RPG)
export class MapGenerator {

    // --- CITY MAP ---
    // Tile types: 0=grass, 1=wall, 2=road, 3=water, 4=park, 5=plaza, 6=building
    static generateCityMap(cityData) {
        const W = 50, H = 38;
        const map = [];

        for (let y = 0; y < H; y++) {
            map[y] = [];
            for (let x = 0; x < W; x++) {
                map[y][x] = 0;
            }
        }

        // Border walls (2 thick for visibility)
        for (let x = 0; x < W; x++) {
            map[0][x] = 1; map[1][x] = 1;
            map[H - 1][x] = 1; map[H - 2][x] = 1;
        }
        for (let y = 0; y < H; y++) {
            map[y][0] = 1; map[y][1] = 1;
            map[y][W - 1] = 1; map[y][W - 2] = 1;
        }

        // Main roads (2 tiles wide)
        const hRoads = [12, 13, 24, 25];
        const vRoads = [12, 13, 24, 25, 36, 37];

        for (let y = 2; y < H - 2; y++) {
            for (let x = 2; x < W - 2; x++) {
                if (hRoads.includes(y) || vRoads.includes(x)) {
                    map[y][x] = 2;
                }
            }
        }

        // Intersections as plaza
        for (const ry of hRoads) {
            for (const rx of vRoads) {
                if (ry < H - 2 && rx < W - 2) map[ry][rx] = 5;
            }
        }

        // Parks
        this._fillRect(map, 18, 16, 5, 5, 4);
        this._fillRect(map, 19, 17, 3, 3, 3); // water in center
        this._fillRect(map, 3, 27, 4, 4, 4);
        this._fillRect(map, 40, 3, 4, 4, 4);

        // Mark building areas
        if (cityData?.buildings) {
            cityData.buildings.forEach(b => {
                const bw = b.w || 3;
                const bh = b.h || 3;
                const sx = b.x - Math.floor(bw / 2);
                const sy = b.y - Math.floor(bh / 2);
                this._fillRect(map, sx, sy, bw, bh, 6);

                // Path from building to nearest road
                for (let py = sy + bh; py < H - 2; py++) {
                    if (map[py][b.x] === 2 || map[py][b.x] === 5) break;
                    if (map[py][b.x] !== 1 && map[py][b.x] !== 6) map[py][b.x] = 2;
                }
                for (let py = sy - 1; py >= 2; py--) {
                    if (map[py][b.x] === 2 || map[py][b.x] === 5) break;
                    if (map[py][b.x] !== 1 && map[py][b.x] !== 6) map[py][b.x] = 2;
                }
            });
        }

        // Scatter trees on grass
        for (let i = 0; i < 25; i++) {
            const rx = 3 + Math.floor(Math.random() * (W - 6));
            const ry = 3 + Math.floor(Math.random() * (H - 6));
            if (map[ry][rx] === 0) map[ry][rx] = 4;
        }

        return { map, width: W, height: H, spawnX: 24, spawnY: 18 };
    }

    static _fillRect(map, x, y, w, h, tile) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const my = y + dy, mx = x + dx;
                if (my >= 0 && my < map.length && mx >= 0 && mx < (map[0]?.length || 0)) {
                    map[my][mx] = tile;
                }
            }
        }
    }

    // --- DUNGEON MAP ---
    // Tile types: 0=floor, 1=wall, 2=entrance, 3=exit, 4=chest
    static generateDungeon(width = 40, height = 30, theme = 'tech') {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = 1;
            }
        }

        // BSP room generation
        const rooms = this._generateRooms(width, height);

        // Carve rooms
        rooms.forEach(room => {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
                        map[y][x] = 0;
                    }
                }
            }
        });

        // Connect rooms with 3-wide corridors
        for (let i = 0; i < rooms.length - 1; i++) {
            const a = rooms[i], b = rooms[i + 1];
            const ax = Math.floor(a.x + a.w / 2);
            const ay = Math.floor(a.y + a.h / 2);
            const bx = Math.floor(b.x + b.w / 2);
            const by = Math.floor(b.y + b.h / 2);
            this._carveCorridor(map, ax, ay, bx, ay, width, height);
            this._carveCorridor(map, bx, ay, bx, by, width, height);
        }

        // Entrance & exit
        const first = rooms[0], last = rooms[rooms.length - 1];
        const spawnX = Math.floor(first.x + first.w / 2);
        const spawnY = Math.floor(first.y + first.h / 2);
        map[spawnY][spawnX] = 2;

        const exitX = Math.floor(last.x + last.w / 2);
        const exitY = Math.floor(last.y + last.h / 2);
        map[exitY][exitX] = 3;

        // Chests
        const chestCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < chestCount; i++) {
            const room = rooms[1 + Math.floor(Math.random() * Math.max(1, rooms.length - 2))];
            if (!room) continue;
            const cx = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
            const cy = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
            if (cy < height && cx < width && map[cy][cx] === 0) map[cy][cx] = 4;
        }

        // Monsters with patrol zones
        const monsterCount = Math.floor(Math.random() * 5) + 4;
        const monsters = [];
        for (let i = 0; i < monsterCount; i++) {
            const ri = 1 + Math.floor(Math.random() * Math.max(1, rooms.length - 2));
            const room = rooms[ri];
            if (!room) continue;
            const mx = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
            const my = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
            if (my < height && mx < width && map[my][mx] === 0) {
                monsters.push({ x: mx, y: my, room: { ...room } });
            }
        }

        return { map, monsters, width, height, theme, spawnX, spawnY };
    }

    static _generateRooms(mapW, mapH) {
        const rooms = [];
        const minSize = 5, maxSize = 9;

        for (let i = 0; i < 35; i++) {
            const w = minSize + Math.floor(Math.random() * (maxSize - minSize));
            const h = minSize + Math.floor(Math.random() * (maxSize - minSize));
            const x = 2 + Math.floor(Math.random() * (mapW - w - 4));
            const y = 2 + Math.floor(Math.random() * (mapH - h - 4));

            let overlap = false;
            for (const r of rooms) {
                if (x < r.x + r.w + 2 && x + w + 2 > r.x &&
                    y < r.y + r.h + 2 && y + h + 2 > r.y) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) rooms.push({ x, y, w, h });
        }

        rooms.sort((a, b) => (a.x + a.y) - (b.x + b.y));

        if (rooms.length < 3) {
            rooms.push({ x: 2, y: 2, w: 6, h: 6 });
            rooms.push({ x: mapW - 9, y: mapH - 9, w: 6, h: 6 });
            rooms.push({ x: Math.floor(mapW / 2) - 3, y: Math.floor(mapH / 2) - 3, w: 6, h: 6 });
        }

        return rooms;
    }

    static _carveCorridor(map, x1, y1, x2, y2, mapW, mapH) {
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);
        let x = x1, y = y1;

        while (x !== x2) {
            for (let w = -1; w <= 1; w++) {
                const cy = y + w;
                if (cy > 0 && cy < mapH - 1 && x > 0 && x < mapW - 1) {
                    if (map[cy][x] === 1) map[cy][x] = 0;
                }
            }
            x += dx;
        }

        while (y !== y2) {
            for (let w = -1; w <= 1; w++) {
                const cx = x + w;
                if (y > 0 && y < mapH - 1 && cx > 0 && cx < mapW - 1) {
                    if (map[y][cx] === 1) map[y][cx] = 0;
                }
            }
            y += dy;
        }
    }
}
