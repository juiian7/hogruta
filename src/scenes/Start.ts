import { apate, Button, Color, DrawLib, globalStorage, levelLoader, Scene, spriteLoader, transition } from "../game.js";
import { getDict, getLangs, setLang, _lang } from "../language.js";
import { getLevelMetaData } from "../LevelLoader.js";
import Tilemap from "../scripts/Tilemap.js";

export default class Start extends Scene {
    private hasStarted = false;
    private tm: Tilemap;

    constructor() {
        super(null, apate);
    }
    onLoad(): void {
        apate.camera(0, 0);

        this.tm = new Tilemap();
        this.tm.tile(3, 14, "player_falling");
        this.tm.tile(5, 14, "grass1");
        this.tm.tile(6, 14, "grass2");
        this.tm.tile(8, 14, "cookie");
        //        this.tm.tile(12, 13, "grass1");

        apate.input.on(Button.right, "down", () => {
            let i = getLangs().indexOf(_lang);
            i++;
            if (i >= getLangs().length) i = 0;

            setLang(getLangs()[i]);
        });
        apate.input.on(Button.left, "down", () => {
            let i = getLangs().indexOf(_lang);
            i--;
            if (i < 0) i = getLangs().length - 1;

            setLang(getLangs()[i]);
        });
    }

    update(delta: number): void {
        if (apate.input.isButtonDown(Button.action1) && !this.hasStarted) {
            this.hasStarted = true;

            transition.setDuration(200);
            transition.color = Color.black;

            levelLoader.load(getLevelMetaData("level1"));
        }
    }

    draw(draw: DrawLib): void {
        const dict = getDict();
        draw.text(centerX("hogruta", 2), 34, "hogruta", Color.white, 2);
        draw.text(centerX("<" + dict.langName + ">"), 54, "<" + dict.langName + ">", Color.white);
        draw.text(centerX(dict.start), 64, dict.start, Color.white);
        draw.text(centerX("(Y/C/N/Space)"), 84, "(Y/C/N/Space)", Color.white);

        this.tm.draw();
        draw.text(75, 113, "<-" + dict.cookie, Color.white);
    }
}

function centerX(text: string, scale: number = 1) {
    return Math.round(64 - apate.draw.measureText(text, scale) / 2);
}
