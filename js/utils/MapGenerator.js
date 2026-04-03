// Random dungeon maze generator
export class MapGenerator {

    // Generate a random dungeon using recursive backtracking
    static generateDungeon(width = 25, height = 19, theme = 'tech') {
        const map = [];
        // Initialize all walls
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = 1; // wall
            }
        }

        // Carve paths using recursive backtracking
        const startX = 1, startY = 1;
        this._carve(map, startX, startY, width, height);

        // Place entrance and exit
        map[1][1] = 2; // entrance
        map[height - 2][width - 2] = 3; // exit

        // Place random chests
        const chestCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < chestCount; i++) {
            let cx, cy;
            do {
                cx = Math.floor(Math.random() * (width - 2)) + 1;
                cy = Math.floor(Math.random() * (height - 2)) + 1;
            } while (map[cy][cx] !== 0);
            map[cy][cx] = 4; // chest
        }

        // Place monsters on walkable tiles
        const monsterCount = Math.floor(Math.random() * 5) + 3;
        const monsters = [];
        for (let i = 0; i < monsterCount; i++) {
            let mx, my;
            do {
                mx = Math.floor(Math.random() * (width - 4)) + 2;
                my = Math.floor(Math.random() * (height - 4)) + 2;
            } while (map[my][mx] !== 0);
            map[my][mx] = 5; // monster marker
            monsters.push({ x: mx, y: my });
        }

        return { map, monsters, width, height, theme };
    }

    static _carve(map, x, y, width, height) {
        map[y][x] = 0; // floor

        const dirs = this._shuffle([
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ]);

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && map[ny][nx] === 1) {
                map[y + dy / 2][x + dx / 2] = 0; // carve wall between
                this._carve(map, nx, ny, width, height);
            }
        }
    }

    static _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Generate city map layout
    static generateCityLayout(cityKey) {
        // Fixed layout for cities - 25x19 grid
        const width = 25, height = 19;
        const map = [];

        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                // Border walls
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    map[y][x] = 1;
                }
                // Roads in cross pattern
                else if (x === 12 || y === 9) {
                    map[y][x] = 6; // road
                }
                // Grass elsewhere
                else {
                    map[y][x] = 7; // grass
                }
            }
        }

        return { map, width, height };
    }
}
