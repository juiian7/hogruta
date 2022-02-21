import { Particle } from "../../engine/src/apate.js";
import { apate, ParticleSystem, DrawLib, Entity, spriteLoader, Color } from "../game.js";
import Player from "./Player.js";
import Tilemap, { Tile } from "./Tilemap.js";

export default class Door extends Entity {
    private keys: { x: number; y: number }[] = [];
    private sprite: ImageData;
    private player: Player;
    private tilemap: Tilemap;

    private x: number;
    private y: number;
    private cx: number;
    private cy: number;

    private isOpening: boolean = false;
    private isOpen: boolean = false;

    private particles: ParticleSystem;

    constructor(pos: { x: number; y: number }, keys: { x: number; y: number }[], player: Player, tilemap: Tilemap) {
        super();

        this.keys = keys;
        this.sprite = spriteLoader.getSprite("key");

        this.x = pos.x;
        this.y = pos.y;

        tilemap.tile(this.x, this.y, "outer_door_top", true);
        tilemap.tile(this.x, this.y + 1, "inner_door_top", true);
        tilemap.tile(this.x, this.y + 2, "inner_door_bottom", true);
        tilemap.tile(this.x, this.y + 3, "outer_door_bottom", true);

        this.player = player;
        this.tilemap = tilemap;
        this.particles = new ParticleSystem(true, 0, true);

        this.particles.lateUpdate = this.lateParticleUpdate.bind(this);

        this.cx = this.x * 8 + 4;
        this.cy = (this.y + 2) * 8;
    }

    public draw(draw: DrawLib): void {
        this.particles.draw(draw);

        for (let i = 0; i < this.keys.length; i++) {
            draw.sprite(this.keys[i].x * 8, this.keys[i].y * 8, this.sprite);
            if (apate.showInfo) draw.rect(this.keys[i].x * 8 + 2, this.keys[i].y * 8 + 2, 4, 4, Color.light_green);
        }
    }

    public update(delta: number): void {
        this.particles.update(delta);

        for (let i = 0; i < this.keys.length; i++) {
            if (this.player.isCollidingWith(this.keys[i].x * 8 + 2, this.keys[i].y * 8 + 2, 4, 4)) {
                this.createDoorParicles(this.keys[i].x * 8, this.keys[i].y * 8);

                this.collect(this.keys[i].x, this.keys[i].y);

                if (this.keys.length == 0) this.isOpening = true;
            }
        }
    }

    private openDoor() {
        this.tilemap.tile(this.x, this.y, "");
        this.tilemap.tile(this.x, this.y + 1, "");
        this.tilemap.tile(this.x, this.y + 2, "");
        this.tilemap.tile(this.x, this.y + 3, "");

        this.isOpen = true;

        for (let i = 0; i < this.particles.particles.length; i++) {
            const p = this.particles.particles[i];
            p.lifetime = apate.random.betweenInt(300, 400);
            p.velX = apate.random.between(-1, 1);
            p.velY = apate.random.between(-1, 1);
        }
    }

    private lateParticleUpdate(delta) {
        // magic :)
        // particles fly too door -> compress at center and explode on open

        if (!this.isOpen) {
            let allDone = true;

            for (let i = 0; i < this.particles.particles.length; i++) {
                const p = this.particles.particles[i] as any;
                p.update += delta;

                if (p.update >= 300) {
                    p.velX = (this.cx - p.x) * 0.06 * p.update * 0.002;
                    p.velY = (this.cy - p.y) * 0.06 * p.update * 0.002;
                }

                if (Math.round(p.x) != this.cx || Math.round(p.y) != this.cy) allDone = false;
            }

            if (allDone && this.isOpening) {
                this.openDoor();
            }
        }
    }

    private createDoorParicles(x: number, y: number) {
        for (let i = 0; i < 10; i++) {
            this.particles.spawn({
                x: x + 4,
                y: y + 4,
                lifetime: Infinity,
                gravityX: 0,
                gravityY: 0,
                velY: apate.random.between(-1, 1),
                velX: apate.random.between(-1, 1),
                scale: 1,
                color: Color.white,
                update: 0,
            } as Particle);
        }
    }

    public collect(x: number, y: number) {
        let i = this.keys.findIndex((c) => c.x == x && c.y == y);
        if (i >= 0) {
            this.keys.splice(i, 1);
        }
    }
}
