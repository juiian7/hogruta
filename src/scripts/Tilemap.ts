import { apate, Color, Entity, spriteLoader } from "../game.js";

export interface Tile {
    x: number;
    y: number;
    name: string;
    isMesh: boolean;
    isInvisible?: boolean;
}

export default class Tilemap extends Entity {
    private width: number;
    private height: number;

    public tiles: Tile[] = [];

    public maxX: number = 0;
    public maxY: number = 0;

    constructor(width: number = 8, height: number = 8) {
        super();
        this.width = width;
        this.height = height;
    }

    tile(x: number, y: number, name: string, isMesh = false, isInvisible = false) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].x == x && this.tiles[i].y == y) {
                this.tiles.splice(i, 1);
                i--;
            }
        }

        if (!name) return;
        this.tiles.push({ x, y, name, isMesh, isInvisible });

        if (x > this.maxX) this.maxX = x;
        if (y > this.maxY) this.maxY = y;
    }

    draw() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].isInvisible) {
                apate.draw.sprite(this.tiles[i].x * this.width, this.tiles[i].y * this.height, spriteLoader.getSprite(this.tiles[i].name));
            }

            if (apate.showInfo && this.tiles[i].isMesh) {
                apate.draw.rect(this.tiles[i].x * this.width + 1, this.tiles[i].y * this.height + 1, 7, 1, Color.light_green);
                apate.draw.rect(this.tiles[i].x * this.width + 1, this.tiles[i].y * this.height + 1 + 6, 7, 1, Color.light_green);
                apate.draw.rect(this.tiles[i].x * this.width + 1, this.tiles[i].y * this.height + 1, 1, 7, Color.light_green);
                apate.draw.rect(this.tiles[i].x * this.width + 1 + 6, this.tiles[i].y * this.height + 1, 1, 7, Color.light_green);
            }
        }

        if (apate.showInfo) {
            for (let x = 0; x < this.maxX; x++) {
                for (let y = 0; y < this.maxY; y++) {
                    apate.draw.rect(x * 8, y * 8, this.maxX * 8, 1, Color.blue);
                    apate.draw.rect(x * 8, y * 8, 1, this.maxY * 8, Color.red);
                }
            }
        }
    }

    getTile(x: number, y: number) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].x == x && this.tiles[i].y == y) return this.tiles[i];
        }
        return null;
    }

    getSurroundingTiles(x: number, y: number) {
        let tiles = [];
        for (let dx = 0; dx < 4; dx++) {
            for (let dy = -1; dy < 4; dy++) {
                tiles.push(this.getTile(dx - 1 + x, dy - 1 + y));
            }
        }
        return tiles;
    }
}
