import { apate, Color, DrawLib, Entity, ParticleSystem, transition } from "../game.js";
import Level from "./Level.js";

export default class Level19 extends Level {
    onLoad(): void {
        let particles = new ParticleSystem(true, 0, true);
        this.add(particles);

        this.applyLevelData(this.data);

        let x = 13;
        let y = 7;

        this.data.tilemap.tile(x, y, "outer_door_top_red", true);
        this.data.tilemap.tile(x, y + 1, "inner_door_top_red", true);
        this.data.tilemap.tile(x, y + 2, "inner_door_bottom_red", true);
        this.data.tilemap.tile(x, y + 3, "outer_door_bottom_red", true);

        this.data.player.onRedDoorHit = () => {
            this.data.tilemap.tile(x, y, "");
            this.data.tilemap.tile(x, y + 1, "");
            this.data.tilemap.tile(x, y + 2, "");
            this.data.tilemap.tile(x, y + 3, "");

            for (let i = 0; i < 20; i++) {
                particles.spawn({
                    x: x * 8 + 4,
                    y: y * 8 + 16,
                    lifetime: 300,
                    gravityX: 0,
                    gravityY: 0,
                    velY: apate.random.between(-2, 2),
                    velX: apate.random.between(-2, 2),
                    scale: 1,
                    color: i < 10 ? Color.red : Color.dark_red,
                });
            }
        };
    }
}
