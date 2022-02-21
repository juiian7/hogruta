import { Particle, spritelib } from "../../engine/src/apate.js";
import { apate, Color, DrawLib, Entity, globalStorage, ParticleSystem, spriteLoader } from "../game.js";
import { getDict } from "../language.js";
import Dialog from "../scripts/Dialog.js";
import Player from "../scripts/Player.js";
import Level from "./Level.js";

export default class TeleportLevel extends Level {
    onLoad(): void {
        this.applyLevelData(this.data);

        // add crystal and info text

        let crystal = new Crystal(this.data.player);
        this.add(crystal);
    }
}

class Crystal extends Entity {
    private position = { x: 76, y: 75 };
    private between = { min: 72, max: 75 };
    private goingUp = true;
    private speed = 0.1;
    private isDestroyed = false;

    private player: Player;
    private particles: ParticleSystem;
    private sprites: ImageData[];

    constructor(player: Player) {
        super();

        this.player = player;
        this.particles = new ParticleSystem(true, 4, true);
        this.particles.generateParticle = this.genPart;

        this.sprites = [spriteLoader.getSprite("crystal_top"), spriteLoader.getSprite("crystal_bottom")];
    }

    update(delta: number) {
        this.particles.update(delta);

        if (this.player.isTeleporting) apate.activeScene.remove(this);

        if (this.isDestroyed) return;

        if (this.player.isCollidingWith(this.position.x, this.position.y, 8, 16)) {
            this.particles.particlesPerSecond = 0;
            this.particles.update(1000);
            this.particles.particles = [];

            for (let i = 0; i < 40; i++) {
                this.particles.spawn({
                    x: this.position.x + this.apate.random.betweenInt(1, 6),
                    y: this.position.y + this.apate.random.betweenInt(1, 6),
                    color: this.apate.random.next() > 0.5 ? Color.red : Color.dark_red,
                    velX: this.apate.random.between(-2, 2),
                    velY: this.apate.random.between(-2, 2),
                    gravityY: 2,
                    gravityX: 0,
                    lifetime: 200,
                    scale: 1,
                });
            }

            this.isDestroyed = true;
            //globalStorage.unlockedTeleporter = true;
            this.player.canTeleport = true;

            let dialog = new Dialog(getDict().crystal_info, Color.white, 52, 60, 4, null, "center");
            apate.activeScene.add(dialog);
        }

        if (this.goingUp) {
            this.position.y -= this.speed * delta * 0.02;
            if (this.position.y <= this.between.min) this.goingUp = false;
        } else {
            this.position.y += this.speed * delta * 0.02;
            if (this.position.y >= this.between.max) this.goingUp = true;
        }
    }

    genPart(): Particle {
        return {
            x: 80 + apate.random.betweenInt(-4, 5),
            y: 80 + apate.random.betweenInt(-4, 5),
            gravityX: 0,
            gravityY: 20,
            lifetime: 400,
            velX: apate.random.between(-1, 1),
            velY: -0.1,
            color: apate.random.next() > 0.5 ? Color.red : Color.dark_red,
            scale: 1,
        };
    }

    draw(drawlib: DrawLib) {
        this.particles.draw(drawlib);

        if (!this.isDestroyed) {
            apate.draw.sprite(Math.round(this.position.x), Math.round(this.position.y), this.sprites[0]);
            apate.draw.sprite(Math.round(this.position.x), Math.round(this.position.y) + 8, this.sprites[1]);
        }
    }
}
