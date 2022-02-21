import { Entity, Color, DrawLib } from "../game.js";
import Player from "./Player.js";

export default class CameraFollow extends Entity {
    private player: Player;
    private area: { x: number; y: number; w: number; h: number };

    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;

    private x: number;
    private y: number;

    constructor(player: Player, area: any) {
        super();

        this.player = player;
        this.area = area;

        this.minX = this.area.x;
        this.maxX = this.area.x + this.area.w - 128;

        this.minY = this.area.y;
        this.maxY = this.area.y + this.area.h - 128;
    }

    public update(delta: number): void {
        this.x = clamp(this.minX, Math.floor(this.player.x) - 64, this.maxX);
        this.y = clamp(this.minY, Math.floor(this.player.y) - 64, this.maxY);
        this.apate.camera(-this.x, -this.y);
    }
}

function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
}
