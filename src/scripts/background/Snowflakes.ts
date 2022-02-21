import { apate, Color, ParticleSystem } from "../../game.js";

export default class Snowflakes extends ParticleSystem {
    private vx: number = 0;
    private vy: number = 0.4;

    private width: number;

    constructor(width: number = 128) {
        super(true, 0, true);

        width += apate.screenOffset.x;

        this.width = width;

        for (let i = 0; i < (40 * this.width) / 128; i++) {
            this.spawn({
                x: apate.random.betweenInt(0, this.width),
                y: apate.random.betweenInt(0, 128),
                velX: 0,
                velY: 0,
                gravityX: 0,
                gravityY: 0,
                scale: 1,
                lifetime: Infinity,
                color: Color.white,
            });
        }
    }

    setVelocity(x: number, y: number) {
        this.vx = x;
        this.vy = y;
    }

    lateUpdate() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].velX = this.vx;
            this.particles[i].velY = this.vy;

            if (this.particles[i].y > 128) this.particles[i].y = 0;
            if (this.particles[i].y < 0) this.particles[i].y = 128;
            if (this.particles[i].x > this.width) this.particles[i].x = 0;
            if (this.particles[i].x < 0) this.particles[i].x = this.width;
        }
    }
}
