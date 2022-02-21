import { apate, Color, DrawLib, Entity, levelLoader, spriteLoader, transition } from "../game.js";
import { getDict } from "../language.js";
import Dialog from "../scripts/Dialog.js";
import Level from "./Level.js";

export default class PostCredits extends Level {
    onLoad(): void {
        this.applyLevelData(this.data);

        this.data.tilemap.tile(10, 15, "");

        this.remove(this.data.player);

        let p = new FakePlayer(this.data.player.x);
        this.add(p);
    }
}

class FakePlayer extends Entity {
    private x: number;
    private y: number;

    private velY: number = 14;

    private hitGround: boolean = false;

    private waitForMsg: number = 2000;
    private dialog: Dialog = null;

    private waitForMsgRead: number = 3000;
    private loadingNextLvl: boolean = false;

    constructor(x: number) {
        super();

        this.x = x;
        this.y = -100;
    }

    public draw(draw: DrawLib): void {
        draw.sprite(Math.round(this.x), Math.round(this.y), spriteLoader.getSprite("player_falling"));
    }

    public update(delta: number): void {
        if (!this.hitGround) {
            this.y += this.velY * delta * 0.02;

            if (this.y >= 120) {
                this.y = 120;
                this.hitGround = true;
            }
        } else {
            this.waitForMsg -= delta;
            if (!this.dialog && this.waitForMsg < 0) {
                this.dialog = new Dialog(getDict().whoami, Color.white, 80, 6, 0, null, "center", 1);
                apate.activeScene.add(this.dialog);
            } else if (this.dialog && this.dialog.hasFinished) {
                this.waitForMsgRead -= delta;
                if (this.waitForMsgRead < 0 && !this.loadingNextLvl) {
                    this.loadingNextLvl = true;
                    transition.setDuration(1000);
                    levelLoader.loadNext();
                }
            }
        }
    }
}
