import { apate, Color, DrawLib, Random, Transition } from "../game.js";
import Level from "../scenes/Level.js";

export default class LevelTransition extends Transition {
    private random: Random = new Random();
    public focus: { x: number; y: number } = { x: 64, y: 64 };
    public color: Color = Color.black;

    constructor() {
        super(200);
    }

    public setDuration(val: number) {
        this.duration = val;
    }

    draw(drawlib: DrawLib) {
        this.random.seed = 42;

        for (let x = 0; x < 128; x++) {
            for (let y = 0; y < 128; y++) {
                if (
                    !isInCircle(
                        x,
                        y,
                        this.focus.x - apate.screenOffset.x + 4,
                        this.focus.y + apate.screenOffset.y + 4,
                        128 * (1 - this.progress)
                    )
                )
                    drawlib.pixel(x + apate.screenOffset.x, y - apate.screenOffset.y, this.color);
            }
        }
    }
}

function isInCircle(x: number, y: number, cx: number, cy: number, r: number) {
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) return true;
    return false;
}
