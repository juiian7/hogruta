import { apate, Button, Color, DrawLib, Entity, globalStorage, levelLoader, restart } from "../game.js";
import { getDict, getLangs, setLang, _lang } from "../language.js";
import Level from "../scenes/Level.js";
import Snowflakes from "./background/Snowflakes.js";

export default class Pause extends Entity {
    public isPaused = false;
    private lvl: Level;

    private snowflakes: Snowflakes;

    private restartConfirmDuration = 500;

    constructor() {
        super();
    }

    public setLevel(lvl: Level) {
        this.lvl = lvl;

        // @ts-ignore
        this.snowflakes = this.lvl.entities.find((e) => e instanceof Snowflakes) as Snowflakes;
    }

    public init(): void {
        apate.input.on(Button.cancel, "down", this.togglePause.bind(this));

        apate.input.on(Button.right, "down", () => {
            if (!this.isPaused) return;
            let i = getLangs().indexOf(_lang);
            i++;
            if (i >= getLangs().length) i = 0;

            setLang(getLangs()[i]);
        });
        apate.input.on(Button.left, "down", () => {
            if (!this.isPaused) return;
            let i = getLangs().indexOf(_lang);
            i--;
            if (i < 0) i = getLangs().length - 1;

            setLang(getLangs()[i]);
        });
    }

    public update(delta: number): void {
        if (this.isPaused) {
            if (apate.input.isButtonDown(Button.action2)) {
                this.restartConfirmDuration -= delta;

                if (this.restartConfirmDuration < 0) {
                    restart();
                }
            } else this.restartConfirmDuration = 500;
        }
    }

    public togglePause() {
        this.isPaused = !this.isPaused;

        this.lvl.data.player.doUpdate = !this.isPaused;
        if (this.snowflakes) this.snowflakes.doUpdate = !this.isPaused;
    }

    public draw(draw: DrawLib): void {
        if (this.isPaused) {
            apate.draw.rect(13 + apate.screenOffset.x, 47 - apate.screenOffset.y, 102, 50, Color.gray);
            apate.draw.rect(14 + apate.screenOffset.x, 48 - apate.screenOffset.y, 100, 48, Color.black);

            const dict = getDict();
            draw.text(centerX("<" + dict.langName + ">"), 54 - apate.screenOffset.y, "<" + dict.langName + ">", Color.white);
            draw.text(centerX(dict.endRun), 74 - apate.screenOffset.y, dict.endRun, Color.white);
            draw.text(centerX("(V/X/M)"), 84 - apate.screenOffset.y, "(V/X/M)", Color.white);

            apate.draw.rect(
                14 + apate.screenOffset.x,
                94 - apate.screenOffset.y,
                Math.round((1 - this.restartConfirmDuration / 500) * 100),
                2,
                Color.red
            );
        }
    }
}

function centerX(text: string, scale: number = 1) {
    return Math.round(64 - apate.draw.measureText(text, scale) / 2) + apate.screenOffset.x;
}
