import { apate, Button, Color, DrawLib, Entity, globalStorage, ParticleSystem, spriteLoader } from "../game.js";
import { getDict } from "../language.js";
import Dialog from "../scripts/Dialog.js";
import Player from "../scripts/Player.js";
import Level from "./Level.js";

export default class CampLevel extends Level {
    onLoad(): void {
        let campfire = new Campfire();
        let stranger = new Stranger(this.data.player);

        this.add(campfire);
        this.add(stranger);

        this.applyLevelData(this.data);
    }
}

class Stranger extends Entity {
    private player: Player;
    private textLines: string[] = [];

    private position = { x: 92, y: 13 * 8 };

    private hasStarted: boolean = false;

    private currentLineIndex: number = 0;
    private currentDialog: Dialog = null;

    constructor(player: Player) {
        super();
        this.initLines();

        this.player = player;

        if (apate.input.isButtonDown(Button.action1)) {
            this.doUpdate = false;
            apate.input.on(Button.action1, "up", () => {
                this.doUpdate = true;
            });
        }
        apate.input.on(Button.action1, "down", this.onInput.bind(this));
    }

    private initLines() {
        this.textLines.push(...getDict().stranger.map((msg) => msg.replace("%1", "42")));
    }

    public onInput() {
        if (this.currentDialog && this.currentDialog.hasFinished) {
            if (apate.input.isButtonDown(Button.action1)) {
                this.currentLineIndex++;
                if (this.currentLineIndex >= this.textLines.length) {
                    this.currentDialog = null;
                    this.player.handleInput = true;
                } else this.setDialog(this.textLines[this.currentLineIndex]);
            }
        }
    }

    setDialog(msg: string) {
        this.currentDialog = new Dialog(msg, Color.white, 64, 60, 2, null, "center");
    }

    public update(delta: number): void {
        if (!this.hasStarted && this.player.x >= 6 * 8 + 2) {
            this.player.handleInput = false;
            this.hasStarted = true;

            this.setDialog(this.textLines[this.currentLineIndex]);
        }

        if (this.currentDialog) this.currentDialog.update(delta);
    }

    public draw(draw: DrawLib): void {
        if (this.currentDialog) this.currentDialog.draw(draw);

        draw.spriteExt(this.position.x - 4, this.position.y - 8, spriteLoader.getSprite("stranger"), 2);
    }
}

class Campfire extends Entity {
    private fps: number = 20;
    private currentFrame: number = 0;
    private nextFrame: number;

    private position = { x: 9 * 8, y: 13 * 8 };
    private fire: ParticleSystem;
    private fpx: number = 0;

    private fireColors = [Color.dark_red, Color.light_gray, Color.yellow];

    constructor() {
        super();

        this.nextFrame = 1000 / this.fps;

        this.fire = new ParticleSystem(true, 1000, true);
        this.fire.generateParticle = this.generateParticle.bind(this);
    }

    public update(delta: number): void {
        this.fire.update(delta);
        this.fpx++;
        if (this.fpx > 8) this.fpx = 0;

        this.nextFrame -= delta;
        if (this.nextFrame < 0) {
            this.currentFrame++;
            if (this.currentFrame >= 3) this.currentFrame = 0;

            this.nextFrame = 1000 / this.fps;
        }
    }
    public draw(draw: DrawLib): void {
        draw.sprite(this.position.x, this.position.y, spriteLoader.getSprite("campfire_left"));
        draw.sprite(this.position.x + 8, this.position.y, spriteLoader.getSprite("campfire_right"));

        draw.sprite(this.position.x + 3, this.position.y - 3, spriteLoader.getAnimatedSprite("fire", this.currentFrame));
        this.fire.draw(draw);
    }

    generateParticle() {
        let color = this.fireColors[apate.random.betweenInt(0, this.fireColors.length)];
        let lifetime = apate.random.betweenInt(1200, 1500);
        let y = this.position.y;
        if (color == Color.yellow) {
            lifetime = 100;
            y += 4;
        }
        return {
            gravityX: 0,
            gravityY: 0,
            lifetime,
            scale: 1,
            velX: 0,
            velY: -0.2,
            x: apate.random.betweenInt(0, 7) + this.position.x + 3,
            y,
            color,
        };
    }
}
