import {
    apate,
    Button,
    Color,
    DrawLib,
    Entity,
    globalStorage,
    levelLoader,
    ParticleSystem,
    Scene,
    spriteLoader,
    transition,
} from "../game.js";
import { getDict } from "../language.js";
import Snowflakes from "../scripts/background/Snowflakes.js";
import CameraFollow from "../scripts/CameraFollow.js";
import Dialog from "../scripts/Dialog.js";
import Player from "../scripts/Player.js";
import Level from "./Level.js";

export default class Summit extends Level {
    onLoad(): void {
        this.applyLevelData(this.data);

        let camFollow = this.entities.find((e) => e instanceof CameraFollow) as CameraFollow;
        let snowflakes = this.entities.find((e) => e instanceof Snowflakes) as Snowflakes;

        console.log(snowflakes);

        this.data.player.canTeleport = false;

        let anim = new EndAnimation(this.data.player, camFollow, snowflakes, this);
        this.add(anim);
    }
}

class EndAnimation extends Entity {
    private player: Player;
    private camFollow: CameraFollow;

    private animationPart: number = 0;

    private waitForStorm = 1000;
    private stromStrenght = 0;
    private snowflakes: Snowflakes;

    private lvl: Summit;

    private gameEnded = false;

    constructor(player: Player, camFollow: CameraFollow, snowflakes: Snowflakes, lvl: Summit) {
        super();

        this.player = player;
        this.snowflakes = snowflakes;
        this.camFollow = camFollow;
        this.lvl = lvl;
    }

    public update(delta: number): void {
        if (this.animationPart == 0) {
            if (this.player.x > 25 * 8) {
                this.player.handleInput = false;

                this.animationPart++;
            }
        } else if (this.animationPart == 1) {
            this.player.x += this.player.speed * delta * 0.02;

            if (this.player.x > 30 * 8) {
                this.animationPart++;
            }
        } else if (this.animationPart == 2) {
            this.waitForStorm -= delta;
            if (this.waitForStorm < 0) this.animationPart++;
        } else if (this.animationPart == 3) {
            this.camFollow.doUpdate = false;
            this.snowflakes.setVelocity(this.stromStrenght, 0.4);

            this.stromStrenght += 0.02 * delta * 0.1;
            if (this.stromStrenght >= 10) {
                this.stromStrenght = 10;
                this.player.forceX += 0.1;
            }

            if (this.stromStrenght >= 5) {
                this.player.facingRight = false;
                this.player.x -= 0.8 * delta * 0.02;
            }

            if (this.player.y > 128 * 2) {
                this.animationPart++;
            }
        } else if (this.animationPart == 4) {
            this.stromStrenght += (this.stromStrenght * 0.95 - this.stromStrenght) * delta * 0.02;
            this.snowflakes.setVelocity(this.stromStrenght, 0.4);

            if (this.stromStrenght < 0.2 && !this.gameEnded) {
                this.gameEnded = true;
                transition.setDuration(1000);

                transition.focus.x = 30 * 8;
                transition.focus.y = 10 * 8;

                levelLoader.loadNext();
            }
        }
    }

    public draw(draw: DrawLib): void {
        draw.text(40, 25, getDict().summit, Color.white, 3);
    }
}
