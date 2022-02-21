import Level from "./Level.js";
import Tilemap from "../scripts/Tilemap.js";
import { apate, Button, Color, Entity, spriteLoader } from "../game.js";

export class LevelEditor extends Level {
    constructor() {
        super(null);
    }

    onLoad() {
        let tilemap = new Tilemap();
        let brush = new Brush(tilemap);

        tilemap.tiles = level1;

        this.apateInstance.drawCursor = true;

        this.add(tilemap);
        this.add(brush);
    }
}

class Brush extends Entity {
    tileNames: string[];

    currentTile: string;

    tilemap: Tilemap;

    constructor(tilemap: Tilemap) {
        super();

        this.tileNames = spriteLoader.getSpriteNames();
        this.tilemap = tilemap;
    }

    init(): void {
        apate.input.on(Button.action2, "down", () => {
            console.log(JSON.stringify(this.tilemap.tiles));
        });
    }

    update() {
        if (apate.input.isButtonDown("action1")) {
            if (apate.input.isMousePressed) {
                let x = Math.floor((apate.input.mousePos.x - 40) / 10);
                let y = Math.floor((apate.input.mousePos.y - 10) / 10);

                if (x >= 0 && y >= 0) {
                    let i = y * 3 + x;
                    this.currentTile = this.tileNames[i];
                }

                return;
            }
        }

        if (apate.input.isMousePressed) {
            this.tilemap.tile(Math.floor(apate.input.mousePos.x / 8), Math.floor(apate.input.mousePos.y / 8), this.currentTile);
        }
    }

    draw() {
        if (apate.input.isButtonDown("action1")) {
            apate.draw.rect(38, 8, 32, 51, Color.black);

            for (let i = 0; i < this.tileNames.length; i++) {
                apate.draw.sprite((i % 3) * 10 + 40, Math.floor(i / 3) * 10 + 10, spriteLoader.getSprite(this.tileNames[i]));
            }

            apate.draw.pixel(40, 10, Color.yellow);
            if (this.currentTile) apate.draw.sprite(10, 100, spriteLoader.getSprite(this.currentTile));
        }

        if (!apate.input.isMousePressed && this.currentTile)
            apate.draw.sprite(apate.input.mousePos.x + 1, apate.input.mousePos.y + 1, spriteLoader.getSprite(this.currentTile));
    }
}

const level1 = [];
